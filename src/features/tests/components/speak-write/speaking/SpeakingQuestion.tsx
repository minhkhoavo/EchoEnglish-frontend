import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';
import type { SpeakingQuestionProps } from '@/features/tests/types/speaking-test.types';
import { Loader2, Upload } from 'lucide-react';

// Import new shared components
import { QuestionTimer } from '../QuestionTimer';
import { RecordingControls } from '../RecordingControls';
import { HelperButtons } from '../HelperButtons';
import {
  IdeasDisplay,
  SampleAnswerDisplay,
  AnswerDisplay,
} from '../AnswerDisplays';
import { RecordingPlayback } from '../RecordingPlayback';
import { QuestionHeader } from '../QuestionHeader';
import { toast } from 'sonner';

export const SpeakingQuestion: React.FC<SpeakingQuestionProps> = ({
  question,
  partTitle,
  questionIndex,
  totalQuestions,
  onAnswer,
  userAnswer = '',
  isReviewMode = false,
  absoluteQuestionNumber,
  testAttemptId,
  onSubmitRecording,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [preparationTimeLeft, setPreparationTimeLeft] = useState(
    question.time_to_think
  );
  const [responseTimeLeft, setResponseTimeLeft] = useState(question.limit_time);
  const [currentPhase, setCurrentPhase] = useState<
    'idle' | 'preparation' | 'response' | 'completed'
  >('idle');
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [hasStartedPreparation, setHasStartedPreparation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const continueResponseTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setResponseTimeLeft((prev) => {
        const safePrev = typeof prev === 'number' ? prev : 0;
        if (safePrev <= 1) {
          clearTimer();
          if (isRecording && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
          setCurrentPhase('completed');
          return 0;
        }
        return safePrev - 1;
      });
    }, 1000);
  }, [isRecording, clearTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const safeResponseTimeLeft =
        typeof responseTimeLeft === 'number' ? responseTimeLeft : 0;
      if (currentPhase === 'response' && safeResponseTimeLeft > 0) {
        continueResponseTimer();
      }
    }
  }, [isRecording, currentPhase, responseTimeLeft, continueResponseTimer]);

  useEffect(() => {
    if (currentPhase === 'completed' && recordedBlob) {
      // Auto-save logic if needed
    }
  }, [currentPhase, recordedBlob, question.id]);

  const handleStartPreparation = () => {
    if (hasStartedPreparation || currentPhase !== 'idle') {
      return;
    }

    setHasStartedPreparation(true);
    setCurrentPhase('preparation');
    clearTimer();

    timerRef.current = setInterval(() => {
      setPreparationTimeLeft((prev) => {
        const safePrev = typeof prev === 'number' ? prev : 0;
        if (safePrev <= 1) {
          clearTimer();
          setCurrentPhase('response');
          startResponseTimer();
          return 0;
        }
        return safePrev - 1;
      });
    }, 1000);
  };

  const startResponseTimer = () => {
    clearTimer();
    startRecording();

    timerRef.current = setInterval(() => {
      setResponseTimeLeft((prev) => {
        const safePrev = typeof prev === 'number' ? prev : 0;
        if (safePrev <= 1) {
          clearTimer();
          if (isRecording && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
          setCurrentPhase('completed');
          return 0;
        }
        return safePrev - 1;
      });
    }, 1000);
  };

  const handleRecordAgain = () => {
    setRecordedBlob(null);
    if (currentPhase === 'completed') {
      setCurrentPhase('response');
      setResponseTimeLeft(question.limit_time);
      startResponseTimer();
    } else if (currentPhase === 'response') {
      startRecording();
    }
  };

  const handleNewRecording = () => {
    setRecordedBlob(null);
    startRecording();
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmitRecorded = async () => {
    if (!recordedBlob || !absoluteQuestionNumber || !onSubmitRecording) return;
    try {
      setIsSubmitting(true);
      await onSubmitRecording({
        questionNumber: absoluteQuestionNumber,
        file: recordedBlob,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-l-4 border-cyan-500">
      <CardHeader>
        <QuestionHeader
          absoluteQuestionNumber={absoluteQuestionNumber}
          questionIndex={questionIndex}
          title={question.title}
          audioUrl={question.audio || undefined}
          imageUrl={question.image || undefined}
        />

        <QuestionTimer
          currentPhase={currentPhase}
          preparationTime={
            typeof question.time_to_think === 'number'
              ? question.time_to_think
              : 0
          }
          responseTime={
            typeof question.limit_time === 'number' ? question.limit_time : 0
          }
          preparationTimeLeft={
            typeof preparationTimeLeft === 'number' ? preparationTimeLeft : 0
          }
          responseTimeLeft={
            typeof responseTimeLeft === 'number' ? responseTimeLeft : 0
          }
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {currentPhase === 'idle' && (
            <Button onClick={handleStartPreparation} className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Start Preparation ({question.time_to_think}s)
            </Button>
          )}

          <RecordingControls
            currentPhase={currentPhase}
            isRecording={isRecording}
            recordedBlob={recordedBlob}
            responseTimeLeft={
              typeof responseTimeLeft === 'number' ? responseTimeLeft : 0
            }
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onRecordAgain={handleNewRecording}
            preparationTime={
              typeof question.time_to_think === 'number'
                ? question.time_to_think
                : 0
            }
          />

          {currentPhase === 'completed' && recordedBlob && (
            <Button
              onClick={handleRecordAgain}
              variant="outline"
              className="flex-1"
            >
              Record Again
            </Button>
          )}

          <HelperButtons
            hasIdea={!!question.idea}
            hasSampleAnswer={!!question.sample_answer}
            showIdea={showIdea}
            showSampleAnswer={showSampleAnswer}
            showSuggestions={false}
            onToggleIdea={() => setShowIdea(!showIdea)}
            onToggleSampleAnswer={() => setShowSampleAnswer(!showSampleAnswer)}
            onToggleSuggestions={() => {}}
          />

          {/* Submit button (only when attemptId present) */}
          {testAttemptId && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmitRecorded}
                variant="default"
                disabled={!recordedBlob || isSubmitting}
                title={!recordedBlob ? 'Record first to enable submit' : ''}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting
                  </span>
                ) : (
                  'Submit Answer'
                )}
              </Button>
            </div>
          )}

          {/* TEMP testing helper: manual upload ALWAYS VISIBLE */}
          {/* NOTE: This helper is intentionally always visible for quick QA. Remove later. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (onSubmitRecording && absoluteQuestionNumber) {
                // If backend is wired, call it
                try {
                  setIsSubmitting(true);
                  await onSubmitRecording({
                    questionNumber: absoluteQuestionNumber,
                    file,
                  });
                } finally {
                  setIsSubmitting(false);
                }
              } else {
                // No backend handler - load file locally for playback and show info toast
                const blob = file;
                setRecordedBlob(blob);
                toast(
                  'Loaded audio locally for playback (no backend submit configured)',
                  { duration: 4000 }
                );
              }
              // reset so same file can be selected again
              e.currentTarget.value = '';
            }}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isSubmitting}
              title="Temporary helper to upload an audio file manually for this question"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload (temp)
                </span>
              )}
            </Button>
          </div>
        </div>
        <AnswerDisplay
          currentPhase={currentPhase}
          recordedBlob={recordedBlob}
          onRecordAgain={handleRecordAgain}
        />
        <RecordingPlayback recordedBlob={recordedBlob} />

        <IdeasDisplay idea={question.idea || ''} show={showIdea} />

        <SampleAnswerDisplay
          sampleAnswer={question.sample_answer || ''}
          show={showSampleAnswer}
        />

        {/* Notes for Review Mode */}
        {isReviewMode && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Notes:</label>
            <Textarea
              value={userAnswer}
              onChange={(e) => onAnswer?.(question.id, e.target.value)}
              placeholder="Add your notes about this question..."
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
