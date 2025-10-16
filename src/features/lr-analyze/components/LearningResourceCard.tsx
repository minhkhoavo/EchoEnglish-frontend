import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Video,
  FileText,
  Zap,
  Clock,
  ExternalLink,
  Play,
  CheckCircle,
} from 'lucide-react';
import type { LearningResource } from '../types/analysis';
import { ResourceContentModal } from './ResourceContentModal';
import { toast } from '@/hooks/use-toast';

interface LearningResourceCardProps {
  resource: LearningResource;
  onComplete?: (resourceId: string) => void;
  onTimeSpent?: (resourceId: string, timeSpent: number) => void;
  showCompletedState?: boolean;
  compact?: boolean;
}

export function LearningResourceCard({
  resource,
  onComplete,
  onTimeSpent,
  showCompletedState = false,
  compact = false,
}: LearningResourceCardProps) {
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState<LearningResource | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeRef = useRef<number>(0);

  // Track time when modal is open
  useEffect(() => {
    if (resourceModalOpen && !startTime) {
      setStartTime(Date.now());
      totalTimeRef.current = 0;
      intervalRef.current = setInterval(() => {
        if (startTime) {
          const currentTime = Math.floor((Date.now() - startTime) / 1000);
          totalTimeRef.current = currentTime;
        }
      }, 6000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resourceModalOpen, startTime]);

  useEffect(() => {
    if (!resourceModalOpen && startTime && onTimeSpent && resource._id) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 5) {
        onTimeSpent(resource._id, timeSpent);
      }
      setStartTime(null);
      totalTimeRef.current = 0;
    }
  }, [resourceModalOpen, startTime, onTimeSpent, resource._id]);

  const getResourceIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      video: Video,
      article: FileText,
      flashcard: BookOpen,
      drill: Zap,
      vocabulary_set: BookOpen,
      personalized_guide: FileText,
    };
    return icons[type] || BookOpen;
  };

  const getResourceColor = (type: string) => {
    const colors: Record<string, string> = {
      video: 'bg-[#ef4444]',
      article: 'bg-[#3b82f6]',
      flashcard: 'bg-[#8b5cf6]',
      drill: 'bg-[#10b981]',
      vocabulary_set: 'bg-[#8b5cf6]',
      personalized_guide: 'bg-[#3b82f6]',
    };
    return colors[type] || 'bg-[#64748b]';
  };

  const handleResourceClick = (resource: LearningResource) => {
    // Handle external links
    if (resource.type === 'article' && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (resource.type === 'video' && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Handle modal content (vocabulary_set, personalized_guide, or resources with generatedContent)
    if (
      resource.type === 'vocabulary_set' ||
      resource.type === 'personalized_guide' ||
      resource.generatedContent
    ) {
      setSelectedResource(resource);
      setResourceModalOpen(true);
      return;
    }

    toast({
      title: 'Resource not available',
      description: 'This resource type is not yet supported.',
      variant: 'destructive',
    });
  };

  const handleComplete = () => {
    if (onComplete && resource._id) {
      onComplete(resource._id);
    }
  };

  const Icon = getResourceIcon(resource.type);
  const bgColor = getResourceColor(resource.type);
  const isCompleted = resource.completed;

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#e5e7eb] hover:border-[#bfdbfe] transition-colors group">
          <div className={`p-2 ${bgColor} rounded-lg flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-sm font-semibold text-[#0f172a] group-hover:text-[#2563eb] transition-colors truncate">
                {resource.title}
              </h5>
              {isCompleted && showCompletedState && (
                <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                <Clock className="w-3 h-3" />
                <span>{resource.estimatedTime || 30} min</span>
                <Badge variant="outline" className="text-xs">
                  {resource.type}
                </Badge>
              </div>
              <Button
                size="sm"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-6 text-xs px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResourceClick(resource);
                }}
                // disabled={isCompleted && showCompletedState}
              >
                {resource.type === 'article' || resource.type === 'video' ? (
                  <>
                    View
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    Read
                    <Play className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <ResourceContentModal
          resource={selectedResource}
          open={resourceModalOpen}
          onOpenChange={setResourceModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card
        className={`p-4 border border-[#e5e7eb] hover:border-[#bfdbfe] transition-colors group ${isCompleted && showCompletedState ? 'bg-[#f8fafc] opacity-75' : 'bg-white'}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 ${bgColor} rounded-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-semibold text-[#0f172a] group-hover:text-[#2563eb] transition-colors">
                {resource.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  {resource.type}
                </Badge>
                {isCompleted && showCompletedState && (
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                )}
              </div>
            </div>

            <p className="text-xs text-[#64748b] mb-3 leading-relaxed">
              {resource.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                <Clock className="w-3 h-3" />
                <span>{resource.estimatedTime || 30} min</span>
              </div>
              <div className="flex items-center gap-2">
                {!isCompleted && onComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleComplete}
                  >
                    Mark Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-7 text-xs"
                  onClick={() => handleResourceClick(resource)}
                  disabled={isCompleted && showCompletedState}
                >
                  {resource.type === 'article' || resource.type === 'video' ? (
                    <>
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Start
                      <Play className="w-3 h-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ResourceContentModal
        resource={selectedResource}
        open={resourceModalOpen}
        onOpenChange={setResourceModalOpen}
      />
    </>
  );
}
