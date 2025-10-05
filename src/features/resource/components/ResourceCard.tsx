import {
  Calendar,
  Clock,
  Play,
  FileText,
  Eye,
  ExternalLink,
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

  return (
    <Card className="group h-full overflow-hidden shadow-card hover:shadow-floating transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${
              isVideo
                ? 'bg-primary/10 text-primary'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isVideo ? (
              <Play className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant={isVideo ? 'secondary' : 'outline'} className="mb-2">
              {isVideo ? 'Video' : 'Article'}
            </Badge>
            <CardTitle
              className="text-base leading-tight line-clamp-2 hover:text-primary transition-smooth cursor-pointer"
              onClick={() => onRead(resource)}
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
            >
              <Eye className="h-4 w-4 mr-2" />
              {isVideo ? 'Watch' : 'Read'}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(resource.url, '_blank');
              }}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
