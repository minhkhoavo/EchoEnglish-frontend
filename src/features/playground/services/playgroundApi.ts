import { api } from '@/core/api/api';
import type {
  ApiEnvelope,
  RoadmapAiInput,
  RoadmapPipelineInput,
  RoadmapOutput,
  DailyPlanContext,
  DailyPlanOutput,
  DailySessionPipelineInput,
} from '../types/playground.types';
import type { DailyLessonData } from '@/features/user-dashboard/types/dashboard.types';

// Dry-run endpoints exposed by the backend playground module. All POST, none
// persist. Plus a couple of read-only loaders for the Insight panel.
export const playgroundApi = api.injectEndpoints({
  endpoints: (builder) => ({
    pgRoadmapAi: builder.mutation<ApiEnvelope<RoadmapOutput>, RoadmapAiInput>({
      query: (body) => ({
        url: '/playground/roadmap/ai',
        method: 'POST',
        data: body,
      }),
    }),

    pgRoadmapPipeline: builder.mutation<
      ApiEnvelope<{
        roadmap: RoadmapOutput & Record<string, unknown>;
        raw: RoadmapOutput;
        contextUsed: unknown;
      }>,
      RoadmapPipelineInput
    >({
      query: (body) => ({
        url: '/playground/roadmap/pipeline',
        method: 'POST',
        data: body,
      }),
    }),

    pgDailyAi: builder.mutation<ApiEnvelope<DailyPlanOutput>, DailyPlanContext>(
      {
        query: (body) => ({
          url: '/playground/daily-session/ai',
          method: 'POST',
          data: body,
        }),
      }
    ),

    pgDailyPipeline: builder.mutation<
      ApiEnvelope<DailyLessonData>,
      DailySessionPipelineInput
    >({
      query: (body) => ({
        url: '/playground/daily-session/pipeline',
        method: 'POST',
        data: body,
      }),
    }),

    // Read-only loaders for the Insight panel (real data mode).
    pgWeakSkills: builder.query<unknown, void>({
      query: () => ({
        url: '/users/competency-profile/weak-skills',
        method: 'GET',
      }),
    }),
    pgResources: builder.query<unknown, void>({
      query: () => ({
        url: '/resources',
        method: 'GET',
        params: { limit: 10 },
      }),
    }),

    // Assemble a ready-to-run roadmap input from real data (firstTest + prefs).
    pgLoadRoadmapInput: builder.mutation<
      ApiEnvelope<{
        input: RoadmapAiInput;
        detectedCurrentLevel?: string;
        testResultId?: string;
        hasTest: boolean;
      }>,
      { userId?: string; testResultId?: string; targetScore?: number }
    >({
      query: (body) => ({
        url: '/playground/load/roadmap-input',
        method: 'POST',
        data: body,
      }),
    }),

    // Assemble the full DailyPlanContext (+ pipeline body) from real data.
    pgLoadDailyContext: builder.mutation<
      ApiEnvelope<{
        context: DailyPlanContext;
        pipeline: DailySessionPipelineInput;
      }>,
      { userId?: string; weekNumber?: number; dayOfWeek?: number }
    >({
      query: (body) => ({
        url: '/playground/load/daily-context',
        method: 'POST',
        data: body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  usePgRoadmapAiMutation,
  usePgRoadmapPipelineMutation,
  usePgDailyAiMutation,
  usePgDailyPipelineMutation,
  usePgWeakSkillsQuery,
  usePgResourcesQuery,
  usePgLoadRoadmapInputMutation,
  usePgLoadDailyContextMutation,
} = playgroundApi;
