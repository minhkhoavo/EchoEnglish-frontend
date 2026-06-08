import React, { useState } from 'react';
import SelectionMenu from '@/features/resource/components/SelectionMenu';
import CreateEditFlashcardDialog from '@/features/resource/components/CreateEditFlashcardDialog';
import { useTextSelection } from '@/features/tests/hooks/useTextSelection';

interface QuestionTextProps {
  text: string;
  resourceUrl?: string;
  className?: string;
  showCorrectAnswers?: boolean; // Only enable selection in review mode
}

export const QuestionText: React.FC<QuestionTextProps> = ({
  text,
  resourceUrl,
  className = 'mb-4 font-medium text-base',
  showCorrectAnswers = false,
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
    <>
      <p
        ref={containerRef as React.RefObject<HTMLParagraphElement>}
        onMouseUp={showCorrectAnswers ? handleMouseUp : undefined}
        onMouseDown={showCorrectAnswers ? handleMouseDown : undefined}
        className={`${className} ${showCorrectAnswers ? 'select-text' : ''}`}
      >
        {text}
      </p>

      {/* Selection Menu - only in review mode */}
      {showCorrectAnswers && selectedText && (
        <SelectionMenu
          selectedText={selectedText}
          position={selectionPosition}
          onSave={handleSaveFlashcard}
          onClose={clearSelection}
        />
      )}

      {/* Flashcard Dialog - only in review mode */}
      {showCorrectAnswers && showFlashcardDialog && (
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
      )}
    </>
  );
};
