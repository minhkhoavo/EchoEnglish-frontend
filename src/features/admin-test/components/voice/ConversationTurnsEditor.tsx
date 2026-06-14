import { Plus, Trash2, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ConversationTurn, VoiceProfile } from '../../services/voiceApi';

interface ConversationTurnsEditorProps {
  turns: ConversationTurn[];
  onChange: (turns: ConversationTurn[]) => void;
  profiles: VoiceProfile[];
}

/**
 * Ordered, per-line speaker editor for multi-speaker TOEIC conversations
 * (Part 3 / Part 4). Each turn maps a voice profile to a line of text; the
 * backend synthesizes each turn separately and concatenates them in order.
 */
export const ConversationTurnsEditor = ({
  turns,
  onChange,
  profiles,
}: ConversationTurnsEditorProps) => {
  const update = (index: number, patch: Partial<ConversationTurn>) => {
    onChange(turns.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const remove = (index: number) => {
    onChange(turns.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= turns.length) return;
    const next = [...turns];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    onChange([...turns, { voiceProfileId: profiles[0]?.id ?? '', text: '' }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-500">
            <Users className="h-3 w-3" />
          </span>
          Conversation turns
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="h-8 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add turn
        </Button>
      </div>

      {turns.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 py-8 text-center text-xs text-slate-500">
          No turns yet — add one to start the conversation.
        </div>
      )}

      <div className="space-y-2.5">
        {turns.map((turn, index) => {
          const profile = profiles.find((p) => p.id === turn.voiceProfileId);
          return (
            <div
              key={index}
              className="group relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300"
            >
              {/* speaker rail accent */}
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-1 rounded-r-full',
                  index % 2 === 0 ? 'bg-blue-500' : 'bg-teal-500'
                )}
              />
              <div className="flex items-center gap-2 pl-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm',
                    index % 2 === 0 ? 'bg-blue-600' : 'bg-teal-600'
                  )}
                >
                  {index + 1}
                </span>
                <Select
                  value={turn.voiceProfileId}
                  onValueChange={(v) => update(index, { voiceProfileId: v })}
                >
                  <SelectTrigger className="h-8 flex-1 bg-slate-50/60">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700"
                    onClick={() => move(index, 1)}
                    disabled={index === turns.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={turn.text}
                onChange={(e) => update(index, { text: e.target.value })}
                placeholder={
                  profile
                    ? `What ${profile.name} says…`
                    : 'What this speaker says…'
                }
                rows={2}
                className="mt-2.5 ml-2 w-[calc(100%-0.5rem)] resize-none bg-slate-50/40"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationTurnsEditor;
