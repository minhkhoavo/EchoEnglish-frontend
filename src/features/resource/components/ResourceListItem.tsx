import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { ResourceType, type Resource } from '../types/resource.type';

interface Props {
  resource: Resource;
  onApprove?: (resource: Resource) => void;
  onReject?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const ResourceListItem: React.FC<Props> = ({
  resource,
  onApprove,
  onReject,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const resAiId = `resource-row-${resource._id || (resource.title || '').slice(0, 16).replace(/\s+/g, '-').toLowerCase()}`;
  const resAiLabel = `${resource.type === ResourceType.YOUTUBE ? 'Video' : 'Article'}: ${resource.title} · ${resource.suitableForLearners ? 'Approved' : 'Pending'}`;

  return (
    <Card
      key={resource._id}
      data-ai-id={resAiId}
      data-ai-label={resAiLabel}
      data-ai-role="resource-row"
      className="relative p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              {resource.type === ResourceType.YOUTUBE ? 'Video' : 'Article'}
            </Badge>
            <Badge
              variant={resource.suitableForLearners ? 'default' : 'destructive'}
            >
              {resource.suitableForLearners ? 'Approved' : 'Pending'}
            </Badge>
          </div>

          <h4 className="font-medium mb-1 line-clamp-2">{resource.title}</h4>

          {resource.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {resource.summary}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {resource.publishedAt && (
              <span>{new Date(resource.publishedAt).toLocaleDateString()}</span>
            )}
            {resource.labels?.domain && (
              <span className="capitalize">{resource.labels.domain}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {!resource.suitableForLearners ? (
              <Button
                size="sm"
                onClick={() => onApprove && onApprove(resource)}
                disabled={isUpdating}
                data-ai-id={`${resAiId}-approve-btn`}
                data-ai-label={`Approve "${resource.title}"`}
                data-ai-role="save"
              >
                <Eye className="h-4 w-4 mr-1" />
                Approve
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject && onReject(resource)}
                disabled={isUpdating}
                data-ai-id={`${resAiId}-reject-btn`}
                data-ai-label={`Reject "${resource.title}"`}
                data-ai-role="cancel"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
          </div>

          <div>
            <ConfirmationDialog
              title="Delete Resource"
              description={`Are you sure you want to delete "${resource.title}"? This action cannot be undone.`}
              onConfirm={() => onDelete && onDelete(resource)}
              variant="destructive"
            >
              <Button
                size="sm"
                variant="destructive"
                disabled={isDeleting}
                data-ai-id={`${resAiId}-delete-btn`}
                data-ai-label={`Delete "${resource.title}"`}
                data-ai-role="delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmationDialog>
          </div>
        </div>
        {/* External link positioned bottom-right */}
        <div className="absolute bottom-3 right-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(resource.url, '_blank')}
            className="text-blue-600 hover:text-blue-700"
            data-ai-id={`${resAiId}-external-btn`}
            data-ai-label={`Open original source of "${resource.title}" in a new tab`}
            data-ai-role="view"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceListItem;
