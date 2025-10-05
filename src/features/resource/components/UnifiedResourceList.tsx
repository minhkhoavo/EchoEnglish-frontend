import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  FileText,
  Play,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Search,
} from 'lucide-react';
import CustomPagination from '@/components/ui/custom-pagination';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { ResourceType, type Resource } from '../types/resource.type';
import {
  setSearchQuery,
  setActiveTab,
  setCurrentPage,
  setSuitableFilter,
} from '../slices/resourceSlice';
import type { RootState } from '@/core/store/store';
import ResourceCard from './ResourceCard';
import ResourceListItem from './ResourceListItem';

interface BaseResourceListProps {
  resources: Resource[];
  onResourceSelect: (resource: Resource) => void;
  isLoading?: boolean;
  totalPages: number;
  totalCounts?: Record<string, number>;
}

interface AdminResourceListProps extends BaseResourceListProps {
  isAdmin: true;
  onApprove: (resource: Resource) => void;
  onReject: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

interface UserResourceListProps extends BaseResourceListProps {
  isAdmin?: false;
  onApprove?: never;
  onReject?: never;
  onDelete?: never;
  isUpdating?: never;
  isDeleting?: never;
}

type UnifiedResourceListProps = AdminResourceListProps | UserResourceListProps;

/**
 * Unified ResourceList component cho cả user và admin
 * Tự quản lý search, filter, pagination thông qua Redux
 */
const UnifiedResourceList: React.FC<UnifiedResourceListProps> = (props) => {
  const {
    resources,
    onResourceSelect,
    isLoading = false,
    totalPages,
    totalCounts,
    isAdmin = false,
  } = props;

  const dispatch = useDispatch();
  const { searchQuery, activeTab, currentPage, suitableFilter } = useSelector(
    (state: RootState) => state.resource
  );

  // Local controlled input for debouncing search updates to Redux
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const debounceRef = useRef<number | null>(null);

  // Keep local input in sync when external searchQuery changes
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Dispatch debounced update to Redux
  useEffect(() => {
    // clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // set new debounce
    debounceRef.current = window.setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, dispatch, searchQuery]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-muted-foreground">Loading resources...</span>
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    { key: 'all' as const, label: 'All' },
    {
      key: ResourceType.WEB_RSS,
      label: 'Articles',
    },
    {
      key: ResourceType.YOUTUBE,
      label: 'Videos',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Tabs - unified for both admin and user */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            dispatch(setActiveTab(value as 'all' | ResourceType))
          }
        >
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={ResourceType.WEB_RSS}>
              <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value={ResourceType.YOUTUBE}>
              <Play className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex gap-4">
            <Select
              value={suitableFilter}
              onValueChange={(value) =>
                dispatch(setSuitableFilter(value as 'all' | 'true' | 'false'))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="true">Suitable for Learners</SelectItem>
                <SelectItem value="false">Not Suitable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Resource Content */}
      {resources.length > 0 ? (
        <>
          {isAdmin ? (
            /* Admin Table View */
            <div className="space-y-4">
              {resources.map((resource) => {
                const handleApprove =
                  'onApprove' in props && typeof props.onApprove === 'function'
                    ? props.onApprove
                    : undefined;
                const handleReject =
                  'onReject' in props && typeof props.onReject === 'function'
                    ? props.onReject
                    : undefined;
                const handleDelete =
                  'onDelete' in props && typeof props.onDelete === 'function'
                    ? props.onDelete
                    : undefined;

                const isUpdating =
                  'isUpdating' in props ? props.isUpdating : false;
                const isDeleting =
                  'isDeleting' in props ? props.isDeleting : false;

                return (
                  <ResourceListItem
                    key={resource._id}
                    resource={resource}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                  />
                );
              })}
            </div>
          ) : (
            /* User Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onRead={onResourceSelect}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            {activeTab === ResourceType.YOUTUBE ? (
              <Play className="h-16 w-16 text-muted-foreground/50" />
            ) : activeTab === ResourceType.WEB_RSS ? (
              <FileText className="h-16 w-16 text-muted-foreground/50" />
            ) : (
              <div className="flex gap-2">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
                <Play className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No results found' : 'No resources available'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search terms or filters'
              : `No ${
                  activeTab === 'all'
                    ? ''
                    : activeTab === ResourceType.YOUTUBE
                      ? 'video'
                      : 'article'
                } resources have been added yet.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedResourceList;
