import {
  Calendar,
  Clock,
  Play,
  FileText,
  Eye,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResourceType, type Resource } from '../types/resource.type';

interface ResourceCardProps {
  resource: Resource;
  onRead: (resource: Resource) => void;
  isAdmin?: boolean;
}

export default function ResourceCard({
  resource,
  onRead,
  isAdmin = false,
}: ResourceCardProps) {
  const isVideo = resource.type === ResourceType.YOUTUBE;
  const isXapi = resource.type === ResourceType.XAPI;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Stable AI handle. Combines the resource _id with title fragment so the AI
  // can refer to "the article about climate" rather than an opaque hash.
  const resAiId = `resource-card-${resource._id || (resource.title || '').slice(0, 16).replace(/\s+/g, '-').toLowerCase()}`;
  const kindLabel = isXapi ? 'Course' : isVideo ? 'Video' : 'Article';
  const resAiLabel = `${kindLabel}: ${resource.title || 'Untitled'}${resource.labels?.cefr ? ` (level ${resource.labels.cefr})` : ''}`;

  return (
    <Card
      data-ai-id={resAiId}
      data-ai-label={resAiLabel}
      data-ai-role="resource-card"
      className="group h-full overflow-hidden shadow-card hover:shadow-floating transition-smooth"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              isVideo
                ? 'bg-primary/10 text-primary'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isXapi ? (
              <GraduationCap className="h-4 w-4" />
            ) : isVideo ? (
              <Play className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Badge
              variant={isXapi ? 'default' : isVideo ? 'secondary' : 'outline'}
              className="mb-2"
            >
              {kindLabel}
            </Badge>
            <CardTitle
              className="text-base leading-tight line-clamp-2 hover:text-primary transition-smooth cursor-pointer"
              onClick={() => onRead(resource)}
              data-ai-id={`${resAiId}-title`}
              data-ai-label={`Open: ${resource.title || 'Untitled'}`}
              data-ai-role="view"
            >
              {resource.title || 'Untitled'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {resource.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {resource.summary}
          </p>
        )}

        {/* Key Points */}
        {resource.keyPoints && resource.keyPoints.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {resource.keyPoints.slice(0, 2).map((point, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRead(resource)}
                  style={{ cursor: 'pointer' }}
                >
                  {truncateText(point, 30)}
                </Badge>
              ))}
              {resource.keyPoints.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  onClick={() => onRead(resource)}
                  style={{ cursor: 'pointer' }}
                >
                  +{resource.keyPoints.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {resource.publishedAt
              ? formatDate(resource.publishedAt)
              : 'No date'}
          </div>
          <div className="flex items-center gap-1">
            {resource.labels?.cefr && (
              <>
                <span>Level: </span>
                <span className="uppercase font-medium">
                  {resource.labels.cefr}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={() => onRead(resource)}
              className="flex-1"
              size="sm"
              data-ai-id={`${resAiId}-read-btn`}
              data-ai-label={`${isVideo ? 'Watch' : 'Read'} "${resource.title || 'Untitled'}"`}
              data-ai-role="view"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isXapi ? 'Open' : isVideo ? 'Watch' : 'Read'}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(resource.url, '_blank');
              }}
              variant="outline"
              size="sm"
              data-ai-id={`${resAiId}-external-btn`}
              data-ai-label={`Open original source of "${resource.title || 'Untitled'}" in a new tab`}
              data-ai-role="view"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
