import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code2, LayoutDashboard, Loader2 } from 'lucide-react';
import { RoadmapVisual } from './RoadmapVisual';
import { DailyLesson } from '@/features/user-dashboard/components/DailyLesson';
import type { DailyLessonData } from '@/features/user-dashboard/types/dashboard.types';
import type {
  GeneratorKind,
  Fidelity,
  RoadmapOutput,
  DailyPlanOutput,
} from '../types/playground.types';

interface OutputPanelProps {
  kind: GeneratorKind;
  fidelity: Fidelity;
  loading: boolean;
  error?: string;
  output?: unknown;
}

type ViewMode = 'json' | 'visual';

// Coerce a pipeline session payload into the DailyLessonData shape the dashboard
// renderer expects (the simulation lacks persisted-only fields).
function toDailyLesson(raw: unknown): DailyLessonData {
  const r = (raw ?? {}) as Partial<DailyLessonData>;
  return {
    _id: r._id ?? 'playground-session',
    userId: r.userId ?? 'playground-user',
    roadmapRef: r.roadmapRef ?? '',
    testResultId: r.testResultId ?? '',
    planItems: r.planItems ?? [],
    dayNumber: r.dayNumber ?? 1,
    weekNumber: r.weekNumber ?? 1,
    scheduledDate: r.scheduledDate ?? new Date().toISOString(),
    title: r.title ?? 'Simulated session',
    description: r.description ?? '',
    targetSkills: r.targetSkills ?? [],
    targetDomains: r.targetDomains ?? [],
    targetWeaknesses: r.targetWeaknesses ?? [],
    totalEstimatedTime: r.totalEstimatedTime ?? 0,
    totalTimeSpent: r.totalTimeSpent ?? 0,
    progress: r.progress ?? 0,
    status: r.status ?? 'upcoming',
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString(),
  };
}

export function OutputPanel({
  kind,
  fidelity,
  loading,
  error,
  output,
}: OutputPanelProps) {
  const [view, setView] = useState<ViewMode>('visual');

  const renderVisual = () => {
    if (kind === 'roadmap') {
      // pipeline returns { roadmap, raw, contextUsed }; ai returns RoadmapOutput
      const data = output as Record<string, unknown>;
      const roadmap = (data?.roadmap ?? data) as RoadmapOutput;
      if (!roadmap?.weeklyFocuses) {
        return <Empty />;
      }
      return <RoadmapVisual roadmap={roadmap} />;
    }

    // dailySession
    if (fidelity === 'pipeline') {
      return <DailyLesson dailyLesson={toDailyLesson(output)} />;
    }
    // ai fidelity → DailyPlanOutput (AI decisions, no planItems)
    const plan = output as DailyPlanOutput;
    if (!plan?.activities) return <Empty />;
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500 italic">{plan.reasoning}</p>
        {plan.activities.map((a, i) => (
          <Card key={i} className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm">
                {String(a.title ?? `Activity ${i + 1}`)}
              </span>
              <Badge className="bg-slate-100 text-slate-600">
                {String(a.activityType ?? '')}
              </Badge>
            </div>
            {/* What the pipeline would generate for this activity */}
            <SubGenBadges activity={a} />
            <pre className="text-xs whitespace-pre-wrap text-slate-600">
              {JSON.stringify(a, null, 2)}
            </pre>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Output</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === 'visual' ? 'default' : 'outline'}
            onClick={() => setView('visual')}
          >
            <LayoutDashboard className="h-4 w-4 mr-1" /> Visual
          </Button>
          <Button
            size="sm"
            variant={view === 'json' ? 'default' : 'outline'}
            onClick={() => setView('json')}
          >
            <Code2 className="h-4 w-4 mr-1" /> JSON
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 p-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Running generator (real
            LLM call)…
          </div>
        )}
        {error && !loading && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}
        {!loading && !error && output == null && <Empty />}
        {!loading && !error && output != null && (
          <>
            {view === 'json' ? (
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              renderVisual()
            )}
          </>
        )}
      </div>
    </Card>
  );
}

// Shows which downstream sub-generators the pipeline would invoke for an AI
// activity decision (vocab set, personalized guide, practice drill, DB resource,
// adaptive activity) — the steps that run AFTER generateDailyPlan returns.
function SubGenBadges({ activity }: { activity: Record<string, unknown> }) {
  const flags: Array<[boolean, string, string]> = [
    [!!activity.useDBResource, 'DB resource', 'bg-blue-100 text-blue-700'],
    [
      !!activity.generateVocabularySet,
      'vocab set',
      'bg-emerald-100 text-emerald-700',
    ],
    [
      !!activity.generatePersonalizedGuide,
      'personalized guide',
      'bg-purple-100 text-purple-700',
    ],
    [
      !!activity.generatePracticeDrill,
      'practice drill',
      'bg-amber-100 text-amber-700',
    ],
    [
      !!activity.generateActivity,
      `activity${activity.activityKind ? `:${String(activity.activityKind)}` : ''}`,
      'bg-pink-100 text-pink-700',
    ],
  ];
  const active = flags.filter(([on]) => on);
  if (active.length === 0) {
    return (
      <div className="text-xs text-slate-400">
        No sub-generation (text-only activity)
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-xs text-slate-400">Pipeline would generate:</span>
      {active.map(([, label, cls]) => (
        <Badge key={label} className={cls}>
          {label}
        </Badge>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-sm text-slate-400 p-6 text-center">
      <Badge className="bg-slate-100 text-slate-500">No output yet</Badge>
      <p className="mt-2">Run a generator to see the result.</p>
    </div>
  );
}
