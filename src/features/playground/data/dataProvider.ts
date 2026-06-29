import { useGetCompetencyInsightsQuery } from '@/features/user-dashboard/services/dashboardApi';
import { usePgResourcesQuery } from '../services/playgroundApi';
import type { DataMode } from '../types/playground.types';
import type { MockInsights, Preset } from './presets';

export interface PlaygroundInsights extends MockInsights {
  source: 'real' | 'mock';
  loading: boolean;
}

/**
 * Playground data provider. Returns insight data (competency, weaknesses,
 * resources) for the Insight panel from the real APIs, mock presets, or a
 * hybrid of both — without any component hardcoding scenario data.
 *
 * Hooks must run unconditionally, so real queries are always declared but
 * skipped in 'mock' mode; in 'hybrid' mode real data wins and mock fills gaps.
 */
export function usePlaygroundInsights(
  mode: DataMode,
  preset: Preset
): PlaygroundInsights {
  const useReal = mode === 'real' || mode === 'hybrid';

  const competencyQuery = useGetCompetencyInsightsQuery(undefined, {
    skip: !useReal,
  });
  const resourcesQuery = usePgResourcesQuery(undefined, { skip: !useReal });

  const realCompetency = competencyQuery.data?.data;
  const hasReal = !!realCompetency;

  if (mode === 'real' || (mode === 'hybrid' && hasReal)) {
    const skills = (realCompetency?.skillsMap ?? []).map((s) => ({
      skillName: s.skillName,
      percentage: s.percentage,
    }));
    const aiInsights = (realCompetency?.aiInsights ?? []).map((i) => ({
      title: i.title,
      description: i.description,
    }));
    const weaknesses = skills
      .filter((s) => s.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage)
      .map((s) => ({
        skillName: s.skillName,
        severity: s.percentage < 40 ? 'critical' : 'high',
        accuracy: s.percentage,
      }));

    const rawResources =
      (resourcesQuery.data as { data?: unknown[] } | undefined)?.data ?? [];
    const resources = (Array.isArray(rawResources) ? rawResources : [])
      .slice(0, 10)
      .map((r) => {
        const rr = r as Record<string, unknown>;
        return {
          title: String(rr.title ?? 'Untitled'),
          type: String(rr.type ?? 'resource'),
          domain: (rr.labels as { domain?: string } | undefined)?.domain,
        };
      });

    return {
      source: 'real',
      loading: competencyQuery.isLoading || resourcesQuery.isLoading,
      competency: {
        currentLevel:
          realCompetency?.scorePrediction?.cefrLevel ??
          preset.insights.competency.currentLevel,
        skills: skills.length ? skills : preset.insights.competency.skills,
        aiInsights: aiInsights.length
          ? aiInsights
          : preset.insights.competency.aiInsights,
      },
      weaknesses: weaknesses.length ? weaknesses : preset.insights.weaknesses,
      resources: resources.length ? resources : preset.insights.resources,
    };
  }

  // mock (or hybrid with no real data yet)
  return {
    source: 'mock',
    loading: useReal ? competencyQuery.isLoading : false,
    ...preset.insights,
  };
}
