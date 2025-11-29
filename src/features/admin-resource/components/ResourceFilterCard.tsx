import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import type { ResourceFilters } from '../types/resource.types';

interface ResourceFilterCardProps {
  filters: ResourceFilters;
  onFilter: (filters: ResourceFilters) => void;
}

const RESOURCE_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
];

const SUITABLE_STATUS = [
  { value: 'true', label: 'Suitable for Learners' },
  { value: 'false', label: 'Not Suitable' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const ITEMS_PER_PAGE = [5, 10, 20, 50];

export const ResourceFilterCard = ({
  filters,
  onFilter,
}: ResourceFilterCardProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<ResourceFilters>(filters);
  const [resetKey, setResetKey] = useState(0);

  const handleChange = (key: keyof ResourceFilters, value: string | number) => {
    setTempFilters({ ...tempFilters, [key]: value });
  };

  const applyFilters = () => {
    onFilter(tempFilters);
  };

  const clearFilters = () => {
    const emptyFilters: ResourceFilters = { limit: 5, sort: 'newest' };
    setTempFilters(emptyFilters);
    onFilter(emptyFilters);
    setResetKey((prev) => prev + 1);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">
              Resource Filters
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {showFilters ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm">Show</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={tempFilters.q || ''}
                  onChange={(e) => handleChange('q', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Resource Type */}
            <div>
              <Label className="mb-2 block">Resource Type</Label>
              <Select
                key={`type-${resetKey}`}
                value={tempFilters.type || ''}
                onValueChange={(v) => handleChange('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Suitable Status */}
            <div>
              <Label className="mb-2 block">Status</Label>
              <Select
                key={`suitable-${resetKey}`}
                value={tempFilters.suitableForLearners || ''}
                onValueChange={(v) => handleChange('suitableForLearners', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {SUITABLE_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <Label className="mb-2 block">Sort Order</Label>
              <Select
                key={`sort-${resetKey}`}
                value={tempFilters.sort || 'newest'}
                onValueChange={(v) => handleChange('sort', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items per page */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">
                Items per page:
              </Label>
              <Select
                key={`limit-${resetKey}`}
                value={String(tempFilters.limit || 5)}
                onValueChange={(v) => handleChange('limit', Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-white/80 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
            >
              Clear All
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
