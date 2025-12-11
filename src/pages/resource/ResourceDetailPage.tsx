import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetTranscriptMutation,
  useGetResourceByIdQuery,
} from '@/features/resource/services/resourceApi';
import { useGetFlashcardsBySourceQuery } from '@/features/flashcard/services/flashcardApi';
import {
  ResourceType,
  type TranscriptSegment,
} from '@/features/resource/types/resource.type';
import type { Flashcard } from '@/features/flashcard/types/flashcard.types';
import SelectionMenu from '@/features/resource/components/SelectionMenu';
import CreateEditFlashcardDialog from '@/features/resource/components/CreateEditFlashcardDialog';
import YouTubeTranscriptPlayer from '@/features/resource/components/YouTubeTranscriptPlayer';
import VocabularySheet from '@/features/resource/components/VocabularySheet';

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('');

  // Get resource from location state OR fetch by ID
  const resourceFromState = location.state?.resource;
  const {
    data: resourceResponse,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useGetResourceByIdQuery(id || '', {
    skip: !id || !!resourceFromState, // Skip if we have resource from state
  });

  // Use resource from state if available, otherwise from API
  const resource = resourceFromState || resourceResponse?.data;

  // API calls
  const { data: flashcardsResponse, refetch: refetchFlashcards } =
    useGetFlashcardsBySourceQuery(resource?.url || '', {
      skip: !resource?.url, // Skip if resource URL is not available yet
    });
  const [getTranscript, { isLoading: isLoadingTranscript }] =
    useGetTranscriptMutation();

  const flashcards: Flashcard[] = flashcardsResponse || [];

  // Fetch transcript when component mounts
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        if (!resource?.url || resource.type !== ResourceType.YOUTUBE) return;

        const response = await getTranscript({ url: resource.url }).unwrap();

        if (response?.data && Array.isArray(response.data)) {
          // Clean up transcript text (decode HTML entities)
          const cleanedTranscript = response.data.map(
            (segment: TranscriptSegment) => ({
              ...segment,
              text: segment.text
                .replace(/&amp;#39;/g, "'")
                .replace(/&amp;/g, '&'),
            })
          );
          setTranscript(cleanedTranscript);
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
        toast.error('Failed to load transcript. Please try again.');
      }
    };

    fetchTranscript();
  }, [resource, getTranscript, toast]);

  // Handle text selection
  const handleTextSelection = (e: React.MouseEvent) => {
    // Don't handle selection if clicking on SelectionMenu or buttons
    if (
      (e.target as HTMLElement).closest('[data-selection-menu]') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }

    // Always close previous selection menu first
    setShowSelectionMenu(false);

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(selectedText);
    setSelectionPosition({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
    });
    setShowSelectionMenu(true);
  };

  const handleCreateFlashcard = (translation?: string) => {
    setSelectedTranslation(translation || '');
    setShowSelectionMenu(false);
    setShowFlashcardDialog(true);
  };

  const handleCloseSelection = () => {
    setShowSelectionMenu(false);
    setSelectedText('');
    setSelectedTranslation('');
  };

  const handleFlashcardSuccess = () => {
    setShowFlashcardDialog(false);
    setSelectedText('');
    setSelectedTranslation('');
    refetchFlashcards();
  };

  // Loading state
  if (isLoadingResource) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (!resource || resourceError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Resource Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The resource you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isVideo = resource.type === ResourceType.YOUTUBE;
  const isArticle =
    resource.type === ResourceType.WEB_RSS ||
    resource.type === ResourceType.ARTICLE ||
    resource.isArticle;

  return (
    <div className="min-h-screen bg-gray-50" onMouseUp={handleTextSelection}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isVideo ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {resource.type}
                </Badge>
                {resource.suitableForLearners !== undefined && (
                  <Badge
                    variant={
                      resource.suitableForLearners ? 'default' : 'destructive'
                    }
                    className="capitalize"
                  >
                    {resource.suitableForLearners
                      ? 'Suitable for Learners'
                      : 'Not Suitable'}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {resource.title}
              </h1>

              {/* Key Points */}
              {resource.keyPoints && resource.keyPoints.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Key Points:
                  </h3>
                  <ul className="space-y-1">
                    {resource.keyPoints.map((point: string, index: number) => (
                      <li
                        key={index}
                        className="text-blue-800 text-sm flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resource.description && (
                <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
                  {resource.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            {resource.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(resource.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Content Layout */}
        {isVideo ? (
          /* Video gets full width */
          <div className="space-y-6 pb-16 ">
            {resource.url && (
              <YouTubeTranscriptPlayer
                videoUrl={resource.url}
                transcript={transcript.map((seg) => ({
                  ...seg,
                  end: seg.start + seg.duration,
                }))}
              />
            )}

            {/* Floating Vocabulary Sheet */}
            <VocabularySheet
              resourceUrl={resource?.url}
              flashcards={flashcards}
              onRefetch={refetchFlashcards}
            />
          </div>
        ) : (
          /* Article layout full width */
          <div className="space-y-6 pb-16 max-w-4xl mx-auto">
            {/* Attachment download card */}
            {resource.attachmentUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {resource.attachmentName || 'Attached Document'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Download the attached file to read offline
                        </p>
                      </div>
                    </div>
                    <a
                      href={resource.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {resource.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: resource.content }}
                      className="leading-relaxed article-content"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No content available for this article.</p>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Original Article
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Floating Vocabulary Sheet */}
            <VocabularySheet
              resourceUrl={resource?.url}
              flashcards={flashcards}
              onRefetch={refetchFlashcards}
            />
          </div>
        )}

        {/* Selection Menu */}
        {showSelectionMenu && (
          <SelectionMenu
            selectedText={selectedText}
            position={selectionPosition}
            onSave={handleCreateFlashcard}
            onClose={handleCloseSelection}
          />
        )}

        {/* Flashcard Creation Dialog */}
        <CreateEditFlashcardDialog
          open={showFlashcardDialog}
          onOpenChange={setShowFlashcardDialog}
          selectedText={selectedText}
          selectedTranslation={selectedTranslation}
          resourceUrl={resource?.url}
          onSuccess={handleFlashcardSuccess}
        />
      </main>
    </div>
  );
}
