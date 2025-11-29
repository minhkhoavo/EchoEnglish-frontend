import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import type { PromoFilters } from '../types/promo.types';

interface PromoFilterCardProps {
  filters: PromoFilters;
  onFilter: (filters: PromoFilters) => void;
}

export const PromoFilterCard = ({
  filters,
  onFilter,
}: PromoFilterCardProps) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [tempFilters, setTempFilters] = useState<PromoFilters>(filters);
  const [resetKey, setResetKey] = useState(0);

  const handleChange = (
    key: keyof PromoFilters,
    value: string | boolean | number
  ) => {
    setTempFilters({ ...tempFilters, [key]: value });
  };

  const applyFilters = () => {
    onFilter(tempFilters);
  };

  // Don't auto-apply on every change, only when Apply button is clicked

  const clearFilters = () => {
    const emptyFilters: PromoFilters = {
      search: '',
      active: '',
      minDiscount: '',
      maxDiscount: '',
      sort: 'desc',
      status: '',
      availability: '',
      limit: 10,
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
              Promo Filters
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
              <Label className="mb-2 block">Search Code</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by code..."
                  value={tempFilters.search || ''}
                  onChange={(e) => handleChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Active Status */}
            <div>
              <Label className="mb-2 block">Active Status</Label>
              <Select
                key={`active-${resetKey}`}
                value={tempFilters.active ? String(tempFilters.active) : ''}
                onValueChange={(v) => handleChange('active', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label className="mb-2 block">Status</Label>
              <Select
                key={`status-${resetKey}`}
                value={tempFilters.status || ''}
                onValueChange={(v) => handleChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label className="mb-2 block">Availability</Label>
              <Select
                key={`availability-${resetKey}`}
                value={tempFilters.availability || ''}
                onValueChange={(v) => handleChange('availability', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Discount */}
            <div>
              <Label className="mb-2 block">Min Discount (%)</Label>
              <Input
                type="number"
                placeholder="0"
                value={tempFilters.minDiscount || ''}
                onChange={(e) => handleChange('minDiscount', e.target.value)}
              />
            </div>

            {/* Max Discount */}
            <div>
              <Label className="mb-2 block">Max Discount (%)</Label>
              <Input
                type="number"
                placeholder="100"
                value={tempFilters.maxDiscount || ''}
                onChange={(e) => handleChange('maxDiscount', e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <Label className="mb-2 block">Sort Order</Label>
              <Select
                key={`sort-${resetKey}`}
                value={tempFilters.sort || 'desc'}
                onValueChange={(v) => handleChange('sort', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Latest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Latest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
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
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
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
