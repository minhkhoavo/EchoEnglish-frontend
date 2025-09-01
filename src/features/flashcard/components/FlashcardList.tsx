import React, { useState } from 'react';
import type { Flashcard } from '../types/flashcard.types';
import { Card, CardContent } from '@/components/ui/card'; // Vẫn giữ lại vì dùng cho màn hình trống
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useGetFlashcardsQuery } from '../services/flashcardApi';

const getDifficultyColor = (difficulty: Flashcard['difficulty']) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-500 text-white';
    case 'Medium':
      return 'bg-yellow-500 text-black';
    case 'Hard':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const FlashcardList: React.FC = () => {
  const { data: flashcards, error, isLoading } = useGetFlashcardsQuery();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(id)) {
        newFlipped.delete(id);
      } else {
        newFlipped.add(id);
      }
      return newFlipped;
    });
  };

  if (isLoading) return <div className="space-y-6">Loading flashcards...</div>;
  if (error) return <div className="space-y-6">Error loading flashcards.</div>;
  if (!flashcards) return <div className="space-y-6">No flashcards found.</div>;

  return (
    <div className="space-y-6">
      {flashcards.length === 0 ? (
        <Card className="glass-card shadow-medium">
          <CardContent className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6 animate-float" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No flashcards yet</h3>
            <p className="text-muted-foreground">Create your first flashcard or generate from content!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((card) => (
            <div
              key={card.id}
              className="p-6 h-64 flex flex-col border rounded-lg relative group cursor-pointer" // Thêm border và bo góc để dễ nhìn
              onClick={() => toggleFlip(card.id)}
            >
              {card.isAIGenerated && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-primary text-primary-foreground text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="border-secondary/30 text-secondary text-xs">
                  {card.category}
                </Badge>
                <Badge className={`${getDifficultyColor(card.difficulty)} text-xs`}>
                  {card.difficulty}
                </Badge>
              </div>

              <div className="flex-1 flex items-center justify-center text-center">
                <div className="space-y-3">
                  {flippedCards.has(card.id) ? (
                    <>
                      <EyeOff className="h-5 w-5 text-muted-foreground mx-auto animate-pulse" />
                      <p className="text-sm text-foreground font-medium">{card.back}</p>
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 text-muted-foreground mx-auto" />
                      <p className="text-sm text-foreground font-medium">{card.front}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {card.source && (
                  <div className="text-xs text-muted-foreground bg-gradient-hero p-2 rounded border border-primary/10">
                    <span className="font-medium">Source:</span> {card.source}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {card.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-secondary-light text-secondary">
                        {tag}
                      </Badge>
                    ))}
                    {card.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-secondary-light text-secondary">
                        +{card.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <RotateCcw className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardList;