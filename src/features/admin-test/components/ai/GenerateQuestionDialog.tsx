import { useState } from 'react';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRunAiMutation } from '../../services/adminTestAiApi';
import {
  buildGenerateQuestion,
  buildGenerateGroup,
} from '../../services/adminTestAiPrompts';
import type {
  AiGeneratedQuestion,
  GenerateQuestionResult,
  GenerateGroupResult,
} from '../../types/admin-test-ai.types';

interface GeneratedGroupContext {
  passageHtml?: string | null;
  transcript?: string | null;
  translation?: string | null;
}

interface GenerateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: number;
  /** Append standalone questions (Parts 1, 2, 5). */
  onInsertQuestions: (questions: AiGeneratedQuestion[]) => void;
  /** Append a question group (Parts 3, 4, 6, 7). */
  onInsertGroup: (
    groupContext: GeneratedGroupContext,
    questions: AiGeneratedQuestion[]
  ) => void;
}

const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Dialog for generating a complete question (+ answer/explanation) from a spec.
 * Builds the prompt on the frontend, calls the generic AI endpoint, previews
 * the result, then inserts it into the test.
 */
export const GenerateQuestionDialog = ({
  open,
  onOpenChange,
  part,
  onInsertQuestions,
  onInsertGroup,
}: GenerateQuestionDialogProps) => {
  const isGroupPart = [3, 4, 6, 7].includes(part);
  const [difficulty, setDifficulty] = useState('B1');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(isGroupPart ? 3 : 1);
  const [runAi, { isLoading }] = useRunAiMutation();
  const [questions, setQuestions] = useState<AiGeneratedQuestion[] | null>(
    null
  );
  const [groupContext, setGroupContext] =
    useState<GeneratedGroupContext | null>(null);

  const reset = () => {
    setQuestions(null);
    setGroupContext(null);
  };

  const handleGenerate = async () => {
    try {
      if (isGroupPart) {
        const res = (await runAi(
          buildGenerateGroup({
            part,
            difficulty,
            instructions: prompt || undefined,
            numQuestions: count,
          })
        ).unwrap()) as GenerateGroupResult;
        setGroupContext(res.groupContext ?? {});
        setQuestions(res.questions ?? []);
      } else {
        const res = (await runAi(
          buildGenerateQuestion({
            part,
            difficulty,
            instructions: prompt || undefined,
            count,
          })
        ).unwrap()) as GenerateQuestionResult;
        setGroupContext(null);
        setQuestions(res.questions ?? []);
      }
    } catch (err) {
      console.error('[GenerateQuestionDialog]', err);
      toast.error('Failed to generate questions. Please try again.');
    }
  };

  const handleInsert = () => {
    if (!questions || questions.length === 0) return;
    if (isGroupPart) {
      onInsertGroup(groupContext ?? {}, questions);
    } else {
      onInsertQuestions(questions);
    }
    toast.success('Inserted into test.');
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Generate Questions (AI) — Part {part}
          </DialogTitle>
          <DialogDescription>
            {isGroupPart
              ? 'AI generates a shared context passage and linked questions.'
              : 'AI generates a complete question with correct answer and explanation.'}
          </DialogDescription>
        </DialogHeader>

        {/* Spec form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Difficulty (CEFR)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CEFR_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">
              {isGroupPart ? 'Questions per group' : 'Count'}
            </Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={count}
              onChange={(e) =>
                setCount(Math.min(5, Math.max(1, Number(e.target.value) || 1)))
              }
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Prompt (optional)</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Short instructions for the AI, e.g. office scenario about a delayed shipment..."
            className="mt-1 min-h-[64px]"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {questions ? 'Regenerate' : 'Generate'}
        </Button>

        {/* Preview */}
        {questions && (
          <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
            {groupContext &&
              (groupContext.passageHtml || groupContext.transcript) && (
                <div
                  className="prose prose-sm max-w-none border-b pb-2"
                  dangerouslySetInnerHTML={{
                    __html:
                      groupContext.passageHtml || groupContext.transcript || '',
                  }}
                />
              )}
            {questions.length === 0 && (
              <p className="text-sm text-slate-500">
                AI could not generate any questions.
              </p>
            )}
            {questions.map((q, i) => (
              <div key={i} className="rounded border bg-white p-2 text-sm">
                {q.questionText && (
                  <p className="font-medium">{q.questionText}</p>
                )}
                <ul className="mt-1 space-y-0.5">
                  {q.options.map((o) => (
                    <li
                      key={o.label}
                      className={
                        o.label === q.correctAnswer
                          ? 'text-green-600 font-medium'
                          : ''
                      }
                    >
                      {o.label}.{' '}
                      {o.text || <em className="text-slate-400">(trống)</em>}
                    </li>
                  ))}
                </ul>
                {q.explanation && (
                  <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!questions || questions.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
