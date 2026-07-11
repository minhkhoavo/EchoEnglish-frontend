import { Card } from '@/components/ui/card';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { OverallSkillDimensions } from '../types/analysis';
import { TrendingUp, Info } from 'lucide-react';

interface SkillRadarChartProps {
  skills: OverallSkillDimensions;
  strengths: string[];
}

export function SkillRadarChart({ skills, strengths }: SkillRadarChartProps) {
  const mainRadarData = [
    {
      skill: 'GIST',
      Score: skills.GIST || 0,
      fullMark: 100,
    },
    {
      skill: 'DETAIL',
      Score: skills.DETAIL || 0,
      fullMark: 100,
    },
    {
      skill: 'INFERENCE',
      Score: skills.INFERENCE || 0,
      fullMark: 100,
    },
    {
      skill: 'SPECIFIC_ACTION',
      Score: skills.SPECIFIC_ACTION || 0,
      fullMark: 100,
    },
    {
      skill: 'GRAMMAR',
      Score: skills.GRAMMAR || 0,
      fullMark: 100,
    },
    {
      skill: 'VOCABULARY',
      Score: skills.VOCABULARY || 0,
      fullMark: 100,
    },
    {
      skill: 'COHESION',
      Score: skills.COHESION || 0,
      fullMark: 100,
    },
    {
      skill: 'OTHERS',
      Score: skills.OTHERS || 0,
      fullMark: 100,
    },
  ];

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
              Understanding Your Skill Profile
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              These radar charts visualize your performance across different
              skill dimensions. Areas where your score is low indicate
              opportunities for focused improvement.
            </p>
          </div>
        </div>
      </Card>

      {/* Main Overall Skills Radar */}
      <Card className="p-4 border border-[#e5e7eb]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">
              Overall Skill Performance
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Six core skill dimensions across all parts
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={mainRadarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
            />
            <Radar
              name="Your Score"
              dataKey="Score"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px',
                fontSize: '11px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Key Strengths Summary - compact */}
      <Card className="p-4 border border-[#d1fae5] bg-[#f0fdf4]">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="p-1.5 bg-[#10b981] rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0f172a] mb-0.5">
              Your Key Strengths
            </h3>
            <p className="text-xs text-[#475569]">Skills where you excel</p>
          </div>
        </div>

        <div className="space-y-2">
          {strengths.map((strength, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-[#d1fae5]"
            >
              <div className="p-1 bg-[#d1fae5] rounded">
                <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <p className="text-xs text-[#0f172a] flex-1 leading-relaxed">
                {strength}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
