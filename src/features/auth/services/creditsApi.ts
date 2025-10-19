import { api } from '@/core/api/api';

export interface CheckAffordFeatureResponse {
  canAfford: boolean;
  requiredCredits: number;
  currentCredits: number;
  featureType?: string;
  message?: string;
}

interface CheckAffordFeatureApiResponse {
  message: string;
  data: CheckAffordFeatureResponse;
}

export const FeaturePricingType = {
  TEST_ANALYSIS_LR: 'test_analysis_lr',
  TEST_ANALYSIS_SPEAKING: 'test_analysis_speaking',
  TEST_ANALYSIS_WRITING: 'test_analysis_writing',
  SPEECH_ASSESSMENT: 'speech_assessment',
} as const;

export type FeaturePricingType =
  (typeof FeaturePricingType)[keyof typeof FeaturePricingType];

export const creditsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Check if user can afford a feature
    checkCanAffordFeature: builder.query<
      CheckAffordFeatureResponse,
      FeaturePricingType
    >({
      query: (featureType) => ({
        url: '/users/check-afford-feature',
        method: 'GET',
        params: {
          featureType,
        },
      }),
      transformResponse: (response: CheckAffordFeatureApiResponse) => {
        return response.data;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useCheckCanAffordFeatureQuery,
  useLazyCheckCanAffordFeatureQuery,
} = creditsApi;
