import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Book, Clock, User, Star, Download, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface EbookData {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  epubUrl: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: string;
  duration?: string; // Estimated reading time
  pages?: number;
  rating?: number;
  isDownloaded?: boolean;
  progress?: number; // 0-100
  lastReadAt?: Date;
}

interface EbookCardProps {
  ebook: EbookData;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const LevelBadge: React.FC<{ level?: string }> = ({ level }) => {
  if (!level) return null;

  const colors: Record<string, string> = {
    A1: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    A2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    B1: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    B2: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    C1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    C2: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  };

  return (
    <Badge className={cn('text-xs font-medium', colors[level] || '')}>
      {level}
    </Badge>
  );
};

const RatingStars: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

// ============================================================================
// DEFAULT CARD
// ============================================================================

const DefaultCard: React.FC<EbookCardProps> = ({
  ebook,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {ebook.coverUrl ? (
          <img
            src={ebook.coverUrl}
            alt={ebook.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="h-16 w-16 text-primary/40" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <LevelBadge level={ebook.level} />
          {ebook.isDownloaded && (
            <Badge variant="secondary" className="bg-background/90">
              <Download className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        {/* Progress indicator */}
        {typeof ebook.progress === 'number' && ebook.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>{ebook.progress}% complete</span>
              {ebook.progress === 100 && (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
            </div>
            <Progress value={ebook.progress} className="h-1.5 bg-white/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {ebook.title}
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <User className="h-3 w-3" />
          {ebook.author}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between">
          {ebook.duration && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {ebook.duration}
            </span>
          )}
          <RatingStars rating={ebook.rating} />
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPACT CARD
// ============================================================================

const CompactCard: React.FC<EbookCardProps> = ({
  ebook,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-3">
        {/* Mini Cover */}
        <div className="w-12 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex-shrink-0 overflow-hidden">
          {ebook.coverUrl ? (
            <img
              src={ebook.coverUrl}
              alt={ebook.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="h-6 w-6 text-primary/40" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
            {ebook.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {ebook.author}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={ebook.level} />
            {typeof ebook.progress === 'number' && ebook.progress > 0 && (
              <span className="text-xs text-muted-foreground">
                {ebook.progress}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// HORIZONTAL CARD
// ============================================================================

const HorizontalCard: React.FC<EbookCardProps> = ({
  ebook,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden',
        className
      )}
      onClick={onClick}
    >
      <div className="flex">
        {/* Cover */}
        <div className="w-24 h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0 relative overflow-hidden">
          {ebook.coverUrl ? (
            <img
              src={ebook.coverUrl}
              alt={ebook.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="h-10 w-10 text-primary/40" />
            </div>
          )}
          <div className="absolute top-1 left-1">
            <LevelBadge level={ebook.level} />
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {ebook.title}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <User className="h-3 w-3" />
              {ebook.author}
            </p>
            {ebook.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {ebook.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {ebook.duration && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {ebook.duration}
                </span>
              )}
              <RatingStars rating={ebook.rating} />
            </div>

            {typeof ebook.progress === 'number' && ebook.progress > 0 && (
              <div className="flex items-center gap-2">
                <Progress value={ebook.progress} className="w-16 h-1.5" />
                <span className="text-xs font-medium">{ebook.progress}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const EbookCard: React.FC<EbookCardProps> = ({
  variant = 'default',
  ...props
}) => {
  switch (variant) {
    case 'compact':
      return <CompactCard {...props} />;
    case 'horizontal':
      return <HorizontalCard {...props} />;
    default:
      return <DefaultCard {...props} />;
  }
};

export default EbookCard;
