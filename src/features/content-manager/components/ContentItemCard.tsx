import React from 'react';
import { 
  FileText, Image, Link2, X, Loader2, Brain, Sparkles,
  ExternalLink, AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-react';
import type { ContentItem, ContentStatus, UploadProgress } from '../types/content.types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ContentItemCardProps {
  item: ContentItem;
  viewMode: 'grid' | 'list' | 'full';
  isGenerating?: boolean;
  uploadProgress: UploadProgress[];
  onRemoveItem: (id: string) => void;
  onGenerateContent: (item: ContentItem, type: 'quiz' | 'flashcards') => void;
}

const getFileIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-blue-500" />;
      case 'url': return <Link2 className="h-5 w-5 text-green-500" />;
      case 'file': return <FileText className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
};

const getStatusIndicator = (status: ContentStatus) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null; // No indicator for 'uploaded'
    }
};

const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item,
  viewMode,
  isGenerating,
  uploadProgress,
  onRemoveItem,
  onGenerateContent,
}) => {

  const getItemProgress = (itemId: string) => {
    return uploadProgress.find(p => p.itemId === itemId)?.progress || 0;
  };

  const progress = getItemProgress(item.id);
  const isProcessing = item.status === 'processing';

  if (viewMode === 'list') {
    return (
      <div className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(item.type)}
              <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate" title={item.name}>
                      {item.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                      </span>
                      <span className="text-xs text-gray-500">{item.size || 'N/A'}</span>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-6">
              {item.status === 'ready' && item.insights && (
                  <>
                      <div className="text-center hidden sm:block">
                          <p className="text-sm font-semibold text-blue-600">{item.insights.suggestedQuizzes}</p>
                          <p className="text-xs text-gray-500">Quizzes</p>
                      </div>
                      <div className="text-center hidden sm:block">
                          <p className="text-sm font-semibold text-purple-600">{item.insights.suggestedFlashcards}</p>
                          <p className="text-xs text-gray-500">Cards</p>
                      </div>
                  </>
              )}
              <div className="flex items-center gap-2">
                  {item.status === 'ready' && (
                      <Button
                          onClick={() => onGenerateContent(item, 'quiz')}
                          disabled={isGenerating}
                          size="icon"
                          variant="ghost"
                          className="p-2 border border-transparent rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isGenerating ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin" /> : <Sparkles className="h-4 w-4 text-blue-600" />}
                      </Button>
                  )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                  >
                      <X className="h-4 w-4" />
                  </Button>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(item.type)}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={item.name}>
                        {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{item.type} • {item.size || 'N/A'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {getStatusIndicator(item.status)}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Status & Upload Date */}
        <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(item.status)}`}>
                {item.status}
            </span>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
            <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                    <span className="text-sm text-gray-500">
                        AI is analyzing your content...
                    </span>
                </div>
                {progress > 0 && (
                    <Progress value={progress} className="h-2" />
                )}
            </div>
        )}

        {/* Estimated Learning Stats */}
        {item.insights && item.status === 'ready' && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-xs text-gray-600">Est. Time</p>
                        <p className="text-sm font-semibold text-gray-900">{item.insights.readingTime}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Vocabulary</p>
                        <p className="text-sm font-semibold text-gray-900">{item.insights.vocabulary}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Difficulty</p>
                        <p className="text-sm font-semibold text-gray-900">{item.insights.difficulty}</p>
                    </div>
                </div>
            </div>
        )}

        {/* AI Generation Potential */}
        {item.insights && item.status === 'ready' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Brain className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Quizzes</p>
                    <p className="font-semibold text-blue-600">{item.insights.suggestedQuizzes}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Sparkles className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Cards</p>
                    <p className="font-semibold text-purple-600">{item.insights.suggestedFlashcards}</p>
                </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
            {item.status === 'ready' ? (
                <>
                    <Button
                        onClick={() => onGenerateContent(item, 'quiz')}
                        disabled={isGenerating}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 inline mr-1 animate-spin" /> : <Brain className="h-4 w-4 inline mr-1" />}
                        Generate
                    </Button>
                    {item.url && (
                        <Button asChild variant="outline" size="icon" className="p-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 text-gray-500" />
                            </a>
                        </Button>
                    )}
                </>
            ) : item.status === 'error' ? (
                <Button variant="destructive" className="flex-1 cursor-not-allowed" disabled>
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Processing Failed
                </Button>
            ) : (
                <Button variant="secondary" className="flex-1 cursor-not-allowed" disabled>
                    <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                    Processing...
                </Button>
            )}
        </div>
    </div>
  );
};
