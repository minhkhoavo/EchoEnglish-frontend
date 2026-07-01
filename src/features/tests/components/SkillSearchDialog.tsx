import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Shuffle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TOEIC_PARTS,
  DEFAULT_QUESTION_LIMIT,
  MAX_QUESTION_LIMIT,
} from '../constants/toeicSkills';
import { DOMAIN_LABELS, Domain } from '@/features/learning-plan-setup/types';
import {
  useFindQuestionsBySkillMutation,
  useParseSkillSearchQueryMutation,
  buildSkillSearchPrompt,
  type FindQuestionsBySkillRequest,
} from '../services/skillSearchApi';
import { useFetchQuestionsByIdsQuery } from '@/features/practice-drill/services/practiceDrillApi';
import type {
  PracticeDrillData,
  PracticeDrillQuestion,
} from '@/features/practice-drill/types/practice-drill.types';
import {
  QuestionPreviewDialog,
  type TestQuestion,
} from '@/features/admin-test';

interface SkillSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewQuestion {
  id: string;
  partName: string;
  partNumber: number;
  questionNumber: number;
  questionText: string | null;
  raw: PracticeDrillQuestion;
}

type MaybeOID = string | { $oid: string };
function getOidString(id: MaybeOID): string {
  return typeof id === 'string' ? id : id.$oid;
}

function flattenPracticeDrillData(data: PracticeDrillData): PreviewQuestion[] {
  const items: PreviewQuestion[] = [];
  const seenIds = new Set<string>();

  const pushItem = (
    q: PracticeDrillQuestion,
    partName: string,
    partNumber: number
  ) => {
    const id = getOidString(q._id);
    if (seenIds.has(id)) return; // guard against duplicated source data
    seenIds.add(id);
    items.push({
      id,
      partName,
      partNumber,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      raw: q,
    });
  };

  for (const part of data.parts) {
    const partNumber = Number(part.partName.match(/\d+/)?.[0] ?? 0);
    for (const q of part.questions ?? []) {
      pushItem(q, part.partName, partNumber);
    }
    for (const group of part.questionGroups ?? []) {
      for (const q of group.questions) {
        pushItem(q, part.partName, partNumber);
      }
    }
  }
  return items.sort((a, b) => a.questionNumber - b.questionNumber);
}

// Reuses the admin test-editor's rich QuestionPreviewDialog (audio/image/
// transcript/explanation rendering) instead of re-building a preview UI.
function toAdminPreviewQuestion(q: PracticeDrillQuestion): TestQuestion {
  return {
    _id: getOidString(q._id),
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    media: q.media,
    contentTags: q.contentTags,
    skillTags: q.skillTags,
  };
}

export function SkillSearchDialog({
  open,
  onOpenChange,
}: SkillSearchDialogProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'advanced'>('manual');
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [selectedParts, setSelectedParts] = useState<string[]>(['5']);
  // Keyed as `${partValue}::${skillValue}` since several parts (e.g. 3 & 4,
  // or 6 & 7) share the same skill value strings — a flat skill-value array
  // would make checking a skill under one part also appear checked under
  // another part that happens to list the same value.
  const [selectedSkillKeys, setSelectedSkillKeys] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [limit, setLimit] = useState(DEFAULT_QUESTION_LIMIT);
  const [nlQuery, setNlQuery] = useState('');

  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState<string[]>([]);
  const [randomCount, setRandomCount] = useState(5);

  const [findQuestionsBySkill, { isLoading: isSearching }] =
    useFindQuestionsBySkillMutation();
  const [parseSkillSearchQuery, { isLoading: isParsing }] =
    useParseSkillSearchQueryMutation();
  const { data: previewData, isFetching: isLoadingPreview } =
    useFetchQuestionsByIdsQuery(matchedIds, {
      skip: step !== 'preview' || matchedIds.length === 0,
    });

  const previewItems = useMemo(
    () => (previewData ? flattenPracticeDrillData(previewData) : []),
    [previewData]
  );

  const currentParts = useMemo(
    () => TOEIC_PARTS.filter((p) => selectedParts.includes(p.value)),
    [selectedParts]
  );

  const togglePart = (partValue: string) => {
    setSelectedParts((prev) => {
      const next = prev.includes(partValue)
        ? prev.filter((p) => p !== partValue)
        : [...prev, partValue];
      setSelectedSkillKeys((keys) =>
        keys.filter((k) => next.includes(k.split('::')[0]))
      );
      return next;
    });
  };

  const toggleSkill = (partValue: string, skill: string) => {
    const key = `${partValue}::${skill}`;
    setSelectedSkillKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // De-duplicated skill values (without the part prefix) sent to the search
  // API — part scoping for the query itself comes from `selectedParts`.
  const selectedSkillValues = useMemo(
    () => Array.from(new Set(selectedSkillKeys.map((k) => k.split('::')[1]))),
    [selectedSkillKeys]
  );

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  const togglePreviewItem = (id: string) => {
    setSelectedPreviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const runSearch = async (criteria: FindQuestionsBySkillRequest) => {
    try {
      const rawIds = await findQuestionsBySkill(criteria).unwrap();

      if (!rawIds || rawIds.length === 0) {
        toast.error('No matching questions found. Try different filters.');
        return;
      }

      // Defensive de-dupe: some tests contain the same question _id more
      // than once (duplicated part/question-group data), which can surface
      // the same question twice in the results.
      const questionIds = Array.from(new Set(rawIds));

      setMatchedIds(questionIds);
      setSelectedPreviewIds(questionIds);
      setStep('preview');
    } catch {
      toast.error('Something went wrong while searching. Please try again.');
    }
  };

  const handleSearch = () => {
    if (selectedParts.length === 0) {
      toast.error('Select at least one part.');
      return;
    }
    if (selectedSkillValues.length === 0 && selectedDomains.length === 0) {
      toast.error('Select at least one skill or topic.');
      return;
    }
    return runSearch({
      parts: selectedParts,
      skills: selectedSkillValues.length > 0 ? selectedSkillValues : undefined,
      domains: selectedDomains.length > 0 ? selectedDomains : undefined,
      limit,
    });
  };

  const handleRandomPick = () => {
    const n = Math.min(Math.max(1, randomCount), matchedIds.length);
    const shuffled = [...matchedIds].sort(() => Math.random() - 0.5);
    setSelectedPreviewIds(shuffled.slice(0, n));
  };

  const handleStartDrill = () => {
    if (selectedPreviewIds.length === 0) {
      toast.error('Select at least one question to start.');
      return;
    }
    onOpenChange(false);
    navigate('/practice-drill', {
      state: { questionIds: selectedPreviewIds },
    });
  };

  // Advanced mode sends the query + the system's known parts/skills/topics to
  // the existing one-shot /chat/message endpoint (same "prompt in, JSON out"
  // endpoint already used by readingExerciseApi.ts), gets back structured
  // tags, then calls the same search API as Manual mode — no chatbot UI or
  // dedicated NL-parsing backend involved.
  const handleAdvancedSearch = async () => {
    const query = nlQuery.trim();
    if (!query) return;

    try {
      const parsed = await parseSkillSearchQuery({
        message: buildSkillSearchPrompt(query),
      }).unwrap();

      const parts = (parsed.parts ?? []).filter((p) =>
        TOEIC_PARTS.some((tp) => tp.value === p)
      );
      const skills = parsed.skills ?? [];
      const domains = (parsed.domains ?? []).filter((d) =>
        Object.values(Domain).includes(d as Domain)
      );

      if (
        parsed.raw ||
        (parts.length === 0 && skills.length === 0 && domains.length === 0)
      ) {
        toast.error(
          "Couldn't understand that request. Try rephrasing or use Manual mode."
        );
        return;
      }

      // Keep Manual tab's state in sync so "Back" from the preview step
      // reflects what was actually searched for.
      if (parts.length > 0) setSelectedParts(parts);
      setSelectedDomains(domains);

      await runSearch({
        parts: parts.length > 0 ? parts : undefined,
        skills: skills.length > 0 ? skills : undefined,
        domains: domains.length > 0 ? domains : undefined,
        limit: parsed.limit ?? DEFAULT_QUESTION_LIMIT,
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep('form');
      setMatchedIds([]);
      setSelectedPreviewIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Search Questions by Skill</DialogTitle>
              <DialogDescription>
                Pick parts and skills to practice, or ask the AI assistant in
                natural language.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'manual' | 'advanced')}
            >
              <TabsList>
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="advanced">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4 pt-2">
                <div>
                  <Label className="mb-2 block">
                    Parts (select one or more)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {TOEIC_PARTS.map((part) => (
                      <button
                        key={part.value}
                        type="button"
                        onClick={() => togglePart(part.value)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                          selectedParts.includes(part.value)
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'bg-background border border-border text-foreground'
                        }`}
                      >
                        Part {part.value}
                      </button>
                    ))}
                  </div>
                </div>

                {currentParts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Select at least one part above to see its skills.
                  </p>
                ) : (
                  currentParts.map((part) => (
                    <div key={part.value}>
                      <Label className="mb-2 block">
                        {part.label} – Skills
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide pr-1">
                        {part.skills.map((skill) => {
                          const key = `${part.value}::${skill.value}`;
                          return (
                            <div
                              key={skill.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`skill-${key}`}
                                checked={selectedSkillKeys.includes(key)}
                                onCheckedChange={() =>
                                  toggleSkill(part.value, skill.value)
                                }
                              />
                              <label
                                htmlFor={`skill-${key}`}
                                className="text-sm leading-none cursor-pointer"
                              >
                                {skill.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                <div>
                  <Label className="mb-2 block">Topics (optional)</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-hide pr-1">
                    {Object.values(Domain).map((domain) => (
                      <Badge
                        key={domain}
                        variant={
                          selectedDomains.includes(domain)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer select-none"
                        onClick={() => toggleDomain(domain)}
                      >
                        {DOMAIN_LABELS[domain]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="question-limit" className="whitespace-nowrap">
                    Number of questions
                  </Label>
                  <Input
                    id="question-limit"
                    type="number"
                    min={1}
                    max={MAX_QUESTION_LIMIT}
                    value={limit}
                    onChange={(e) =>
                      setLimit(
                        Math.min(
                          MAX_QUESTION_LIMIT,
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-24"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-3 pt-2">
                <Label>Describe what you want to practice</Label>
                <Textarea
                  placeholder='E.g. "Give me 15 grammar questions about verb tense in Part 5, office topics"'
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  The AI will match your request to parts, skills, and topics,
                  then search for questions directly.
                </p>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              {activeTab === 'manual' ? (
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Find Questions
                </Button>
              ) : (
                <Button
                  onClick={handleAdvancedSearch}
                  disabled={isParsing || isSearching || !nlQuery.trim()}
                >
                  {isParsing || isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Find Questions
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Preview Questions</DialogTitle>
              <DialogDescription>
                {matchedIds.length} question{matchedIds.length !== 1 && 's'}{' '}
                found. Pick the ones you want, or use random pick, then start
                the drill.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-2 border-b pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPreviewIds(matchedIds)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPreviewIds([])}
              >
                Clear
              </Button>
              <div className="flex items-center gap-1.5 ml-auto">
                <Input
                  type="number"
                  min={1}
                  max={matchedIds.length}
                  value={randomCount}
                  onChange={(e) => setRandomCount(Number(e.target.value) || 1)}
                  className="w-16 h-8"
                />
                <Button variant="outline" size="sm" onClick={handleRandomPick}>
                  <Shuffle className="h-3.5 w-3.5 mr-1" />
                  Random pick
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-hide pr-1">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading preview...
                </div>
              ) : (
                previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`preview-${item.id}`}
                      checked={selectedPreviewIds.includes(item.id)}
                      onCheckedChange={() => togglePreviewItem(item.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`preview-${item.id}`}
                      className="text-sm leading-snug cursor-pointer flex-1 min-w-0"
                    >
                      <Badge variant="outline" className="mr-1.5 shrink-0">
                        {item.partName}
                      </Badge>
                      <span className="text-muted-foreground mr-1">
                        #{item.questionNumber}
                      </span>
                      {item.questionText || (
                        <span className="italic text-muted-foreground">
                          (media-based question, no text preview)
                        </span>
                      )}
                    </label>
                    <QuestionPreviewDialog
                      question={toAdminPreviewQuestion(item.raw)}
                      partNumber={item.partNumber}
                    />
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <Button variant="ghost" onClick={() => setStep('form')}>
                Back
              </Button>
              <Button
                onClick={handleStartDrill}
                disabled={selectedPreviewIds.length === 0}
              >
                Start Practice Drill ({selectedPreviewIds.length})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
