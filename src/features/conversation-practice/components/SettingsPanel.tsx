import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Lightbulb,
  Volume2,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  ConversationTopic,
  ChecklistItem,
  ConversationTask,
} from '../types';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SettingsPanelProps {
  topic: ConversationTopic;
  checklist: ChecklistItem[];
  completedTasksCount: number;
  totalTasksCount: number;
  onBack: () => void;
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  topic,
  checklist,
  completedTasksCount,
  totalTasksCount,
  onBack,
}) => {
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(
    new Set()
  );

  const progressPercentage =
    totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getTaskById = (taskId: string): ConversationTask | undefined => {
    return topic.tasks.find((t) => t.id === taskId);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-3 -ml-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>

        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          {topic.title}
        </h2>
        <p className="text-sm text-slate-500 line-clamp-2">
          {topic.description}
        </p>

        <div className="flex items-center gap-3 mt-3">
          <Badge
            variant="secondary"
            className={difficultyColors[topic.difficulty]}
          >
            {topic.difficulty.charAt(0).toUpperCase() +
              topic.difficulty.slice(1)}
          </Badge>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{topic.estimatedMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Target className="w-4 h-4 text-blue-600" />
            Progress
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {completedTasksCount}/{totalTasksCount}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-slate-500 mt-2">
          Complete all tasks to finish this conversation
        </p>
      </div>

      {/* Tasks Checklist */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Tasks to Complete
          </h3>

          <div className="space-y-2">
            {checklist.map((item) => {
              const task = getTaskById(item.taskId);
              if (!task) return null;

              const isExpanded = expandedTasks.has(item.taskId);

              return (
                <Collapsible
                  key={item.taskId}
                  open={isExpanded}
                  onOpenChange={() => toggleTask(item.taskId)}
                >
                  <div
                    className={cn(
                      'rounded-lg border transition-all duration-200',
                      item.isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 text-left">
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                        <span
                          className={cn(
                            'flex-1 text-sm font-medium',
                            item.isCompleted
                              ? 'text-emerald-700'
                              : 'text-slate-700'
                          )}
                        >
                          {task.description}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-0">
                        <Separator className="mb-3" />
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs font-medium text-slate-600">
                            Example Phrases
                          </span>
                        </div>
                        <div className="space-y-2 pl-6">
                          {task.examplePhrases.map((phrase, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between group"
                            >
                              <span className="text-sm text-slate-600 italic">
                                "{phrase}"
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(phrase);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                                title="Listen to pronunciation"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SettingsPanel;
