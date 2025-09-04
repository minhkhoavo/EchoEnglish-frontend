import React, { useState } from 'react';
import {
  Brain,
  BookOpen,
  Play,
  Zap,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';
import type { ContentItem, GenerationResult } from '../types/content.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GenerationHubProps {
  readyItems: ContentItem[];
  onGenerateContent: (
    item: ContentItem,
    type: 'quiz' | 'flashcards'
  ) => Promise<GenerationResult>;
  isGenerating?: boolean;
}

export const GenerationHub: React.FC<GenerationHubProps> = ({
  readyItems,
  onGenerateContent,
  isGenerating = false,
}) => {
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);

  const handleItemGenerate = async (
    item: ContentItem,
    type: 'quiz' | 'flashcards'
  ) => {
    try {
      const result = await onGenerateContent(item, type);
      setLastResult(result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  if (readyItems.length === 0) {
    return (
      <Card className="glass-card shadow-medium">
        <CardContent className="text-center py-16">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-6 animate-float" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No content ready for generation
          </h3>
          <p className="text-muted-foreground mb-6">
            Upload and process content first to use AI generation!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Generation */}
      <Card className="glass-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-warning animate-pulse" />
            <span className="bold text-2xl">AI Generation Hub</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-hero rounded-xl border border-primary/20">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Smart Quiz Generation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered quiz creation
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Available quizzes
                  </span>
                  <Badge className="bg-gradient-success text-success-foreground">
                    {readyItems.reduce(
                      (acc, item) =>
                        acc + (item.insights?.suggestedQuizzes || 0),
                      0
                    )}
                  </Badge>
                </div>
                <Button className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-pink">
                  <Play className="h-4 w-4 mr-2" />
                  Generate All Quizzes
                </Button>
              </div>
            </div>

            <div className="p-6 bg-gradient-hero rounded-xl border border-secondary/20">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Flashcard Creation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vocabulary & concept cards
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Available cards
                  </span>
                  <Badge className="bg-gradient-secondary text-secondary-foreground">
                    {readyItems.reduce(
                      (acc, item) =>
                        acc + (item.insights?.suggestedFlashcards || 0),
                      0
                    )}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-secondary/30 hover:bg-gradient-secondary hover:text-secondary-foreground hover:scale-105 transition-all duration-300"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create All Flashcards
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Content Generation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Individual Generation</span>
        </h3>

        <div className="grid gap-4">
          {readyItems.map((item) => (
            <Card
              key={item.id}
              className="glass-card shadow-medium hover:shadow-strong transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground truncate max-w-md">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge
                        variant="outline"
                        className={
                          item.insights?.difficulty === 'Beginner'
                            ? 'text-green-600 bg-green-100'
                            : item.insights?.difficulty === 'Intermediate'
                              ? 'text-yellow-600 bg-yellow-100'
                              : 'text-red-600 bg-red-100'
                        }
                      >
                        {item.insights?.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        📖 {item.insights?.readingTime}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        📝 {item.insights?.vocabulary} words
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemGenerate(item, 'quiz')}
                      disabled={
                        isGenerating || !item.insights?.suggestedQuizzes
                      }
                      className="hover:bg-gradient-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-1" />
                      )}
                      Quiz ({item.insights?.suggestedQuizzes || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemGenerate(item, 'flashcards')}
                      disabled={
                        isGenerating || !item.insights?.suggestedFlashcards
                      }
                      className="hover:bg-gradient-secondary hover:text-secondary-foreground transition-all duration-300"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      Cards ({item.insights?.suggestedFlashcards || 0})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
