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
import type { UserFilters } from '../types/user.types';

interface UserFilterCardProps {
  filters: UserFilters;
  onFilter: (filters: UserFilters) => void;
}

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const DELETED_OPTIONS = [
  { value: 'all', label: 'Active Users' },
  { value: 'true', label: 'Deleted Users' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'credits_desc', label: 'Credits High-Low' },
  { value: 'credits_asc', label: 'Credits Low-High' },
];

const ITEMS_PER_PAGE = [10, 20, 50, 100];

export const UserFilterCard = ({ filters, onFilter }: UserFilterCardProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<UserFilters>(filters);
  const [resetKey, setResetKey] = useState(0);

  const handleChange = (key: keyof UserFilters, value: string | number) => {
    setTempFilters({ ...tempFilters, [key]: value });
  };

  const applyFilters = () => {
    const filtersToApply = { ...tempFilters, page: 1 };
    onFilter(filtersToApply);
  };

  const clearFilters = () => {
    const emptyFilters: UserFilters = {
      limit: 10,
      sortBy: 'date_desc',
      page: 1,
    };
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
              User Filters
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={tempFilters.search || ''}
                  onChange={(e) => handleChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label className="mb-2 block">Gender</Label>
              <Select
                key={`gender-${resetKey}`}
                value={tempFilters.gender || ''}
                onValueChange={(v) => handleChange('gender', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deleted Status */}
            <div>
              <Label className="mb-2 block">User Type</Label>
              <Select
                key={`deleted-${resetKey}`}
                value={tempFilters.includeDeleted || 'all'}
                onValueChange={(v) => {
                  const newValue = v === 'all' ? undefined : v;
                  handleChange('includeDeleted', newValue as string);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Active Users" />
                </SelectTrigger>
                <SelectContent>
                  {DELETED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <Label className="mb-2 block">Sort By</Label>
              <Select
                key={`sort-${resetKey}`}
                value={tempFilters.sortBy || 'date_desc'}
                onValueChange={(v) => handleChange('sortBy', v)}
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
                value={String(tempFilters.limit || 10)}
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
