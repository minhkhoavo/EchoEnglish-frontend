import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SelectionMenu from '@/features/resource/components/SelectionMenu';
import CreateEditFlashcardDialog from '@/features/resource/components/CreateEditFlashcardDialog';
import { useTextSelection } from '@/features/tests/hooks/useTextSelection';
import { useState } from 'react';

interface QuestionContentProps {
  title: string;
  content: string;
  resourceUrl?: string;
  isHtml?: boolean;
  showCorrectAnswers?: boolean; // Only enable selection in review mode
}

const BLANK_HTML =
  '<span class="inline-block w-16 h-6 bg-yellow-200 dark:bg-yellow-800 border-b-2 border-yellow-600 mx-1 align-bottom">______</span>';

export const QuestionContent: React.FC<QuestionContentProps> = ({
  title,
  content,
  resourceUrl,
  isHtml = false,
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
    if (translation) setSelectedTranslation(translation);
    setShowFlashcardDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTranslation('');
    clearSelection();
  };

  const renderPlainWithBlanks = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(_{3,}|--)/g);
    return (
      <>
        {parts.map((chunk, i) => {
          if (!chunk) return null;
          if (chunk === '--' || /^_{3,}$/.test(chunk)) {
            return (
              <span
                key={`blank-${i}`}
                className="inline-block w-16 h-6 bg-yellow-200 dark:bg-yellow-800 border-b-2 border-yellow-600 mx-1 align-bottom"
              >
                ______
              </span>
            );
          }
          return <React.Fragment key={`t-${i}`}>{chunk}</React.Fragment>;
        })}
      </>
    );
  };

  const getHtmlWithBlanks = (html: string) => {
    if (!html) return html;
    return html.replace(/(--|_{3,})/g, BLANK_HTML);
  };

  const commonProps = {
    ref: containerRef as React.RefObject<HTMLDivElement>,
    onMouseUp: showCorrectAnswers ? handleMouseUp : undefined,
    onMouseDown: showCorrectAnswers ? handleMouseDown : undefined,
    className: showCorrectAnswers ? 'select-text' : '',
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">{title}</h3>

          {isHtml ? (
            <div
              {...commonProps}
              className={`text-base leading-relaxed ${showCorrectAnswers ? 'select-text' : ''} prose prose-sm max-w-none dark:prose-invert`}
              dangerouslySetInnerHTML={{
                __html: getHtmlWithBlanks(content),
              }}
            />
          ) : (
            <div
              {...commonProps}
              className={`text-base leading-relaxed ${showCorrectAnswers ? 'select-text' : ''}`}
            >
              {renderPlainWithBlanks(content)}
            </div>
          )}
        </CardContent>
      </Card>

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
