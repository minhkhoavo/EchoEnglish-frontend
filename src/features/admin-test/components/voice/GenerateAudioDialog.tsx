import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  Check,
  RefreshCw,
  Settings2,
  User,
  Users,
  Wand2,
  Mic2,
  Mic,
  Plus,
  Gauge,
  Type,
  AlertTriangle,
  AudioWaveform,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { htmlToText } from '@/lib/htmlToText';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConversationTurnsEditor } from './ConversationTurnsEditor';
import { useUploadTestAudioMutation } from '../../services/adminTestUploadApi';
import {
  BUILTIN_VOICE_PROFILES,
  DESIGN_ATTRIBUTES,
  type DesignAttrKey,
  type ConversationTurn,
} from '../../services/voiceApi';
import {
  getOmniConfig,
  setOmniConfig,
  ping,
  fetchVoices,
  createProfile,
  generateAudio,
  type OmniProfile,
} from '../../services/omnivoiceClient';

export interface GenerateAudioContext {
  partNumber?: number;
  questionNumber?: number;
  range?: { start: number; end: number };
  questionText?: string;
  options?: { label: string; text: string }[];
  defaultText?: string;
}

interface GenerateAudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: GenerateAudioContext;
  onAccepted: (url: string) => void;
}

interface ScriptChoice {
  label: string;
  text: string;
}
type GenMode = 'single' | 'conversation';
type DesignState = Partial<Record<DesignAttrKey, string>>;
type ServerStatus = 'checking' | 'online' | 'offline';

const DESIGN_KEYS = Object.keys(DESIGN_ATTRIBUTES) as DesignAttrKey[];
// Two-letter accent codes (flag emojis don't render on Windows / many fonts).
const CODES: Record<string, string> = {
  american: 'US',
  british: 'UK',
  australian: 'AU',
};

const PART_NAMES: Record<number, string> = {
  1: 'Photographs',
  2: 'Question–Response',
  3: 'Conversations',
  4: 'Short Talks',
};

/**
 * TOEIC transcript speaker tags, e.g. `M-Cn` (man, Canadian) or `W-Br`
 * (woman, British). First group = gender (M/W), second = accent region.
 */
const SPEAKER_RE = /\b([MW])-(Am|Au|Br|Cn|Us)\b/gi;

/** Map a transcript accent region to one of our built-in accents. */
const accentForRegion = (region: string): string => {
  const r = region.toLowerCase();
  return r === 'br' || r === 'au' ? 'british' : 'american';
};

/** Resolve a transcript speaker tag to a built-in voice profile id. */
const voiceForSpeaker = (genderTag: string, region: string): string => {
  const gender = genderTag.toUpperCase() === 'W' ? 'female' : 'male';
  const accent = accentForRegion(region);
  return (
    BUILTIN_VOICE_PROFILES.find(
      (p) => p.gender === gender && p.accent === accent
    )?.id ??
    BUILTIN_VOICE_PROFILES.find((p) => p.gender === gender)?.id ??
    BUILTIN_VOICE_PROFILES[0].id
  );
};

/** Strip TOEIC question-number markers like "(35)" and collapse whitespace. */
const cleanLine = (s: string) =>
  s
    .replace(/\((\d{1,3})\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Parse a TOEIC conversation transcript (HTML) into ordered speaker turns by
 * splitting on the standard `M-Cn` / `W-Br` speaker tags. Each tag maps to a
 * built-in voice. Returns [] when no tags are present (caller falls back to a
 * blank editor).
 */
const parseTranscriptTurns = (html?: string | null): ConversationTurn[] => {
  const text = htmlToText(html);
  if (!text) return [];
  const matches = [...text.matchAll(SPEAKER_RE)];
  if (!matches.length) return [];
  const turns: ConversationTurn[] = [];
  matches.forEach((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? text.length)
        : text.length;
    const body = cleanLine(text.slice(start, end));
    if (body) {
      turns.push({ voiceProfileId: voiceForSpeaker(m[1], m[2]), text: body });
    }
  });
  return turns;
};

/** Flatten a single-speaker transcript (Part 4 talk): drop tags + markers. */
const transcriptToScript = (html?: string | null): string =>
  cleanLine(htmlToText(html).replace(SPEAKER_RE, ' '));

const CHOICE_RE = /\(([A-D])\)/g;

/**
 * Parse a Part 1 / Part 2 transcript into a spoken stem + lettered choices.
 * Parts 1 & 2 keep the script in the transcript with "(A) … (B) …" markers
 * (Part 1 has no stem; Part 2's stem is the question before "(A)"). Speaker
 * tags are stripped. With no markers, the whole line becomes the stem.
 */
const parseLetteredScript = (
  html?: string | null
): { stem: string; choices: { label: string; text: string }[] } => {
  const text = cleanLine(htmlToText(html).replace(SPEAKER_RE, ' '));
  if (!text) return { stem: '', choices: [] };
  const matches = [...text.matchAll(CHOICE_RE)];
  if (!matches.length) return { stem: text, choices: [] };
  const stem = text.slice(0, matches[0].index ?? 0).trim();
  const choices = matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? text.length)
        : text.length;
    return {
      label: m[1].toUpperCase(),
      text: cleanLine(text.slice(start, end)),
    };
  });
  return { stem, choices };
};

export const GenerateAudioDialog = ({
  open,
  onOpenChange,
  context,
  onAccepted,
}: GenerateAudioDialogProps) => {
  const [uploadAudio, { isLoading: accepting }] = useUploadTestAudioMutation();
  const cloneInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const canConverse = context.range != null;
  const showStem = context.partNumber !== 1;

  const [status, setStatus] = useState<ServerStatus>('checking');
  const [profiles, setProfiles] = useState<OmniProfile[]>([]);
  const [genMode, setGenMode] = useState<GenMode>('single');
  const [text, setText] = useState('');
  const [stem, setStem] = useState('');
  const [choices, setChoices] = useState<ScriptChoice[]>([]);
  const [selectedId, setSelectedId] = useState(BUILTIN_VOICE_PROFILES[0].id);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [speed, setSpeed] = useState(1);
  const [design, setDesign] = useState<DesignState>({});
  // The instruction string sent to the model. Seeded from the attribute
  // dropdowns but freely editable by the user.
  const [designText, setDesignText] = useState('');
  const [cloneUploading, setCloneUploading] = useState(false);
  const hasIntro = context.questionNumber != null || context.range != null;
  const [includeIntro, setIncludeIntro] = useState(hasIntro);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewBlobRef = useRef<Blob | null>(null);
  const [generating, setGenerating] = useState(false);

  const structured = genMode === 'single' && (context.options?.length ?? 0) > 0;

  const partName = PART_NAMES[context.partNumber ?? 0];

  const voiceCards = useMemo(
    () => [
      ...BUILTIN_VOICE_PROFILES.map((b) => ({
        id: b.id,
        name: b.name,
        kind: 'builtin' as const,
        accent: b.accent,
        gender: b.gender,
      })),
      ...profiles.map((p) => ({
        id: p.id,
        name: p.name,
        kind: 'profile' as const,
        sub: p.kind,
      })),
      { id: '__design', name: 'Voice Design', kind: 'design' as const },
      { id: '__clone', name: 'Clone a voice', kind: 'clone' as const },
    ],
    [profiles]
  );

  const selectedKind =
    voiceCards.find((c) => c.id === selectedId)?.kind ?? 'builtin';

  /** Rebuild the editable instruction string from the attribute dropdowns. */
  const applyDesign = (next: DesignState) => {
    setDesign(next);
    setDesignText(
      DESIGN_KEYS.map((k) => next[k])
        .filter(Boolean)
        .join(', ')
    );
  };

  const setPreviewBlob = (blob: Blob | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewBlobRef.current = blob;
    const url = blob ? URL.createObjectURL(blob) : null;
    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  // Init on open + check server + load saved profiles.
  useEffect(() => {
    if (!open) return;
    const p = context.partNumber;
    const isConversation = canConverse && p === 3;

    if (p === 1 || p === 2) {
      // Parts 1 & 2: the spoken script lives in the transcript ("(A) … (B) …")
      // — options / questionText are usually blank. Parse stem + lettered
      // choices from it, but let any real option/question text win.
      const parsed = parseLetteredScript(context.defaultText);
      setStem(htmlToText(context.questionText) || parsed.stem);
      setChoices(
        (context.options ?? []).map((o) => ({
          label: o.label,
          text:
            htmlToText(o.text) ||
            parsed.choices.find((c) => c.label === o.label)?.text ||
            '',
        }))
      );
      setText('');
    } else {
      // Part 4 talk: read the transcript as one script (tags + markers
      // stripped). Other single parts: prefer the question text.
      setStem(htmlToText(context.questionText));
      setChoices(
        (context.options ?? []).map((o) => ({
          label: o.label,
          text: htmlToText(o.text),
        }))
      );
      setText(
        p === 4
          ? transcriptToScript(context.defaultText)
          : htmlToText(context.defaultText)
      );
    }

    // Part 3 conversation: parse the transcript into speaker turns. Falls back
    // to a blank editor when the transcript has no speaker tags yet.
    setTurns(isConversation ? parseTranscriptTurns(context.defaultText) : []);
    setIncludeIntro(hasIntro);
    setDesign({});
    setDesignText('');
    setSelectedId(BUILTIN_VOICE_PROFILES[0].id);
    setGenMode(
      canConverse && context.partNumber === 3 ? 'conversation' : 'single'
    );
    setPreviewBlob(null);
    setStatus('checking');
    ping().then((ok) => setStatus(ok ? 'online' : 'offline'));
    fetchVoices()
      .then((v) => setProfiles(v.profiles ?? []))
      .catch(() => setProfiles([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (genMode === 'conversation' && turns.length === 0) {
      const a = BUILTIN_VOICE_PROFILES[0].id;
      const b = BUILTIN_VOICE_PROFILES[1]?.id ?? a;
      setTurns([
        { voiceProfileId: a, text: '' },
        { voiceProfileId: b, text: '' },
      ]);
    }
  }, [genMode, turns.length]);

  // Invalidate the preview whenever inputs change.
  useEffect(() => {
    setPreviewBlob(null);
  }, [
    genMode,
    text,
    stem,
    choices,
    selectedId,
    turns,
    speed,
    designText,
    includeIntro,
  ]);

  // Revoke the object URL on unmount.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const handleCloneFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCloneUploading(true);
    try {
      const form = new FormData();
      form.append('name', file.name.replace(/\.[^.]+$/, '') || 'Cloned voice');
      form.append('file', file);
      const prof = await createProfile(form);
      setProfiles((prev) => [...prev, prof]);
      setSelectedId(prof.id);
      toast.success(`Voice “${prof.name}” cloned.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create the clone.'
      );
    } finally {
      setCloneUploading(false);
    }
  };

  const buildPayload = () => {
    const loc = context.range
      ? { range: context.range }
      : context.questionNumber != null
        ? { question_number: context.questionNumber }
        : {};
    const common = {
      ...loc,
      include_intro: includeIntro,
      speed,
      response_format: 'mp3' as const,
    };

    if (genMode === 'conversation') {
      const cleaned = turns
        .filter((t) => t.text.trim() && t.voiceProfileId)
        .map((t) => ({ text: t.text.trim(), voice: t.voiceProfileId }));
      if (!cleaned.length) {
        toast.error('Add at least one turn with a voice and text.');
        return null;
      }
      return { ...common, turns: cleaned };
    }

    let voiceField: { voice?: string; instructions?: string };
    if (selectedKind === 'design') {
      const instructions = designText.trim();
      if (!instructions) {
        toast.error('Describe the voice or pick at least one attribute.');
        return null;
      }
      voiceField = { instructions };
    } else if (selectedKind === 'clone') {
      toast.error('Upload a sample to create the clone first.');
      return null;
    } else {
      voiceField = { voice: selectedId };
    }

    if (structured) {
      const list = choices
        .filter((c) => c.text.trim())
        .map((c) => ({ label: c.label, text: c.text.trim() }));
      if (!list.length) {
        toast.error('Enter at least one choice.');
        return null;
      }
      return {
        ...common,
        ...voiceField,
        ...(showStem && stem.trim() ? { stem: stem.trim() } : {}),
        choices: list,
      };
    }

    if (!text.trim()) {
      toast.error('Enter the script text.');
      return null;
    }
    return { ...common, ...voiceField, text: text.trim() };
  };

  const handleGenerate = async () => {
    if (!getOmniConfig().baseUrl) {
      toast.error('Set the EchoEnglish Voice server URL (gear icon).');
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    setGenerating(true);
    try {
      const blob = await generateAudio(payload);
      setPreviewBlob(blob);
      toast.success('Audio generated.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to generate audio.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async () => {
    const blob = previewBlobRef.current;
    if (!blob) return;
    try {
      const file = new File([blob], `voice-${Date.now()}.mp3`, {
        type: 'audio/mpeg',
      });
      const res = await uploadAudio({ file }).unwrap();
      onAccepted(res.url);
      toast.success('Audio attached.');
      onOpenChange(false);
    } catch {
      toast.error('Failed to save the audio.');
    }
  };

  const introLabel = context.range
    ? `Questions ${context.range.start}–${context.range.end}`
    : context.questionNumber != null
      ? `Question ${context.questionNumber}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-2xl gap-0 overflow-hidden rounded-2xl border-slate-200/80 p-0',
          'shadow-2xl shadow-slate-900/10',
          '[&>button]:top-5 [&>button]:text-white/50 [&>button]:transition-colors [&>button]:hover:text-white'
        )}
      >
        <style>{`@keyframes vs-eq{0%,100%{transform:scaleY(.28)}50%{transform:scaleY(1)}}`}</style>

        {/* ---------------------------------- Header --------------------------------- */}
        <div className="relative overflow-hidden bg-[#0b1220] px-6 py-5 text-white">
          {/* atmospheric brand glow + grid, replacing the generic blur blob */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <AudioWaveform className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[17px] font-semibold tracking-tight">
                  Voice Studio
                </DialogTitle>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-200 ring-1 ring-inset ring-white/10">
                  Echo English
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-xs text-slate-400">
                {[partName, introLabel, 'neural speech synthesis']
                  .filter(Boolean)
                  .join(' · ')}
              </DialogDescription>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Equalizer active={generating} />
              <StatusDot status={status} />
              <SettingsPopover
                onSaved={() => {
                  setStatus('checking');
                  ping().then((ok) => setStatus(ok ? 'online' : 'offline'));
                }}
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------- Body ---------------------------------- */}
        <div className="max-h-[68vh] space-y-6 overflow-y-auto bg-gradient-to-b from-white to-slate-50/60 px-6 py-5 scrollbar-thin">
          {status === 'offline' && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                Can’t reach the EchoEnglish server. Open{' '}
                <span className="font-medium">settings</span> (gear icon) to set
                the server URL.
              </span>
            </div>
          )}

          {canConverse && <ModeToggle mode={genMode} onChange={setGenMode} />}

          {genMode === 'conversation' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ConversationTurnsEditor
                turns={turns}
                onChange={setTurns}
                profiles={BUILTIN_VOICE_PROFILES}
              />
            </div>
          ) : (
            <>
              {/* Script */}
              <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SectionLabel icon={Type}>Script</SectionLabel>
                {structured ? (
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    {showStem && (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Question
                        </Label>
                        <Input
                          value={stem}
                          onChange={(e) => setStem(e.target.value)}
                          placeholder="Question / statement"
                          className="bg-slate-50/60"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {choices.map((choice, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-xs font-bold text-white shadow-sm">
                            {choice.label}
                          </span>
                          <Input
                            value={choice.text}
                            onChange={(e) =>
                              setChoices((prev) =>
                                prev.map((c, j) =>
                                  j === i ? { ...c, text: e.target.value } : c
                                )
                              )
                            }
                            placeholder={`Choice ${choice.label}`}
                            className="bg-slate-50/60"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text to read aloud…"
                    rows={4}
                    className="resize-none bg-white leading-relaxed shadow-sm"
                  />
                )}
              </section>

              {/* Voice picker */}
              <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 [animation-delay:60ms]">
                <SectionLabel icon={Mic}>Voice</SectionLabel>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {voiceCards.map((c) => (
                    <VoiceCard
                      key={c.id}
                      active={selectedId === c.id}
                      onClick={() => setSelectedId(c.id)}
                      kind={c.kind}
                      name={c.name}
                      accent={'accent' in c ? c.accent : undefined}
                      gender={'gender' in c ? c.gender : undefined}
                      sub={'sub' in c ? c.sub : undefined}
                    />
                  ))}
                </div>

                {/* Design attributes */}
                {selectedKind === 'design' && (
                  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {DESIGN_KEYS.map((key) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-[11px] font-medium capitalize text-slate-500">
                            {key}
                          </Label>
                          <Select
                            value={design[key] ?? 'any'}
                            onValueChange={(v) =>
                              applyDesign({
                                ...design,
                                [key]: v === 'any' ? undefined : v,
                              })
                            }
                          >
                            <SelectTrigger className="h-9 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {DESIGN_ATTRIBUTES[key].map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-inset ring-blue-100 focus-within:ring-blue-300">
                      <Wand2 className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <input
                        value={designText}
                        onChange={(e) => setDesignText(e.target.value)}
                        placeholder="Choose attributes to design the voice."
                        className="w-full bg-transparent text-xs italic text-slate-600 placeholder:not-italic placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Clone upload */}
                {selectedKind === 'clone' && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-1 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      ref={cloneInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleCloneFile}
                    />
                    <button
                      type="button"
                      onClick={() => cloneInputRef.current?.click()}
                      disabled={cloneUploading}
                      className="group flex w-full flex-col items-center gap-2 rounded-lg py-5 text-sm text-slate-500 transition-colors hover:bg-blue-50/50 hover:text-blue-600"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-colors group-hover:ring-blue-300">
                        {cloneUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        ) : (
                          <Plus className="h-5 w-5" />
                        )}
                      </span>
                      <span className="font-medium">
                        Upload a 5–15s sample to clone a new voice
                      </span>
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Speaking rate */}
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 [animation-delay:120ms]">
            <div className="flex items-center justify-between">
              <SectionLabel icon={Gauge}>Speaking rate</SectionLabel>
              <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-cyan-200">
                {speed.toFixed(2)}×
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 pb-2.5 pt-3.5 shadow-sm">
              <Slider
                min={0.5}
                max={1.5}
                step={0.05}
                value={[speed]}
                onValueChange={(v) => setSpeed(v[0])}
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>0.5× Slower</span>
                <span>1.0× Normal</span>
                <span>1.5× Faster</span>
              </div>
            </div>
          </section>

          {/* Intro toggle */}
          {introLabel && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-colors hover:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-300 [animation-delay:160ms]">
              <Switch
                checked={includeIntro}
                onCheckedChange={setIncludeIntro}
              />
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    Prepend TOEIC intro
                  </span>
                  <span className="rounded bg-blue-50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                    TOEIC
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  “{introLabel}…”
                </div>
              </div>
            </label>
          )}

          {/* Preview */}
          {previewUrl && (
            <section className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
              <div className="relative mb-3 flex items-center justify-between">
                <SectionLabel icon={AudioWaveform}>Preview</SectionLabel>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Ready
                </span>
              </div>
              <audio controls src={previewUrl} className="relative w-full" />
            </section>
          )}
        </div>

        {/* ---------------------------------- Footer --------------------------------- */}
        <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-6 py-3.5">
          <p className="hidden flex-1 text-xs text-slate-400 sm:block">
            {previewUrl
              ? 'Review the preview, then attach it to the question.'
              : 'Generate a preview before attaching.'}
          </p>
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating || accepting}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {previewUrl ? 'Regenerate' : 'Generate'}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!previewUrl || generating || accepting}
            className="min-w-32 gap-2 bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-600"
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            )}
            Accept &amp; attach
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* --------------------------------- bits --------------------------------- */

const EQ_BARS = [0.45, 0.85, 0.55, 1, 0.4, 0.7];

const Equalizer = ({ active }: { active: boolean }) => (
  <div className="hidden h-7 items-end gap-[3px] sm:flex" aria-hidden>
    {EQ_BARS.map((h, i) => (
      <span
        key={i}
        className="w-[3px] rounded-full bg-gradient-to-t from-blue-400/70 to-cyan-300"
        style={{
          height: `${h * 100}%`,
          transformOrigin: 'bottom',
          transform: active ? undefined : `scaleY(${0.35 + h * 0.25})`,
          animation: active
            ? `vs-eq ${700 + i * 70}ms ease-in-out ${i * 80}ms infinite`
            : undefined,
        }}
      />
    ))}
  </div>
);

const SectionLabel = ({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-500">
      <Icon className="h-3 w-3" />
    </span>
    {children}
  </div>
);

const StatusDot = ({ status }: { status: ServerStatus }) => {
  const map = {
    checking: ['bg-amber-400', 'Checking…'],
    online: ['bg-emerald-400', 'Connected'],
    offline: ['bg-rose-500', 'Offline'],
  } as const;
  const [color, label] = map[status];
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            color,
            status === 'checking' && 'animate-pulse'
          )}
        />
      </span>
      {label}
    </span>
  );
};

const ModeToggle = ({
  mode,
  onChange,
}: {
  mode: GenMode;
  onChange: (m: GenMode) => void;
}) => (
  <div className="relative grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
    <span
      className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm ring-1 ring-slate-200/60 transition-transform duration-300 ease-out"
      style={{
        transform:
          mode === 'conversation' ? 'translateX(100%)' : 'translateX(0)',
      }}
    />
    {[
      { value: 'single' as const, icon: User, label: 'Single voice' },
      { value: 'conversation' as const, icon: Users, label: 'Conversation' },
    ].map(({ value, icon: Icon, label }) => (
      <button
        key={value}
        type="button"
        onClick={() => onChange(value)}
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors',
          mode === value
            ? 'text-blue-600'
            : 'text-slate-500 hover:text-slate-700'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    ))}
  </div>
);

const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const VoiceCard = ({
  active,
  onClick,
  kind,
  name,
  accent,
  gender,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  kind: 'builtin' | 'profile' | 'design' | 'clone';
  name: string;
  accent?: string;
  gender?: string;
  sub?: string;
}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const title = kind === 'builtin' && gender ? `${cap(gender)} voice` : name;
  const subtitle =
    kind === 'builtin'
      ? accent
        ? `${cap(accent)} accent`
        : 'Standard voice'
      : kind === 'profile'
        ? sub === 'clone'
          ? 'Cloned voice'
          : cap(sub) || 'Custom'
        : kind === 'design'
          ? 'Custom attributes'
          : 'From a sample';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-xl border bg-white p-2.5 text-left transition-all duration-200',
        active
          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/25'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm',
          kind === 'design' && 'bg-gradient-to-br from-indigo-500 to-blue-500',
          kind === 'clone' && 'bg-gradient-to-br from-cyan-500 to-teal-500',
          kind === 'profile' && 'bg-gradient-to-br from-slate-700 to-slate-900',
          kind === 'builtin' &&
            (gender === 'female'
              ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-[11px] tracking-wide'
              : 'bg-gradient-to-br from-sky-500 to-blue-600 text-[11px] tracking-wide')
        )}
      >
        {kind === 'design' ? (
          <Wand2 className="h-4 w-4" />
        ) : kind === 'clone' ? (
          <Mic2 className="h-4 w-4" />
        ) : kind === 'builtin' ? (
          ((accent && CODES[accent]) ?? initials)
        ) : (
          initials
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">
          {title}
        </span>
        <span className="block truncate text-[11px] capitalize text-slate-400">
          {subtitle}
        </span>
      </span>
      {active && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

const SettingsPopover = ({ onSaved }: { onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open) {
      const cfg = getOmniConfig();
      setBaseUrl(cfg.baseUrl);
      setApiKey(cfg.apiKey);
    }
  }, [open]);

  const save = () => {
    setOmniConfig({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    onSaved();
    setOpen(false);
    toast.success('EchoEnglish Voice settings saved.');
  };

  const test = async () => {
    setOmniConfig({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    setTesting(true);
    const ok = await ping();
    setTesting(false);
    if (ok) toast.success('Connected to EchoEnglish Voice.');
    else toast.error('Could not reach the server.');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          title="EchoEnglish Voice settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Settings2 className="h-4 w-4 text-slate-400" />
          EchoEnglish Voice server
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Server URL</Label>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://xxxx.ngrok-free.app"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">API key (optional)</Label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            placeholder="Bearer token"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Button variant="ghost" size="sm" onClick={test} disabled={testing}>
            {testing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : null}
            Test connection
          </Button>
          <Button size="sm" onClick={save}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GenerateAudioDialog;
