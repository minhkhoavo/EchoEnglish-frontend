import { Sparkles, X, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAiAssist } from './AiAssistContext';

const statusStyles = {
  info: { ring: 'border-violet-200', header: 'text-violet-700', Icon: Info },
  success: {
    ring: 'border-green-200',
    header: 'text-green-700',
    Icon: Check,
  },
  warning: {
    ring: 'border-amber-200',
    header: 'text-amber-700',
    Icon: AlertTriangle,
  },
  error: {
    ring: 'border-red-200',
    header: 'text-red-700',
    Icon: AlertTriangle,
  },
} as const;

/**
 * Docked panel on the right edge of the editor showing the active AI
 * suggestion with Apply / Discard actions. Renders nothing when idle.
 */
export const AiSuggestionPanel = () => {
  const { suggestion, dismiss } = useAiAssist();

  if (!suggestion) return null;

  const style = statusStyles[suggestion.status ?? 'info'];
  const StatusIcon = style.Icon;

  return (
    <div
      className={cn(
        'fixed top-24 right-4 bottom-4 z-40 w-[380px] max-w-[calc(100vw-2rem)]',
        'flex flex-col rounded-xl border-2 bg-white shadow-2xl',
        style.ring
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div
          className={cn('flex items-center gap-2 font-semibold', style.header)}
        >
          <Sparkles className="h-4 w-4" />
          <span className="truncate">AI Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={dismiss} title="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-4 pt-3 text-sm font-medium',
          style.header
        )}
      >
        <StatusIcon className="h-4 w-4 shrink-0" />
        <span>{suggestion.title}</span>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="text-sm text-slate-700 space-y-2">
          {suggestion.body}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="outline" size="sm" onClick={dismiss}>
          {suggestion.onApply ? 'Discard' : 'Close'}
        </Button>
        {suggestion.onApply && (
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => {
              suggestion.onApply?.();
              dismiss();
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            {suggestion.applyLabel ?? 'Apply'}
          </Button>
        )}
      </div>
    </div>
  );
};
