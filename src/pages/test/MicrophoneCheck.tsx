import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetSpeakingTestByIdQuery } from '@/features/tests/services/speakingTestApi';
import { useStartSpeakingAttemptMutation } from '@/features/tests/services/speakingAttemptApi';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const MicrophoneCheck: React.FC = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [micPermission, setMicPermission] = useState<
    'pending' | 'granted' | 'denied'
  >('pending');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [testAttemptId, setTestAttemptId] = useState<string | null>(null);
  const [isStartingTest, setIsStartingTest] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Get test data
  const {
    data: testData,
    error: testError,
    isLoading: isLoadingTest,
  } = useGetSpeakingTestByIdQuery(Number(testId!));

  const [startAttempt] = useStartSpeakingAttemptMutation();

  useEffect(() => {
    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setMicPermission('granted');
      setupAudioAnalyser(stream);
      toast.success('Microphone access granted');
    } catch (error) {
      console.error('Microphone access denied:', error);
      setMicPermission('denied');
      toast.error('Microphone access is required for the speaking test');
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);
    analyserRef.current = analyser;

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 128) * 100));

      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const startTestRecording = async () => {
    if (!streamRef.current) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setHasRecorded(true);
        toast.success('Test recording completed');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'recording'
        ) {
          stopTestRecording();
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start test recording');
    }
  };

  const stopTestRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playTestRecording = () => {
    if (recordedChunksRef.current.length === 0) return;

    const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(blob);

    if (testAudioRef.current) {
      testAudioRef.current.src = audioUrl;
      testAudioRef.current.play();
      setIsPlayingTest(true);

      testAudioRef.current.onended = () => {
        setIsPlayingTest(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const handleStartTest = async () => {
    if (!testData) return;

    setIsStartingTest(true);
    try {
      const res = await startAttempt({
        toeicSpeakingTestId: String(testData.testId ?? testId),
      }).unwrap();

      // Extract attempt ID from response
      let attemptId: string | undefined;
      const r: unknown = res;
      if (r && typeof r === 'object') {
        const obj = r as Record<string, unknown>;
        if (
          typeof obj.testAttemptId === 'string' ||
          typeof obj.testAttemptId === 'number'
        ) {
          attemptId = String(obj.testAttemptId);
        } else if (
          obj.data &&
          typeof obj.data === 'object' &&
          (obj.data as Record<string, unknown>).testAttemptId
        ) {
          attemptId = String(
            (obj.data as Record<string, unknown>).testAttemptId
          );
        } else if (obj._id) {
          attemptId = String(obj._id);
        } else if (obj.id) {
          attemptId = String(obj.id);
        }
      }

      if (attemptId) {
        setTestAttemptId(String(attemptId));
        toast.success('Test started successfully');
        // Navigate to speaking exam with test attempt ID
        navigate(`/test/speaking/${testId}/exam`, {
          state: {
            testAttemptId: attemptId,
            micReady: true,
          },
        });
      } else {
        throw new Error('Failed to get test attempt ID');
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to start test');
    } finally {
      setIsStartingTest(false);
    }
  };

  const canStartTest = micPermission === 'granted' && hasRecorded;

  if (isLoadingTest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading test...</span>
        </div>
      </div>
    );
  }

  if (testError || !testData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Unable to load speaking test. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Microphone Check
              </h1>
              <p className="text-sm text-muted-foreground">
                {testData.testTitle} - Speaking Test Setup
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Microphone Setup
              </CardTitle>
              <CardDescription>
                Please ensure your microphone is working properly before
                starting the speaking test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Microphone Permission */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      micPermission === 'granted'
                        ? 'bg-green-100 text-green-600'
                        : micPermission === 'denied'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {micPermission === 'granted' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : micPermission === 'denied' ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">1</span>
                    )}
                  </div>
                  <h3 className="font-medium">Grant microphone access</h3>
                </div>

                {micPermission === 'pending' && (
                  <Button onClick={requestMicrophoneAccess} className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Allow Microphone Access
                  </Button>
                )}

                {micPermission === 'denied' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      Microphone access was denied. Please check your browser
                      settings and reload the page.
                    </AlertDescription>
                  </Alert>
                )}

                {micPermission === 'granted' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Microphone access granted</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">Audio level:</span>
                      </div>
                      <Progress value={audioLevel} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Speak into your microphone to see the audio level
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Test Recording */}
              {micPermission === 'granted' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        hasRecorded
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {hasRecorded ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">2</span>
                      )}
                    </div>
                    <h3 className="font-medium">Test your microphone</h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Record a short test message to ensure your microphone is
                      working properly.
                    </p>

                    <div className="flex gap-2">
                      {!isRecording && !hasRecorded && (
                        <Button onClick={startTestRecording} variant="default">
                          <Mic className="h-4 w-4 mr-2" />
                          Start Test Recording
                        </Button>
                      )}

                      {isRecording && (
                        <Button
                          onClick={stopTestRecording}
                          variant="destructive"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording (Auto-stop in 5s)
                        </Button>
                      )}

                      {hasRecorded && (
                        <div className="flex gap-2">
                          <Button
                            onClick={playTestRecording}
                            variant="outline"
                            disabled={isPlayingTest}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isPlayingTest ? 'Playing...' : 'Play Recording'}
                          </Button>
                          <Button
                            onClick={startTestRecording}
                            variant="outline"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            Record Again
                          </Button>
                        </div>
                      )}
                    </div>

                    {hasRecorded && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Test recording completed successfully
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Start Test Button */}
              {canStartTest && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleStartTest}
                    className="w-full"
                    size="lg"
                    disabled={isStartingTest}
                  >
                    {isStartingTest ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Test...
                      </>
                    ) : (
                      'Start Speaking Test'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    You will have 20 minutes to complete the test
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden audio element for playback */}
        <audio ref={testAudioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default MicrophoneCheck;
