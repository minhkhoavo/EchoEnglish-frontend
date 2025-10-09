import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { PartAnalysis, SkillPerformance } from '../types/analysis';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PartAnalysisSectionProps {
  partAnalyses: PartAnalysis[];
}

export function PartAnalysisSection({
  partAnalyses,
}: PartAnalysisSectionProps) {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(
    new Set(['3'])
  );

  const togglePart = (partNumber: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partNumber)) {
      newExpanded.delete(partNumber);
    } else {
      newExpanded.add(partNumber);
    }
    setExpandedParts(newExpanded);
  };

  const getPartTitle = (partNumber: string): string => {
    const titles: Record<string, string> = {
      '1': 'Part 1: Photographs',
      '2': 'Part 2: Question-Response',
      '3': 'Part 3 & 4: Conversations & Talks',
      '5': 'Part 5: Incomplete Sentences',
      '6': 'Part 6: Text Completion',
      '7': 'Part 7: Reading Comprehension',
    };
    return titles[partNumber] || `Part ${partNumber}`;
  };

  const getPartDescription = (partNumber: string): string => {
    const descriptions: Record<string, string> = {
      '1': 'Assess ability to connect descriptive language with images',
      '2': 'Test response reflex and understanding of communicative intent',
      '3': 'Deeper contextual listening comprehension',
      '5': 'Direct assessment of grammar and vocabulary',
      '6': 'Discourse understanding and coherence',
      '7': 'Diverse reading comprehension skills',
    };
    return descriptions[partNumber] || '';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) {
      return '#10b981'; // Excellent - Green
    } else if (accuracy >= 65) {
      return '#f59e0b'; // Warning - Amber
    } else {
      return '#dc2626'; // Critical - Red
    }
  };

  const renderSkillBar = (skill: SkillPerformance) => {
    const color = getAccuracyColor(skill.accuracy);
    const isWeakness = skill.accuracy < 65;

    return (
      <div key={skill.skillKey} className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#0f172a]">
              {skill.skillName}
            </span>
            {isWeakness && (
              <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#64748b]">
              {skill.correct}/{skill.total}
            </span>
            <span className="text-sm font-bold" style={{ color }}>
              {skill.accuracy.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${skill.accuracy}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="p-5 bg-[#eff6ff] border border-[#bfdbfe]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#2563eb] rounded-lg">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0f172a] mb-1.5 text-sm">
              Part-by-Part Deep Dive
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Click on any part to expand and see detailed skill breakdowns,
              contextual analysis, and specific areas for improvement. Red
              indicators show critical weaknesses.
            </p>
          </div>
        </div>
      </Card>

      {partAnalyses.map((partAnalysis) => {
        const isExpanded = expandedParts.has(partAnalysis.partNumber);
        const hasWeakness = partAnalysis.skillBreakdown.some(
          (s) => s.accuracy < 65
        );

        return (
          <Collapsible
            key={partAnalysis.partNumber}
            open={isExpanded}
            onOpenChange={() => togglePart(partAnalysis.partNumber)}
          >
            <Card
              className={`border ${hasWeakness ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full p-5 text-left hover:bg-[#f9fafb] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2.5 rounded-lg ${
                          hasWeakness ? 'bg-[#fef2f2]' : 'bg-[#f0f9ff]'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown
                            className={`w-4 h-4 ${
                              hasWeakness ? 'text-[#dc2626]' : 'text-[#2563eb]'
                            }`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-4 h-4 ${
                              hasWeakness ? 'text-[#dc2626]' : 'text-[#2563eb]'
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-0.5">
                          <h3 className="text-base font-bold text-[#0f172a]">
                            {getPartTitle(partAnalysis.partNumber)}
                          </h3>
                          {hasWeakness && (
                            <Badge className="bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] text-xs px-2 py-0.5">
                              Needs Attention
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {getPartDescription(partAnalysis.partNumber)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-[#64748b] mb-0.5">
                          Accuracy
                        </p>
                        <p
                          className={`text-xl font-bold ${
                            partAnalysis.accuracy >= 75
                              ? 'text-[#10b981]'
                              : partAnalysis.accuracy >= 60
                                ? 'text-[#f59e0b]'
                                : 'text-[#dc2626]'
                          }`}
                        >
                          {partAnalysis.accuracy.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#64748b] mb-0.5">Score</p>
                        <p className="text-xl font-bold text-[#0f172a]">
                          {partAnalysis.correctAnswers}/
                          {partAnalysis.totalQuestions}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-5 pb-5 pt-2 border-t border-[#f1f5f9]">
                  <div className="flex flex-col md:flex-row gap-5 mb-5">
                    {/* Skill Breakdown */}
                    <div className="w-full md:w-1/2">
                      <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#2563eb] rounded-full" />
                        Skill Breakdown
                      </h4>
                      <div className="space-y-2.5">
                        {partAnalysis.skillBreakdown.map(renderSkillBar)}
                      </div>
                    </div>

                    {/* Skill Distribution Chart */}
                    <div className="w-full md:w-1/2">
                      <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#8b5cf6] rounded-full" />
                        Skill Distribution
                      </h4>
                      <div className="bg-[#fafafa] rounded-lg p-3">
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart
                            data={partAnalysis.skillBreakdown}
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="skillName"
                              angle={0}
                              textAnchor="middle"
                              height={60}
                              tick={{ fill: '#64748b', fontSize: 9 }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tick={{ fill: '#64748b', fontSize: 9 }}
                              label={{
                                value: 'Accuracy (%)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: '#64748b', fontSize: 10 },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px',
                                fontSize: '11px',
                              }}
                              formatter={(value: number) => [
                                `${value.toFixed(1)}%`,
                                'Accuracy',
                              ]}
                            />
                            <Bar
                              dataKey="accuracy"
                              name="Your Score"
                              radius={[6, 6, 0, 0]}
                            >
                              {partAnalysis.skillBreakdown.map(
                                (skill, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={getAccuracyColor(skill.accuracy)}
                                  />
                                )
                              )}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Analysis (if available) */}
                  {partAnalysis.contextualAnalysis && (
                    <div className="space-y-5">
                      {/* By Domain */}
                      {Object.keys(partAnalysis.contextualAnalysis.byDomain)
                        .length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#10b981] rounded-full" />
                            Performance by Context Domain
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.entries(
                              partAnalysis.contextualAnalysis.byDomain
                            ).map(([domain, perf]) => (
                              <Card
                                key={domain}
                                className="p-3 border border-[#e5e7eb]"
                              >
                                <p className="text-xs font-medium text-[#64748b] mb-2">
                                  {perf.skillName}
                                </p>
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span
                                    className="text-xl font-bold"
                                    style={{
                                      color: getAccuracyColor(perf.accuracy),
                                    }}
                                  >
                                    {perf.accuracy.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={perf.accuracy}
                                  className="h-1.5"
                                />
                                <p className="text-xs text-[#64748b] mt-2">
                                  {perf.correct}/{perf.total} correct
                                </p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* By Difficulty/Passage Type */}
                      {Object.keys(partAnalysis.contextualAnalysis.byDifficulty)
                        .length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                            <div className="w-1 h-4 bg-[#f59e0b] rounded-full" />
                            {partAnalysis.partNumber === '7'
                              ? 'By Passage Type'
                              : 'By Difficulty Level'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.entries(
                              partAnalysis.contextualAnalysis.byDifficulty
                            ).map(([level, perf]) => (
                              <Card
                                key={level}
                                className="p-3 border border-[#e5e7eb]"
                              >
                                <p className="text-xs font-medium text-[#64748b] mb-2">
                                  {perf.skillName}
                                </p>
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span
                                    className="text-xl font-bold"
                                    style={{
                                      color: getAccuracyColor(perf.accuracy),
                                    }}
                                  >
                                    {perf.accuracy.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={perf.accuracy}
                                  className="h-1.5"
                                />
                                <p className="text-xs text-[#64748b] mt-2">
                                  {perf.correct}/{perf.total} correct
                                </p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
                    <Button
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to drills for this part
                      }}
                    >
                      Practice {getPartTitle(partAnalysis.partNumber)} Skills
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
