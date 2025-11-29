import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import {
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  FileText,
  Play,
} from 'lucide-react';
import { ResourceType, type Resource } from '../types/resource.types';

interface AdminResourceListProps {
  resources: Resource[];
  onApprove: (resource: Resource) => void;
  onReject: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const AdminResourceList = ({
  resources,
  onApprove,
  onReject,
  onDelete,
  isUpdating,
  isDeleting,
}: AdminResourceListProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4 gap-2">
          <FileText className="h-16 w-16 text-muted-foreground/50" />
          <Play className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No resources available</h3>
        <p className="text-muted-foreground">
          No resources have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource._id} className="relative p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {resource.type === ResourceType.VIDEO ? 'Video' : 'Article'}
                </Badge>
                <Badge
                  variant={
                    resource.suitableForLearners ? 'default' : 'destructive'
                  }
                >
                  {resource.suitableForLearners ? 'Approved' : 'Pending'}
                </Badge>
              </div>

              <h4 className="font-medium mb-1 line-clamp-2">
                {resource.title || 'Untitled'}
              </h4>

              {resource.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {resource.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {resource.publishedAt && (
                  <span>
                    {new Date(resource.publishedAt).toLocaleDateString()}
                  </span>
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
                    onClick={() => onApprove(resource)}
                    disabled={isUpdating}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(resource)}
                    disabled={isUpdating}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
              </div>

              <div>
                <ConfirmationDialog
                  title="Delete Resource"
                  description={`Are you sure you want to delete "${resource.title || 'this resource'}"? This action cannot be undone.`}
                  onConfirm={() => onDelete(resource)}
                  variant="destructive"
                >
                  <Button size="sm" variant="destructive" disabled={isDeleting}>
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
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
