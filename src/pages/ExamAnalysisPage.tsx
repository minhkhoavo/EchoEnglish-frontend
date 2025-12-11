import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Info,
  RefreshCw,
  Coins,
  Sparkles,
} from 'lucide-react';
import type { ExamAnalysisResult } from '@/features/lr-analyze/types/analysis';
import {
  useGetAnalysisResultQuery,
  useRequestAnalysisMutation,
} from '@/features/lr-analyze/services';
import {
  SkillRadarChart,
  PartAnalysisSection,
  DiagnosisSection,
  StudyPlanSection,
  TimeAnalysisSection,
  KeyInsightsSection,
  DomainPerformanceSection,
  BlurredContent,
  UnlockAnalysisDialog,
} from '@/features/lr-analyze/components';
import { AffordabilityDialog } from '@/features/lr-analyze/components/AffordabilityDialog';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useLazyCheckCanAffordFeatureQuery } from '@/features/auth/services/creditsApi';
import { FeaturePricingType } from '@/features/auth/services/creditsApi';
import type { CheckAffordFeatureResponse } from '@/features/auth/services/creditsApi';

export function ExamAnalysisPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAffordabilityDialog, setShowAffordabilityDialog] = useState(false);

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetAnalysisResultQuery(attemptId || '', {
    skip: !attemptId,
  });

  const [requestAnalysis, { isLoading: isAnalyzing }] =
    useRequestAnalysisMutation();

  const analysisData = apiData;
  const hasExamAnalysis = !!analysisData?.analysis?.examAnalysis;
  const analysisCost = 5; // Default cost, can be made configurable later

  const handleRequestAnalysis = async () => {
    try {
      const result = await requestAnalysis(attemptId || '').unwrap();
      setShowAffordabilityDialog(false);
      toast.success(
        `Analysis Complete! Deep analysis unlocked. ${result.creditsUsed} credits used.`
      );
      refetch();
    } catch (error: unknown) {
      console.error('Failed to request analysis:', error);
      toast.error(
        error && typeof error === 'object' && 'data' in error
          ? `Analysis Failed: ${JSON.stringify(error.data)}`
          : 'Analysis Failed: Unable to process your analysis request. Please try again.'
      );
    }
  };

  // Show loading state
  if (attemptId && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2563eb] border-r-transparent"></div>
          <p className="mt-4 text-[#64748b]">Loading analysis...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (attemptId && error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-50 rounded-lg mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Failed to Load Analysis
            </h2>
            <p className="text-red-700 text-sm">
              {error && 'data' in error
                ? JSON.stringify(error.data)
                : 'Unable to fetch analysis data. Please try again later.'}
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <Info className="w-12 h-12 text-[#64748b] mx-auto mb-2" />
          <p className="text-[#64748b]">No analysis data available</p>
        </div>
      </div>
    );
  }
  console.log('Analysis Data:', analysisData);
  // Helper to convert examDate to Date object if it's a string
  const examDate =
    typeof analysisData.examDate === 'string'
      ? new Date(analysisData.examDate)
      : analysisData.examDate;

  // Get analysis data (handle backend structure)
  // Data is already flattened by the API service transformResponse
  const analysis = {
    overallSkills: analysisData.overallSkills,
    partAnalyses: analysisData.partAnalyses || [],
    weaknesses: analysisData.topWeaknesses || analysisData.weaknesses || [],
    strengths: analysisData.strengths || [],
    keyInsights: analysisData.keyInsights || [],
    summary: analysisData.summary,
    domainPerformance: analysisData.domainPerformance || [],
    timeAnalysis: analysisData.timeAnalysis,
  };

  // Get study plan items (handle both studyPlanId and studyPlan formats)
  const studyPlanItems =
    analysisData.studyPlanId?.planItems || analysisData.studyPlan || [];

  console.log('Processed Analysis:', analysis);
  console.log('Time Analysis Data:', analysis.timeAnalysis);

  // Safely filter weaknesses with default empty array
  const criticalWeaknesses = analysis.weaknesses.filter(
    (w) => w.severity === 'CRITICAL'
  );
  const highWeaknesses = analysis.weaknesses.filter(
    (w) => w.severity === 'HIGH'
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Unlock Banner - Only show when analysis is not unlocked */}
      {!hasExamAnalysis && (
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white">
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Unlock Your Deep Performance Analysis
                  </h3>
                  <p className="text-sm text-white/90">
                    Get AI-powered insights, personalized study plan, and
                    detailed skill breakdown for just {analysisCost} credits
                  </p>
                </div>
              </div>
              <ConfirmationDialog
                title="Unlock Deep Analysis"
                description={`This will use credits to generate a comprehensive analysis of your exam performance, including detailed insights, skill breakdown, and personalized recommendations.`}
                confirmText={`Use Credits`}
                cancelText="Not Now"
                icon={
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e40af]">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                }
                onConfirm={() => setShowAffordabilityDialog(true)}
              >
                <Button
                  variant="outline"
                  className="bg-white text-[#2563eb] hover:bg-white/90 border-0 font-semibold"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#2563eb] border-r-transparent mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Unlock Now
                    </>
                  )}
                </Button>
              </ConfirmationDialog>

              {/* Affordability Dialog */}
              <AffordabilityDialog
                isOpen={showAffordabilityDialog}
                onClose={() => setShowAffordabilityDialog(false)}
                featureType={FeaturePricingType.TEST_ANALYSIS_LR}
                onProceed={handleRequestAnalysis}
                onBuyCredits={() => navigate('/payment')}
                isPending={isAnalyzing}
                description="Get comprehensive analysis of your exam performance with detailed insights and personalized recommendations."
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
                TOEIC Performance Analysis
              </h1>
              <p className="text-[#64748b] text-sm">
                Exam taken on{' '}
                {examDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Button
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
              onClick={() =>
                navigate(`/test-exam?mode=review&resultId=${attemptId}`)
              }
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {/* Total Score */}
            <Card className="p-5 bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm opacity-90">Total Score</p>
                  <p className="text-4xl font-bold mt-1">
                    {analysisData.totalScore}
                  </p>
                </div>
                <Target className="w-7 h-7 opacity-80" />
              </div>
            </Card>

            {/* Listening Score */}
            <Card className="p-5 border border-[#e5e7eb]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-[#64748b]">Listening</p>
                  <p className="text-3xl font-bold text-[#0f172a] mt-1">
                    {analysisData.listeningScore}
                  </p>
                </div>
                <div className="p-2 bg-[#dbeafe] rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#2563eb]" />
                </div>
              </div>
            </Card>

            {/* Reading Score */}
            <Card className="p-5 border border-[#e5e7eb]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-[#64748b]">Reading</p>
                  <p className="text-3xl font-bold text-[#0f172a] mt-1">
                    {analysisData.readingScore}
                  </p>
                </div>
                <div className="p-2 bg-[#dbeafe] rounded-lg">
                  <BarChart3 className="w-5 h-5 text-[#2563eb]" />
                </div>
              </div>
            </Card>

            {/* Weaknesses */}
            <Card className="p-5 border border-[#fecaca] bg-[#fef2f2]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-[#991b1b]">Key Weaknesses</p>
                  <p className="text-3xl font-bold text-[#dc2626] mt-1">
                    {criticalWeaknesses.length + highWeaknesses.length}
                  </p>
                </div>
                <div className="p-2 bg-[#fee2e2] rounded-lg">
                  <AlertCircle className="w-5 h-5 text-[#dc2626]" />
                </div>
              </div>
              <p className="text-xs text-[#991b1b] mt-3">
                {criticalWeaknesses.length} critical • {highWeaknesses.length}{' '}
                high priority
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-[#e5e7eb] p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger
              value="parts"
              className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white"
            >
              Part Analysis
            </TabsTrigger>
            <TabsTrigger
              value="diagnosis"
              className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white"
            >
              Diagnosis
            </TabsTrigger>
            <TabsTrigger
              value="studyplan"
              className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white"
            >
              Study Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Summary and Key Insights */}
            {(analysis.summary ||
              (analysis.keyInsights && analysis.keyInsights.length > 0)) && (
              <>
                {hasExamAnalysis ? (
                  <KeyInsightsSection
                    insights={analysis.keyInsights}
                    summary={analysis.summary}
                  />
                ) : (
                  <UnlockAnalysisDialog
                    title="Unlock Key Insights"
                    description="Get AI-powered analysis of your performance patterns and strategic recommendations."
                    isLoading={isAnalyzing}
                    onConfirm={handleRequestAnalysis}
                  >
                    <KeyInsightsSection
                      insights={analysis.keyInsights}
                      summary={analysis.summary}
                    />
                  </UnlockAnalysisDialog>
                )}
              </>
            )}

            {/* Skills Radar Chart */}
            {analysis.overallSkills ? (
              <>
                {hasExamAnalysis ? (
                  <SkillRadarChart
                    skills={analysis.overallSkills}
                    strengths={analysis.strengths || []}
                  />
                ) : (
                  <UnlockAnalysisDialog
                    title="Unlock Skill Analysis"
                    description="Visualize your performance across all TOEIC skill dimensions with our interactive radar chart."
                    isLoading={isAnalyzing}
                    onConfirm={handleRequestAnalysis}
                  >
                    <SkillRadarChart
                      skills={analysis.overallSkills}
                      strengths={analysis.strengths || []}
                    />
                  </UnlockAnalysisDialog>
                )}
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center text-[#64748b]">
                  <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Skill analysis data not available for this exam.</p>
                </div>
              </Card>
            )}

            {/* Domain Performance */}
            {analysis.domainPerformance &&
              analysis.domainPerformance.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-[#3b82f6] rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0f172a]">
                        Domain Performance
                      </h2>
                      <p className="text-xs text-[#64748b]">
                        Performance across business contexts
                      </p>
                    </div>
                  </div>
                  {hasExamAnalysis ? (
                    <DomainPerformanceSection
                      domainPerformance={analysis.domainPerformance}
                      compact={true}
                    />
                  ) : (
                    <UnlockAnalysisDialog
                      title="Unlock Domain Analysis"
                      description="See your performance breakdown across business domains and contexts."
                      isLoading={isAnalyzing}
                      onConfirm={handleRequestAnalysis}
                    >
                      <DomainPerformanceSection
                        domainPerformance={analysis.domainPerformance}
                        compact={true}
                      />
                    </UnlockAnalysisDialog>
                  )}
                </Card>
              )}
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            {analysis.timeAnalysis ? (
              <TimeAnalysisSection
                timeAnalysis={analysis.timeAnalysis}
                resultId={attemptId}
              />
            ) : (
              <Card className="p-6">
                <div className="text-center text-[#64748b]">
                  <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Time analysis data not available for this exam.</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parts" className="mt-4">
            {hasExamAnalysis ? (
              <PartAnalysisSection partAnalyses={analysis.partAnalyses || []} />
            ) : (
              <UnlockAnalysisDialog
                title="Unlock Part-by-Part Analysis"
                description="Get detailed breakdown of your performance in each TOEIC part with skill-level insights."
                isLoading={isAnalyzing}
                onConfirm={handleRequestAnalysis}
              >
                <PartAnalysisSection
                  partAnalyses={analysis.partAnalyses || []}
                />
              </UnlockAnalysisDialog>
            )}
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-4">
            {hasExamAnalysis ? (
              <DiagnosisSection weaknesses={analysis.weaknesses || []} />
            ) : (
              <UnlockAnalysisDialog
                title="Unlock Weakness Diagnosis"
                description="Identify your critical weaknesses with detailed explanations and representative questions."
                isLoading={isAnalyzing}
                onConfirm={handleRequestAnalysis}
              >
                <DiagnosisSection weaknesses={analysis.weaknesses || []} />
              </UnlockAnalysisDialog>
            )}
          </TabsContent>

          <TabsContent value="studyplan" className="mt-4">
            {hasExamAnalysis ? (
              <StudyPlanSection studyPlan={studyPlanItems} />
            ) : (
              <UnlockAnalysisDialog
                title="Unlock Personalized Study Plan"
                description="Get a customized learning path with resources and practice drills tailored to your weaknesses."
                isLoading={isAnalyzing}
                onConfirm={handleRequestAnalysis}
              >
                <StudyPlanSection studyPlan={studyPlanItems} />
              </UnlockAnalysisDialog>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
