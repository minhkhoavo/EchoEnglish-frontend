import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Languages, Save, Loader2 } from 'lucide-react';
import { useTranslateTextMutation } from '@/features/flashcard/services/flashcardApi';
import { toast } from 'sonner';

interface SelectionMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onSave: (translation?: string) => void;
  onClose: () => void;
}

export default function SelectionMenu({
  selectedText,
  position,
  onSave,
  onClose,
}: SelectionMenuProps) {
  const [menuPosition, setMenuPosition] = useState(position);
  const [translation, setTranslation] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translateText, { isLoading }] = useTranslateTextMutation();

  useEffect(() => {
    // Adjust menu position to stay within viewport
    const adjustPosition = () => {
      const rect = { width: 200, height: 80 };
      const viewport = { width: window.innerWidth, height: window.innerHeight };

      let x = position.x;
      let y = position.y - 10; // Above selection

      // Keep within horizontal bounds
      if (x + rect.width > viewport.width) {
        x = viewport.width - rect.width - 10;
      }
      if (x < 10) x = 10;

      // Keep within vertical bounds
      if (y < 10) {
        y = position.y + 30; // Below selection if no space above
      }
      if (y + rect.height > viewport.height) {
        y = viewport.height - rect.height - 10;
      }

      setMenuPosition({ x, y });
    };

    adjustPosition();
  }, [position]);

  const handleTranslate = async () => {
    try {
      const response = await translateText({
        sourceText: selectedText,
        destinationLanguage: 'vi',
      }).unwrap();
      setTranslation(
        response.data?.destinationText || 'No translation available'
      );
      setShowTranslation(true);
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Failed to translate text. Please try again.');
    }
  };

  if (!selectedText) return null;

  return (
    <Card
      data-selection-menu
      className="fixed z-50 p-3 shadow-lg border bg-card/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 min-w-[280px]"
      style={{
        left: menuPosition.x,
        top: menuPosition.y,
        transform: 'translateY(-100%)',
      }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        {/* Selected text */}
        <div className="text-sm font-medium text-foreground">
          "{selectedText}"
        </div>

        {/* Translation display */}
        {showTranslation && translation && (
          <div className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
            <span className="font-medium text-primary">→</span> {translation}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTranslate}
            disabled={isLoading}
            className="flex items-center gap-2 h-8 px-3"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Languages className="h-3 w-3" />
            )}
            Translate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(translation)}
            className="flex items-center gap-2 h-8 px-3"
          >
            <Save className="h-3 w-3" />
            Save Flashcard
          </Button>
        </div>
      </div>
    </Card>
  );
}
