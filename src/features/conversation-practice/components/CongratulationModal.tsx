import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy,
  Star,
  Sparkles,
  PartyPopper,
  ArrowRight,
  RotateCcw,
  Home,
  CheckCircle,
} from 'lucide-react';
import type { ConversationTopic, ChecklistItem } from '../types';

interface CongratulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ConversationTopic | null;
  checklist: ChecklistItem[];
  onTryAnother: () => void;
  onGoHome: () => void;
}

// Simple confetti component
const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: [
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#8B5CF6',
              ][Math.floor(Math.random() * 5)],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

const CongratulationModal: React.FC<CongratulationModalProps> = ({
  isOpen,
  onClose,
  topic,
  checklist,
  onTryAnother,
  onGoHome,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!topic) return null;

  const completedTasks = checklist.filter((item) => item.isCompleted);

  return (
    <>
      <Confetti show={showConfetti && isOpen} />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl max-h-[90vh] p-0 overflow-hidden">
          <ScrollArea className="max-h-[90vh]">
            <div className="text-center p-6">
              {/* Trophy Animation */}
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-20" />
                <div className="relative w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <Star className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
              </div>

              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  <PartyPopper className="w-5 h-5 text-amber-500" />
                  Congratulations!
                  <PartyPopper className="w-5 h-5 text-amber-500 scale-x-[-1]" />
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3">
                    <p className="text-slate-600 text-sm">
                      You've successfully completed the conversation!
                    </p>

                    {/* Topic Info */}
                    <div className="bg-slate-50 rounded-xl p-3 text-left">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 text-xs"
                      >
                        {completedTasks.length}/{checklist.length} Tasks
                        Completed
                      </Badge>
                    </div>

                    {/* Completed Tasks */}
                    <div className="text-left">
                      <h5 className="text-xs font-medium text-slate-700 mb-2">
                        What you practiced:
                      </h5>
                      <div className="space-y-1.5">
                        {topic.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600">
                              {task.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 py-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {topic.estimatedMinutes}
                        </div>
                        <div className="text-xs text-slate-500">Minutes</div>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-emerald-600">
                          {checklist.length}
                        </div>
                        <div className="text-xs text-slate-500">Tasks</div>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-amber-600">
                          +50
                        </div>
                        <div className="text-xs text-slate-500">XP Earned</div>
                      </div>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={onTryAnother}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Try Another Topic
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onGoHome}
                    className="flex-1 rounded-xl py-4 border-slate-300 text-sm"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 rounded-xl py-4 border-slate-300 text-sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Practice Again
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CongratulationModal;
