import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Clock,
  SkipForward,
  RefreshCw,
  TrendingUp,
  Info,
  Lightbulb,
  PieChart,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TimeAnalysis } from '../types/analysis';

interface TimeAnalysisSectionProps {
  timeAnalysis: TimeAnalysis;
  onQuestionSelect?: (questionNumber: number) => void;
  resultId?: string;
}

export function TimeAnalysisSection({
  timeAnalysis,
  onQuestionSelect,
  resultId,
}: TimeAnalysisSectionProps) {
  const navigate = useNavigate();
  const {
    partMetrics,
    overallMetrics,
    hesitationAnalysis,
    answerChangePatterns,
  } = timeAnalysis;

  // Calculate insights
  const slowestPart = [...partMetrics].sort(
    (a, b) => b.averageTimePerQuestion - a.averageTimePerQuestion
  )[0];
  const fastestPart = [...partMetrics].sort(
    (a, b) => a.averageTimePerQuestion - b.averageTimePerQuestion
  )[0];
  const highestChangePart = [...partMetrics].sort(
    (a, b) => b.answerChangeRate - a.answerChangeRate
  )[0];

  // Format time helper
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Scroll to question function
  const scrollToQuestion = (questionNumber: number) => {
    if (resultId) {
      // Navigate to test page with review mode and resultId using relative path
      navigate(
        `/test-exam?mode=review&resultId=${resultId}&question=${questionNumber}`
      );
    } else {
      // Fallback to original scroll behavior if no resultId
      const element = document.getElementById(`question-${questionNumber}`);
      if (element) {
        // Scroll smoothly to the selected question element
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
      // Also call the parent's onQuestionSelect to update current question
      if (onQuestionSelect) {
        onQuestionSelect(questionNumber);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="p-4 bg-[#eff6ff] border border-[#bfdbfe]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#2563eb] rounded-lg">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] mb-1 text-sm">
              Time & Behavior Analysis
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Detailed analysis of how you spent time on each part, answer
              change patterns, and hesitation behaviors.
            </p>
          </div>
        </div>
      </Card>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-[#3b82f6] bg-gradient-to-r from-[#eff6ff] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#dbeafe] rounded-lg">
              <Clock className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <Badge
              variant="outline"
              className="text-xs border-[#3b82f6] text-[#3b82f6]"
            >
              Total Time
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#3b82f6] mb-1">
            {formatTime(overallMetrics.totalActiveTime)}
          </p>
          <p className="text-xs text-[#64748b]">Total active time</p>
          <p className="text-xs text-[#1e40af] mt-1">
            Avg: {formatTime(overallMetrics.averageTimePerQuestion)}/question
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#10b981] bg-gradient-to-r from-[#f0fdf4] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#d1fae5] rounded-lg">
              <Target className="w-5 h-5 text-[#10b981]" />
            </div>
            <Badge
              variant="outline"
              className="text-xs border-[#10b981] text-[#10b981]"
            >
              Confidence
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#10b981] mb-1">
            {overallMetrics.confidenceScore}/100
          </p>
          <p className="text-xs text-[#64748b]">Overall confidence score</p>
          <p className="text-xs text-[#047857] mt-1">
            {overallMetrics.confidenceScore >= 80
              ? 'High'
              : overallMetrics.confidenceScore >= 60
                ? 'Medium'
                : 'Low'}{' '}
            confidence
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#f59e0b] bg-gradient-to-r from-[#fffbeb] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#fef3c7] rounded-lg">
              <RefreshCw className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <Badge
              variant="outline"
              className="text-xs border-[#f59e0b] text-[#f59e0b]"
            >
              Changes
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#f59e0b] mb-1">
            {overallMetrics.totalAnswerChanges}
          </p>
          <p className="text-xs text-[#64748b]">Total answer changes</p>
          <p className="text-xs text-[#92400e] mt-1">
            {hesitationAnalysis.questionsWithMultipleChanges} questions with 2+
            changes
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#dc2626] bg-gradient-to-r from-[#fef2f2] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#fee2e2] rounded-lg">
              <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
            </div>
            <Badge variant="destructive" className="text-xs">
              Hesitation
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#dc2626] mb-1">
            {hesitationAnalysis.topHesitationQuestions.length}
          </p>
          <p className="text-xs text-[#64748b]">Top hesitation questions</p>
          <p className="text-xs text-[#991b1b] mt-1">
            Avg: {hesitationAnalysis.averageChangesPerQuestion.toFixed(2)}{' '}
            changes/question
          </p>
        </Card>
      </div>

      {/* Time Distribution by Part */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-[#2563eb] rounded-lg">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">
              Time Distribution by Part
            </h3>
            <p className="text-xs text-[#64748b]">
              Percentage of total time spent on each part
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {partMetrics.map((part) => {
            const percentage =
              overallMetrics.timeDistribution[part.partName] || 0;
            const isHighTime = percentage > 30;
            const isLowTime = percentage < 5;

            return (
              <div key={part.partName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {part.partName.toUpperCase()}
                    </Badge>
                    <span className="text-[#64748b]">
                      {part.questionsCount} questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0f172a]">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-[#64748b]">
                      ({formatTime(part.totalTime)})
                    </span>
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${isHighTime ? 'bg-[#fee2e2]' : isLowTime ? 'bg-[#f0fdf4]' : ''}`}
                />
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>
                    Avg: {formatTime(part.averageTimePerQuestion)}/question
                  </span>
                  {part.answerChangeRate > 0 && (
                    <span className="text-[#f59e0b]">
                      {part.answerChangeRate.toFixed(1)}% change rate
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* High Hesitation Questions */}
        {hesitationAnalysis.topHesitationQuestions.length > 0 && (
          <Card className="p-4 border border-[#fecaca]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#dc2626] rounded-lg">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Top Hesitation Questions
                </h3>
                <p className="text-xs text-[#64748b]">
                  Questions with the most answer changes
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto  scrollbar-hide">
              {hesitationAnalysis.topHesitationQuestions.map((q) => (
                <div
                  key={q.questionNumber}
                  className="p-3 bg-[#fef2f2] rounded-lg border border-[#fecaca]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold cursor-pointer hover:bg-blue-50"
                        onClick={() => scrollToQuestion(q.questionNumber)}
                      >
                        Q{q.questionNumber}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {q.answerChanges} changes
                      </Badge>
                    </div>
                    {q.isCorrect ? (
                      <Badge className="text-xs bg-[#10b981]">✓ Correct</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        ✗ Wrong
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748b]">
                        Time to first answer:
                      </span>
                      <span className="font-semibold text-[#0f172a]">
                        {formatTime(q.timeToFirstAnswer)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748b]">Total time spent:</span>
                      <span className="font-semibold text-[#0f172a]">
                        {formatTime(q.totalTimeSpent)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748b]">Final answer:</span>
                      <Badge variant="outline" className="text-xs">
                        {q.finalAnswer}
                      </Badge>
                    </div>
                  </div>

                  {/* Change History */}
                  <div className="mt-2 pt-2 border-t border-[#fecaca]">
                    <p className="text-xs text-[#64748b] mb-1">
                      Change history:
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {q.changeHistory.map((answer, idx) => (
                        <span key={idx} className="flex items-center">
                          <Badge
                            variant={
                              idx === q.changeHistory.length - 1
                                ? 'default'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {answer}
                          </Badge>
                          {idx < q.changeHistory.length - 1 && (
                            <span className="text-[#64748b] mx-1">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Answer Change Patterns */}
        <Card className="p-4 border border-[#fed7aa]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#f59e0b] rounded-lg">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                Answer Change Patterns
              </h3>
              <p className="text-xs text-[#64748b]">
                Quality of answer changes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Correct to Incorrect */}
            <div className="p-3 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                  <span className="text-xs font-semibold text-[#0f172a]">
                    Correct → Incorrect
                  </span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {answerChangePatterns.correctToIncorrect}
                </Badge>
              </div>
              <p className="text-xs text-[#64748b]">
                ⚠️ Overthinking: Changed from right answer to wrong
              </p>
            </div>

            {/* Incorrect to Correct */}
            <div className="p-3 bg-[#f0fdf4] rounded-lg border border-[#d1fae5]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-semibold text-[#0f172a]">
                    Incorrect → Correct
                  </span>
                </div>
                <Badge className="text-xs bg-[#10b981]">
                  {answerChangePatterns.incorrectToCorrect}
                </Badge>
              </div>
              <p className="text-xs text-[#64748b]">
                ✓ Good correction: Changed from wrong to right
              </p>
            </div>

            {/* Incorrect to Incorrect */}
            <div className="p-3 bg-[#fffbeb] rounded-lg border border-[#fed7aa]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs font-semibold text-[#0f172a]">
                    Incorrect → Incorrect
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs border-[#f59e0b] text-[#f59e0b]"
                >
                  {answerChangePatterns.incorrectToIncorrect}
                </Badge>
              </div>
              <p className="text-xs text-[#64748b]">
                ⚠️ Confusion: Changed between wrong answers
              </p>
            </div>
          </div>

          {/* Change Pattern Insight */}
          <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#64748b]">
                {answerChangePatterns.correctToIncorrect >
                answerChangePatterns.incorrectToCorrect ? (
                  <span className="text-[#dc2626] font-semibold">
                    You tend to overthink! Trust your first instinct more.
                  </span>
                ) : (
                  <span className="text-[#10b981] font-semibold">
                    Good! Your corrections often lead to right answers.
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Slowest Questions by Part */}
        <Card className="p-4 border border-[#bfdbfe] lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#3b82f6] rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                Slowest Questions by Part
              </h3>
              <p className="text-xs text-[#64748b]">
                Questions that took the most time in each part
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {partMetrics.map((part) => (
              <div key={part.partName} className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {part.partName.toUpperCase()}
                </Badge>
                <div className="space-y-1.5">
                  {part.slowestQuestions.slice(0, 3).map((qNum) => (
                    <div
                      key={qNum}
                      className="p-2 bg-[#eff6ff] rounded border border-[#bfdbfe] text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => scrollToQuestion(qNum)}
                    >
                      <span className="font-semibold text-[#0f172a]">
                        Q{qNum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actionable Insights */}
      <Card className="p-4 border border-[#d1fae5] bg-[#f0fdf4]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#10b981] rounded-lg">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] mb-2 text-sm">
              Key Insights & Recommendations
            </h3>
            <div className="space-y-2">
              {/* Time Management */}
              {slowestPart && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>{slowestPart.partName.toUpperCase()}</strong> takes
                    the most time per question (
                    {formatTime(slowestPart.averageTimePerQuestion)}).
                    {slowestPart.partName === 'part7'
                      ? ' This is normal for reading comprehension.'
                      : ' Consider speed practice for this section.'}
                  </p>
                </div>
              )}

              {/* Confidence Score */}
              {overallMetrics.confidenceScore < 70 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <p>
                    Your confidence score is{' '}
                    <strong>{overallMetrics.confidenceScore}/100</strong>. With{' '}
                    {overallMetrics.totalAnswerChanges} total changes, you may
                    be second-guessing too much.
                  </p>
                </div>
              )}

              {/* Overthinking Pattern */}
              {answerChangePatterns.correctToIncorrect >
                answerChangePatterns.incorrectToCorrect && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626] mt-0.5 flex-shrink-0" />
                  <p>
                    You changed{' '}
                    <strong>
                      {answerChangePatterns.correctToIncorrect} correct answers
                      to incorrect
                    </strong>{' '}
                    vs only {answerChangePatterns.incorrectToCorrect}{' '}
                    corrections to correct. Trust your initial instinct more!
                  </p>
                </div>
              )}

              {/* High Change Rate Part */}
              {highestChangePart && highestChangePart.answerChangeRate > 15 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <Info className="w-3.5 h-3.5 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>{highestChangePart.partName.toUpperCase()}</strong>{' '}
                    has the highest answer change rate (
                    {highestChangePart.answerChangeRate.toFixed(1)}%). Focus
                    practice on building confidence in this section.
                  </p>
                </div>
              )}

              {/* Good Performance */}
              {overallMetrics.confidenceScore >= 80 &&
                answerChangePatterns.incorrectToCorrect >
                  answerChangePatterns.correctToIncorrect && (
                  <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Excellent test-taking behavior!</strong> High
                      confidence ({overallMetrics.confidenceScore}/100) and good
                      correction patterns. Keep it up!
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
