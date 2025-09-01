import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  Clock, 
  Users, 
  ChevronRight,
  BookOpen,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ContentItem } from '../types/content.types';

interface GenerateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem;
  onGenerate: (item: ContentItem, type: 'quiz' | 'flashcards', options?: { optionId: string }) => void;
  isGenerating: boolean;
}

interface GenerationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  estimatedTime?: string;
}

const quizOptions: GenerationOption[] = [
  {
    id: 'multiple-choice',
    label: 'Multiple Choice',
    description: 'Classic quiz format with 4 answer choices',
    icon: <Target className="h-5 w-5" />,
    badge: 'Popular',
    estimatedTime: '15-20 questions'
  },
  {
    id: 'fill-blank',
    label: 'Fill in the Blanks',
    description: 'Test comprehension with missing words',
    icon: <BookOpen className="h-5 w-5" />,
    estimatedTime: '10-15 questions'
  },
  {
    id: 'true-false',
    label: 'True or False',
    description: 'Quick assessment with binary choices',
    icon: <Zap className="h-5 w-5" />,
    estimatedTime: '20-25 questions'
  }
];

const flashcardOptions: GenerationOption[] = [
  {
    id: 'vocabulary',
    label: 'Vocabulary Cards',
    description: 'Key terms and definitions from content',
    icon: <BookOpen className="h-5 w-5" />,
    badge: 'Recommended',
    estimatedTime: '15-30 cards'
  },
  {
    id: 'concept',
    label: 'Concept Cards',
    description: 'Important concepts and explanations',
    icon: <Brain className="h-5 w-5" />,
    estimatedTime: '15-20 cards'
  }
];

export const GenerateContentDialog: React.FC<GenerateContentDialogProps> = ({
  open,
  onOpenChange,
  item,
  onGenerate,
  isGenerating
}) => {
  const [selectedType, setSelectedType] = useState<'quiz' | 'flashcards' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleGenerate = () => {
    if (selectedType && selectedOption) {
      onGenerate(item, selectedType, { optionId: selectedOption });
      onOpenChange(false);
      // Reset selections
      setSelectedType(null);
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    if (selectedOption) {
      setSelectedOption(null);
    } else {
      setSelectedType(null);
    }
  };

  const currentOptions = selectedType === 'quiz' ? quizOptions : flashcardOptions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogClose />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              Generate Learning Content
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Create personalized study materials from "{item.name}"
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Step 1: Choose Content Type */}
          {!selectedType && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What would you like to create?
                </h3>
                <p className="text-sm text-gray-600">
                  Choose the type of learning material that suits your study style
                </p>
              </div>

              <div className="grid gap-4">
                {/* Quiz Option */}
                <button
                  onClick={() => setSelectedType('quiz')}
                  className="group relative p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Interactive Quiz</h4>
                        {item.insights && (
                          <Badge variant="secondary" className="text-xs">
                            ~{item.insights.suggestedQuizzes} questions
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Test your knowledge with interactive questions and immediate feedback
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          15-30 min
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Performance tracking
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>

                {/* Flashcards Option */}
                <button
                  onClick={() => setSelectedType('flashcards')}
                  className="group relative p-5 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Study Flashcards</h4>
                        {item.insights && (
                          <Badge variant="secondary" className="text-xs">
                            ~{item.insights.suggestedFlashcards} cards
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Review key concepts with spaced repetition learning cards
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          10-20 min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Self-paced
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Specific Options */}
          {selectedType && !selectedOption && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Choose {selectedType === 'quiz' ? 'Quiz' : 'Flashcard'} Format
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select the format that matches your learning goals
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  ← Back
                </Button>
              </div>

              <div className="space-y-3">
                {currentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className="group w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${selectedType === 'quiz' ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-purple-100 group-hover:bg-purple-200'} transition-colors`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{option.label}</h4>
                          {option.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                        {option.estimatedTime && (
                          <p className="text-xs text-gray-500">{option.estimatedTime}</p>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 group-hover:text-${selectedType === 'quiz' ? 'blue' : 'purple'}-600 transition-colors`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {selectedType && selectedOption && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Ready to Generate</h3>
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  ← Back
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${selectedType === 'quiz' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {selectedType === 'quiz' ? <Brain className="h-5 w-5 text-blue-600" /> : <Sparkles className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {currentOptions.find(opt => opt.id === selectedOption)?.label}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {currentOptions.find(opt => opt.id === selectedOption)?.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Source: {item.name}</span>
                      <span>•</span>
                      <span>{currentOptions.find(opt => opt.id === selectedOption)?.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`flex-1 ${selectedType === 'quiz' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
