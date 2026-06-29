import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, BookOpen, Lightbulb } from 'lucide-react';
import { usePlaygroundInsights } from '../data/dataProvider';
import type { DataMode } from '../types/playground.types';
import type { Preset } from '../data/presets';

interface InsightPanelProps {
  mode: DataMode;
  preset: Preset;
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

// Insight Panel — weakness breakdown, competency profile, skill-gap map and
// resource recommendations, sourced via the data provider (real | mock | hybrid).
export function InsightPanel({ mode, preset }: InsightPanelProps) {
  const insights = usePlaygroundInsights(mode, preset);

  return (
    <Card className="p-4 flex flex-col gap-4 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Insights</h3>
        <Badge
          className={
            insights.source === 'real'
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-600'
          }
        >
          {insights.source} data
        </Badge>
      </div>

      {/* Competency profile / skill-gap map */}
      <section>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          <Brain className="h-4 w-4" /> Competency (
          {insights.competency.currentLevel})
        </div>
        <div className="space-y-2">
          {insights.competency.skills.map((s) => (
            <div key={s.skillName}>
              <div className="flex justify-between text-xs mb-0.5">
                <span>{s.skillName}</span>
                <span className="text-slate-500">{s.percentage}%</span>
              </div>
              <Progress value={s.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
      </section>

      {/* Weakness breakdown */}
      <section>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          <Target className="h-4 w-4" /> Weakness breakdown
        </div>
        <div className="flex flex-wrap gap-1.5">
          {insights.weaknesses.map((w) => (
            <Badge
              key={w.skillName}
              className={severityColor[w.severity] ?? 'bg-slate-100'}
            >
              {w.skillName} · {w.accuracy}%
            </Badge>
          ))}
        </div>
      </section>

      {/* AI insights */}
      <section>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          <Lightbulb className="h-4 w-4" /> AI insights
        </div>
        <ul className="space-y-1.5">
          {insights.competency.aiInsights.map((i) => (
            <li key={i.title} className="text-xs">
              <span className="font-medium">{i.title}:</span>{' '}
              <span className="text-slate-600">{i.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Resource recommendations */}
      <section>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
          <BookOpen className="h-4 w-4" /> Resources
        </div>
        <ul className="space-y-1">
          {insights.resources.map((r) => (
            <li key={r.title} className="text-xs flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-600">{r.type}</Badge>
              <span className="text-slate-700">{r.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}
