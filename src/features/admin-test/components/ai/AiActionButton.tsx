import { useState } from 'react';
import { Loader2, Sparkles, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AiActionButtonProps {
  /** Async work to run when clicked (call the mutation + show suggestion). */
  onRun: () => Promise<void>;
  label?: string;
  /** Tooltip / aria-label. */
  title?: string;
  icon?: LucideIcon;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  disabled?: boolean;
}

/**
 * A small "magic" button that runs an AI action with a loading spinner and
 * surfaces failures as a toast. Stop-propagation so it can live inside
 * collapsible headers without toggling them.
 */
export const AiActionButton = ({
  onRun,
  label,
  title,
  icon: Icon = Sparkles,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
}: AiActionButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await onRun();
    } catch (err) {
      console.error('[AiActionButton]', err);
      toast.error('AI request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || loading}
      title={title || label}
      onClick={handleClick}
      className={cn(
        'gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label && <span>{label}</span>}
    </Button>
  );
};
