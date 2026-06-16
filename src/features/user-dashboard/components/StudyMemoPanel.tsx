import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookMarked,
  Plus,
  Trash2,
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  ArrowRight,
  Check,
  Library,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetActiveRoadmapQuery,
  useGetMyLibraryQuery,
  useAddToLibraryMutation,
  useRemoveFromLibraryMutation,
  useAnalyzeStudyMemoMutation,
  useCreateStudyMemoMutation,
  useDeleteStudyMemoMutation,
} from '../services/dashboardApi';
import { useSearchResourcesQuery } from '@/features/resource/services/resourceApi';
import type {
  MemoAnalysisResult,
  MemoSupplementedWeakness,
  StudyMemo,
} from '../types/dashboard.types';

type Step = 'list' | 'select' | 'review';

const severityColor = (s: string) =>
  s === 'critical'
    ? 'bg-red-100 text-red-700'
    : s === 'high'
      ? 'bg-orange-100 text-orange-700'
      : s === 'medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-700';

export function StudyMemoPanel() {
  const { data: roadmapResponse, refetch: refetchRoadmap } =
    useGetActiveRoadmapQuery();
  const roadmap = roadmapResponse?.data || null;
  const memos: StudyMemo[] = roadmap?.studyMemos || [];

  // Personal library (persisted on user profile)
  const { data: libraryResponse, refetch: refetchLibrary } =
    useGetMyLibraryQuery();
  const library = libraryResponse?.data || [];
  const libraryIds = useMemo(
    () => new Set(library.map((l) => l.resourceId)),
    [library]
  );

  // Resource catalog search
  const [search, setSearch] = useState('');
  const { data: resourcesResponse, isFetching: resourcesLoading } =
    useSearchResourcesQuery({
      q: search || undefined,
      page: 1,
      limit: 50,
      suitableForLearners: true,
    });
  const resources = resourcesResponse?.data?.resources || [];

  const [addToLibrary, { isLoading: adding }] = useAddToLibraryMutation();
  const [removeFromLibrary] = useRemoveFromLibraryMutation();
  const [analyzeMemo, { isLoading: analyzing }] = useAnalyzeStudyMemoMutation();
  const [createMemo, { isLoading: creating }] = useCreateStudyMemoMutation();
  const [deleteMemo] = useDeleteStudyMemoMutation();

  // Dialog + form state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scope, setScope] = useState<'date' | 'week'>('date');
  const [note, setNote] = useState('');
  const [preferredDays, setPreferredDays] = useState<number>(0);

  // Review state (editable)
  const [analysis, setAnalysis] = useState<MemoAnalysisResult | null>(null);
  const [dayPlan, setDayPlan] = useState<
    Array<{ order: number; focus: string }>
  >([]);
  const [acceptedWeaknesses, setAcceptedWeaknesses] = useState<
    Record<string, boolean>
  >({});

  const activeWeek = roadmap?.activeWeekNumber ?? roadmap?.currentWeek ?? 1;

  const resetForm = () => {
    setSelectedIds([]);
    setScope('date');
    setNote('');
    setPreferredDays(0);
    setSearch('');
    setAnalysis(null);
    setDayPlan([]);
    setAcceptedWeaknesses({});
  };

  const closeDialog = () => {
    setOpen(false);
    setStep('list');
    resetForm();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddToLibrary = async (resourceId: string) => {
    try {
      await addToLibrary(resourceId).unwrap();
      refetchLibrary();
    } catch {
      toast.error('Failed to add to library.');
    }
  };

  const handleRemoveFromLibrary = async (resourceId: string) => {
    try {
      await removeFromLibrary(resourceId).unwrap();
      setSelectedIds((prev) => prev.filter((x) => x !== resourceId));
      refetchLibrary();
    } catch {
      toast.error('Failed to remove from library.');
    }
  };

  const buildScopeFields = () => {
    if (scope === 'date') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { targetDate: today.toISOString() };
    }
    return { targetWeekNumber: activeWeek };
  };

  const handleAnalyze = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one material from your library.');
      return;
    }
    try {
      const res = await analyzeMemo({
        materials: selectedIds.map((id) => ({
          refType: 'resource' as const,
          refId: id,
        })),
        note: note || undefined,
        scope,
        ...buildScopeFields(),
        preferredDays: preferredDays || 0,
      }).unwrap();

      const result = res.data.analysis;
      setAnalysis(result);
      setDayPlan(
        result.dayPlan.map((d, i) => ({ order: i + 1, focus: d.focus }))
      );
      const accepted: Record<string, boolean> = {};
      result.supplementedWeaknesses.forEach((w) => {
        accepted[w.skillKey] = true;
      });
      setAcceptedWeaknesses(accepted);
      setStep('review');
    } catch {
      toast.error('Failed to analyze the material. Please try again.');
    }
  };

  const updateDayFocus = (idx: number, value: string) => {
    setDayPlan((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, focus: value } : d))
    );
  };

  const removeDay = (idx: number) => {
    setDayPlan((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((d, i) => ({ order: i + 1, focus: d.focus }))
    );
  };

  const handleConfirm = async () => {
    if (!analysis) return;
    if (dayPlan.length === 0) {
      toast.error('The plan needs at least one study day.');
      return;
    }
    const supplemented: MemoSupplementedWeakness[] =
      analysis.supplementedWeaknesses.filter(
        (w) => acceptedWeaknesses[w.skillKey]
      );
    try {
      await createMemo({
        materials: selectedIds.map((id) => ({
          refType: 'resource' as const,
          refId: id,
        })),
        note: note || undefined,
        scope,
        ...buildScopeFields(),
        suitability: {
          isSuitable: analysis.isSuitable,
          reason: analysis.suitabilityReason,
          cefrFit: analysis.cefrFit,
        },
        dayPlan: dayPlan.map((d, i) => ({ order: i + 1, focus: d.focus })),
        supplementedWeaknesses: supplemented,
      }).unwrap();
      toast.success("Material added. Today's lesson has been updated.");
      refetchRoadmap();
      closeDialog();
    } catch {
      toast.error('Failed to create the plan from this material.');
    }
  };

  const handleDeleteMemo = async (memoId: string) => {
    try {
      await deleteMemo(memoId).unwrap();
      toast.success('Material removed.');
      refetchRoadmap();
    } catch {
      toast.error('Failed to remove.');
    }
  };

  const startAdding = () => {
    resetForm();
    setStep('select');
  };

  const selectedTitles = useMemo(
    () =>
      selectedIds.map(
        (id) => library.find((l) => l.resourceId === id)?.title || 'Material'
      ),
    [selectedIds, library]
  );

  const activeMemoCount = memos.filter((m) => m.status === 'active').length;

  return (
    <>
      {/* Compact trigger */}
      <Button
        disabled={!roadmap}
        onClick={() => {
          setStep('list');
          setOpen(true);
        }}
        className="shrink-0 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white shadow-md font-semibold"
      >
        <BookMarked className="w-4 h-4 mr-1.5" />
        My Materials
        {activeMemoCount > 0 && (
          <Badge className="ml-1.5 bg-white text-[#4f46e5] font-bold">
            {activeMemoCount}
          </Badge>
        )}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}
      >
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'list'
                ? 'My Materials'
                : step === 'select'
                  ? 'Choose materials to study'
                  : 'Confirm the study plan'}
            </DialogTitle>
            <DialogDescription>
              {step === 'list'
                ? 'Attach your own materials so they are split across days and woven into your daily lessons.'
                : step === 'select'
                  ? 'Search the catalog, add items to your library, then pick the ones to study.'
                  : 'Review the suggestion, then confirm to build the study plan.'}
            </DialogDescription>
          </DialogHeader>

          {/* STEP: LIST */}
          {step === 'list' && (
            <div className="space-y-3">
              {memos.length === 0 ? (
                <p className="text-sm text-[#94a3b8] py-4 text-center">
                  No materials yet. Add one to personalize your lessons.
                </p>
              ) : (
                memos.map((memo) => {
                  const done = memo.dayPlan.filter(
                    (d) => d.status === 'done'
                  ).length;
                  return (
                    <div
                      key={memo._id}
                      className="border border-[#e5e7eb] rounded-lg p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <FileText className="w-4 h-4 text-[#6366f1]" />
                          <span className="text-sm font-semibold text-[#0f172a]">
                            {memo.materials.map((m) => m.title).join(', ') ||
                              'Material'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {memo.scope === 'date'
                              ? 'By day'
                              : `Week ${memo.targetWeekNumber}`}
                          </Badge>
                          <Badge
                            className={`text-xs ${memo.status === 'completed' ? 'bg-[#10b981] text-white' : 'bg-[#e0e7ff] text-[#4338ca]'}`}
                          >
                            {done}/{memo.dayPlan.length} days
                          </Badge>
                          {memo.suitability && !memo.suitability.isSuitable && (
                            <Badge className="text-xs bg-amber-100 text-amber-700">
                              Check fit
                            </Badge>
                          )}
                        </div>
                        {memo.note && (
                          <p className="text-xs text-[#64748b] mb-1">
                            “{memo.note}”
                          </p>
                        )}
                        <ol className="text-xs text-[#475569] list-decimal ml-4 space-y-0.5">
                          {memo.dayPlan.map((d) => (
                            <li
                              key={d._id || d.order}
                              className={
                                d.status === 'done'
                                  ? 'line-through text-[#94a3b8]'
                                  : ''
                              }
                            >
                              {d.focus}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#ef4444] hover:bg-red-50"
                        onClick={() => handleDeleteMemo(memo._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* STEP: SELECT */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Catalog search */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Search className="w-4 h-4" /> Resource catalog
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[#94a3b8]" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by title..."
                      className="pl-8"
                    />
                  </div>
                  <div className="mt-2 h-64 overflow-y-auto border rounded-lg divide-y">
                    {resourcesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-[#64748b] p-3">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                    ) : resources.length === 0 ? (
                      <p className="text-sm text-[#94a3b8] p-3">
                        No resources found.
                      </p>
                    ) : (
                      resources.map((r) => {
                        const inLib = libraryIds.has(r._id);
                        return (
                          <div
                            key={r._id}
                            className="flex items-center gap-2 p-2.5"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#0f172a] truncate">
                                {r.title || 'Untitled resource'}
                              </div>
                              <div className="text-xs text-[#64748b] flex items-center gap-2">
                                <span className="uppercase">{r.type}</span>
                                {r.labels?.cefr && (
                                  <span>• {r.labels.cefr}</span>
                                )}
                                {r.labels?.domain && (
                                  <span>• {r.labels.domain}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={inLib ? 'ghost' : 'outline'}
                              disabled={inLib || adding}
                              onClick={() => handleAddToLibrary(r._id)}
                              className="shrink-0"
                              title={
                                inLib ? 'Already in library' : 'Add to library'
                              }
                            >
                              {inLib ? (
                                <Check className="w-4 h-4 text-[#10b981]" />
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Personal library */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Library className="w-4 h-4" /> My library ({library.length}
                    )
                  </Label>
                  <div className="mt-1 h-[19.5rem] overflow-y-auto border rounded-lg divide-y">
                    {library.length === 0 ? (
                      <p className="text-sm text-[#94a3b8] p-3">
                        Your library is empty. Add resources from the catalog on
                        the left using <ArrowRight className="w-3 h-3 inline" />
                        .
                      </p>
                    ) : (
                      library.map((l) => (
                        <label
                          key={l.resourceId}
                          className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-slate-50"
                        >
                          <Checkbox
                            checked={selectedIds.includes(l.resourceId)}
                            onCheckedChange={() => toggleSelect(l.resourceId)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#0f172a] truncate">
                              {l.title || 'Material'}
                            </div>
                            {l.type && (
                              <div className="text-xs text-[#64748b] uppercase">
                                {l.type}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#ef4444] hover:bg-red-50 shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFromLibrary(l.resourceId);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Check items in your library to add them to the plan (
                    {selectedIds.length} selected).
                  </p>
                </div>
              </div>

              {/* Scope / days / note */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Apply to</Label>
                  <Select
                    value={scope}
                    onValueChange={(v) => setScope(v as 'date' | 'week')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Starting today</SelectItem>
                      <SelectItem value="week">
                        Current week (Week {activeWeek})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Number of days (0 = let the system decide)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={preferredDays}
                    onChange={(e) =>
                      setPreferredDays(Number(e.target.value) || 0)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Note (optional)</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Focus on Part 5, review 30 business vocabulary words..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* STEP: REVIEW */}
          {step === 'review' && analysis && (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-3 ${analysis.isSuitable ? 'bg-[#f0fdf4] border border-[#bbf7d0]' : 'bg-amber-50 border border-amber-200'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {analysis.isSuitable ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-sm font-semibold">
                    {analysis.isSuitable
                      ? 'Material is a good fit'
                      : 'Material needs consideration'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {analysis.cefrFit}
                  </Badge>
                </div>
                <p className="text-xs text-[#475569]">
                  {analysis.suitabilityReason}
                </p>
                {analysis.warnings?.length > 0 && (
                  <ul className="mt-2 text-xs text-amber-700 list-disc ml-4">
                    {analysis.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-[#64748b] mt-1">
                  Selected material: {selectedTitles.join(', ')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#6366f1]" />
                  <Label className="text-sm font-medium">
                    Day-by-day plan ({dayPlan.length} days)
                  </Label>
                </div>
                <div className="space-y-2">
                  {dayPlan.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge className="bg-[#e0e7ff] text-[#4338ca] text-xs shrink-0">
                        Day {idx + 1}
                      </Badge>
                      <Input
                        value={d.focus}
                        onChange={(e) => updateDayFocus(idx, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#ef4444] hover:bg-red-50 shrink-0"
                        onClick={() => removeDay(idx)}
                        disabled={dayPlan.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.supplementedWeaknesses.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">
                    Additional weaknesses detected (added to your competency
                    profile)
                  </Label>
                  <div className="space-y-2 mt-2">
                    {analysis.supplementedWeaknesses.map((w) => (
                      <label
                        key={w.skillKey}
                        className="flex items-start gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={!!acceptedWeaknesses[w.skillKey]}
                          onCheckedChange={(c) =>
                            setAcceptedWeaknesses((prev) => ({
                              ...prev,
                              [w.skillKey]: !!c,
                            }))
                          }
                        />
                        <span className="flex-1">
                          <span className="font-medium">{w.skillName}</span>{' '}
                          <Badge
                            className={`text-xs ${severityColor(w.severity)}`}
                          >
                            {w.severity}
                          </Badge>
                          {w.reason && (
                            <span className="block text-xs text-[#64748b]">
                              {w.reason}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {step === 'list' && (
              <>
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                <Button
                  onClick={startAdding}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add material
                </Button>
              </>
            )}
            {step === 'select' && (
              <>
                <Button variant="outline" onClick={() => setStep('list')}>
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || selectedIds.length === 0}
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </>
            )}
            {step === 'review' && (
              <>
                <Button variant="outline" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={creating}
                  className="bg-[#10b981] hover:bg-[#059669] text-white"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Confirm & create'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
