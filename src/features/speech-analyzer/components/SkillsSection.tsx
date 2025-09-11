// components/SkillsSection.tsx
import SkillItem from './SkillItem';
import { Info, TrendingUp } from 'lucide-react';
import type { TopMistake } from '../types/pronunciation.types';

export interface SkillsSectionProps {
  topMistakes: TopMistake[];
}

const youtubeThumb = (url: string) => {
  try {
    const u = new URL(url);
    const id = u.searchParams.get('v');
    if (id) return `https://img.youtube.com/vi/${id}/1.jpg`;
    const parts = u.pathname.split('/');
    const last = parts[parts.length - 1];
    if (u.hostname.includes('youtu.be') && last) {
      return `https://img.youtube.com/vi/${last}/1.jpg`;
    }
  } catch (_) {
    // ignore
  }
  return 'https://img.youtube.com/vi/dQw4w9WgXcQ/1.jpg';
};

const SkillsSection = ({ topMistakes }: SkillsSectionProps) => {
  const skillsData = topMistakes
    .flatMap((m) => m.skillsData)
    .map((s) => ({
      title: s.title,
      level: s.level,
      videos: s.resources
        .filter((r) => r.type === 'video')
        .map((r) => ({
          imgUrl: youtubeThumb(r.url),
          title: r.title,
          url: r.url,
        })),
    }));
  const needsImprovement = skillsData.filter(
    (skill) => skill.level === 'Needs Improvement'
  ).length;
  const totalSkills = skillsData.length;

  return (
    <div className="space-y-4">
      {/* Compact Header with Progress Indicator */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Pronunciation by skill
          </h3>
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">
              {needsImprovement}/{totalSkills} to improve
            </span>
          </div>
        </div>
      </div>

      {/* Compact Skills Grid */}
      <div className="grid gap-3">
        {skillsData.map((skill, index) => (
          <SkillItem key={index} {...skill} />
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;
