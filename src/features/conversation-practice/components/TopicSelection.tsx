import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  ChevronRight,
  MessageCircle,
  Target,
  Loader2,
  BookOpen,
  Briefcase,
  Plane,
  Users,
  ShoppingBag,
  Heart,
  Sparkles,
} from 'lucide-react';
import type { ConversationCategory, ConversationTopic } from '../types';
import { cn } from '@/lib/utils';

interface TopicSelectionProps {
  categories: ConversationCategory[];
  onSelectTopic: (topic: ConversationTopic) => void;
  isLoading: boolean;
}

const difficultyConfig: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  beginner: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  intermediate: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  advanced: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

// Category icons and colors
const categoryConfig: Record<
  string,
  { icon: React.ElementType; gradient: string; iconBg: string }
> = {
  'Daily Life': {
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-100 text-pink-600',
  },
  'Work & Business': {
    icon: Briefcase,
    gradient: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  Travel: {
    icon: Plane,
    gradient: 'from-cyan-500 to-teal-500',
    iconBg: 'bg-cyan-100 text-cyan-600',
  },
  Social: {
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  Shopping: {
    icon: ShoppingBag,
    gradient: 'from-orange-500 to-amber-500',
    iconBg: 'bg-orange-100 text-orange-600',
  },
  Education: {
    icon: BookOpen,
    gradient: 'from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
};

const getDefaultCategoryConfig = (index: number) => {
  const colors = [
    {
      gradient: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      gradient: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      gradient: 'from-teal-500 to-emerald-500',
      iconBg: 'bg-teal-100 text-teal-600',
    },
  ];
  return { icon: Sparkles, ...colors[index % colors.length] };
};

const TopicSelection: React.FC<TopicSelectionProps> = ({
  categories,
  onSelectTopic,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-400 animate-ping opacity-20" />
          </div>
          <p className="text-slate-600 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
            <MessageCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No conversations available
          </h3>
          <p className="text-slate-500">Check back later for new topics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <ScrollArea className="h-full">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Conversation Practice
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Choose a Topic to Practice
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Select a conversation scenario below and practice speaking English
              with our AI assistant.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-10">
            {categories.map((category, categoryIndex) => {
              const config =
                categoryConfig[category.name] ||
                getDefaultCategoryConfig(categoryIndex);
              const IconComponent = config.icon;

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        config.iconBg
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {category.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {category.topics.length} conversations
                      </p>
                    </div>
                  </div>

                  {/* Topics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.topics.map((topic) => {
                      const difficulty = difficultyConfig[topic.difficulty];

                      return (
                        <Card
                          key={topic.id}
                          className="group cursor-pointer border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 overflow-hidden"
                          onClick={() => onSelectTopic(topic)}
                        >
                          {/* Gradient Top Bar */}
                          <div
                            className={cn(
                              'h-1.5 bg-gradient-to-r',
                              config.gradient
                            )}
                          />

                          <CardContent className="p-5">
                            {/* Title & Description */}
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                              {topic.title}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                              {topic.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Difficulty Badge */}
                                <div
                                  className={cn(
                                    'flex items-center gap-1.5 px-2 py-1 rounded-full',
                                    difficulty.bg
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-1.5 h-1.5 rounded-full',
                                      difficulty.dot
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      difficulty.text
                                    )}
                                  >
                                    {topic.difficulty.charAt(0).toUpperCase() +
                                      topic.difficulty.slice(1)}
                                  </span>
                                </div>
                              </div>

                              {/* Duration & Tasks */}
                              <div className="flex items-center gap-3 text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-xs">
                                    {topic.estimatedMinutes}m
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="w-3.5 h-3.5" />
                                  <span className="text-xs">
                                    {topic.tasks.length}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Hover Arrow */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                                Start conversation
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TopicSelection;
