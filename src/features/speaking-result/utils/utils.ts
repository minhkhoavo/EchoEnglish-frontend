// Helper utilities for speaking result UI (colors and icons)
export const getProficiencyColor = (level: string) => {
  switch (level) {
    case 'Expert':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Advanced':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Intermediate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Beginner':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'text-emerald-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-orange-600';
  return 'text-red-600';
};

export const getPartIcon = (iconName: string) => {
  return `/icon/speech-analyzer/icon-${iconName}.svg`;
};
