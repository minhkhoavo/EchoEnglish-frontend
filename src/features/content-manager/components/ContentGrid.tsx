import React, { useState, useMemo } from 'react';
import { 
  FileText, Grid, List,
  Search
} from 'lucide-react';
import type { ContentItem, UploadProgress, ContentStatus } from '../types/content.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentItemCard } from './ContentItemCard';

interface ContentGridProps {
  items: ContentItem[];
  uploadProgress: UploadProgress[];
  onRemoveItem: (id: string) => void;
  onGenerateContent: (item: ContentItem, type: 'quiz' | 'flashcards') => void;
  isGenerating?: boolean;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  uploadProgress, 
  onRemoveItem, 
  onGenerateContent,
  isGenerating = false 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContentStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ContentItem['type'] | 'all'>('all');

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesSearch && matchesStatus && matchesType;
      });
  }, [items, searchQuery, selectedStatus, selectedType]);


  if (items.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="text-center py-16">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
          <p className="text-gray-600">Upload your first file or add a URL to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search files by name..."
                className="w-full pl-10 pr-4 py-2.5 h-auto border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={selectedStatus} onValueChange={(value: ContentStatus | 'all') => setSelectedStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={(value: ContentItem['type'] | 'all') => setSelectedType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
              </div>
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
              {filteredItems.map((item) => (
                  <div
                      key={item.id}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                  >
                    <ContentItemCard 
                      item={item}
                      viewMode={viewMode}
                      isGenerating={isGenerating}
                      uploadProgress={uploadProgress}
                      onRemoveItem={onRemoveItem}
                      onGenerateContent={onGenerateContent}
                    />
                  </div>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No files match your filters</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search query or filter settings.</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedType('all');
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </Button>
          </div>
        )}
    </div>
);
};