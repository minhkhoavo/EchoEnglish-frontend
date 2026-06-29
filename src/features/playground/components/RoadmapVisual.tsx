import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen } from 'lucide-react';
import type { RoadmapOutput } from '../types/playground.types';

// Lightweight visual renderer for a generated roadmap. Reuses shadcn primitives
// and the same phase/week structure the dashboard's LearningJourney shows, but
// reads directly from the simulated output (the dashboard components fetch their
// own data from the live API, so they cannot render an unsaved simulation).
export function RoadmapVisual({ roadmap }: { roadmap: RoadmapOutput }) {
  const phases = roadmap.phaseSummary ?? [];
  const weeks = roadmap.weeklyFocuses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className="bg-indigo-100 text-indigo-700">
          Level: {roadmap.currentLevel}
        </Badge>
        <Badge className="bg-slate-100 text-slate-600">
          {roadmap.totalWeeks} weeks
        </Badge>
        {roadmap.learningStrategy && (
          <Badge className="bg-slate-100 text-slate-600">
            Foundation {roadmap.learningStrategy.foundationFocus}% / Domain{' '}
            {roadmap.learningStrategy.domainFocus}%
          </Badge>
        )}
      </div>

      {phases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((p, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-indigo-600">
                  {p.weekRange}
                </div>
                <div className="font-bold text-sm mt-1">{p.phaseTitle}</div>
                {p.targetScore != null && (
                  <div className="text-lg font-bold text-indigo-700 mt-1">
                    {p.targetScore}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                <ul className="mt-2 space-y-1">
                  {(p.keyFocusAreas ?? []).map((f, j) => (
                    <li key={j} className="flex items-start gap-1 text-xs">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-slate-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {weeks.map((w) => (
          <Card key={w.weekNumber} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Week {w.weekNumber}: {w.title}
                </div>
                {w.status && (
                  <Badge className="bg-slate-100 text-slate-600">
                    {w.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{w.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {w.focusSkills.map((s) => (
                  <Badge key={s} className="bg-blue-50 text-blue-700">
                    {s}
                  </Badge>
                ))}
              </div>
              {w.dailyFocuses && w.dailyFocuses.length > 0 && (
                <div className="mt-2 text-xs text-slate-600">
                  {w.dailyFocuses.length} daily focus
                  {w.dailyFocuses.length > 1 ? 'es' : ''} ·{' '}
                  {w.dailyFocuses.map((d) => d.focus).join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
