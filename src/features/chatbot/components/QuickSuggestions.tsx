// QuickSuggestions.tsx - Quick action suggestion chips
import React from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  Sparkles,
  MessageCircle,
  Zap,
  GraduationCap,
} from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  icon?: React.ReactNode;
  category?: 'progress' | 'study' | 'practice' | 'help';
}

interface QuickSuggestionsProps {
  suggestions?: Suggestion[];
  onSelect: (text: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'animated';
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    text: 'Show my progress',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    category: 'progress',
  },
  {
    id: '2',
    text: 'What should I study today?',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    category: 'study',
  },
  {
    id: '3',
    text: 'Practice grammar',
    icon: <Target className="w-3.5 h-3.5" />,
    category: 'practice',
  },
  {
    id: '4',
    text: 'Show my weak points',
    icon: <Zap className="w-3.5 h-3.5" />,
    category: 'progress',
  },
];

const CATEGORY_COLORS = {
  progress:
    'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
  study:
    'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300',
  practice:
    'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
  help: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
};

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
  className,
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-all duration-200',
              'hover:scale-105 active:scale-95',
              CATEGORY_COLORS[suggestion.category || 'help'],
              'animate-in fade-in slide-in-from-bottom-2'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {suggestion.icon}
            <span className="truncate max-w-[100px]">{suggestion.text}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'animated') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Quick suggestions</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => onSelect(suggestion.text)}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300',
                'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
                CATEGORY_COLORS[suggestion.category || 'help'],
                'animate-in fade-in zoom-in-95 slide-in-from-bottom-3'
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                {suggestion.icon}
              </span>
              <span className="truncate text-left">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
        <MessageCircle className="w-3 h-3" />
        Try asking:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200',
              'hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]',
              CATEGORY_COLORS[suggestion.category || 'help'],
              'animate-in fade-in slide-in-from-bottom-2'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {suggestion.icon}
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
};

// Context-aware suggestions based on user state
interface SmartSuggestionsProps {
  hasTests?: boolean;
  hasLearningPlan?: boolean;
  weakSkills?: string[];
  onSelect: (text: string) => void;
  className?: string;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  hasTests = false,
  hasLearningPlan = false,
  weakSkills = [],
  onSelect,
  className,
}) => {
  const suggestions: Suggestion[] = [];

  // Add progress-related if has tests
  if (hasTests) {
    suggestions.push({
      id: 'progress',
      text: 'Show my progress',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      category: 'progress',
    });
  }

  // Add learning plan suggestion
  if (hasLearningPlan) {
    suggestions.push({
      id: 'today',
      text: "What's today's plan?",
      icon: <Clock className="w-3.5 h-3.5" />,
      category: 'study',
    });
  } else {
    suggestions.push({
      id: 'setup',
      text: 'Create a learning plan',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      category: 'study',
    });
  }

  // Add weak skills practice
  if (weakSkills.length > 0) {
    suggestions.push({
      id: 'practice',
      text: `Practice ${weakSkills[0]}`,
      icon: <Target className="w-3.5 h-3.5" />,
      category: 'practice',
    });
  } else {
    suggestions.push({
      id: 'practice-general',
      text: 'Start practice drill',
      icon: <Target className="w-3.5 h-3.5" />,
      category: 'practice',
    });
  }

  // Always add help
  suggestions.push({
    id: 'help',
    text: 'What can you do?',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    category: 'help',
  });

  return (
    <QuickSuggestions
      suggestions={suggestions.slice(0, 4)}
      onSelect={onSelect}
      className={className}
      variant="animated"
    />
  );
};

export default QuickSuggestions;
