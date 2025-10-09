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
} from 'lucide-react';
import type { QuestionAttemptDetail } from '../types/analysis';

interface QuestionPatternsSectionProps {
  questions: QuestionAttemptDetail[];
}

export function QuestionPatternsSection({
  questions,
}: QuestionPatternsSectionProps) {
  // Tính toán các pattern thực tế từ data
  const hesitationQuestions = questions.filter((q) => (q.changes || 0) >= 3);
  const answerChangeQuestions = questions.filter(
    (q) => (q.changes || 0) >= 1 && (q.changes || 0) < 3
  );
  const slowestQuestions = [...questions]
    .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
    .slice(0, 10);
  const skippedQuestions = questions.filter((q) => q.skipped);

  // Calculate average time
  const avgTime =
    questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0) /
    questions.length;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="p-4 bg-[#eff6ff] border border-[#bfdbfe]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#2563eb] rounded-lg">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] mb-1 text-sm">
              Question-Level Behavioral Patterns
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Analyze questions based on actual behavior: hesitation, answer
              changes, time spent, and skipping.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-[#dc2626] bg-gradient-to-r from-[#fef2f2] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#fee2e2] rounded-lg">
              <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
            </div>
            <Badge variant="destructive" className="text-xs">
              Critical
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#dc2626] mb-1">
            {hesitationQuestions.length}
          </p>
          <p className="text-xs text-[#64748b]">
            Questions with multiple hesitations
          </p>
          <p className="text-xs text-[#991b1b] mt-1">≥3 changes</p>
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
              Warning
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#f59e0b] mb-1">
            {answerChangeQuestions.length}
          </p>
          <p className="text-xs text-[#64748b]">
            Questions with answer changes
          </p>
          <p className="text-xs text-[#92400e] mt-1">1-2 changes</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#3b82f6] bg-gradient-to-r from-[#eff6ff] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#dbeafe] rounded-lg">
              <Clock className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <Badge
              variant="outline"
              className="text-xs border-[#3b82f6] text-[#3b82f6]"
            >
              Info
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#3b82f6] mb-1">
            {slowestQuestions.length}
          </p>
          <p className="text-xs text-[#64748b]">
            Questions taking the most time
          </p>
          <p className="text-xs text-[#1e40af] mt-1">Top 10 slowest</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#64748b] bg-gradient-to-r from-[#f8fafc] to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#e2e8f0] rounded-lg">
              <SkipForward className="w-5 h-5 text-[#64748b]" />
            </div>
            <Badge variant="outline" className="text-xs">
              Skipped
            </Badge>
          </div>
          <p className="text-2xl font-bold text-[#64748b] mb-1">
            {skippedQuestions.length}
          </p>
          <p className="text-xs text-[#64748b]">Skipped questions</p>
          <p className="text-xs text-[#475569] mt-1">Unanswered</p>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* High Hesitation Questions */}
        {hesitationQuestions.length > 0 && (
          <Card className="p-4 border border-[#fecaca]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#dc2626] rounded-lg">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Questions with multiple hesitations
                </h3>
                <p className="text-xs text-[#64748b]">
                  Answer changes ≥3 times
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {hesitationQuestions.slice(0, 15).map((q) => (
                <div
                  key={q.questionId}
                  className="p-2.5 bg-[#fef2f2] rounded-lg border border-[#fecaca]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Q{q.questionNumber}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {q.changes} changes
                      </Badge>
                    </div>
                    {q.isCorrect ? (
                      <Badge className="text-xs bg-[#10b981]">Correct</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Wrong
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Part {q.partNumber} • {q.skillTested} •{' '}
                    {q.timeSpent?.toFixed(1)}s
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Answer Change Questions */}
        {answerChangeQuestions.length > 0 && (
          <Card className="p-4 border border-[#fed7aa]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#f59e0b] rounded-lg">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Questions with answer changes
                </h3>
                <p className="text-xs text-[#64748b]">Changes 1-2 times</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {answerChangeQuestions.slice(0, 15).map((q) => (
                <div
                  key={q.questionId}
                  className="p-2.5 bg-[#fffbeb] rounded-lg border border-[#fed7aa]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Q{q.questionNumber}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-[#f59e0b] text-[#f59e0b]"
                      >
                        {q.changes} change{q.changes! > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {q.isCorrect ? (
                      <Badge className="text-xs bg-[#10b981]">Correct</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Wrong
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Part {q.partNumber} • {q.skillTested} •{' '}
                    {q.timeSpent?.toFixed(1)}s
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Slowest Questions */}
        <Card className="p-4 border border-[#bfdbfe]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#3b82f6] rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                Questions taking the most time
              </h3>
              <p className="text-xs text-[#64748b]">
                Top 10 questions taking the most time
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {slowestQuestions.map((q) => (
              <div
                key={q.questionId}
                className="p-2.5 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Q{q.questionNumber}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-[#3b82f6] text-[#3b82f6]"
                    >
                      {q.timeSpent?.toFixed(1)}s
                    </Badge>
                  </div>
                  {q.isCorrect ? (
                    <Badge className="text-xs bg-[#10b981]">Correct</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Wrong
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#64748b]">
                  Part {q.partNumber} • {q.skillTested}
                </p>
                <div className="mt-1.5">
                  <Progress
                    value={(q.timeSpent! / avgTime) * 50}
                    className="h-1"
                  />
                  <p className="text-xs text-[#64748b] mt-0.5">
                    {((q.timeSpent! / avgTime) * 100).toFixed(0)}% of average
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skipped Questions */}
        {skippedQuestions.length > 0 && (
          <Card className="p-4 border border-[#e2e8f0]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#64748b] rounded-lg">
                <SkipForward className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Skipped questions
                </h3>
                <p className="text-xs text-[#64748b]">Unanswered</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {skippedQuestions.map((q) => (
                <div
                  key={q.questionId}
                  className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Q{q.questionNumber}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Skipped
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    Part {q.partNumber} • {q.skillTested}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Actionable Insights */}
      <Card className="p-4 border border-[#d1fae5] bg-[#f0fdf4]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#10b981] rounded-lg">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] mb-2 text-sm">
              Improvement recommendations
            </h3>
            <div className="space-y-2">
              {hesitationQuestions.length > 10 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p>
                    You have{' '}
                    <strong>
                      {hesitationQuestions.length} questions with multiple
                      hesitations
                    </strong>{' '}
                    (≥3 changes). This indicates you need to increase confidence
                    when selecting answers.
                  </p>
                </div>
              )}
              {answerChangeQuestions.length > 15 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>
                      {answerChangeQuestions.length} questions with answer
                      changes
                    </strong>
                    . Trust your first answer more if you've prepared well.
                  </p>
                </div>
              )}
              {slowestQuestions.filter((q) => !q.isCorrect).length > 5 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>
                      {slowestQuestions.filter((q) => !q.isCorrect).length}{' '}
                      questions taking time but still wrong
                    </strong>
                    . Consider time management skills and test-taking
                    strategies.
                  </p>
                </div>
              )}
              {skippedQuestions.length > 0 && (
                <div className="flex items-start gap-2 text-xs text-[#0f172a]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#10b981] mt-0.5 flex-shrink-0" />
                  <p>
                    You skipped{' '}
                    <strong>{skippedQuestions.length} questions</strong>. Always
                    try to answer all questions, even if unsure.
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
