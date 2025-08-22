import React from 'react';
import { FileText, Image, Link2, X, Loader2, Brain, Sparkles } from 'lucide-react';
import type { ContentItem, UploadProgress } from '../types/content.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ContentGridProps {
  items: ContentItem[];
  uploadProgress: UploadProgress[];
  onRemoveItem: (id: string) => void;
  onGenerateContent: (item: ContentItem, type: 'quiz' | 'flashcards') => void;
  isGenerating?: boolean;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  uploadProgress, 
  onRemoveItem, 
  onGenerateContent,
  isGenerating = false 
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'url': return <Link2 className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': 
        return <Badge variant="default" className="bg-green-100 text-green-800">Ready</Badge>;
      case 'processing': 
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'error': 
        return <Badge variant="destructive">Error</Badge>;
      default: 
        return <Badge variant="outline">Uploaded</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getItemProgress = (itemId: string) => {
    return uploadProgress.find(p => p.itemId === itemId)?.progress || 0;
  };

  if (items.length === 0) {
    return (
      <Card className="glass-card shadow-medium">
        <CardContent className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6 animate-float" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No content yet</h3>
          <p className="text-muted-foreground">Upload your first file or add a URL to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {items.map((item) => {
        const progress = getItemProgress(item.id);
        const isProcessing = item.status === 'processing';
        
        return (
          <Card 
            key={item.id}
            className="glass-card shadow-medium hover:shadow-strong transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* File Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getStatusColor(item.status)} bg-opacity-10`}>
                    {getFileIcon(item.type)}
                  </div>
                  
                  {/* Content Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground truncate max-w-md">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(item.status)}
                          {item.size && (
                            <span className="text-sm text-muted-foreground">{item.size}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Processing Progress */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            AI is analyzing your content...
                          </span>
                        </div>
                        {progress > 0 && (
                          <Progress value={progress} className="h-2" />
                        )}
                      </div>
                    )}

                    {/* Insights */}
                    {item.insights && item.status === 'ready' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className={`${getDifficultyColor(item.insights.difficulty)} border-0`}>
                            {item.insights.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            📖 {item.insights.readingTime}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            📝 {item.insights.vocabulary} words
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.insights.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {item.insights.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.insights.topics.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Generation Actions */}
                        <div className="flex space-x-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateContent(item, 'quiz')}
                            disabled={isGenerating}
                            className="flex-1 hover:bg-gradient-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Brain className="h-4 w-4 mr-2" />
                            )}
                            Quiz ({item.insights.suggestedQuizzes})
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGenerateContent(item, 'flashcards')}
                            disabled={isGenerating}
                            className="flex-1 hover:bg-gradient-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Cards ({item.insights.suggestedFlashcards})
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {item.status === 'error' && (
                      <div className="text-red-600 text-sm">
                        Failed to process this content. Please try again.
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview for images */}
                {item.preview && (
                  <div className="ml-4">
                    <img 
                      src={item.preview} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
