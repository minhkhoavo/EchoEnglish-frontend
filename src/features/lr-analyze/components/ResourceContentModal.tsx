import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LearningResource } from '../types/analysis';
import { VocabularySetView } from './VocabularySetView';
import { PersonalizedGuideView } from './PersonalizedGuideView';

interface ResourceContentModalProps {
  resource: LearningResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourceContentModal({
  resource,
  open,
  onOpenChange,
}: ResourceContentModalProps) {
  if (!resource) return null;

  // Render content based on resource type
  const renderContent = () => {
    switch (resource.type) {
      case 'vocabulary_set':
        return <VocabularySetView resource={resource} />;
      case 'personalized_guide':
        return <PersonalizedGuideView resource={resource} />;
      default:
        return (
          <div className="text-center py-8 text-[#64748b]">
            <p>This resource type is not yet supported for preview</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <DialogTitle className="sr-only">{resource.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
