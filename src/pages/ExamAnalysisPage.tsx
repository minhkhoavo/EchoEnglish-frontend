import { useEffect, useState } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { ExamAnalysisResult } from '@/features/lr-analyze/types/analysis';
import { generateMockAnalysisData } from '@/features/lr-analyze/services/mockAnalysisData';
import { SkillRadarChart } from '@/features/lr-analyze/components/SkillRadarChart';
import { PartAnalysisSection } from '@/features/lr-analyze/components/PartAnalysisSection';
import { DiagnosisSection } from '@/features/lr-analyze/components/DiagnosisSection';
import { StudyPlanSection } from '@/features/lr-analyze/components/StudyPlanSection';
import { QuestionPatternsSection } from '@/features/lr-analyze/components/QuestionPatternsSection';

export function ExamAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<ExamAnalysisResult | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In production, fetch from API
    const data = generateMockAnalysisData();
    setAnalysisData(data);
  }, []);

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2563eb] border-r-transparent"></div>
          <p className="mt-4 text-[#64748b]">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const criticalWeaknesses = analysisData.weaknesses.filter(
    (w) => w.severity === 'critical'
  );
  const highWeaknesses = analysisData.weaknesses.filter(
    (w) => w.severity === 'high'
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
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
                {analysisData.examDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Start Learning
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
              Question Patterns
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

          <TabsContent value="overview" className="mt-4">
            <SkillRadarChart
              skills={analysisData.overallSkills}
              strengths={analysisData.strengths}
            />
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <QuestionPatternsSection
              questions={analysisData.questionAttempts}
            />
          </TabsContent>

          <TabsContent value="parts" className="mt-4">
            <PartAnalysisSection partAnalyses={analysisData.partAnalyses} />
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-4">
            <DiagnosisSection weaknesses={analysisData.weaknesses} />
          </TabsContent>

          <TabsContent value="studyplan" className="mt-4">
            <StudyPlanSection studyPlan={analysisData.studyPlan} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
