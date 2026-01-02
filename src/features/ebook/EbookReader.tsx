import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import type { Contents, Rendition, NavItem } from 'epubjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Settings,
  List,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Sun,
  Moon,
  Palette,
  Type,
  Loader2,
  Highlighter,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SelectionMenu from '../resource/components/SelectionMenu';
import CreateEditFlashcardDialog from '../resource/components/CreateEditFlashcardDialog';

// ============================================================================
// TYPES
// ============================================================================

interface EbookReaderProps {
  url: string; // EPUB file URL
  ebookId?: string; // ID for progress tracking
  title?: string;
  onClose?: () => void;
  className?: string;
}

// Centralized reading state storage key
const READING_STATE_KEY = 'ebook-reading-states';

interface ReadingState {
  progress: number;
  lastReadAt: string;
  location?: string;
}

const saveReadingProgress = (
  ebookId: string,
  progress: number,
  location?: string
) => {
  try {
    const data = localStorage.getItem(READING_STATE_KEY);
    const states: Record<string, ReadingState> = data ? JSON.parse(data) : {};
    states[ebookId] = {
      ...states[ebookId],
      progress,
      lastReadAt: new Date().toISOString(),
      location,
    };
    localStorage.setItem(READING_STATE_KEY, JSON.stringify(states));
  } catch (e) {
    console.error('Failed to save reading progress:', e);
  }
};

interface EbookNote {
  id: string;
  cfiRange: string;
  text: string;
  note: string;
  color: string;
  createdAt: Date;
}

interface EbookBookmark {
  id: string;
  cfi: string;
  label: string;
  createdAt: Date;
}

type ReaderTheme = 'light' | 'dark' | 'sepia';

// ============================================================================
// THEME STYLES
// ============================================================================

const getReaderStyles = (theme: ReaderTheme): typeof ReactReaderStyle => {
  const themes = {
    light: {
      body: { background: '#ffffff' },
      content: { color: '#1a1a1a' },
    },
    dark: {
      body: { background: '#1a1a1a' },
      content: { color: '#e5e5e5' },
    },
    sepia: {
      body: { background: '#f4ecd8' },
      content: { color: '#5c4b37' },
    },
  };

  return {
    ...ReactReaderStyle,
    container: {
      ...ReactReaderStyle.container,
      overflow: 'hidden',
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      backgroundColor: themes[theme].body.background,
      transition: 'background-color 0.3s ease',
    },
    reader: {
      ...ReactReaderStyle.reader,
    },
    arrow: {
      ...ReactReaderStyle.arrow,
      color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
    },
    arrowHover: {
      ...ReactReaderStyle.arrowHover,
      color: theme === 'dark' ? '#ffffff' : '#000000',
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
    },
    tocButton: {
      ...ReactReaderStyle.tocButton,
      color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
    },
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EbookReader: React.FC<EbookReaderProps> = ({
  url,
  ebookId,
  title = 'Ebook',
  onClose,
  className,
}) => {
  // State
  const [location, setLocation] = useState<string | number>(0);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState(100); // percentage
  const [showToc, setShowToc] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [currentPage, setCurrentPage] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0); // Overall book progress 0-100
  const [locationsGenerated, setLocationsGenerated] = useState(false);

  // Notes & Bookmarks
  const [notes, setNotes] = useState<EbookNote[]>([]);
  const [bookmarks, setBookmarks] = useState<EbookBookmark[]>([]);
  const [currentBookmarkLabel, setCurrentBookmarkLabel] = useState('');

  // Selection Menu
  const [selectedText, setSelectedText] = useState('');
  const [selectedCfiRange, setSelectedCfiRange] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Refs
  const renditionRef = useRef<Rendition | null>(null);
  const tocRef = useRef<NavItem[]>([]);

  // Storage key based on ebookId or URL
  const storageKey = ebookId || url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);

  // Load saved data from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem(`ebook-location-${storageKey}`);
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      // If no saved location, try to navigate to Chapter 1
      setLocation(''); // Empty string signals to go to first chapter
    }

    const savedNotes = localStorage.getItem(`ebook-notes-${storageKey}`);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse saved notes');
      }
    }

    const savedBookmarks = localStorage.getItem(
      `ebook-bookmarks-${storageKey}`
    );
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse saved bookmarks');
      }
    }
  }, [storageKey]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`ebook-notes-${storageKey}`, JSON.stringify(notes));
    }
  }, [notes, storageKey]);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem(
        `ebook-bookmarks-${storageKey}`,
        JSON.stringify(bookmarks)
      );
    }
  }, [bookmarks, storageKey]);

  // Handle location change
  const handleLocationChanged = (epubcfi: string) => {
    setLocation(epubcfi);
    localStorage.setItem(`ebook-location-${storageKey}`, epubcfi);

    // Update current page info
    if (renditionRef.current) {
      const currentLocation = renditionRef.current.currentLocation() as {
        start?: {
          displayed?: { page?: number; total?: number };
          cfi?: string;
          location?: number;
        };
        end?: { location?: number };
      };

      if (currentLocation && currentLocation.start) {
        const displayed = currentLocation.start.displayed;
        const currentPageNum = displayed?.page || 0;
        const chapterTotalPages = displayed?.total || 0;

        setCurrentPage({
          current: currentPageNum,
          total: chapterTotalPages,
        });

        // Calculate overall book progress using locations (accurate percentage)
        if (
          locationsGenerated &&
          renditionRef.current.book?.locations &&
          epubcfi
        ) {
          try {
            const book = renditionRef.current.book;
            // Get percentage from CFI for accurate book-level progress
            const percentage = book.locations.percentageFromCfi(epubcfi);
            const progressPercent = Math.round(percentage * 100);
            setTotalProgress(progressPercent);

            // Save progress with accurate percentage
            if (ebookId) {
              saveReadingProgress(ebookId, progressPercent, epubcfi);
            }
          } catch (error) {
            console.warn('Invalid CFI:', epubcfi, error);
            // Fall back to saving without CFI
            if (ebookId && currentPageNum > 0 && chapterTotalPages > 0) {
              const estimatedProgress = Math.round(
                (currentPageNum / chapterTotalPages) * 100
              );
              setTotalProgress(Math.min(estimatedProgress, 99));
            }
          }
        }

        // Get current chapter label for bookmark
        const currentCfi = currentLocation.start.cfi || '';
        const chapter = tocRef.current.find((item) => {
          return currentCfi.includes(item.href?.split('#')[0] || '');
        });
        setCurrentBookmarkLabel(chapter?.label || 'Unknown Chapter');
      }
    }
  };

  // Handle rendition ready
  const handleRendition = useCallback(
    (rendition: Rendition) => {
      renditionRef.current = rendition;
      setIsLoading(false);

      // Generate locations for accurate progress calculation
      // This calculates positions throughout the entire book
      rendition.book.ready
        .then(() => {
          return rendition.book.locations.generate(1024); // Generate locations every ~1024 characters
        })
        .then(() => {
          setLocationsGenerated(true);
          console.log(
            'Book locations generated for accurate progress tracking'
          );
        })
        .catch((err: Error) => {
          console.warn('Failed to generate book locations:', err);
        });

      // Check localStorage directly to see if we have a saved location
      const savedLocation = localStorage.getItem(
        `ebook-location-${storageKey}`
      );

      // If no saved location (first time reading), navigate to first chapter
      if (!savedLocation) {
        rendition.book.ready
          .then(() => {
            // Get the first chapter from TOC
            const toc = rendition.book.navigation.toc;
            if (toc && toc.length > 0) {
              const firstChapter = toc[0];
              if (firstChapter.href) {
                rendition.display(firstChapter.href);
                console.log('Navigated to first chapter:', firstChapter.label);
              }
            } else {
              // Fallback: just display the book (starts from beginning)
              rendition.display();
              console.log('No TOC available, displaying from start');
            }
          })
          .catch((err: Error) => {
            console.warn('Failed to navigate to first chapter:', err);
          });
      }
      // If there IS a saved location, React will handle it via the <ReactReader location={location} /> prop

      // Apply initial font size
      rendition.themes.fontSize(`${fontSize}%`);

      // Apply theme styles
      rendition.themes.register('custom', {
        body: { 'font-family': 'Georgia, serif !important' },
        p: { 'line-height': '1.8 !important' },
      });
      rendition.themes.select('custom');

      // Handle text selection for translate/flashcard/highlight
      rendition.on('selected', (cfiRange: string, contents: Contents) => {
        const selection = contents.window.getSelection();
        if (selection && selection.toString().trim()) {
          const text = selection.toString().trim();
          setSelectedText(text);
          setSelectedCfiRange(cfiRange);

          // Get selection position
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Get iframe position
          const iframe = document.querySelector('iframe');
          const iframeRect = iframe?.getBoundingClientRect() || {
            left: 0,
            top: 0,
          };

          setSelectionPosition({
            x: iframeRect.left + rect.left + rect.width / 2,
            y: iframeRect.top + rect.top,
          });
          setShowSelectionMenu(true);
        }
      });

      // Apply existing highlights
      notes.forEach((note) => {
        rendition.annotations.highlight(
          note.cfiRange,
          {},
          () => {},
          'highlight',
          { fill: note.color, 'fill-opacity': '0.3' }
        );
      });
    },
    [fontSize, notes]
  );

  // Get TOC
  const handleTocLoaded = (tocItems: NavItem[]) => {
    setToc(tocItems);
    tocRef.current = tocItems;
  };

  // Navigation
  const goToLocation = (href: string) => {
    setLocation(href);
    setShowToc(false);
  };

  // Theme toggle
  const cycleTheme = () => {
    const themes: ReaderTheme[] = ['light', 'sepia', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);

    // Apply theme to rendition
    if (renditionRef.current) {
      const themeColors = {
        light: { bg: '#ffffff', color: '#1a1a1a' },
        dark: { bg: '#1a1a1a', color: '#e5e5e5' },
        sepia: { bg: '#f4ecd8', color: '#5c4b37' },
      };

      renditionRef.current.themes.override(
        'color',
        themeColors[nextTheme].color
      );
      renditionRef.current.themes.override(
        'background',
        themeColors[nextTheme].bg
      );
    }
  };

  // Font size
  const changeFontSize = (delta: number) => {
    const newSize = Math.max(80, Math.min(150, fontSize + delta));
    setFontSize(newSize);
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${newSize}%`);
    }
  };

  // Bookmark
  const toggleBookmark = () => {
    const currentCfi = location.toString();
    const existingIndex = bookmarks.findIndex((b) => b.cfi === currentCfi);

    if (existingIndex >= 0) {
      setBookmarks((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      const newBookmark: EbookBookmark = {
        id: `bookmark-${Date.now()}`,
        cfi: currentCfi,
        label: currentBookmarkLabel || `Page ${currentPage.current}`,
        createdAt: new Date(),
      };
      setBookmarks((prev) => [...prev, newBookmark]);
    }
  };

  const isCurrentLocationBookmarked = bookmarks.some(
    (b) => b.cfi === location.toString()
  );

  // Selection menu handlers
  const handleCloseSelection = () => {
    setShowSelectionMenu(false);
    setSelectedText('');
    setSelectedCfiRange('');
    setSelectedTranslation('');
  };

  const handleCreateFlashcard = (translation?: string) => {
    setSelectedTranslation(translation || '');
    setShowSelectionMenu(false);
    setShowFlashcardDialog(true);
  };

  const handleFlashcardSuccess = () => {
    setShowFlashcardDialog(false);
    setSelectedText('');
    setSelectedCfiRange('');
    setSelectedTranslation('');
  };

  // Highlight/Note handlers
  const handleAddHighlight = (withNote: boolean = false) => {
    if (!selectedCfiRange || !selectedText) return;

    if (withNote) {
      setShowSelectionMenu(false);
      setNoteText('');
      setShowNoteDialog(true);
    } else {
      // Just highlight without note
      createHighlight('');
    }
  };

  const createHighlight = (noteContent: string) => {
    if (!selectedCfiRange || !selectedText) return;

    const newNote: EbookNote = {
      id: `note-${Date.now()}`,
      cfiRange: selectedCfiRange,
      text: selectedText,
      note: noteContent,
      color: '#fef08a', // Yellow highlight
      createdAt: new Date(),
    };

    setNotes((prev) => [...prev, newNote]);

    // Apply highlight to rendition
    if (renditionRef.current) {
      renditionRef.current.annotations.highlight(
        selectedCfiRange,
        {},
        () => {},
        'highlight',
        { fill: '#fef08a', 'fill-opacity': '0.4' }
      );
    }

    handleCloseSelection();
    setShowNoteDialog(false);
    setNoteText('');
  };

  const handleDeleteNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note && renditionRef.current) {
      renditionRef.current.annotations.remove(note.cfiRange, 'highlight');
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Use total book progress instead of chapter-based progress
  const progress = totalProgress;

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-background z-10">
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}

          {/* TOC */}
          <Sheet open={showToc} onOpenChange={setShowToc}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Table of Contents</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                <div className="space-y-1">
                  {toc.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => goToLocation(item.href)}
                    >
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-sm font-medium truncate">{title}</h1>
          {currentPage.total > 0 && (
            <p className="text-xs text-muted-foreground">
              Page {currentPage.current} of {currentPage.total}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Bookmark */}
          <Button variant="ghost" size="icon" onClick={toggleBookmark}>
            {isCurrentLocationBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>

          {/* Notes Panel */}
          <Sheet open={showNotes} onOpenChange={setShowNotes}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <StickyNote className="h-5 w-5" />
                {notes.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {notes.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Notes & Highlights</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                {/* Bookmarks */}
                {bookmarks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Bookmarks
                    </h3>
                    <div className="space-y-2">
                      {bookmarks.map((bookmark) => (
                        <Button
                          key={bookmark.id}
                          variant="ghost"
                          className="w-full justify-start text-left text-sm"
                          onClick={() => {
                            setLocation(bookmark.cfi);
                            setShowNotes(false);
                          }}
                        >
                          <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                          {bookmark.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {notes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Highlights & Notes
                    </h3>
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950 group relative"
                        >
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              setLocation(note.cfiRange);
                              setShowNotes(false);
                            }}
                          >
                            <p className="text-sm font-medium pr-6">
                              "{note.text}"
                            </p>
                            {note.note && (
                              <p className="text-xs text-muted-foreground mt-1 border-t pt-1">
                                📝 {note.note}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bookmarks.length === 0 && notes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No notes or bookmarks yet.
                    <br />
                    Select text to highlight or click bookmark to save your
                    place.
                  </p>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={cycleTheme}>
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : theme === 'sepia' ? (
                  <Palette className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                Theme: {theme}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Font Size: {fontSize}%
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => changeFontSize(-10)}
                  >
                    <Type className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${((fontSize - 80) / 70) * 100}%` }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => changeFontSize(10)}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Reader */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={handleRendition}
          tocChanged={handleTocLoaded}
          readerStyles={getReaderStyles(theme)}
          epubOptions={{
            allowScriptedContent: true,
            flow: 'paginated',
            manager: 'continuous', // Fix: use continuous manager for smooth chapter navigation
            spread: 'auto',
          }}
        />
      </div>

      {/* Selection Menu */}
      {showSelectionMenu && selectedText && (
        <SelectionMenu
          selectedText={selectedText}
          position={selectionPosition}
          onSave={handleCreateFlashcard}
          onClose={handleCloseSelection}
          showHighlightActions={true}
          onHighlight={() => handleAddHighlight(false)}
          onAddNote={() => handleAddHighlight(true)}
        />
      )}

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-yellow-500" />
              Add Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium">"{selectedText}"</p>
            </div>
            <Textarea
              placeholder="Write your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNoteDialog(false);
                setNoteText('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => createHighlight(noteText)}>
              <Highlighter className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flashcard Dialog */}
      {showFlashcardDialog && (
        <CreateEditFlashcardDialog
          open={showFlashcardDialog}
          onOpenChange={setShowFlashcardDialog}
          selectedText={selectedText}
          selectedTranslation={selectedTranslation}
          resourceUrl={url}
          onSuccess={handleFlashcardSuccess}
        />
      )}
    </div>
  );
};

export default EbookReader;
