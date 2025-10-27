import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { SpeakingQuestionProps } from '@/features/tests/types/speaking-test.types';
import { Loader2, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { goToQuestion } from '@/features/tests/slices/speakingExamSlice';
import { useSubmitSpeakingQuestionMutation } from '@/features/tests/services/speakingAttemptApi';
import { AudioPlayer } from '@/components/AudioPlayer';

// Import shared components
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

type QuestionPhase = 'idle' | 'preparation' | 'response' | 'completed';

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
  // Get uploaded status from backend data - this is the source of truth
  uploadedAudioUrl,
}) => {
  const dispatch = useAppDispatch();
  const { examMode, playPipSounds, currentQuestionIndex, currentPartIndex } =
    useAppSelector((state) => state.speakingExam);
  const [submitSpeakingQuestion] = useSubmitSpeakingQuestionMutation();

  // Local loading state for this specific question
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  // Check if already uploaded based on backend data
  const isAlreadyUploaded = !!uploadedAudioUrl;
  const isViewOnlyMode = isAlreadyUploaded;

  // Local component state only - no state management, backend is source of truth
  const [currentPhase, setCurrentPhase] = useState<QuestionPhase>(
    isAlreadyUploaded ? 'completed' : 'idle'
  );
  const [preparationTimeLeft, setPreparationTimeLeft] = useState(
    question.time_to_think ?? 0
  );
  const [responseTimeLeft, setResponseTimeLeft] = useState(
    question.limit_time ?? 60
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showIdea, setShowIdea] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const autoFlowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preparationTimeRef = useRef<number>(question.time_to_think ?? 0);
  const responseTimeRef = useRef<number>(question.limit_time ?? 0);
  const audioResumedRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoFlowTimeoutRef.current) {
        clearTimeout(autoFlowTimeoutRef.current);
        autoFlowTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset refs and state when question changes or component re-mounts
  useEffect(() => {
    preparationTimeRef.current = question.time_to_think ?? 0;
    responseTimeRef.current = question.limit_time ?? 60;
    setPreparationTimeLeft(question.time_to_think ?? 0);
    setResponseTimeLeft(question.limit_time ?? 60);

    // Reset phase based on uploaded status - this is critical for resume
    const newPhase = isAlreadyUploaded ? 'completed' : 'idle';
    setCurrentPhase(newPhase);
  }, [
    question.id,
    question.time_to_think,
    question.limit_time,
    isAlreadyUploaded,
  ]);

  // Keep refs in sync with state
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

        // Auto-submit recording
        if (testAttemptId && !isAlreadyUploaded) {
          try {
            const result = await submitSpeakingQuestion({
              testAttemptId,
              questionNumber: absoluteQuestionNumber ?? 0,
              file: blob,
            }).unwrap();

            setCurrentPhase('completed');
            if (playPipSounds) {
              playPipSound(600, 300);
            }

            toast.success('Recording uploaded successfully');
            console.log('Recording submitted:', result);

            // Auto move to next question after short delay in exam mode
            if (examMode === 'exam') {
              setTimeout(
                () =>
                  dispatch(
                    goToQuestion({ questionIndex: currentQuestionIndex + 1 })
                  ),
                1500
              );
            }
          } catch (error) {
            console.error('Failed to submit recording:', error);
            toast.error('Failed to upload recording');
            // Still move to next question in exam mode
            if (examMode === 'exam') {
              setTimeout(
                () =>
                  dispatch(
                    goToQuestion({ questionIndex: currentQuestionIndex + 1 })
                  ),
                1500
              );
            }
          }
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [
    question.id,
    onBlobRecorded,
    testAttemptId,
    absoluteQuestionNumber,
    playPipSounds,
    submitSpeakingQuestion,
    dispatch,
    isAlreadyUploaded,
    currentQuestionIndex,
    examMode,
  ]);

  const handleTimeout = useCallback(() => {
    clearTimer();

    // Stop recording if still active
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (e) {
      // ignore
    }

    setCurrentPhase('completed');
  }, [clearTimer]);

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
      (time) => setResponseTimeLeft(time),
      () => setTimeout(handleTimeout, 350)
    );
  }, [createTimer, handleTimeout]);

  const handleStartPreparation = useCallback(() => {
    if (currentPhase !== 'idle') return;

    setCurrentPhase('preparation');
    if (playPipSounds) playPipSound(800, 200);

    createTimer(
      preparationTimeRef,
      (time) => setPreparationTimeLeft(time),
      () => {
        setCurrentPhase('response');
        if (playPipSounds) playPipSound(1000, 200);

        // Auto-start recording in exam mode
        if (examMode === 'exam') {
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
    playPipSounds,
    createTimer,
    examMode,
    startRecording,
    startResponseTimer,
  ]);

  // Auto-start preparation in exam mode ONLY (not in practice mode)
  // This ensures each question is independent in practice mode
  useEffect(() => {
    if (examMode === 'exam' && currentPhase === 'idle' && !isViewOnlyMode) {
      const timeoutId = setTimeout(() => {
        handleStartPreparation();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [examMode, currentPhase, isViewOnlyMode, handleStartPreparation]);

  const handleRecordAgain = useCallback(() => {
    setRecordedBlob(null);
    setCurrentPhase('response');
    setResponseTimeLeft(question.limit_time || 60);
    startResponseTimer();
  }, [question.limit_time, startResponseTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

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

        {isViewOnlyMode ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Recording submitted</span>
          </div>
        ) : (
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
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* View-only mode: Show playback of uploaded audio */}
        {isViewOnlyMode && uploadedAudioUrl && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Your Submitted Recording:</h4>
            <AudioPlayer audioUrl={uploadedAudioUrl} />
          </div>
        )}

        {/* Action Buttons - only show if not uploaded */}
        {!isViewOnlyMode && (
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
              onRecordAgain={handleRecordAgain}
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
              onToggleSampleAnswer={() =>
                setShowSampleAnswer(!showSampleAnswer)
              }
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
                if (!file || !testAttemptId) {
                  toast.error('Please wait for test to initialize');
                  return;
                }

                try {
                  setIsLocalSubmitting(true);
                  const result = await submitSpeakingQuestion({
                    testAttemptId,
                    questionNumber: absoluteQuestionNumber ?? 0,
                    file,
                  }).unwrap();

                  setCurrentPhase('completed');
                  if (playPipSounds) {
                    playPipSound(600, 300);
                  }

                  toast.success('File uploaded successfully');
                  console.log('File submitted:', result);

                  // Auto move to next question after short delay in exam mode
                  if (examMode === 'exam') {
                    setTimeout(
                      () =>
                        dispatch(
                          goToQuestion({
                            questionIndex: currentQuestionIndex + 1,
                          })
                        ),
                      1500
                    );
                  }
                } catch (error) {
                  console.error('Failed to submit file:', error);
                  toast.error('Failed to submit file');
                } finally {
                  setIsLocalSubmitting(false);
                  // Reset input
                  e.currentTarget.value = '';
                }
              }}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={
                  isLocalSubmitting || !testAttemptId || isAlreadyUploaded
                }
                title={
                  !testAttemptId
                    ? 'Test attempt ID not available'
                    : isAlreadyUploaded
                      ? 'Recording already uploaded'
                      : 'Upload an audio file manually for this question'
                }
              >
                {isLocalSubmitting ? (
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
        )}

        {!isViewOnlyMode && (
          <>
            <AnswerDisplay
              currentPhase={currentPhase}
              recordedBlob={recordedBlob}
              onRecordAgain={handleRecordAgain}
            />
            <RecordingPlayback recordedBlob={recordedBlob} />
          </>
        )}

        {/* Helper sections - available in both modes */}
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
