import { useState } from 'react';
import { Loader2, Sparkles, Check } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRunAiMediaMutation } from '../../services/adminTestAiApi';
import { buildGenerateFromMedia } from '../../services/adminTestAiPrompts';
import type {
  AiGeneratedQuestion,
  GenerateQuestionResult,
} from '../../types/admin-test-ai.types';

interface GenerateFromMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: number;
  /** Uploaded/linked image URLs (Part 1). Attached to the AI request. */
  imageUrls?: string[];
  /** Existing transcript (Part 2) used as the source when there is no image. */
  transcript?: string | null;
  /** Fill the current question with the generated content. */
  onApply: (question: AiGeneratedQuestion) => void;
}

const CEFR_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Generates a single question from media already attached to the question:
 * the photo (Part 1, sent to the model) or the transcript (Part 2). The author
 * adds a short prompt; the result fills the current question in place.
 */
export const GenerateFromMediaDialog = ({
  open,
  onOpenChange,
  part,
  imageUrls,
  transcript,
  onApply,
}: GenerateFromMediaDialogProps) => {
  const hasImage = (imageUrls?.length ?? 0) > 0;
  const [difficulty, setDifficulty] = useState('B1');
  const [prompt, setPrompt] = useState('');
  const [runAiMedia, { isLoading }] = useRunAiMediaMutation();
  const [question, setQuestion] = useState<AiGeneratedQuestion | null>(null);

  const reset = () => {
    setQuestion(null);
    setPrompt('');
  };

  const handleGenerate = async () => {
    try {
      const built = buildGenerateFromMedia({
        part,
        difficulty,
        instructions: prompt || undefined,
        transcript,
        hasImage,
      });
      const res = (await runAiMedia({
        ...built,
        imageUrls: hasImage ? imageUrls : undefined,
      }).unwrap()) as GenerateQuestionResult;
      setQuestion(res.questions?.[0] ?? null);
      if (!res.questions?.length) {
        toast.error('AI could not generate a question from this media.');
      }
    } catch (err) {
      console.error('[GenerateFromMediaDialog]', err);
      toast.error('Failed to generate question. Please try again.');
    }
  };

  const handleApply = () => {
    if (!question) return;
    onApply(question);
    toast.success('Question filled from media.');
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Generate question from {hasImage ? 'image' : 'transcript'} — Part{' '}
            {part}
          </DialogTitle>
          <DialogDescription>
            {hasImage
              ? 'The uploaded image is sent to the AI to author this question.'
              : 'The transcript is used as the source to author this question.'}
          </DialogDescription>
        </DialogHeader>

        {hasImage && (
          <div className="flex flex-wrap gap-2">
            {imageUrls!.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`source ${i + 1}`}
                className="h-20 w-20 rounded border object-cover"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div className="sm:col-span-2">
            <Label className="text-xs">Prompt (optional)</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Short instructions for the AI, e.g. focus on the action in progress..."
              className="mt-1 min-h-[44px]"
            />
          </div>
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
          {question ? 'Regenerate' : 'Generate'}
        </Button>

        {question && (
          <div className="space-y-2 rounded-lg border bg-slate-50 p-3 text-sm">
            {question.questionText && (
              <p className="font-medium">{question.questionText}</p>
            )}
            {question.transcript && (
              <pre className="whitespace-pre-wrap rounded bg-white p-2 text-xs text-slate-600">
                {question.transcript}
              </pre>
            )}
            <ul className="space-y-0.5">
              {question.options.map((o) => (
                <li
                  key={o.label}
                  className={
                    o.label === question.correctAnswer
                      ? 'text-green-600 font-medium'
                      : ''
                  }
                >
                  {o.label}.{' '}
                  {o.text || <em className="text-slate-400">(spoken)</em>}
                </li>
              ))}
            </ul>
            {question.explanation && (
              <p className="text-xs text-slate-500">{question.explanation}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleApply} disabled={!question}>
            <Check className="h-4 w-4 mr-1" />
            Apply to question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
