import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import SelectionMenu from '@/features/resource/components/SelectionMenu';
import CreateEditFlashcardDialog from '@/features/resource/components/CreateEditFlashcardDialog';
import { useTextSelection } from '@/features/tests/hooks/useTextSelection';

interface ExplanationSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  explanation: string;
  resourceUrl?: string;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  title,
  expanded,
  onToggle,
  explanation,
  resourceUrl,
}) => {
  const [selectedTranslation, setSelectedTranslation] = useState('');
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const {
    selectedText,
    selectionPosition,
    handleMouseUp,
    handleMouseDown,
    containerRef,
    clearSelection,
  } = useTextSelection();

  const handleSaveFlashcard = (translation?: string) => {
    if (translation) {
      setSelectedTranslation(translation);
    }
    setShowFlashcardDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTranslation('');
    clearSelection();
  };

  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {title}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="p-4">
            <div
              ref={containerRef as React.RefObject<HTMLDivElement>}
              onMouseUp={handleMouseUp}
              onMouseDown={handleMouseDown}
              dangerouslySetInnerHTML={{ __html: explanation }}
              className="prose prose-sm max-w-none dark:prose-invert select-text"
            />
          </CardContent>
        </Card>
      </CollapsibleContent>

      {/* Selection Menu */}
      <SelectionMenu
        selectedText={selectedText}
        position={selectionPosition}
        onSave={handleSaveFlashcard}
        onClose={clearSelection}
      />

      {/* Flashcard Dialog */}
      <CreateEditFlashcardDialog
        open={showFlashcardDialog}
        onOpenChange={setShowFlashcardDialog}
        selectedText={selectedText}
        selectedTranslation={selectedTranslation}
        resourceUrl={resourceUrl}
        onSuccess={() => {
          handleCloseDialog();
          setShowFlashcardDialog(false);
        }}
      />
    </Collapsible>
  );
};
