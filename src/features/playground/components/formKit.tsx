import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

// ---- Reusable, fully-controlled form primitives for the Playground editor ----

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <Label className="text-xs">{label}</Label>}
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input
        className="h-8"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label?: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        className="h-8"
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <Textarea
        className="text-xs"
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string | undefined;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

// Chip-based editor for string[] (and number[] when numeric).
export function TagsField({
  label,
  value,
  onChange,
  numeric,
  placeholder,
}: {
  label?: string;
  value: Array<string | number> | undefined;
  onChange: (v: Array<string | number>) => void;
  numeric?: boolean;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const items = value ?? [];
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...items, numeric ? Number(t) : t]);
    setDraft('');
  };
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1 mb-1">
        {items.map((it, i) => (
          <Badge key={i} className="bg-slate-100 text-slate-700 gap-1">
            {String(it)}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            />
          </Badge>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          className="h-8"
          value={draft}
          placeholder={placeholder ?? (numeric ? 'add number…' : 'add…')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </Field>
  );
}

// Collapsible section wrapper.
export function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-md">
      <button
        type="button"
        className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold bg-slate-50 rounded-t-md"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {title}
      </button>
      {open && <div className="p-2 space-y-2">{children}</div>}
    </div>
  );
}

// Generic array-of-objects editor with add / remove and a per-item render.
export function ArrayEditor<T>({
  title,
  items,
  onChange,
  makeNew,
  render,
  addLabel = 'Add',
}: {
  title: string;
  items: T[] | undefined;
  onChange: (next: T[]) => void;
  makeNew: () => T;
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel?: string;
}) {
  const list = items ?? [];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {title} ({list.length})
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => onChange([...list, makeNew()])}
        >
          <Plus className="h-3 w-3 mr-1" />
          {addLabel}
        </Button>
      </div>
      {list.map((item, idx) => (
        <div key={idx} className="border rounded p-2 relative bg-white">
          <button
            type="button"
            className="absolute top-1 right-1 text-slate-400 hover:text-red-500"
            onClick={() => onChange(list.filter((_, i) => i !== idx))}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {render(item, (patch) => {
            const next = [...list];
            next[idx] = { ...item, ...patch };
            onChange(next);
          })}
        </div>
      ))}
    </div>
  );
}

export const SEVERITY_OPTS = ['critical', 'high', 'medium', 'low'];
export const DIFFICULTY_OPTS = ['easy', 'medium', 'hard'];
export const PROFICIENCY_OPTS = ['weak', 'developing', 'proficient', 'strong'];
export const PRIMARY_GOAL_OPTS = [
  'toeic_preparation',
  'career_advancement',
  'business_english',
  'academic_excellence',
];
export const ROADMAP_LEVEL_OPTS = [
  'beginner',
  'intermediate',
  'upper_intermediate',
  'advanced',
];
export const CEFR_OPTS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const STUDY_TIME_OPTS = ['morning', 'afternoon', 'evening', 'night'];
export const RESOURCE_TYPE_OPTS = ['article', 'video', 'flashcard', 'other'];
export const DOW_OPTS = ['0', '1', '2', '3', '4', '5', '6'];
