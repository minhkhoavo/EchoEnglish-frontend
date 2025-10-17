import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Target } from 'lucide-react';
import type { SkillData } from '../types/dashboard.types';

interface SkillsRadarProps {
  skillsData: SkillData[];
}

export const SkillsRadar = ({ skillsData }: SkillsRadarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" style={{ color: '#3B82F6' }} />
          360° Skills Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive analysis of your TOEIC abilities across key skill areas
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={skillsData.map((skill) => ({
                skill: skill.skillName,
                value: skill.percentage,
                fullMark: 100,
              }))}
            >
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar
                name="Your Score"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {skillsData.map((skill) => (
            <div key={skill._id} className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                {skill.skillName}
              </div>
              <div className="text-lg font-semibold">
                {skill.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
