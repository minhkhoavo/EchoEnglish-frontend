import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Wand2,
  Languages,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useGetAdminTestByIdQuery,
  useUpdateTestMutation,
} from '../services/adminTestApi';
import type {
  AdminTest,
  TestPart,
  TestQuestion,
  TestQuestionGroup,
  TestMedia,
  TestVocabWord,
} from '../types/admin-test.types';
import { RichTextEditor } from './RichTextEditor';
import { AudioPreview, ImagePreview } from './MediaPreview';
import { QuestionPreviewDialog, GroupPreviewDialog } from './PreviewDialogs';
import { AiAssistProvider, useAiAssist } from './ai/AiAssistContext';
import { AiActionButton } from './ai/AiActionButton';
import { AiSuggestionPanel } from './ai/AiSuggestionPanel';
import { SkillTagsEditor } from './ai/SkillTagsEditor';
import { GenerateQuestionDialog } from './ai/GenerateQuestionDialog';
import { GenerateFromMediaDialog } from './ai/GenerateFromMediaDialog';
import { useRunAiMutation } from '../services/adminTestAiApi';
import {
  buildGenerateGroup,
  buildGenerateDistractors,
  buildGenerateExplanation,
  buildImproveQuestion,
  buildReview,
  buildAutoTag,
  buildTranslate,
  buildFormatTranscript,
  buildExtractVocab,
} from '../services/adminTestAiPrompts';
import type {
  AiGeneratedQuestion,
  GenerateGroupResult,
  GenerateDistractorsResult,
  GenerateExplanationResult,
  ImproveQuestionResult,
  ReviewResult,
  AutoTagResult,
  TranslateResult,
  FormatTranscriptResult,
  ExtractVocabResult,
} from '../types/admin-test-ai.types';

/** Map an AI-generated question into the editor's TestQuestion shape. */
const aiToTestQuestion = (
  partNumber: number,
  aiQ: AiGeneratedQuestion,
  questionNumber: number
): TestQuestion => {
  const labels = partNumber === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
  // Part 1 & 2 are listening: option text and question text are never printed.
  const blankPart = partNumber === 1 || partNumber === 2;
  const options = labels.map((label) => {
    const found = aiQ.options?.find((o) => o.label === label);
    return { label, text: blankPart ? '' : (found?.text ?? '') };
  });
  return {
    questionNumber,
    questionText: blankPart ? null : (aiQ.questionText ?? ''),
    options,
    correctAnswer: labels.includes(aiQ.correctAnswer) ? aiQ.correctAnswer : 'A',
    explanation: aiQ.explanation ?? '',
    media: aiQ.transcript ? { transcript: aiQ.transcript } : {},
    contentTags: { difficulty: 'B1', domain: [] },
    skillTags: { part: String(partNumber) },
  };
};

const QuestionEditor = ({
  question,
  partNumber,
  onChange,
  onRemove,
  groupContext,
}: {
  question: TestQuestion;
  partNumber: number;
  onChange: (updated: TestQuestion) => void;
  onRemove: () => void;
  groupContext?: TestMedia;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mediaGenOpen, setMediaGenOpen] = useState(false);
  const hasOptions4 = ![2].includes(partNumber); // Part 2 only has 3 options

  const { show } = useAiAssist();
  const [runAi] = useRunAiMutation();
  const blankPart = partNumber === 1 || partNumber === 2;

  // Per-question "Generate from media": only meaningful once media exists.
  // Part 1 needs the uploaded photo; Part 2 (audio-only) needs a transcript.
  const canGenerateFromMedia =
    (partNumber === 1 && (question.media?.imageUrls?.length ?? 0) > 0) ||
    (partNumber === 2 && !!question.media?.transcript?.trim());

  // Fill THIS question from an AI generation, preserving its number, id and any
  // uploaded media; only the authored fields (and transcript) are replaced.
  const applyGeneratedToQuestion = (aiQ: AiGeneratedQuestion) => {
    const mapped = aiToTestQuestion(partNumber, aiQ, question.questionNumber);
    onChange({
      ...question,
      questionText: mapped.questionText,
      options: mapped.options,
      correctAnswer: mapped.correctAnswer,
      explanation: mapped.explanation,
      media: {
        ...question.media,
        transcript: aiQ.transcript ?? question.media?.transcript ?? null,
      },
    });
  };

  const updateOption = (label: string, text: string) => {
    const newOptions = question.options.map((opt) =>
      opt.label === label ? { ...opt, text } : opt
    );
    onChange({ ...question, options: newOptions });
  };

  // Question view passed to prompts; for group parts we fold the shared
  // passage/transcript in so the AI can actually solve/tag the item.
  const promptQuestion = {
    questionText: question.questionText,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    media: {
      transcript:
        question.media?.transcript ??
        groupContext?.transcript ??
        groupContext?.passageHtml ??
        null,
    },
  };

  // ----- AI handlers -----
  const handleImprove = async () => {
    const res = (await runAi(
      buildImproveQuestion(partNumber, promptQuestion)
    ).unwrap()) as ImproveQuestionResult;
    show({
      id: 'improve',
      title: 'Question rewritten',
      status: 'info',
      body: (
        <div className="space-y-2">
          <p className="font-medium">{res.questionText}</p>
          {res.options?.length > 0 && (
            <ul className="list-disc pl-5">
              {res.options.map((o) => (
                <li key={o.label}>
                  <span className="font-semibold">{o.label}.</span> {o.text}
                </li>
              ))}
            </ul>
          )}
          {res.notes && (
            <p className="text-xs text-slate-500 italic">{res.notes}</p>
          )}
        </div>
      ),
      applyLabel: 'Use this version',
      onApply: () => {
        const newOptions = question.options.map((opt) => {
          const found = res.options?.find((o) => o.label === opt.label);
          return found ? { ...opt, text: found.text } : opt;
        });
        onChange({
          ...question,
          questionText: res.questionText || question.questionText,
          options: newOptions,
        });
      },
    });
  };

  const handleGenerateExplanation = async () => {
    const res = (await runAi(
      buildGenerateExplanation(promptQuestion)
    ).unwrap()) as GenerateExplanationResult;
    show({
      id: 'explanation',
      title: 'Suggested explanation',
      status: 'info',
      body: (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: res.explanation }}
        />
      ),
      applyLabel: 'Use this explanation',
      onApply: () => onChange({ ...question, explanation: res.explanation }),
    });
  };

  const handleGenerateDistractors = async () => {
    const correct = question.options.find(
      (o) => o.label === question.correctAnswer
    );
    if (!correct?.text?.trim()) {
      toast.error(
        'Enter the correct answer text before generating distractors.'
      );
      return;
    }
    const res = (await runAi(
      buildGenerateDistractors({
        part: partNumber,
        questionText: question.questionText,
        correctOptionText: correct.text,
      })
    ).unwrap()) as GenerateDistractorsResult;
    show({
      id: 'distractors',
      title: 'Suggested distractors',
      status: 'info',
      body: (
        <ul className="space-y-1">
          {res.options.map((o, i) => (
            <li key={i}>
              • {o.text}
              {o.distractorType && (
                <span className="ml-1 text-xs text-violet-500">
                  ({o.distractorType})
                </span>
              )}
            </li>
          ))}
        </ul>
      ),
      applyLabel: 'Fill distractors',
      onApply: () => {
        const otherLabels = question.options
          .map((o) => o.label)
          .filter((l) => l !== question.correctAnswer);
        const newOptions = question.options.map((opt) => {
          if (opt.label === question.correctAnswer) return opt;
          const idx = otherLabels.indexOf(opt.label);
          const d = res.options[idx];
          return d ? { ...opt, text: d.text } : opt;
        });
        onChange({ ...question, options: newOptions });
      },
    });
  };

  // Merged QA: spelling/grammar + answer validation + difficulty in one call.
  const handleReview = async () => {
    const res = (await runAi(
      buildReview(partNumber, promptQuestion)
    ).unwrap()) as ReviewResult;

    const claimed = question.correctAnswer?.toUpperCase();
    const predicted = res.predictedAnswer
      ? res.predictedAnswer.trim().toUpperCase().charAt(0)
      : null;
    const answerMismatch = predicted !== null && predicted !== claimed;
    const currentDiff = question.contentTags?.difficulty;
    const diffMismatch = Boolean(currentDiff && currentDiff !== res.cefr);

    let applyLabel: string | undefined;
    let onApply: (() => void) | undefined;
    if (answerMismatch && predicted) {
      applyLabel = `Change correct answer → ${predicted}`;
      onApply = () => onChange({ ...question, correctAnswer: predicted });
    } else if (diffMismatch) {
      applyLabel = `Tag difficulty: ${res.cefr}`;
      onApply = () =>
        onChange({
          ...question,
          contentTags: { ...question.contentTags, difficulty: res.cefr },
        });
    }

    show({
      id: 'review',
      title: answerMismatch
        ? `AI chose ${predicted} (you set ${claimed})`
        : 'AI Review',
      status: answerMismatch || res.issues.length ? 'warning' : 'success',
      applyLabel,
      onApply,
      body: (
        <div className="space-y-3">
          {/* Answer check */}
          <div>
            <p className="font-semibold">Answer check</p>
            {predicted ? (
              <p>
                AI chose <span className="font-semibold">{predicted}</span>{' '}
                (confidence {Math.round((res.confidence ?? 0) * 100)}%){' '}
                {answerMismatch ? (
                  <span className="text-amber-600">— doesn't match key!</span>
                ) : (
                  <span className="text-green-600">— matches key.</span>
                )}
              </p>
            ) : (
              <p className="text-slate-500">
                AI could not determine the answer (e.g. Part 1 needs an image).
              </p>
            )}
            {res.answerRationale && (
              <p className="text-slate-600">{res.answerRationale}</p>
            )}
          </div>
          {/* Difficulty */}
          <div>
            <p className="font-semibold">Difficulty: {res.cefr}</p>
            {diffMismatch && (
              <p className="text-amber-600">
                Differs from current tag ({currentDiff}).
              </p>
            )}
            {res.difficultyRationale && (
              <p className="text-slate-600">{res.difficultyRationale}</p>
            )}
          </div>
          {/* Proofread */}
          <div>
            <p className="font-semibold">
              Spelling / grammar{' '}
              {res.issues.length === 0 && (
                <span className="text-green-600">— no issues</span>
              )}
            </p>
            {res.issues.length > 0 && (
              <ul className="space-y-1">
                {res.issues.map((iss, i) => (
                  <li key={i}>
                    <span className="font-semibold capitalize">
                      {iss.type}:
                    </span>{' '}
                    <span className="line-through text-red-500">
                      {iss.original}
                    </span>{' '}
                    → <span className="text-green-600">{iss.suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ),
    });
  };

  const handleAutoTag = async () => {
    const res = (await runAi(
      buildAutoTag(partNumber, promptQuestion)
    ).unwrap()) as AutoTagResult;
    show({
      id: 'autotag',
      title: 'Suggested tags',
      status: 'info',
      body: (
        <div className="space-y-2 text-xs">
          <div>
            <p className="font-semibold">contentTags</p>
            <pre className="bg-slate-50 p-2 rounded overflow-auto">
              {JSON.stringify(res.contentTags, null, 2)}
            </pre>
          </div>
          <div>
            <p className="font-semibold">skillTags</p>
            <pre className="bg-slate-50 p-2 rounded overflow-auto">
              {JSON.stringify(res.skillTags, null, 2)}
            </pre>
          </div>
        </div>
      ),
      applyLabel: 'Apply tags',
      onApply: () =>
        onChange({
          ...question,
          contentTags: {
            ...question.contentTags,
            ...(res.contentTags as TestQuestion['contentTags']),
          },
          skillTags: {
            ...question.skillTags,
            ...(res.skillTags as TestQuestion['skillTags']),
          },
        }),
    });
  };

  return (
    <Card className="border border-slate-200">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <Badge className="bg-blue-600 text-white">
                  Question {question.questionNumber}
                </Badge>
                <span className="text-sm text-slate-500 truncate max-w-md">
                  {question.questionText || 'No content yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <QuestionPreviewDialog
                  question={question}
                  partNumber={partNumber}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* AI toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
                <Sparkles className="h-3.5 w-3.5" />
                AI
              </span>
              {canGenerateFromMedia && (
                <AiActionButton
                  label="Generate question (AI)"
                  icon={Wand2}
                  onRun={async () => setMediaGenOpen(true)}
                />
              )}
              {!blankPart && (
                <AiActionButton
                  label="Improve"
                  icon={Wand2}
                  onRun={handleImprove}
                />
              )}
              <AiActionButton
                label="Explanation"
                onRun={handleGenerateExplanation}
              />
              {!blankPart && (
                <AiActionButton
                  label="Distractors"
                  onRun={handleGenerateDistractors}
                />
              )}
              <AiActionButton
                label="AI Review"
                icon={CheckCircle2}
                onRun={handleReview}
              />
              <AiActionButton
                label="Auto-tag"
                icon={Tag}
                onRun={handleAutoTag}
              />
            </div>

            {/* Question Text */}
            <div>
              <Label>Question Content</Label>
              <Input
                value={question.questionText || ''}
                onChange={(e) =>
                  onChange({ ...question, questionText: e.target.value })
                }
                placeholder="Enter question content..."
                className="mt-1"
              />
            </div>

            {/* Media URLs with Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudioPreview
                url={question.media?.audioUrl || ''}
                onChange={(url) =>
                  onChange({
                    ...question,
                    media: { ...question.media, audioUrl: url || null },
                  })
                }
              />
              <ImagePreview
                urls={question.media?.imageUrls || []}
                onChange={(urls) =>
                  onChange({
                    ...question,
                    media: {
                      ...question.media,
                      imageUrls: urls.length > 0 ? urls : null,
                    },
                  })
                }
              />
            </div>

            {/* Transcript with Editor */}
            <RichTextEditor
              label="Transcript"
              value={question.media?.transcript || ''}
              onChange={(value) =>
                onChange({
                  ...question,
                  media: { ...question.media, transcript: value || null },
                })
              }
              placeholder="Enter transcript..."
              minHeight="80px"
            />

            {/* Options */}
            <div>
              <Label>Answers</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {question.options
                  .slice(0, hasOptions4 ? 4 : 3)
                  .map((option) => (
                    <div key={option.label} className="flex items-center gap-2">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          option.label === question.correctAnswer
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {option.label}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(option.label, e.target.value)
                        }
                        placeholder={`Answer ${option.label}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div className="flex items-center gap-4">
              <Label>Correct Answer:</Label>
              <Select
                value={question.correctAnswer}
                onValueChange={(value) =>
                  onChange({ ...question, correctAnswer: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  {hasOptions4 && <SelectItem value="D">D</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Explanation with Editor */}
            <RichTextEditor
              label="Explanation"
              value={question.explanation || ''}
              onChange={(value) =>
                onChange({ ...question, explanation: value })
              }
              placeholder="Enter answer explanation..."
              minHeight="100px"
            />

            {/* Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={question.contentTags?.difficulty || 'B1'}
                  onValueChange={(value) =>
                    onChange({
                      ...question,
                      contentTags: {
                        ...question.contentTags,
                        difficulty: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Beginner</SelectItem>
                    <SelectItem value="A2">A2 - Elementary</SelectItem>
                    <SelectItem value="B1">B1 - Intermediate</SelectItem>
                    <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                    <SelectItem value="C1">C1 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topics (comma-separated)</Label>
                <Input
                  value={question.contentTags?.domain?.join(', ') || ''}
                  onChange={(e) =>
                    onChange({
                      ...question,
                      contentTags: {
                        ...question.contentTags,
                        domain: e.target.value
                          ? e.target.value.split(',').map((s) => s.trim())
                          : [],
                      },
                    })
                  }
                  placeholder="business, office, travel"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Skill Tags (AI) */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-violet-500" />
                  Skill Tags
                  <span className="text-xs font-normal text-slate-400">
                    (feeds the diagnostic engine)
                  </span>
                </Label>
                {question.skillTags &&
                  Object.keys(question.skillTags).filter((k) => k !== 'part')
                    .length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-400 hover:text-red-500"
                      onClick={() =>
                        onChange({
                          ...question,
                          skillTags: { part: String(partNumber) },
                        })
                      }
                    >
                      Clear
                    </Button>
                  )}
              </div>
              <div className="mt-2">
                <SkillTagsEditor
                  part={partNumber}
                  value={
                    question.skillTags as Record<string, unknown> | undefined
                  }
                  onChange={(skillTags) =>
                    onChange({
                      ...question,
                      skillTags: skillTags as TestQuestion['skillTags'],
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <GenerateFromMediaDialog
        open={mediaGenOpen}
        onOpenChange={setMediaGenOpen}
        part={partNumber}
        imageUrls={question.media?.imageUrls ?? undefined}
        transcript={question.media?.transcript}
        onApply={applyGeneratedToQuestion}
      />
    </Card>
  );
};

// Inline vocabulary editor for group context
const VocabEditor = ({
  words,
  onChange,
}: {
  words: TestVocabWord[];
  onChange: (words: TestVocabWord[]) => void;
}) => {
  const updateWord = (i: number, field: keyof TestVocabWord, val: string) => {
    const next = [...words];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const removeWord = (i: number) =>
    onChange(words.filter((_, idx) => idx !== i));
  const addWord = () =>
    onChange([
      ...words,
      { word: '', partOfSpeech: '', meaning: '', example: '' },
    ]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-slate-700">
          Vocabulary
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addWord}
          className="h-7 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add word
        </Button>
      </div>
      {words.length === 0 && (
        <p className="text-xs text-slate-400 italic">
          No vocabulary yet. Use "Extract Vocab" or add manually.
        </p>
      )}
      <div className="space-y-2">
        {words.map((w, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center"
          >
            <Input
              value={w.word}
              onChange={(e) => updateWord(i, 'word', e.target.value)}
              placeholder="Word"
              className="h-8 text-sm"
            />
            <Input
              value={w.partOfSpeech || ''}
              onChange={(e) => updateWord(i, 'partOfSpeech', e.target.value)}
              placeholder="Part of speech"
              className="h-8 text-sm"
            />
            <Input
              value={w.meaning || ''}
              onChange={(e) => updateWord(i, 'meaning', e.target.value)}
              placeholder="Meaning (VI)"
              className="h-8 text-sm"
            />
            <Input
              value={w.example || ''}
              onChange={(e) => updateWord(i, 'example', e.target.value)}
              placeholder="Example"
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              onClick={() => removeWord(i)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const GroupEditor = ({
  group,
  partNumber,
  groupIndex,
  onGroupChange,
  onRemoveGroup,
}: {
  group: TestQuestionGroup;
  partNumber: number;
  groupIndex: number;
  onGroupChange: (updated: TestQuestionGroup) => void;
  onRemoveGroup: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { show } = useAiAssist();
  const [runAi] = useRunAiMutation();

  const ctx = group.groupContext || {};
  const contextText = ctx.passageHtml || ctx.transcript || '';

  const handleGenerateGroup = async () => {
    const res = (await runAi(
      buildGenerateGroup({
        part: partNumber,
        numQuestions: Math.max(group.questions.length || 3, 1),
      })
    ).unwrap()) as GenerateGroupResult;
    show({
      id: 'gen-group',
      title: `Generated group of ${res.questions.length} questions`,
      status: 'info',
      body: (
        <div className="space-y-2">
          <div
            className="prose prose-sm max-w-none border-b pb-2"
            dangerouslySetInnerHTML={{
              __html:
                res.groupContext.passageHtml ||
                res.groupContext.transcript ||
                '',
            }}
          />
          <ol className="list-decimal pl-5 space-y-1">
            {res.questions.map((q, i) => (
              <li key={i}>
                {q.questionText}{' '}
                <span className="text-xs text-green-600">
                  ({q.correctAnswer})
                </span>
              </li>
            ))}
          </ol>
        </div>
      ),
      applyLabel: 'Replace group content',
      onApply: () => {
        const startNum = group.questions[0]?.questionNumber ?? 1;
        onGroupChange({
          ...group,
          groupContext: { ...group.groupContext, ...res.groupContext },
          questions: res.questions.map((q, i) =>
            aiToTestQuestion(partNumber, q, startNum + i)
          ),
        });
      },
    });
  };

  const handleTranslate = async (source: string) => {
    if (!source.trim()) {
      toast.error('No content to translate.');
      return;
    }
    const res = (await runAi(
      buildTranslate(source)
    ).unwrap()) as TranslateResult;
    show({
      id: 'translate',
      title: 'Vietnamese translation',
      status: 'info',
      body: <p className="whitespace-pre-wrap">{res.translation}</p>,
      applyLabel: 'Set as translation',
      onApply: () =>
        onGroupChange({
          ...group,
          groupContext: {
            ...group.groupContext,
            translation: res.translation,
          },
        }),
    });
  };

  const handleFormatTranscript = async () => {
    if (!ctx.transcript?.trim()) {
      toast.error('No transcript to format.');
      return;
    }
    const res = (await runAi(
      buildFormatTranscript(ctx.transcript ?? '')
    ).unwrap()) as FormatTranscriptResult;
    show({
      id: 'format-transcript',
      title: 'Formatted transcript',
      status: 'info',
      body: (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: res.transcriptHtml }}
        />
      ),
      applyLabel: 'Use this version',
      onApply: () =>
        onGroupChange({
          ...group,
          groupContext: {
            ...group.groupContext,
            transcript: res.transcriptHtml,
          },
        }),
    });
  };

  const handleExtractVocab = async () => {
    if (!contextText.trim()) {
      toast.error('No content to extract vocabulary from.');
      return;
    }
    const res = (await runAi(
      buildExtractVocab(contextText)
    ).unwrap()) as ExtractVocabResult;
    show({
      id: 'vocab',
      title: `Extracted ${res.words.length} words`,
      status: 'info',
      body: (
        <ul className="space-y-1">
          {res.words.map((w, i) => (
            <li key={i}>
              <span className="font-semibold">{w.word}</span>{' '}
              <span className="text-xs text-slate-400">({w.partOfSpeech})</span>
              : {w.meaning}
              {w.example && (
                <p className="text-xs text-slate-500 italic">"{w.example}"</p>
              )}
            </li>
          ))}
        </ul>
      ),
      applyLabel: 'Save to test',
      onApply: () =>
        onGroupChange({
          ...group,
          groupContext: {
            ...group.groupContext,
            vocabulary: res.words.map((w) => ({
              word: w.word,
              partOfSpeech: w.partOfSpeech,
              meaning: w.meaning,
              example: w.example,
            })),
          },
        }),
    });
  };

  const addQuestion = () => {
    const maxNum = Math.max(0, ...group.questions.map((q) => q.questionNumber));
    const newQuestion: TestQuestion = {
      questionNumber: maxNum + 1,
      questionText: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correctAnswer: 'A',
      explanation: '',
      media: {},
      contentTags: { difficulty: 'B1', domain: [] },
      skillTags: { part: String(partNumber) },
    };
    onGroupChange({ ...group, questions: [...group.questions, newQuestion] });
  };

  const updateQuestion = (index: number, updated: TestQuestion) => {
    const newQuestions = [...group.questions];
    newQuestions[index] = updated;
    onGroupChange({ ...group, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = group.questions.filter((_, i) => i !== index);
    onGroupChange({ ...group, questions: newQuestions });
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50/30">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-purple-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <Badge className="bg-purple-600 text-white">
                  Group {groupIndex + 1} ({group.questions.length} questions)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <GroupPreviewDialog
                  group={group}
                  partNumber={partNumber}
                  groupIndex={groupIndex}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGroup();
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Group Context */}
            <div className="p-4 bg-white rounded-lg border border-purple-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-purple-700">
                  Shared Context
                </h4>
              </div>

              {/* AI toolbar */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI
                </span>
                <AiActionButton
                  label="Generate group"
                  icon={Wand2}
                  onRun={handleGenerateGroup}
                />
                <AiActionButton
                  label="Translate to VI"
                  icon={Languages}
                  onRun={() => handleTranslate(contextText)}
                />
                <AiActionButton
                  label="Format transcript"
                  onRun={handleFormatTranscript}
                />
                <AiActionButton
                  label="Extract Vocab"
                  onRun={handleExtractVocab}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AudioPreview
                  url={group.groupContext?.audioUrl || ''}
                  onChange={(url) =>
                    onGroupChange({
                      ...group,
                      groupContext: {
                        ...group.groupContext,
                        audioUrl: url || null,
                      },
                    })
                  }
                />
                <ImagePreview
                  urls={group.groupContext?.imageUrls || []}
                  onChange={(urls) =>
                    onGroupChange({
                      ...group,
                      groupContext: {
                        ...group.groupContext,
                        imageUrls: urls.length > 0 ? urls : null,
                      },
                    })
                  }
                />
              </div>

              <RichTextEditor
                label="Passage"
                value={group.groupContext?.passageHtml || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      passageHtml: value || null,
                    },
                  })
                }
                placeholder="Enter passage content..."
                minHeight="120px"
              />

              <RichTextEditor
                label="Transcript"
                value={group.groupContext?.transcript || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      transcript: value || null,
                    },
                  })
                }
                placeholder="Enter transcript..."
                minHeight="100px"
              />

              <RichTextEditor
                label="Translation"
                value={group.groupContext?.translation || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      translation: value || null,
                    },
                  })
                }
                placeholder="Enter translation..."
                minHeight="100px"
              />

              {/* Vocabulary editor */}
              <div className="border-t pt-3">
                <VocabEditor
                  words={group.groupContext?.vocabulary || []}
                  onChange={(words) =>
                    onGroupChange({
                      ...group,
                      groupContext: {
                        ...group.groupContext,
                        vocabulary: words.length > 0 ? words : null,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Questions in Group */}
            <div className="space-y-3">
              {group.questions.map((question, idx) => (
                <QuestionEditor
                  key={idx}
                  question={question}
                  partNumber={partNumber}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onRemove={() => removeQuestion(idx)}
                  groupContext={group.groupContext}
                />
              ))}

              <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const PartEditor = ({
  part,
  onChange,
}: {
  part: TestPart;
  onChange: (updated: TestPart) => void;
}) => {
  const partNumber = parseInt(part.partName.replace('Part ', ''));
  const isGroupPart = [3, 4, 6, 7].includes(partNumber);

  const [genDialogOpen, setGenDialogOpen] = useState(false);

  // Append AI-generated standalone questions (Parts 1, 2, 5).
  const insertGeneratedQuestions = (aiQuestions: AiGeneratedQuestion[]) => {
    const questions = part.questions || [];
    let maxNum = Math.max(0, ...questions.map((q) => q.questionNumber));
    const mapped = aiQuestions.map((q) =>
      aiToTestQuestion(partNumber, q, ++maxNum)
    );
    onChange({ ...part, questions: [...questions, ...mapped] });
  };

  // Append an AI-generated question group (Parts 3, 4, 6, 7).
  const insertGeneratedGroup = (
    groupContext: TestMedia,
    aiQuestions: AiGeneratedQuestion[]
  ) => {
    const groups = part.questionGroups || [];
    const allQuestions = groups.flatMap((g) => g.questions);
    let maxNum = Math.max(0, ...allQuestions.map((q) => q.questionNumber));
    const mapped = aiQuestions.map((q) =>
      aiToTestQuestion(partNumber, q, ++maxNum)
    );
    onChange({
      ...part,
      questionGroups: [
        ...groups,
        { groupContext: { ...groupContext }, questions: mapped },
      ],
    });
  };

  const addQuestion = () => {
    const questions = part.questions || [];
    const maxNum = Math.max(0, ...questions.map((q) => q.questionNumber));
    const newQuestion: TestQuestion = {
      questionNumber: maxNum + 1,
      questionText: '',
      options:
        partNumber === 2
          ? [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
            ]
          : [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
              { label: 'D', text: '' },
            ],
      correctAnswer: 'A',
      explanation: '',
      media: {},
      contentTags: { difficulty: 'B1', domain: [] },
      skillTags: { part: String(partNumber) },
    };
    onChange({ ...part, questions: [...questions, newQuestion] });
  };

  const addGroup = () => {
    const groups = part.questionGroups || [];
    const allQuestions = groups.flatMap((g) => g.questions);
    const maxNum = Math.max(0, ...allQuestions.map((q) => q.questionNumber));

    const newGroup: TestQuestionGroup = {
      groupContext: {},
      questions: [
        {
          questionNumber: maxNum + 1,
          questionText: '',
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' },
          ],
          correctAnswer: 'A',
          explanation: '',
          contentTags: { difficulty: 'B1', domain: [] },
          skillTags: { part: String(partNumber) },
        },
      ],
    };
    onChange({ ...part, questionGroups: [...groups, newGroup] });
  };

  const updateQuestion = (index: number, updated: TestQuestion) => {
    const questions = [...(part.questions || [])];
    questions[index] = updated;
    onChange({ ...part, questions });
  };

  const removeQuestion = (index: number) => {
    const questions = (part.questions || []).filter((_, i) => i !== index);
    onChange({ ...part, questions });
  };

  const updateGroup = (index: number, updated: TestQuestionGroup) => {
    const groups = [...(part.questionGroups || [])];
    groups[index] = updated;
    onChange({ ...part, questionGroups: groups });
  };

  const removeGroup = (index: number) => {
    const groups = (part.questionGroups || []).filter((_, i) => i !== index);
    onChange({ ...part, questionGroups: groups });
  };

  return (
    <div className="space-y-4">
      {/* AI generator (works for every part) */}
      <div className="flex justify-end">
        <AiActionButton
          label="Generate Questions (AI)"
          icon={Wand2}
          size="default"
          onRun={async () => setGenDialogOpen(true)}
        />
      </div>

      {!isGroupPart && (
        <>
          {(part.questions || []).map((question, idx) => (
            <QuestionEditor
              key={idx}
              question={question}
              partNumber={partNumber}
              onChange={(updated) => updateQuestion(idx, updated)}
              onRemove={() => removeQuestion(idx)}
            />
          ))}
          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full border-dashed border-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Question
          </Button>
        </>
      )}

      {isGroupPart && (
        <>
          {(part.questionGroups || []).map((group, idx) => (
            <GroupEditor
              key={idx}
              group={group}
              partNumber={partNumber}
              groupIndex={idx}
              onGroupChange={(updated) => updateGroup(idx, updated)}
              onRemoveGroup={() => removeGroup(idx)}
            />
          ))}
          <Button
            variant="outline"
            onClick={addGroup}
            className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Question Group
          </Button>
        </>
      )}

      <GenerateQuestionDialog
        open={genDialogOpen}
        onOpenChange={setGenDialogOpen}
        part={partNumber}
        onInsertQuestions={insertGeneratedQuestions}
        onInsertGroup={insertGeneratedGroup}
      />
    </div>
  );
};

export const AdminTestEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    data: originalTest,
    isLoading,
    error,
  } = useGetAdminTestByIdQuery(id || '');
  const [updateTest, { isLoading: isSaving }] = useUpdateTestMutation();

  const [test, setTest] = useState<AdminTest | null>(null);

  useEffect(() => {
    if (originalTest) {
      setTest({ ...originalTest });
    }
  }, [originalTest]);

  const handleSave = async () => {
    if (!test) return;

    // Calculate total number of questions
    const totalQuestions = test.parts.reduce((acc, part) => {
      if (part.questions) return acc + part.questions.length;
      if (part.questionGroups) {
        return (
          acc + part.questionGroups.reduce((a, g) => a + g.questions.length, 0)
        );
      }
      return acc;
    }, 0);

    try {
      await updateTest({
        id: test._id,
        data: {
          testTitle: test.testTitle,
          duration: test.duration,
          number_of_questions: totalQuestions,
          number_of_parts: test.number_of_parts,
          parts: test.parts,
        },
      }).unwrap();

      toast.success('Test saved successfully');

      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save test');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/admin/tests');
    }
  };

  const updateTestField = <K extends keyof AdminTest>(
    field: K,
    value: AdminTest[K]
  ) => {
    if (!test) return;
    setTest({ ...test, [field]: value });
    setHasChanges(true);
  };

  const updatePart = (partName: string, updated: TestPart) => {
    if (!test) return;
    const newParts = test.parts.map((p) =>
      p.partName === partName ? updated : p
    );
    setTest({ ...test, parts: newParts });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Test Not Found
          </h2>
          <Button onClick={() => navigate('/admin/tests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AiAssistProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Edit Test</h1>
                <p className="text-sm text-slate-500">{test.testTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700"
                >
                  Unsaved Changes
                </Badge>
              )}
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white shadow-md p-1 mb-6">
              <TabsTrigger value="info">General Information</TabsTrigger>
              {test.parts.map((part) => (
                <TabsTrigger key={part.partName} value={part.partName}>
                  {part.partName}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* General Info Tab */}
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Test Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Test Name *</Label>
                    <Input
                      value={test.testTitle}
                      onChange={(e) =>
                        updateTestField('testTitle', e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={test.duration}
                        onChange={(e) =>
                          updateTestField(
                            'duration',
                            parseInt(e.target.value) || 120
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Number of Questions</Label>
                      <Input
                        type="number"
                        value={test.number_of_questions}
                        onChange={(e) =>
                          updateTestField(
                            'number_of_questions',
                            parseInt(e.target.value) || 200
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Number of Parts</Label>
                      <Input
                        type="number"
                        value={test.number_of_parts}
                        disabled
                        className="mt-1 bg-slate-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Part Tabs */}
            {test.parts.map((part) => (
              <TabsContent key={part.partName} value={part.partName}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{part.partName}</span>
                      <Badge variant="secondary">
                        {part.questions?.length ||
                          part.questionGroups?.reduce(
                            (a, g) => a + g.questions.length,
                            0
                          ) ||
                          0}{' '}
                        questions
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PartEditor
                      part={part}
                      onChange={(updated) => updatePart(part.partName, updated)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Unsaved Changes Dialog */}
          <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unsaved Changes</DialogTitle>
                <DialogDescription>
                  You have unsaved changes. Do you want to save before leaving?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnsavedDialog(false);
                    navigate('/admin/tests');
                  }}
                >
                  Discard
                </Button>
                <Button
                  onClick={async () => {
                    await handleSave();
                    setShowUnsavedDialog(false);
                    navigate('/admin/tests');
                  }}
                >
                  Save and Exit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <AiSuggestionPanel />
      </div>
    </AiAssistProvider>
  );
};

export default AdminTestEdit;
