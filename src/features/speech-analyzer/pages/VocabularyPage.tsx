import React from 'react';
import VocabularyContent from '../components/vocabulary/VocabularyContent';

const VocabularyPage: React.FC = () => {
  const vocabularyAnalysis = {
    distribution: {
      totalWords: 45,
      uniqueWords: 38,
      advancedVocabularyPercentage: 9,
      cefrLevels: [
        {
          level: 'A1' as const,
          name: 'Beginner',
          percentage: 45,
          count: 17,
          description: 'Basic everyday words',
        },
        {
          level: 'A2' as const,
          name: 'Elementary',
          percentage: 45,
          count: 17,
          description: 'Common expressions',
        },
        {
          level: 'B1' as const,
          name: 'Intermediate',
          percentage: 0,
          count: 0,
          description: 'Work and study vocabulary',
        },
        {
          level: 'B2' as const,
          name: 'Upper-Intermediate',
          percentage: 9,
          count: 4,
          description: 'Abstract concepts',
        },
        {
          level: 'C1' as const,
          name: 'Advanced',
          percentage: 0,
          count: 0,
          description: 'Complex ideas',
        },
        {
          level: 'C2' as const,
          name: 'Proficient',
          percentage: 0,
          count: 0,
          description: 'Native-like vocabulary',
        },
      ],
    },
    scores: {
      overall: 85,
      complexity: 78,
      variety: 88,
      accuracy: 92,
      appropriateness: 85,
    },
    topPerformances: [
      {
        category: 'Technical Terms',
        description:
          'Excellent use of technical vocabulary in software engineering context.',
        score: 92,
        level: 'excellent' as const,
      },
      {
        category: 'Professional Language',
        description: 'Good use of formal and professional expressions.',
        score: 88,
        level: 'excellent' as const,
      },
    ],
    suggestedWords: [
      {
        word: 'sophisticated',
        cefrLevel: 'C1' as const,
        definition: 'Having great knowledge or experience',
        example:
          'The software uses sophisticated algorithms for data processing.',
        category: 'Descriptive',
      },
      {
        word: 'implement',
        cefrLevel: 'B2' as const,
        definition: 'To put a plan or system into operation',
        example: 'We need to implement the new security features.',
        category: 'Technical',
      },
      {
        word: 'consequently',
        cefrLevel: 'B2' as const,
        definition: 'As a result or effect of something',
        example: 'The system crashed; consequently, we lost some data.',
        category: 'Connective',
      },
      {
        word: 'optimize',
        cefrLevel: 'C1' as const,
        definition: 'To make something as effective as possible',
        example:
          'We should optimize the database queries for better performance.',
        category: 'Technical',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <VocabularyContent analysis={vocabularyAnalysis} />
    </div>
  );
};

export default VocabularyPage;
