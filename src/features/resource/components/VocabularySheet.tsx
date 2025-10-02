import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Edit2, Trash2, Volume2, Plus } from 'lucide-react';
import type { Flashcard } from '@/features/flashcard/types/flashcard.types';
import CreateEditFlashcardDialog from './CreateEditFlashcardDialog';

interface VocabularySheetProps {
  flashcards: Flashcard[];
  resourceUrl?: string;
  onRefetch: () => void;
  onDelete?: (flashcard: Flashcard) => void;
}

const VocabularySheet: React.FC<VocabularySheetProps> = ({
  flashcards,
  resourceUrl,
  onRefetch,
  onDelete,
}) => {
  const playAudio = (text: string, language: 'en' | 'vi' = 'en') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-US' : 'vi-VN';
    speechSynthesis.speak(utterance);
  };

  const getCategoryName = (category: string | object): string => {
    if (typeof category === 'string') return category || 'Uncategorized';
    if (category && typeof category === 'object' && 'name' in category) {
      return (category as { name: string }).name;
    }
    return 'Uncategorized';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="fixed bottom-6 left-6 h-12 px-4 shadow-lg hover:shadow-xl transition-shadow z-40 bg-white border-2 border-blue-200 hover:border-blue-400"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Vocabulary ({flashcards.length})
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Flashcards ({flashcards.length})
            </SheetTitle>
            <CreateEditFlashcardDialog
              resourceUrl={resourceUrl}
              onSuccess={onRefetch}
              trigger={
                <Button type="button" size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              }
            />
          </div>
        </SheetHeader>

        <ScrollArea className="h-full mt-6 pr-4">
          {flashcards.length > 0 ? (
            <div className="space-y-4">
              {flashcards.map((flashcard) => (
                <Card
                  key={flashcard._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Front side */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 leading-relaxed">
                              {flashcard.front}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                playAudio(flashcard.front, 'en');
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Back side */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-blue-800 leading-relaxed">
                              <strong>Translation:</strong> {flashcard.back}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                playAudio(flashcard.back, 'vi');
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Category and actions */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(flashcard.category)}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <CreateEditFlashcardDialog
                            isEdit={true}
                            flashcard={flashcard}
                            onSuccess={onRefetch}
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            }
                          />
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(flashcard)}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Source info */}
                      {flashcard.source && (
                        <div className="text-xs text-gray-500 border-t pt-2">
                          Source: {flashcard.source}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No flashcards yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your vocabulary by selecting text and creating
                flashcards
              </p>
              <CreateEditFlashcardDialog
                resourceUrl={resourceUrl}
                onSuccess={onRefetch}
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Flashcard
                  </Button>
                }
              />
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default VocabularySheet;
