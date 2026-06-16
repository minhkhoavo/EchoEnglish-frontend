import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Mic,
  Square,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetFlashcardsQuery,
  useReviewFlashcardMutation,
} from '@/features/flashcard/services/flashcardApi';
import { useGetResourceByIdQuery } from '@/features/resource/services/resourceApi';
import {
  useGenerateExerciseQuestionsMutation,
  useEvaluateAnswerMutation,
  generateTTSUrl,
} from '@/features/resource/components/exercises/reading/services/readingExerciseApi';
import { calculateSimilarity } from '@/features/resource/utils/exerciseGenerator';
import { useRecordActivityResultMutation } from '../services/dashboardApi';
import axiosInstance from '@/core/api/axios';
import type { LearningResource } from '@/features/lr-analyze/types/analysis';

type Signals = NonNullable<LearningResource['generatedContent']>['signals'];

interface ActivityRunnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: LearningResource;
  onComplete?: () => void;
}

interface AIExercise {
  title?: string;
  instruction: string;
  passage?: string;
  items?: Array<{
    id: string;
    prompt: string;
    type: 'mcq' | 'text';
    options?: string[];
  }>;
  writingTask?: string;
}

interface AIEvaluation {
  score: number;
  maxScore?: number;
  feedback: string;
  items?: Array<{ id: string; correct: boolean; explanation?: string }>;
  strengths?: string[];
  improvements?: string[];
}

const KIND_LABEL: Record<string, string> = {
  writing: 'Writing',
  grammar: 'Grammar',
  sentence_rewrite: 'Sentence rewrite',
  reading: 'Reading',
  error_correction: 'Error correction',
  paraphrase: 'Paraphrase',
  summary: 'Summary',
  dictation: 'Dictation',
  speaking: 'Speaking',
  flashcard_review: 'Flashcard review',
};

const stripHtml = (s?: string) =>
  (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// #1 — Robust JSON: call the AI, validate the shape, retry once on bad output.
type Trigger = (arg: { message: string }) => { unwrap: () => Promise<unknown> };
async function callAIJson<T>(
  trigger: Trigger,
  message: string,
  validate: (r: unknown) => boolean
): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const msg =
      attempt === 0
        ? message
        : `${message}\n\nIMPORTANT: Return ONLY one valid minified JSON object. No markdown, no prose.`;
    try {
      const res = await trigger({ message: msg }).unwrap();
      if (res && validate(res)) return res as T;
    } catch {
      /* retry */
    }
  }
  return null;
}

export function ActivityRunnerModal({
  open,
  onOpenChange,
  resource,
  onComplete,
}: ActivityRunnerModalProps) {
  const gc = resource.generatedContent || {};
  const kind = (gc.kind as string) || 'writing';
  const signals = gc.signals;
  const [recordResult] = useRecordActivityResultMutation();

  // Close the loop: record the score, then finish.
  const finish = (score?: number) => {
    if (typeof score === 'number') {
      recordResult({
        kind,
        targetSkill: signals?.targetSkill,
        score,
      }).catch(() => {});
    }
    onComplete?.();
    toast.success('Activity completed!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {resource.title}
            <Badge variant="outline" className="text-xs">
              {KIND_LABEL[kind] || 'Activity'}
            </Badge>
          </DialogTitle>
          {resource.description && (
            <DialogDescription>{resource.description}</DialogDescription>
          )}
        </DialogHeader>

        {open &&
          (kind === 'flashcard_review' ? (
            <FlashcardReviewRunner onDone={() => finish()} />
          ) : kind === 'dictation' ? (
            <DictationRunner
              brief={(gc.brief as string) || resource.description}
              signals={signals}
              onDone={finish}
            />
          ) : kind === 'speaking' ? (
            <SpeakingRunner
              brief={(gc.brief as string) || resource.description}
              signals={signals}
              onDone={finish}
            />
          ) : (
            <AIExerciseRunner
              kind={kind}
              brief={(gc.brief as string) || resource.description}
              signals={signals}
              onDone={finish}
            />
          ))}
      </DialogContent>
    </Dialog>
  );
}

// Shared: build the "ground the exercise" context lines from signals.
function signalLines(signals: Signals): string[] {
  const lines: string[] = [`Learner CEFR level: ${signals?.level || 'B1'}`];
  if (signals?.targetSkill) lines.push(`Target skill: ${signals.targetSkill}`);
  if (signals?.weaknesses?.length)
    lines.push(`Learner weaknesses: ${signals.weaknesses.join('; ')}`);
  if (signals?.aiInsights?.length)
    lines.push(`AI insights: ${signals.aiInsights.join(' | ')}`);
  if (signals?.interests?.length)
    lines.push(`Interests: ${signals.interests.join(', ')}`);
  if (signals?.focus) lines.push(`Today's focus: ${signals.focus}`);
  return lines;
}

// ---------------------------------------------------------------------------
// AI exercise — writing / grammar / sentence_rewrite / reading /
// error_correction / paraphrase / summary. AI builds it, learner does it, AI grades.
// ---------------------------------------------------------------------------
function AIExerciseRunner({
  kind,
  brief,
  signals,
  onDone,
}: {
  kind: string;
  brief: string;
  signals: Signals;
  onDone: (score?: number) => void;
}) {
  const [generate] = useGenerateExerciseQuestionsMutation();
  const [evaluate, { isLoading: evaluating }] = useEvaluateAnswerMutation();

  const materialId = signals?.materialResourceId;
  const { data: matRes, isFetching: matFetching } = useGetResourceByIdQuery(
    materialId || '',
    { skip: !materialId }
  );
  const materialContent = stripHtml(matRes?.data?.content).slice(0, 1800);

  const [exercise, setExercise] = useState<AIExercise | null>(null);
  const [genError, setGenError] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);
  const generatedRef = useRef(false);

  const buildGenMessage = () => {
    const lines: string[] = [
      `You are an expert, creative English/TOEIC tutor. Design ONE engaging self-study micro-exercise the learner can finish in ~10 minutes; it will then be auto-graded. Be specific and adapt to the learner.`,
      ``,
      `Activity type: ${kind}`,
      `Instruction brief: ${brief}`,
      ...signalLines(signals),
    ];
    if (materialContent) {
      lines.push(
        ``,
        `Base it on the learner's ACTUAL study material (quote/adapt real sentences):`,
        `"""${materialContent}"""`
      );
    } else if (signals?.materialTitle) {
      lines.push(
        `Ground it in the learner's material "${signals.materialTitle}". ${signals.materialSummary || ''}`
      );
    }
    lines.push(
      ``,
      `Rules by type:`,
      `- writing: put the task in "writingTask"; no "items".`,
      `- summary: ask for a short summary in "writingTask"; put the source in "passage".`,
      `- sentence_rewrite / paraphrase: put source sentences in "passage" and the transformation instruction in "writingTask"; no "items".`,
      `- error_correction: put 4-6 sentences each containing one error as "items" (type "text"); the learner writes the corrected sentence.`,
      `- grammar: 4-6 "items" (type "mcq" with 4 "options", or "text" fill-in-the-blank).`,
      `- reading: a ~120-word "passage" + 3 "items" (type "mcq", 4 options).`,
      ``,
      `Return ONLY this JSON (no prose, no markdown):`,
      `{"title":"...","instruction":"...","passage":"","items":[{"id":"q1","prompt":"...","type":"mcq","options":["a","b","c","d"]}],"writingTask":""}`
    );
    return lines.join('\n');
  };

  const ready = !materialId || !matFetching;
  useEffect(() => {
    if (!ready || generatedRef.current) return;
    generatedRef.current = true;
    (async () => {
      const res = await callAIJson<AIExercise>(
        generate as unknown as Trigger,
        buildGenMessage(),
        (r) => !!(r as AIExercise)?.instruction
      );
      if (!res) setGenError(true);
      else setExercise({ ...res, items: res.items || [] });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const submit = async () => {
    if (!exercise) return;
    if (exercise.writingTask && (answers.__writing || '').trim().length < 10) {
      toast.error('Please write a bit more before submitting.');
      return;
    }
    const message = `You are a strict but encouraging English examiner. Grade the learner's work and give actionable feedback.

Exercise: ${JSON.stringify({
      instruction: exercise.instruction,
      passage: exercise.passage,
      items: exercise.items,
      writingTask: exercise.writingTask,
    })}
Learner answers (keyed by item id; "__writing" is the free-writing answer): ${JSON.stringify(
      answers
    )}

Return ONLY this JSON:
{"score":<0-100>,"maxScore":100,"feedback":"<overall, 1-3 sentences>","items":[{"id":"q1","correct":true,"explanation":"..."}],"strengths":["..."],"improvements":["..."]}`;
    const res = await callAIJson<AIEvaluation>(
      evaluate as unknown as Trigger,
      message,
      (r) => typeof (r as AIEvaluation)?.score === 'number'
    );
    if (!res) {
      toast.error('Grading failed. Please try again.');
      return;
    }
    setEvaluation(res);
  };

  if (!exercise && !genError) {
    return <LoadingExercise />;
  }
  if (genError || !exercise) {
    return <BuildFailed onClose={() => onDone()} />;
  }

  const itemResult = (id: string) =>
    evaluation?.items?.find((i) => i.id === id);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0f172a] font-medium">
        {exercise.instruction}
      </p>

      {exercise.passage && (
        <Card className="p-3 bg-[#f8fafc] text-sm text-[#475569] whitespace-pre-line">
          {exercise.passage}
        </Card>
      )}

      {exercise.items && exercise.items.length > 0 && (
        <div className="space-y-4">
          {exercise.items.map((item, idx) => {
            const res = itemResult(item.id);
            return (
              <div key={item.id} className="space-y-2">
                <div className="text-sm font-medium flex items-start gap-2">
                  <span className="text-[#94a3b8]">{idx + 1}.</span>
                  <span className="flex-1">{item.prompt}</span>
                  {res &&
                    (res.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                    ))}
                </div>
                {item.type === 'mcq' && item.options ? (
                  <div className="grid gap-1.5">
                    {item.options.map((opt) => {
                      const selected = answers[item.id] === opt;
                      return (
                        <button
                          key={opt}
                          disabled={!!evaluation}
                          onClick={() =>
                            setAnswers((a) => ({ ...a, [item.id]: opt }))
                          }
                          className={`text-left text-sm rounded-md border px-3 py-2 transition-colors ${
                            selected
                              ? 'border-[#6366f1] bg-[#eef2ff]'
                              : 'border-[#e5e7eb] hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    value={answers[item.id] || ''}
                    disabled={!!evaluation}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [item.id]: e.target.value }))
                    }
                    placeholder="Your answer..."
                  />
                )}
                {res?.explanation && (
                  <p className="text-xs text-[#64748b]">{res.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {exercise.writingTask && (
        <div className="space-y-2">
          <div className="text-sm font-medium">{exercise.writingTask}</div>
          <Textarea
            value={answers.__writing || ''}
            disabled={!!evaluation}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, __writing: e.target.value }))
            }
            rows={6}
            placeholder="Write your response here..."
          />
        </div>
      )}

      {!evaluation ? (
        <div className="flex justify-end">
          <Button
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
            onClick={submit}
            disabled={evaluating}
          >
            {evaluating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Grading...
              </>
            ) : (
              'Submit for grading'
            )}
          </Button>
        </div>
      ) : (
        <FeedbackCard
          evaluation={evaluation}
          onFinish={() => onDone(evaluation.score)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dictation — AI gives a sentence, app plays TTS, learner transcribes, score by
// similarity. Kept simple (no extra AI grading call).
// ---------------------------------------------------------------------------
function DictationRunner({
  brief,
  signals,
  onDone,
}: {
  brief: string;
  signals: Signals;
  onDone: (score?: number) => void;
}) {
  const [generate] = useGenerateExerciseQuestionsMutation();
  const [audioText, setAudioText] = useState<string | null>(null);
  const [genError, setGenError] = useState(false);
  const [text, setText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;
    (async () => {
      const message = [
        `You are an English tutor creating a DICTATION exercise.`,
        `Brief: ${brief}`,
        ...signalLines(signals),
        ``,
        `Produce 2-3 short, natural sentences (total < 45 words) for the learner to hear and transcribe.`,
        `Return ONLY this JSON: {"audioText":"the sentences as one string"}`,
      ].join('\n');
      const res = await callAIJson<{ audioText: string }>(
        generate as unknown as Trigger,
        message,
        (r) => !!(r as { audioText?: string })?.audioText
      );
      if (!res) setGenError(true);
      else setAudioText(res.audioText);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!audioText && !genError)
    return <LoadingExercise label="Preparing audio..." />;
  if (genError || !audioText) return <BuildFailed onClose={() => onDone()} />;

  const check = () => {
    const s = Math.round(calculateSimilarity(text, audioText) * 100);
    setScore(s);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0f172a] font-medium">
        Listen and type exactly what you hear.
      </p>
      <audio controls src={generateTTSUrl(audioText)} className="w-full">
        <track kind="captions" />
      </audio>
      <Textarea
        value={text}
        disabled={score !== null}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type what you heard..."
      />
      {score === null ? (
        <div className="flex justify-end">
          <Button
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
            onClick={check}
            disabled={text.trim().length === 0}
          >
            <Volume2 className="w-4 h-4 mr-1" />
            Check
          </Button>
        </div>
      ) : (
        <Card className="p-3 space-y-2 bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#6366f1] text-white">{score}/100</Badge>
            <span className="text-sm font-semibold">Match score</span>
          </div>
          <div className="text-xs text-[#475569]">
            <b>Correct:</b> {audioText}
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={() => onDone(score)}
            >
              Finish
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speaking — AI gives a sentence to read aloud, learner records, audio is sent
// to /speech/assess-inline (Azure) and pronunciation scores are shown.
// ---------------------------------------------------------------------------
interface SpeechScores {
  accuracyScore?: number | null;
  fluencyScore?: number | null;
  completenessScore?: number | null;
  pronScore?: number | null;
  recognizedText?: string;
}

function SpeakingRunner({
  brief,
  signals,
  onDone,
}: {
  brief: string;
  signals: Signals;
  onDone: (score?: number) => void;
}) {
  const [generate] = useGenerateExerciseQuestionsMutation();
  const [speakText, setSpeakText] = useState<string | null>(null);
  const [genError, setGenError] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [scores, setScores] = useState<SpeechScores | null>(null);
  const generatedRef = useRef(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;
    (async () => {
      const message = [
        `You are an English speaking coach.`,
        `Brief: ${brief}`,
        ...signalLines(signals),
        ``,
        `Give 2-3 short sentences (< 40 words) for the learner to READ ALOUD clearly.`,
        `Return ONLY this JSON: {"speakText":"the sentences as one string"}`,
      ].join('\n');
      const res = await callAIJson<{ speakText: string }>(
        generate as unknown as Trigger,
        message,
        (r) => !!(r as { speakText?: string })?.speakText
      );
      if (!res) setGenError(true);
      else setSpeakText(res.speakText);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        setAudioBlob(
          new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        );
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error('Microphone access is required for speaking practice.');
    }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const assess = async () => {
    if (!audioBlob || !speakText) return;
    setAssessing(true);
    try {
      const form = new FormData();
      form.append('file', audioBlob, 'speaking.webm');
      form.append('referenceText', speakText);
      const res = await axiosInstance.post('/speech/assess-inline', form);
      const data = (res.data?.data || {}) as SpeechScores;
      setScores(data);
    } catch {
      toast.error('Could not assess your speech. Please try again.');
    } finally {
      setAssessing(false);
    }
  };

  if (!speakText && !genError)
    return <LoadingExercise label="Preparing sentence..." />;
  if (genError || !speakText) return <BuildFailed onClose={() => onDone()} />;

  const overall = Math.round(scores?.pronScore ?? scores?.accuracyScore ?? 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0f172a] font-medium">Read this aloud:</p>
      <Card className="p-3 bg-[#f8fafc] text-base text-[#0f172a]">
        {speakText}
      </Card>

      {!scores ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            {!recording ? (
              <Button
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
                onClick={startRec}
                disabled={!!audioBlob && assessing}
              >
                <Mic className="w-4 h-4 mr-1" />
                {audioBlob ? 'Record again' : 'Record'}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-[#ef4444] text-[#ef4444]"
                onClick={stopRec}
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
          {audioBlob && !recording && (
            <div className="flex justify-end">
              <Button
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                onClick={assess}
                disabled={assessing}
              >
                {assessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  'Get pronunciation score'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-3 space-y-2 bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <Badge className="bg-[#6366f1] text-white">{overall}/100</Badge>
            <span className="text-sm font-semibold">Pronunciation</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-[#475569]">
            <span>Accuracy: {scores.accuracyScore ?? '—'}</span>
            <span>Fluency: {scores.fluencyScore ?? '—'}</span>
            <span>Completeness: {scores.completenessScore ?? '—'}</span>
            <span>Overall: {scores.pronScore ?? '—'}</span>
          </div>
          {scores.recognizedText && (
            <div className="text-xs text-[#64748b]">
              <b>Heard:</b> {scores.recognizedText}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={() => onDone(overall)}
            >
              Finish
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flashcard review — real spaced repetition (due-first + persist remember/forgot)
// ---------------------------------------------------------------------------
type DueFlashcard = {
  _id?: string;
  front: string;
  back: string;
  phonetic?: string;
  nextReviewDate?: string;
};

function FlashcardReviewRunner({ onDone }: { onDone: () => void }) {
  const { data: cards = [], isLoading } = useGetFlashcardsQuery();
  const [reviewFlashcard, { isLoading: saving }] = useReviewFlashcardMutation();

  const deck = useMemo(() => {
    const soon = Date.now() + 2 * 24 * 60 * 60 * 1000;
    const list = [...(cards as unknown as DueFlashcard[])];
    const due = list.filter(
      (c) => !c.nextReviewDate || new Date(c.nextReviewDate).getTime() <= soon
    );
    const pool = due.length > 0 ? due : list;
    pool.sort((a, b) => {
      const da = a.nextReviewDate
        ? new Date(a.nextReviewDate).getTime()
        : Infinity;
      const db = b.nextReviewDate
        ? new Date(b.nextReviewDate).getTime()
        : Infinity;
      return da - db;
    });
    return pool.slice(0, 15);
  }, [cards]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (isLoading) return <LoadingExercise />;
  if (deck.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          You have no flashcards yet. Create some to review them here.
        </p>
        <Button onClick={onDone}>Close</Button>
      </div>
    );
  }

  const card = deck[idx];
  const isLast = idx + 1 >= deck.length;

  const grade = async (remember: boolean) => {
    if (card._id) {
      try {
        await reviewFlashcard({ id: card._id, remember }).unwrap();
      } catch {
        /* keep flowing */
      }
    }
    if (isLast) onDone();
    else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3" /> Card {idx + 1} / {deck.length} · due
        first
      </div>
      <Card
        onClick={() => setFlipped((f) => !f)}
        className="min-h-44 flex items-center justify-center cursor-pointer p-6 text-center select-none"
      >
        <div>
          <div className="text-lg font-semibold text-[#0f172a]">
            {flipped ? card.back : card.front}
          </div>
          {!flipped && card.phonetic && (
            <div className="text-xs text-muted-foreground mt-1">
              {card.phonetic}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-3">
            {flipped ? 'How well did you remember?' : 'Tap to reveal'}
          </div>
        </div>
      </Card>

      {!flipped ? (
        <div className="flex items-center justify-center">
          <Button variant="outline" onClick={() => setFlipped(true)}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reveal answer
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#fca5a5] text-[#dc2626] hover:bg-red-50"
            disabled={saving}
            onClick={() => grade(false)}
          >
            Forgot
          </Button>
          <Button
            className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white"
            disabled={saving}
            onClick={() => grade(true)}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLast ? (
              'Remembered · Finish'
            ) : (
              'Remembered'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared bits
// ---------------------------------------------------------------------------
function LoadingExercise({
  label = 'Building your exercise...',
}: {
  label?: string;
}) {
  return (
    <div className="py-12 flex flex-col items-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function BuildFailed({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-8 text-center space-y-3">
      <p className="text-sm text-muted-foreground">
        Could not build this activity. Please try again.
      </p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}

function FeedbackCard({
  evaluation,
  onFinish,
}: {
  evaluation: AIEvaluation;
  onFinish: () => void;
}) {
  return (
    <Card className="p-3 space-y-2 bg-[#f8fafc]">
      <div className="flex items-center gap-2">
        <Badge className="bg-[#6366f1] text-white">
          {evaluation.score}/{evaluation.maxScore || 100}
        </Badge>
        <span className="text-sm font-semibold">AI feedback</span>
      </div>
      <p className="text-sm text-[#475569]">{evaluation.feedback}</p>
      {evaluation.strengths && evaluation.strengths.length > 0 && (
        <div className="text-xs text-[#475569]">
          <b>Strengths:</b> {evaluation.strengths.join('; ')}
        </div>
      )}
      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div className="text-xs text-[#475569]">
          <b>Improve:</b> {evaluation.improvements.join('; ')}
        </div>
      )}
      <div className="flex justify-end">
        <Button
          className="bg-[#10b981] hover:bg-[#059669] text-white"
          onClick={onFinish}
        >
          Finish
        </Button>
      </div>
    </Card>
  );
}
