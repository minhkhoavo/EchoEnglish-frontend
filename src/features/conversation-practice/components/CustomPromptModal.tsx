import React, { useState } from 'react';
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
import { Sparkles, X } from 'lucide-react';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleClose = () => {
    setPrompt('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Create Custom Conversation</DialogTitle>
              <DialogDescription>
                Describe the conversation scenario you want to practice
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="custom-prompt"
              className="text-sm font-medium text-slate-700"
            >
              Your Prompt
            </label>
            <Textarea
              id="custom-prompt"
              placeholder="Example: I want to practice ordering food at a restaurant in a formal setting. The conversation should include asking about menu recommendations, dietary restrictions, and making a reservation."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">
              Be specific about the scenario, context, and what you want to
              practice.
            </p>
          </div>

          {/* Example prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Example prompts:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setPrompt(
                    'I want to practice a job interview for a software engineer position. Include questions about technical skills, past experience, and behavioral questions.'
                  )
                }
                className="w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                disabled={isLoading}
              >
                Job interview practice for software engineer
              </button>
              <button
                type="button"
                onClick={() =>
                  setPrompt(
                    'Practice negotiating a salary increase with my manager. I want to discuss my achievements and market rates.'
                  )
                }
                className="w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                disabled={isLoading}
              >
                Salary negotiation with manager
              </button>
              <button
                type="button"
                onClick={() =>
                  setPrompt(
                    'Help me practice making small talk at a business networking event. Include introductions, discussing industry trends, and exchanging contact information.'
                  )
                }
                className="w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                disabled={isLoading}
              >
                Business networking small talk
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? 'Starting...' : 'Start Conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPromptModal;
