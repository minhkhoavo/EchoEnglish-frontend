import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Zap, Upload, File, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  addFilesToProcess,
  addUrlToProcess,
  removeItem as removeContentItem,
  setLoadedFiles,
  setLoading,
} from './slices/contentSlice';
import { useLazyFetchUserFilesQuery } from './services/contentApi';
import { UploadSection } from './components/UploadSection';
import { ContentGrid } from './components/ContentGrid';
import { GenerationHub } from './components/GenerationHub';
import { useNavigate } from 'react-router-dom';
import type { ContentItem } from './types/content.types';

export const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const contentItems = useAppSelector((state) => state.content.items);
  const readyItems = useAppSelector((state) =>
    state.content.items.filter((item) => item.status === 'ready')
  );
  const [fetchUserFiles] = useLazyFetchUserFilesQuery();

  const loadFiles = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchUserFiles(88).unwrap();
      dispatch(setLoadedFiles(result));
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchUserFiles]);

  useEffect(() => {
    if (activeTab === 'library') {
      loadFiles();
    }
  }, [activeTab, loadFiles]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const newItems: ContentItem[] = files.map((file) => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        status: 'uploaded',
      }));

      dispatch(addFilesToProcess(newItems));
    },
    [dispatch]
  );

  const addUrl = useCallback(
    async (url: string) => {
      const newItem: ContentItem = {
        id: Date.now().toString() + Math.random().toString(),
        name: url,
        type: 'url',
        url,
        status: 'uploaded',
      };

      dispatch(addUrlToProcess(newItem));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (id: string) => {
      dispatch(removeContentItem(id));
    },
    [dispatch]
  );

  // Simplified generation functions - can be implemented later if needed
  const generateContent = useCallback(
    async (item: ContentItem, type: 'quiz' | 'flashcards', fileId?: string) => {
      if (type === 'quiz' && fileId) {
        navigate(`/quiz?fileId=${fileId}`);
      } else {
        console.log(
          `Generating ${type} for item ${item.id} with fileId: ${fileId}`
        );
      }
      return { success: true, count: 0, message: 'Not implemented' };
    },
    [navigate]
  );

  // Mock states for components that expect them
  const uploadProgress: { itemId: string; progress: number }[] = [];
  const isGenerating = false;

  const totalSuggestions = readyItems.reduce(
    (acc, item) =>
      acc +
      (item.insights?.suggestedQuizzes || 0) +
      (item.insights?.suggestedFlashcards || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-pink animate-pulse-glow">
              <Sparkles className="h-8 w-8 text-primary-foreground animate-float" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-success rounded-full flex items-center justify-center">
              <Zap className="h-3 w-3 text-success-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Content Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload, analyze, and transform content into learning materials
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {contentItems.length}
            </div>
            <div className="text-sm text-muted-foreground">Content Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {readyItems.length}
            </div>
            <div className="text-sm text-muted-foreground">Ready to Use</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {totalSuggestions}
            </div>
            <div className="text-sm text-muted-foreground">AI Suggestions</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card shadow-soft">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pink"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pink"
          >
            <File className="h-4 w-4 mr-2" />
            Content Library{' '}
            {contentItems.length > 0 && `(${contentItems.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="generate"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-pink"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <UploadSection onFilesUpload={addFiles} onUrlAdd={addUrl} />
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {contentItems.length === 0 ? (
            <Card className="glass-card shadow-medium">
              <CardContent className="text-center py-16">
                <File className="h-16 w-16 text-muted-foreground mx-auto mb-6 animate-float" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No content yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first file or add a URL to get started!
                </p>
                <Button
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-pink"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ContentGrid
              items={contentItems}
              uploadProgress={uploadProgress}
              onRemoveItem={removeItem}
              onGenerateContent={generateContent}
              isGenerating={isGenerating}
            />
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <GenerationHub
            readyItems={readyItems}
            onGenerateContent={generateContent}
            isGenerating={isGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
