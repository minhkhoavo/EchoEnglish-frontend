import { X, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/core/store/store';

interface QuizHeaderProps {
  onClose: () => void;
}

export const QuizHeader = ({ onClose }: QuizHeaderProps) => {
  const { activeQuiz, currentQuestionIndex, timeLeft } = useAppSelector((state) => state.quiz);

  if (!activeQuiz) return null;

  const currentQ = activeQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl">{activeQuiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{activeQuiz.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress and Timer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4" />
            <span className={cn(
              "font-mono",
              timeLeft < 60 && "text-red-500"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <Badge variant="outline" className="w-fit">
          {currentQ.type.toUpperCase()}
        </Badge>
      </div>
    </CardHeader>
  );
};
