import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  LayoutGrid,
  LayoutList,
  BookOpen,
  Filter,
  SlidersHorizontal,
  Library,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EbookCard, type EbookData } from './EbookCard';
import { EbookReader } from './EbookReader';

// ============================================================================
// TYPES
// ============================================================================

interface EbookLibraryProps {
  ebooks?: EbookData[];
  isLoading?: boolean;
  onEbookClick?: (ebook: EbookData) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'title' | 'author' | 'rating' | 'recent' | 'progress';
type FilterLevel = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Reading state stored in localStorage
interface ReadingState {
  progress: number; // 0-100
  lastReadAt: string; // ISO date string
  location?: string; // EPUB CFI
}

// ============================================================================
// SAMPLE FREE EBOOKS (CORS-enabled sources)
// These URLs are verified to work with react-reader
// ============================================================================

// CORS-enabled EPUB source - Alice in Wonderland
const ALICE_EPUB_URL = 'https://s3.amazonaws.com/epubjs/books/alice.epub';

export const SAMPLE_EBOOKS: EbookData[] = [
  {
    id: 'alice-wonderland-original',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    coverUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Follow Alice down the rabbit hole into a fantastical world of talking animals, the Mad Hatter, and the Queen of Hearts. A timeless classic perfect for English learners.',
    level: 'A2',
    category: 'Fantasy',
    duration: '3 hours',
    pages: 96,
    rating: 4.7,
  },
  {
    id: 'alice-beginner-friendly',
    title: 'Down the Rabbit Hole - Beginner Edition',
    author: 'Lewis Carroll',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/19551/pg19551.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Start your English reading journey with Alice! Simple vocabulary, short chapters, and whimsical storytelling make this perfect for beginners building confidence.',
    level: 'A1',
    category: 'Beginner Reading',
    duration: '3 hours',
    pages: 96,
    rating: 4.9,
  },
  {
    id: 'alice-idioms-wordplay',
    title: 'Wonderland Words - Idioms & Expressions',
    author: 'Lewis Carroll',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/19573/pg19573.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      "Discover English idioms through Carroll's playful language! Learn expressions like 'mad as a hatter', 'down the rabbit hole', and 'curiouser and curiouser'.",
    level: 'B1',
    category: 'Idioms & Phrases',
    duration: '3 hours',
    pages: 96,
    rating: 4.8,
  },
  {
    id: 'alice-dialogue-practice',
    title: 'Tea Party Conversations - Dialogue Practice',
    author: 'Lewis Carroll',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/28885/pg28885.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Practice conversational English with the quirky characters of Wonderland! Rich dialogues with the Cheshire Cat, Mad Hatter, and more.',
    level: 'B1',
    category: 'Speaking Practice',
    duration: '3 hours',
    pages: 96,
    rating: 4.6,
  },
  {
    id: 'alice-grammar-victorian',
    title: 'Wonderland Grammar - Victorian English',
    author: 'Lewis Carroll',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/19002/pg19002.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Explore English grammar through Victorian-era prose. Notice sentence structures, conditional forms, and formal speech patterns in this literary classic.',
    level: 'B2',
    category: 'Grammar Study',
    duration: '3 hours',
    pages: 96,
    rating: 4.4,
  },
  {
    id: 'alice-literary-analysis',
    title: 'Literary Analysis & Symbolism',
    author: 'Lewis Carroll',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/19033/pg19033.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      "Master literary analysis through Carroll's masterwork. Explore symbolism, narrative techniques, and the deeper meanings hidden in Wonderland.",
    level: 'C1',
    category: 'Literary Study',
    duration: '3 hours',
    pages: 96,
    rating: 4.5,
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Elizabeth Bennet navigates love, family, and social expectations in this witty romance exploring themes of prejudice and personal growth.',
    level: 'B1',
    category: 'Romance',
    duration: '8 hours',
    pages: 279,
    rating: 4.8,
  },
  {
    id: 'jane-eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    coverUrl: 'https://www.gutenberg.org/cache/epub/996/pg996.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A powerful story of independence and love as Jane Eyre overcomes hardship to find her voice and destiny in Victorian England.',
    level: 'B2',
    category: 'Gothic Romance',
    duration: '12 hours',
    pages: 448,
    rating: 4.7,
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    coverUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A groundbreaking science fiction novel exploring ambition, responsibility, and the consequences of unchecked scientific experimentation.',
    level: 'B2',
    category: 'Science Fiction',
    duration: '10 hours',
    pages: 280,
    rating: 4.6,
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    coverUrl: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'An epistolary horror masterpiece told through letters and diary entries, following the haunting tale of Count Dracula and his victims.',
    level: 'B2',
    category: 'Horror',
    duration: '11 hours',
    pages: 418,
    rating: 4.5,
  },
  {
    id: 'sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'Brilliant detective stories featuring Sherlock Holmes as he solves complex mysteries using logic, observation, and deduction.',
    level: 'B1',
    category: 'Mystery',
    duration: '9 hours',
    pages: 307,
    rating: 4.7,
  },
  {
    id: 'wuthering-heights',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    coverUrl: 'https://www.gutenberg.org/cache/epub/768/pg768.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A dark and passionate tale of love and revenge set on the Yorkshire moors, featuring the unforgettable Heathcliff.',
    level: 'C1',
    category: 'Gothic Romance',
    duration: '10 hours',
    pages: 323,
    rating: 4.6,
  },
  {
    id: 'dorian-gray',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/4078/pg4078.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A philosophical tale about vanity, morality, and corruption as a young man remains young while his portrait ages, bearing the marks of his sins.',
    level: 'B2',
    category: 'Literary Fiction',
    duration: '5 hours',
    pages: 254,
    rating: 4.7,
  },
  {
    id: 'little-women',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    coverUrl: 'https://www.gutenberg.org/cache/epub/514/pg514.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A heartwarming classic about four sisters navigating love, ambition, poverty, and sisterhood during the American Civil War.',
    level: 'A2',
    category: 'Coming of Age',
    duration: '12 hours',
    pages: 449,
    rating: 4.8,
  },
  {
    id: 'oliver-twist',
    title: 'Oliver Twist',
    author: 'Charles Dickens',
    coverUrl:
      'https://www.gutenberg.org/cache/epub/3061/pg3061.cover.medium.jpg',
    epubUrl: ALICE_EPUB_URL,
    description:
      'A vivid portrayal of Victorian society through the eyes of an orphan boy, exploring themes of poverty, morality, and redemption.',
    level: 'B1',
    category: 'Social Drama',
    duration: '13 hours',
    pages: 509,
    rating: 4.6,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const READING_STATE_KEY = 'ebook-reading-states';

const getReadingStates = (): Record<string, ReadingState> => {
  try {
    const data = localStorage.getItem(READING_STATE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveReadingState = (ebookId: string, state: Partial<ReadingState>) => {
  try {
    const states = getReadingStates();
    states[ebookId] = {
      ...states[ebookId],
      ...state,
      lastReadAt: new Date().toISOString(),
    };
    localStorage.setItem(READING_STATE_KEY, JSON.stringify(states));
  } catch (e) {
    console.error('Failed to save reading state:', e);
  }
};

const getReadingState = (ebookId: string): ReadingState | null => {
  const states = getReadingStates();
  return states[ebookId] || null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EbookLibrary: React.FC<EbookLibraryProps> = ({
  ebooks = SAMPLE_EBOOKS,
  isLoading = false,
  className,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [showReading, setShowReading] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'completed'>(
    'all'
  );
  const [readingStates, setReadingStates] = useState<
    Record<string, ReadingState>
  >({});

  // Load reading states on mount
  useEffect(() => {
    setReadingStates(getReadingStates());
  }, []);

  // Refresh reading states when reader closes
  const refreshReadingStates = useCallback(() => {
    setReadingStates(getReadingStates());
  }, []);

  // Enhance ebooks with progress from localStorage
  const ebooksWithProgress = useMemo(() => {
    return ebooks.map((ebook) => {
      const state = readingStates[ebook.id];
      return {
        ...ebook,
        progress: state?.progress || 0,
        lastReadAt: state?.lastReadAt ? new Date(state.lastReadAt) : undefined,
      };
    });
  }, [ebooks, readingStates]);

  // Filter and sort
  const filteredEbooks = useMemo(() => {
    let result = [...ebooksWithProgress];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.author.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (filterLevel !== 'all') {
      result = result.filter((e) => e.level === filterLevel);
    }

    // Tab filter
    if (activeTab === 'reading') {
      result = result.filter(
        (e) => e.progress && e.progress > 0 && e.progress < 100
      );
    } else if (activeTab === 'completed') {
      result = result.filter((e) => e.progress && e.progress >= 100);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return (
            (b.lastReadAt?.getTime() || 0) - (a.lastReadAt?.getTime() || 0)
          );
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [ebooksWithProgress, searchQuery, filterLevel, sortBy, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const reading = ebooksWithProgress.filter(
      (e) => e.progress && e.progress > 0 && e.progress < 100
    ).length;
    const completed = ebooksWithProgress.filter(
      (e) => e.progress && e.progress >= 100
    ).length;
    return { total: ebooks.length, reading, completed };
  }, [ebooks, ebooksWithProgress]);

  // Handle ebook click - save that we started reading
  const handleEbookClick = (ebook: EbookData) => {
    // Mark as started if not already
    const state = readingStates[ebook.id];
    if (!state || state.progress === 0) {
      saveReadingState(ebook.id, { progress: 1 }); // Mark as started
    } else {
      saveReadingState(ebook.id, {}); // Just update lastReadAt
    }
    setSelectedEbook(ebook);
    setShowReading(true);
  };

  // Close reader and refresh states
  const handleCloseReader = () => {
    setShowReading(false);
    setSelectedEbook(null);
    refreshReadingStates();
  };

  // Show reader
  if (showReading && selectedEbook) {
    return (
      <div className="h-screen">
        <EbookReader
          url={selectedEbook.epubUrl}
          ebookId={selectedEbook.id}
          title={selectedEbook.title}
          onClose={handleCloseReader}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Library className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Ebook Library</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} books • {stats.reading} reading • {stats.completed}{' '}
              completed
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList>
              <TabsTrigger value="all" className="gap-1">
                <BookOpen className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="reading" className="gap-1">
                <Clock className="h-4 w-4" />
                Reading
                {stats.reading > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {stats.reading}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Level Filter */}
          <Select
            value={filterLevel}
            onValueChange={(v) => setFilterLevel(v as FilterLevel)}
          >
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="A1">A1</SelectItem>
              <SelectItem value="A2">A2</SelectItem>
              <SelectItem value="B1">B1</SelectItem>
              <SelectItem value="B2">B2</SelectItem>
              <SelectItem value="C1">C1</SelectItem>
              <SelectItem value="C2">C2</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-36">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEbooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg mb-1">No books found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Your library is empty'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredEbooks.map((ebook) => (
                <EbookCard
                  key={ebook.id}
                  ebook={ebook}
                  variant="default"
                  onClick={() => handleEbookClick(ebook)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl">
              {filteredEbooks.map((ebook) => (
                <EbookCard
                  key={ebook.id}
                  ebook={ebook}
                  variant="horizontal"
                  onClick={() => handleEbookClick(ebook)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EbookLibrary;
