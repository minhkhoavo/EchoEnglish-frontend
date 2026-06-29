import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, FormInput, Code2 } from 'lucide-react';
import type { GeneratorKind, Fidelity } from '../types/playground.types';
import { RoadmapForm, DailyForm, DailyPipelineForm } from './InputForms';

interface InputPanelProps {
  kind: GeneratorKind;
  fidelity: Fidelity;
  value: string;
  onChange: (text: string) => void;
}

type View = 'form' | 'json';

// Hybrid editor: a full form (every parameter as a control) plus a raw JSON tab
// that mirrors the exact backend signature. Both edit the same object.
export function InputPanel({
  kind,
  fidelity,
  value,
  onChange,
}: InputPanelProps) {
  const [view, setView] = useState<View>('form');

  const parsed = useMemo(() => {
    try {
      return {
        ok: true as const,
        data: JSON.parse(value) as Record<string, unknown>,
      };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [value]);

  const setObject = (next: Record<string, unknown>) =>
    onChange(JSON.stringify(next, null, 2));

  const renderForm = () => {
    if (!parsed.ok) {
      return (
        <p className="text-xs text-red-600">
          Fix the JSON to use the form view.
        </p>
      );
    }
    if (kind === 'roadmap') {
      return (
        <RoadmapForm
          value={parsed.data}
          fidelity={fidelity}
          onChange={setObject}
        />
      );
    }
    if (fidelity === 'pipeline') {
      return <DailyPipelineForm value={parsed.data} onChange={setObject} />;
    }
    return <DailyForm value={parsed.data} onChange={setObject} />;
  };

  return (
    <Card className="p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Input Simulator</h3>
        <div className="flex items-center gap-2">
          {parsed.ok ? (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Valid
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 gap-1">
              <AlertCircle className="h-3 w-3" /> Invalid
            </Badge>
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={view === 'form' ? 'default' : 'outline'}
              onClick={() => setView('form')}
            >
              <FormInput className="h-4 w-4 mr-1" /> Form
            </Button>
            <Button
              size="sm"
              variant={view === 'json' ? 'default' : 'outline'}
              onClick={() => setView('json')}
            >
              <Code2 className="h-4 w-4 mr-1" /> JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'form' ? (
          renderForm()
        ) : (
          <div className="flex flex-col h-full">
            <Label className="text-xs mb-1">
              Full payload (mirrors backend signature)
            </Label>
            <Textarea
              className="font-mono text-xs flex-1 min-h-[400px] resize-none"
              spellCheck={false}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            {!parsed.ok && (
              <p className="text-xs text-red-600 mt-1">{parsed.error}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
