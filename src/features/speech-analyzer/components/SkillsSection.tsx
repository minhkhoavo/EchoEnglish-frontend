// components/SkillsSection.tsx
import SkillItem from './SkillItem';
import { Info, TrendingUp } from 'lucide-react';

const skillsData = [
  {
    title: 'Skill /æ/, /ʌ/, /ɑ/',
    level: 'Needs Improvement',
    videos: [
      {
        imgUrl: 'https://img.youtube.com/vi/msSHfmmZ-WA/1.jpg',
        title: 'Tutorial for /æ/, /ʌ/, /ɑ/',
      },
    ],
  },
  {
    title: 'Skill Nasals: /m/, /n/, /ŋ/',
    level: 'Needs Improvement',
    videos: [
      {
        imgUrl: 'https://img.youtube.com/vi/6ESY7ueSfrc/1.jpg',
        title: 'Tutorial for Nasals',
      },
      {
        imgUrl: 'https://img.youtube.com/vi/CoEh8cz-mS4/1.jpg',
        title: 'Tutorial for Nasals',
      },
    ],
  },
  {
    title: 'Skill /eɪ/, /ɛ/, /æ/',
    level: 'Good',
    videos: [
      {
        imgUrl: 'https://img.youtube.com/vi/XOuD6mFr6sQ/1.jpg',
        title: 'Tutorial for /eɪ/, /ɛ/, /æ/',
      },
    ],
  },
  {
    title: 'Skill /p/, /t/, /k/',
    level: 'Correct',
    videos: [
      {
        imgUrl: 'https://img.youtube.com/vi/UMGLa9L0o7U/1.jpg',
        title: 'Tutorial for /p/, /t/, /k/',
      },
    ],
  },
];

const SkillsSection = () => {
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
