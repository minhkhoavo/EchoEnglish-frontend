import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SKILL_TAXONOMY } from '../../services/adminTestAiPrompts';

// Fields whose value is an array (multi-select); everything else is single.
const MULTI_FIELDS = new Set(['skills', 'distractorTypes']);
const NONE = '__none';

interface SkillTagsEditorProps {
  part: number;
  value?: Record<string, unknown>;
  onChange: (skillTags: Record<string, unknown>) => void;
}

/**
 * Editable skill-tag editor. Renders the taxonomy fields valid for the given
 * part (from SKILL_TAXONOMY): single-value fields as a Select, array fields as
 * toggleable badges. Teachers can adjust after using "Auto-tag".
 */
export const SkillTagsEditor = ({
  part,
  value = {},
  onChange,
}: SkillTagsEditorProps) => {
  const taxonomy = SKILL_TAXONOMY[part] ?? {};
  const fields = Object.keys(taxonomy);

  if (fields.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No skill tags available for Part {part}.
      </p>
    );
  }

  const setField = (field: string, v: unknown) =>
    onChange({ ...value, part: String(part), [field]: v });

  const toggleArrayValue = (field: string, item: string) => {
    const arr = Array.isArray(value[field])
      ? [...(value[field] as string[])]
      : [];
    const idx = arr.indexOf(item);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(item);
    setField(field, arr);
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const options = taxonomy[field];

        if (MULTI_FIELDS.has(field)) {
          const selected = Array.isArray(value[field])
            ? (value[field] as string[])
            : [];
          return (
            <div key={field}>
              <Label className="text-xs text-slate-500">{field}</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {options.map((opt) => {
                  const on = selected.includes(opt);
                  return (
                    <Badge
                      key={opt}
                      onClick={() => toggleArrayValue(field, opt)}
                      variant={on ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer',
                        on && 'bg-violet-600 hover:bg-violet-700'
                      )}
                    >
                      {opt}
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        }

        const current =
          typeof value[field] === 'string' ? (value[field] as string) : '';
        return (
          <div key={field}>
            <Label className="text-xs text-slate-500">{field}</Label>
            <Select
              value={current || NONE}
              onValueChange={(v) => setField(field, v === NONE ? undefined : v)}
            >
              <SelectTrigger className="mt-1 h-8">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— (none)</SelectItem>
                {options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
};
