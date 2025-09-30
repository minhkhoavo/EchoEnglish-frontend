import React from 'react';
import VocabularyContent from '../components/vocabulary/VocabularyContent';
import type { Recording } from '@/features/recordings/types/recordings.types';

interface VocabularyPageProps {
  recording?: Recording;
}

const VocabularyPage: React.FC<VocabularyPageProps> = ({ recording }) => {
  return (
    <div className="space-y-6">
      <VocabularyContent recording={recording} />
    </div>
  );
};

export default VocabularyPage;
