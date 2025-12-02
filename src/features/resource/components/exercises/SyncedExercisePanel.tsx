import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Volume2,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PenLine,
  BookOpen,
  ListChecks,
  Mic2,
  Shuffle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptSegment } from '../../types/resource.type';
import { DifficultyLevel, ExerciseType } from '../../types/exercise.type';
import { compareAnswers } from '../../utils/exerciseGenerator';

// ============================================================================
// TYPES
// ============================================================================

interface SyncedExercisePanelProps {
  transcript: TranscriptSegment[];
  currentSegmentIndex: number;
  onPlaySegment: (startTime: number, endTime?: number) => void;
  onSeek: (time: number) => void;
  onNavigateSegment: (index: number) => void;
  className?: string;
}

type ExerciseMode =
  | 'dictation'
  | 'fill_blanks'
  | 'quiz'
  | 'shadowing'
  | 'word_order';

interface ExerciseState {
  answered: boolean;
  correct: boolean;
  userAnswer: string[] | string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const cleanText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (text: string): string[] => {
  return cleanText(text)
    .split(/\s+/)
    .filter((w) => w.length > 0);
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'and',
  'but',
  'or',
  'so',
  'yet',
  'not',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'this',
  'that',
  'these',
  'those',
]);

const isContentWord = (word: string): boolean => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  return cleaned.length > 2 && !STOP_WORDS.has(cleaned);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SyncedExercisePanel: React.FC<SyncedExercisePanelProps> = ({
  transcript,
  currentSegmentIndex,
  onPlaySegment,
  onSeek,
  onNavigateSegment,
  className,
}) => {
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>('dictation');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    DifficultyLevel.MEDIUM
  );
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    answered: false,
    correct: false,
    userAnswer: null,
  });

  // For dictation/fill blanks
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [inputResults, setInputResults] = useState<(boolean | null)[]>([]);

  // For quiz
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // For word order
  const [selectedWords, setSelectedWords] = useState<
    { id: string; word: string }[]
  >([]);
  const [availableWords, setAvailableWords] = useState<
    { id: string; word: string }[]
  >([]);

  // For shadowing
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentSegment = transcript[currentSegmentIndex];
  const words = useMemo(
    () => (currentSegment ? tokenize(currentSegment.text) : []),
    [currentSegment]
  );

  // Generate exercise data based on mode
  const exerciseData = useMemo(() => {
    if (!currentSegment || words.length < 3) return null;

    const hiddenRatio =
      difficulty === DifficultyLevel.EASY
        ? 0.2
        : difficulty === DifficultyLevel.MEDIUM
          ? 0.35
          : 0.5;
    const hiddenCount = Math.max(1, Math.floor(words.length * hiddenRatio));

    // Find content word indices
    const contentIndices = words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => isContentWord(w))
      .map(({ i }) => i);

    // Select which words to hide
    const indicesToHide =
      contentIndices.length >= hiddenCount
        ? shuffleArray(contentIndices).slice(0, hiddenCount)
        : shuffleArray(words.map((_, i) => i)).slice(0, hiddenCount);

    // For quiz - pick one word and create options
    const targetIndex =
      contentIndices.length > 0
        ? contentIndices[Math.floor(Math.random() * contentIndices.length)]
        : Math.floor(Math.random() * words.length);

    const targetWord = words[targetIndex];
    const allWords = transcript
      .flatMap((s) => tokenize(s.text))
      .filter(isContentWord);
    const distractors = shuffleArray([
      ...new Set(
        allWords.filter((w) => w.toLowerCase() !== targetWord.toLowerCase())
      ),
    ]).slice(0, 3);
    const options = shuffleArray([targetWord, ...distractors]);

    // For word order
    const wordsWithId = words.map((word, i) => ({ id: `${i}-${word}`, word }));
    const shuffledWords = shuffleArray([...wordsWithId]);

    return {
      indicesToHide: indicesToHide.sort((a, b) => a - b),
      targetIndex,
      targetWord,
      options,
      wordsWithId,
      shuffledWords,
    };
  }, [currentSegment, words, difficulty, transcript]);

  // Reset state when segment or mode changes
  useEffect(() => {
    setExerciseState({ answered: false, correct: false, userAnswer: null });
    setUserInputs([]);
    setInputResults([]);
    setSelectedOption(null);
    setSelectedWords([]);
    setAvailableWords(exerciseData?.shuffledWords || []);
    setHasRecording(false);
    setIsRecording(false);
  }, [currentSegmentIndex, exerciseMode, exerciseData?.shuffledWords]);

  const handlePlayAudio = () => {
    if (currentSegment) {
      const endTime =
        currentSegment.end ||
        currentSegment.start + (currentSegment.duration || 5);
      onPlaySegment(currentSegment.start, endTime);
    }
  };

  const handleCheckAnswer = () => {
    if (!exerciseData) return;

    let isCorrect = false;

    switch (exerciseMode) {
      case 'dictation':
      case 'fill_blanks': {
        const results = exerciseData.indicesToHide.map((idx, i) =>
          compareAnswers(userInputs[i] || '', words[idx])
        );
        setInputResults(results);
        isCorrect = results.every((r) => r);
        break;
      }
      case 'quiz': {
        isCorrect =
          exerciseData.options[selectedOption!] === exerciseData.targetWord;
        break;
      }
      case 'word_order': {
        const userOrder = selectedWords.map((w) => w.word).join(' ');
        const correctOrder = words.join(' ');
        isCorrect = userOrder.toLowerCase() === correctOrder.toLowerCase();
        break;
      }
      case 'shadowing': {
        isCorrect = hasRecording;
        break;
      }
    }

    setExerciseState({ answered: true, correct: isCorrect, userAnswer: null });
  };

  const handleReset = () => {
    setExerciseState({ answered: false, correct: false, userAnswer: null });
    setUserInputs([]);
    setInputResults([]);
    setSelectedOption(null);
    setSelectedWords([]);
    setAvailableWords(exerciseData?.shuffledWords || []);
    setHasRecording(false);
  };

  const handleNextSegment = () => {
    if (currentSegmentIndex < transcript.length - 1) {
      onNavigateSegment(currentSegmentIndex + 1);
    }
  };

  const handlePrevSegment = () => {
    if (currentSegmentIndex > 0) {
      onNavigateSegment(currentSegmentIndex - 1);
    }
  };

  // Recording functions for shadowing
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        recordedAudioRef.current = new Audio(URL.createObjectURL(blob));
        setHasRecording(true);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  if (!currentSegment || !exerciseData) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-gray-500',
          className
        )}
      >
        <p>Play the video to start practicing</p>
      </div>
    );
  }

  // ============================================================================
  // RENDER EXERCISE CONTENT
  // ============================================================================

  const renderExerciseContent = () => {
    switch (exerciseMode) {
      case 'dictation':
      case 'fill_blanks': {
        const hiddenSet = new Set(exerciseData.indicesToHide);
        let inputIdx = 0;

        return (
          <div className="flex flex-wrap items-center gap-2 text-lg leading-loose">
            {words.map((word, idx) => {
              if (hiddenSet.has(idx)) {
                const currentInputIdx = inputIdx++;
                return (
                  <input
                    key={idx}
                    type="text"
                    value={userInputs[currentInputIdx] || ''}
                    onChange={(e) => {
                      const newInputs = [...userInputs];
                      newInputs[currentInputIdx] = e.target.value;
                      setUserInputs(newInputs);
                    }}
                    disabled={exerciseState.answered}
                    placeholder="..."
                    className={cn(
                      'px-2 py-1 border-b-2 text-center font-medium min-w-[60px] outline-none bg-transparent',
                      !exerciseState.answered &&
                        'border-blue-400 focus:border-blue-600',
                      exerciseState.answered &&
                        inputResults[currentInputIdx] &&
                        'border-green-500 text-green-700',
                      exerciseState.answered &&
                        !inputResults[currentInputIdx] &&
                        'border-red-500 text-red-700'
                    )}
                    style={{ width: `${Math.max(word.length * 12, 60)}px` }}
                  />
                );
              }
              return (
                <span key={idx} className="text-gray-800">
                  {word}
                </span>
              );
            })}
          </div>
        );
      }

      case 'quiz': {
        const questionWords = [...words];
        questionWords[exerciseData.targetIndex] = '______';

        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-800">{questionWords.join(' ')}</p>
            <div className="grid grid-cols-2 gap-2">
              {exerciseData.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    !exerciseState.answered && setSelectedOption(idx)
                  }
                  disabled={exerciseState.answered}
                  className={cn(
                    'p-3 rounded-lg border-2 font-medium transition-all',
                    !exerciseState.answered &&
                      selectedOption === idx &&
                      'border-blue-500 bg-blue-50',
                    !exerciseState.answered &&
                      selectedOption !== idx &&
                      'border-gray-200 hover:border-blue-300',
                    exerciseState.answered &&
                      opt === exerciseData.targetWord &&
                      'border-green-500 bg-green-50',
                    exerciseState.answered &&
                      selectedOption === idx &&
                      opt !== exerciseData.targetWord &&
                      'border-red-500 bg-red-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'word_order': {
        return (
          <div className="space-y-4">
            {/* Selected words */}
            <div className="bg-gray-50 p-3 rounded-lg min-h-[50px] flex flex-wrap gap-2">
              {selectedWords.length > 0 ? (
                selectedWords.map((w, idx) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      if (!exerciseState.answered) {
                        setSelectedWords(
                          selectedWords.filter((_, i) => i !== idx)
                        );
                        setAvailableWords([...availableWords, w]);
                      }
                    }}
                    disabled={exerciseState.answered}
                    className={cn(
                      'px-3 py-1 rounded-lg border-2 font-medium',
                      !exerciseState.answered && 'bg-blue-100 border-blue-300',
                      exerciseState.answered &&
                        exerciseState.correct &&
                        'bg-green-100 border-green-300',
                      exerciseState.answered &&
                        !exerciseState.correct &&
                        'bg-red-100 border-red-300'
                    )}
                  >
                    {w.word}
                  </button>
                ))
              ) : (
                <span className="text-gray-400">
                  Click words to build the sentence
                </span>
              )}
            </div>

            {/* Available words */}
            {!exerciseState.answered && availableWords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableWords.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWords([...selectedWords, w]);
                      setAvailableWords(
                        availableWords.filter((aw) => aw.id !== w.id)
                      );
                    }}
                    className="px-3 py-1 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 font-medium"
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'shadowing': {
        return (
          <div className="space-y-4">
            <p className="text-lg text-gray-800 text-center">
              "{cleanText(currentSegment.text)}"
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handlePlayAudio}>
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic2
                  className={cn('w-4 h-4 mr-2', isRecording && 'animate-pulse')}
                />
                {isRecording ? 'Stop' : 'Record'}
              </Button>
              {hasRecording && (
                <Button
                  variant="outline"
                  onClick={() => recordedAudioRef.current?.play()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              )}
            </div>
            {hasRecording && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recording saved!</span>
              </div>
            )}
          </div>
        );
      }
    }
  };

  const canCheck = () => {
    switch (exerciseMode) {
      case 'dictation':
      case 'fill_blanks':
        return (
          userInputs.length === exerciseData.indicesToHide.length &&
          userInputs.every((i) => i.trim().length > 0)
        );
      case 'quiz':
        return selectedOption !== null;
      case 'word_order':
        return availableWords.length === 0;
      case 'shadowing':
        return hasRecording;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with mode selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select
            value={exerciseMode}
            onValueChange={(v) => setExerciseMode(v as ExerciseMode)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dictation">
                <span className="flex items-center gap-2">
                  <PenLine className="w-4 h-4" /> Dictation
                </span>
              </SelectItem>
              <SelectItem value="fill_blanks">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Fill Blanks
                </span>
              </SelectItem>
              <SelectItem value="quiz">
                <span className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Quiz
                </span>
              </SelectItem>
              <SelectItem value="shadowing">
                <span className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4" /> Shadowing
                </span>
              </SelectItem>
              <SelectItem value="word_order">
                <span className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4" /> Word Order
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as DifficultyLevel)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="hard">🔴 Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={handlePlayAudio}>
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Segment navigation */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevSegment}
          disabled={currentSegmentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <span className="text-sm text-gray-500">
            Sentence {currentSegmentIndex + 1} of {transcript.length}
          </span>
          <Badge variant="outline" className="ml-2">
            {formatTime(currentSegment.start)}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextSegment}
          disabled={currentSegmentIndex === transcript.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Exercise content */}
      <div className="bg-white border rounded-lg p-4">
        {renderExerciseContent()}
      </div>

      {/* Feedback */}
      {exerciseState.answered && (
        <div
          className={cn(
            'p-3 rounded-lg flex items-center gap-2',
            exerciseState.correct
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          )}
        >
          {exerciseState.correct ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Correct!
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" /> Incorrect. Answer:{' '}
              {cleanText(currentSegment.text)}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <div className="flex gap-2">
          {!exerciseState.answered ? (
            <Button onClick={handleCheckAnswer} disabled={!canCheck()}>
              <Check className="w-4 h-4 mr-1" />
              Check
            </Button>
          ) : (
            <Button
              onClick={handleNextSegment}
              disabled={currentSegmentIndex === transcript.length - 1}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncedExercisePanel;
