import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';
import type { SpeakingQuestionProps } from '@/features/tests/types/speaking-test.types';
import { Loader2, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  updateQuestionPhase,
  updateQuestionTime,
  markQuestionSubmitted,
  nextQuestion,
  initQuestionState,
} from '@/features/tests/slices/speakingExamSlice';
import { useSubmitSpeakingQuestionMutation } from '@/features/tests/services/speakingAttemptApi';

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

// Audio context for pip sounds
const audioContext = new (window.AudioContext ||
  (window as typeof window & { webkitAudioContext: typeof AudioContext })
    .webkitAudioContext)();

const playPipSound = (frequency: number = 800, duration: number = 200) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration / 1000
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
};

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
  onBlobRecorded,
}) => {
  const dispatch = useAppDispatch();
  const { examMode, questionStates, isAutoFlow, playPipSounds } =
    useAppSelector((state) => state.speakingExam);
  const [submitSpeakingQuestion] = useSubmitSpeakingQuestionMutation();

  // Get current question state from Redux or initialize
  const questionState = questionStates[question.id] || {
    id: question.id,
    phase: 'idle',
    preparationTimeLeft: question.time_to_think,
    recordingTimeLeft: question.limit_time,
    hasAudio: false,
  };

  // Use Redux state for phase and timing
  const currentPhase = questionState.phase;
  const preparationTimeLeft = questionState.preparationTimeLeft;
  const responseTimeLeft = questionState.recordingTimeLeft;

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const autoFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Initialize refs from question props to avoid referencing block-scoped
  // Redux variables before they're declared during module evaluation.
  const preparationTimeRef = useRef<number>(question.time_to_think ?? 0);
  const responseTimeRef = useRef<number>(question.limit_time ?? 0);
  const audioResumedRef = useRef<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Map Redux phase to component phase
  const componentPhase =
    currentPhase === 'recording'
      ? ('response' as const)
      : currentPhase === 'submitted'
        ? ('completed' as const)
        : (currentPhase as 'idle' | 'preparation' | 'completed');

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoFlowTimeoutRef.current) {
        clearTimeout(autoFlowTimeoutRef.current);
      }
    };
  }, [question.id]);

  // Keep refs in sync with latest redux values so interval callbacks use fresh numbers
  useEffect(() => {
    preparationTimeRef.current = preparationTimeLeft;
  }, [preparationTimeLeft]);

  useEffect(() => {
    responseTimeRef.current = responseTimeLeft;
  }, [responseTimeLeft]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      try {
        window.clearInterval(timerRef.current);
      } catch (e) {
        clearInterval(Number(timerRef.current));
      }
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        onBlobRecorded?.(question.id, blob);

        // Auto-submit in exam mode
        if (testAttemptId) {
          try {
            await submitSpeakingQuestion({
              testAttemptId,
              questionNumber: absoluteQuestionNumber ?? 0,
              file: blob,
            }).unwrap();

            dispatch(
              markQuestionSubmitted({
                questionId: question.id,
                hasAudio: true,
              })
            );

            if (playPipSounds) {
              playPipSound(600, 300);
            }

            if ((examMode === 'exam' && isAutoFlow) || examMode === 'normal') {
              setTimeout(() => dispatch(nextQuestion()), 1500);
            }

            toast.success('Question submitted successfully');
          } catch (error) {
            console.error('Failed to submit:', error);
            toast.error('Failed to submit recording');
            if ((examMode === 'exam' && isAutoFlow) || examMode === 'normal') {
              dispatch(
                markQuestionSubmitted({
                  questionId: question.id,
                  hasAudio: true,
                })
              );
              setTimeout(() => dispatch(nextQuestion()), 1500);
            }
          }
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      dispatch(
        updateQuestionPhase({ questionId: question.id, phase: 'recording' })
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [
    dispatch,
    question.id,
    onBlobRecorded,
    testAttemptId,
    absoluteQuestionNumber,
    examMode,
    isAutoFlow,
    playPipSounds,
    submitSpeakingQuestion,
  ]);

  // Helper function to handle timeout logic
  const handleTimeout = useCallback(() => {
    clearTimer();

    // Stop recording if still active
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (e) {
      // ignore stop errors
    }

    // Handle auto-flow modes
    if ((examMode === 'exam' && isAutoFlow) || examMode === 'normal') {
      if (recordedBlob && testAttemptId) {
        // Submit will be handled by onstop callback
      } else {
        dispatch(
          markQuestionSubmitted({
            questionId: question.id,
            hasAudio: !!recordedBlob,
          })
        );
        setTimeout(() => dispatch(nextQuestion()), 1500);
      }
    } else {
      dispatch(
        updateQuestionPhase({ questionId: question.id, phase: 'completed' })
      );
    }
  }, [
    clearTimer,
    examMode,
    isAutoFlow,
    recordedBlob,
    testAttemptId,
    dispatch,
    question.id,
  ]);

  // Generic timer function
  const createTimer = useCallback(
    (
      timeRef: React.MutableRefObject<number>,
      onTick: (time: number) => void,
      onTimeout: () => void,
      pipFrequency: number = 800
    ) => {
      clearTimer();
      audioResumedRef.current = false;

      timerRef.current = window.setInterval(() => {
        const newTime = Math.max(0, timeRef.current - 1);
        timeRef.current = newTime;
        onTick(newTime);

        if (playPipSounds && newTime > 2) {
          try {
            if (
              !audioResumedRef.current &&
              audioContext.state === 'suspended'
            ) {
              void audioContext.resume();
              audioResumedRef.current = true;
            }
            playPipSound(pipFrequency, 100);
          } catch (e) {
            // ignore
          }
        }

        if (newTime <= 0) {
          clearTimer();
          onTimeout();
        }
      }, 1000) as unknown as number;
    },
    [clearTimer, playPipSounds]
  );

  const startResponseTimer = useCallback(() => {
    createTimer(
      responseTimeRef,
      (time) =>
        dispatch(
          updateQuestionTime({ questionId: question.id, recordingTime: time })
        ),
      () => setTimeout(handleTimeout, 350)
    );
  }, [createTimer, dispatch, question.id, handleTimeout]);

  const handleStartPreparation = useCallback(() => {
    if (currentPhase !== 'idle') return;

    dispatch(
      updateQuestionPhase({ questionId: question.id, phase: 'preparation' })
    );
    if (playPipSounds) playPipSound(800, 200);

    createTimer(
      preparationTimeRef,
      (time) =>
        dispatch(
          updateQuestionTime({ questionId: question.id, preparationTime: time })
        ),
      () => {
        dispatch(
          updateQuestionPhase({ questionId: question.id, phase: 'recording' })
        );
        if (playPipSounds) playPipSound(1000, 200);

        if ((examMode === 'exam' && isAutoFlow) || examMode === 'normal') {
          setTimeout(() => {
            startRecording();
            startResponseTimer();
          }, 500);
        } else {
          startResponseTimer();
        }
      }
    );
  }, [
    currentPhase,
    dispatch,
    question.id,
    playPipSounds,
    createTimer,
    examMode,
    isAutoFlow,
    startRecording,
    startResponseTimer,
  ]);

  // Auto-start preparation in exam mode
  useEffect(() => {
    if (examMode === 'exam' && isAutoFlow && currentPhase === 'idle') {
      autoFlowTimeoutRef.current = setTimeout(() => {
        handleStartPreparation();
      }, 1000);
    }
  }, [examMode, isAutoFlow, currentPhase, handleStartPreparation]);

  const handleManualStartRecording = useCallback(() => {
    if (currentPhase === 'recording' && !isRecording) {
      startRecording();
    } else if (currentPhase === 'recording' && isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  }, [currentPhase, isRecording, startRecording]);

  const handleRecordAgain = useCallback(() => {
    setRecordedBlob(null);
    if (currentPhase === 'recording') {
      dispatch(
        updateQuestionPhase({ questionId: question.id, phase: 'preparation' })
      );
    } else {
      dispatch(
        updateQuestionPhase({ questionId: question.id, phase: 'recording' })
      );
    }
    dispatch(
      updateQuestionTime({
        questionId: question.id,
        recordingTime: question.limit_time || 60,
      })
    );
    startResponseTimer();
  }, [
    dispatch,
    question.id,
    question.limit_time,
    startResponseTimer,
    currentPhase,
  ]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleNewRecording = () => {
    setRecordedBlob(null);
    startRecording();
  };

  // Initialize question state in Redux
  useEffect(() => {
    dispatch(
      initQuestionState({
        questionId: question.id,
        preparationTime: question.time_to_think ?? 0,
        recordingTime: question.limit_time ?? 0,
      })
    );
  }, [dispatch, question.id, question.time_to_think, question.limit_time]);

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
          currentPhase={componentPhase}
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
            currentPhase={componentPhase}
            isRecording={isRecording}
            recordedBlob={recordedBlob}
            responseTimeLeft={
              typeof responseTimeLeft === 'number' ? responseTimeLeft : 0
            }
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onRecordAgain={handleRecordAgain}
            preparationTime={
              typeof question.time_to_think === 'number'
                ? question.time_to_think
                : 0
            }
          />

          {(currentPhase === 'completed' ||
            (examMode === 'exam' && questionState.phase === 'submitted')) &&
            recordedBlob && (
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

          {/* File upload for manual submission */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !testAttemptId) return;

              try {
                setIsSubmitting(true);
                await submitSpeakingQuestion({
                  testAttemptId,
                  questionNumber: absoluteQuestionNumber ?? 0,
                  file,
                }).unwrap();

                dispatch(
                  markQuestionSubmitted({
                    questionId: question.id,
                    hasAudio: true,
                  })
                );

                if (playPipSounds) {
                  playPipSound(600, 300);
                }

                toast.success('File uploaded and submitted successfully');
              } catch (error) {
                console.error('Failed to submit file:', error);
                toast.error('Failed to submit file');
              } finally {
                setIsSubmitting(false);
                // Reset input
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isSubmitting || !testAttemptId}
              title="Upload an audio file manually for this question"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload File
                </span>
              )}
            </Button>
          </div>
        </div>
        <AnswerDisplay
          currentPhase={componentPhase}
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
