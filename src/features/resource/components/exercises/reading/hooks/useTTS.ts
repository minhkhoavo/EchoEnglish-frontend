import { useState, useRef, useCallback, useEffect } from 'react';

interface TTSOptions {
  baseUrl?: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  autoPlay?: boolean;
}

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  currentText: string | null;
  error: Error | null;
  progress: number; // 0-100
}

interface UseTTSReturn {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentText: string | null;
  error: Error | null;

  // Actions
  play: (text: string) => Promise<void>;
  playMultiple: (texts: string[], delayBetween?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;

  // Utilities
  getTTSUrl: (text: string) => string;
  preload: (text: string) => void;
}

const DEFAULT_TTS_URL = 'https://classmate-vuive.vn/tts';

export const useTTS = (options: TTSOptions = {}): UseTTSReturn => {
  const { baseUrl = DEFAULT_TTS_URL, onComplete, onError } = options;

  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    currentText: null,
    error: null,
    progress: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const isQueuePlayingRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    // Only initialize once
    if (audioRef.current) return;

    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.addEventListener('playing', () => {
      setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
    });

    audio.addEventListener('pause', () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    });

    audio.addEventListener('ended', () => {
      setState((prev) => ({ ...prev, isPlaying: false, currentText: null }));
      onComplete?.();
    });

    audio.addEventListener('error', (e) => {
      const error = new Error('Failed to load audio');
      setState((prev) => ({
        ...prev,
        error,
        isLoading: false,
        isPlaying: false,
      }));
      onError?.(error);
    });

    audio.addEventListener('loadstart', () => {
      setState((prev) => ({ ...prev, isLoading: true }));
    });

    audio.addEventListener('canplaythrough', () => {
      setState((prev) => ({ ...prev, isLoading: false }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  /**
   * Generate TTS URL for text
   */
  const getTTSUrl = useCallback(
    (text: string): string => {
      return `${baseUrl}?text=${encodeURIComponent(text)}`;
    },
    [baseUrl]
  );

  /**
   * Play TTS for a single text
   */
  const play = useCallback(
    async (text: string): Promise<void> => {
      if (!audioRef.current || !text.trim()) {
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
          currentText: text,
        }));

        audioRef.current.src = getTTSUrl(text);
        await audioRef.current.play();
      } catch (error) {
        // AbortError is expected when play() is interrupted by pause/stop
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Clear loading state but don't treat as error
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const err =
          error instanceof Error ? error : new Error('Playback failed');
        setState((prev) => ({ ...prev, error: err, isLoading: false }));
        onError?.(err);
        throw err;
      }
    },
    [getTTSUrl, onError]
  );

  /**
   * Play multiple texts in sequence
   */
  const playMultiple = useCallback(
    async (texts: string[], delayBetween: number = 500): Promise<void> => {
      if (isQueuePlayingRef.current) return;

      queueRef.current = [...texts];
      isQueuePlayingRef.current = true;

      const playNext = async (): Promise<void> => {
        if (queueRef.current.length === 0) {
          isQueuePlayingRef.current = false;
          return;
        }

        const text = queueRef.current.shift()!;

        return new Promise((resolve) => {
          const handleEnded = async () => {
            audioRef.current?.removeEventListener('ended', handleEnded);

            if (queueRef.current.length > 0) {
              await new Promise((r) => setTimeout(r, delayBetween));
              await playNext();
            }
            resolve();
          };

          audioRef.current?.addEventListener('ended', handleEnded);
          play(text).catch(() => {
            audioRef.current?.removeEventListener('ended', handleEnded);
            resolve();
          });
        });
      };

      try {
        await playNext();
      } finally {
        isQueuePlayingRef.current = false;
      }
    },
    [play]
  );

  /**
   * Pause current playback
   */
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  /**
   * Resume paused playback
   */
  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  /**
   * Stop playback and clear queue
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    queueRef.current = [];
    isQueuePlayingRef.current = false;
    setState((prev) => ({ ...prev, isPlaying: false, currentText: null }));
  }, []);

  /**
   * Preload audio for faster playback
   */
  const preload = useCallback(
    (text: string) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = getTTSUrl(text);
    },
    [getTTSUrl]
  );

  return {
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    currentText: state.currentText,
    error: state.error,
    play,
    playMultiple,
    pause,
    resume,
    stop,
    getTTSUrl,
    preload,
  };
};

/**
 * Hook for managing TTS in reading exercises with segment support
 */
interface UseExerciseTTSOptions {
  segments: string[];
  onSegmentComplete?: (index: number) => void;
  autoAdvance?: boolean;
}

interface UseExerciseTTSReturn extends UseTTSReturn {
  currentSegmentIndex: number;
  playSegment: (index: number) => Promise<void>;
  playAllSegments: () => Promise<void>;
  nextSegment: () => void;
  prevSegment: () => void;
}

export const useExerciseTTS = (
  options: UseExerciseTTSOptions
): UseExerciseTTSReturn => {
  const { segments, onSegmentComplete, autoAdvance = false } = options;
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const tts = useTTS({
    onComplete: () => {
      onSegmentComplete?.(currentSegmentIndex);
      if (autoAdvance && currentSegmentIndex < segments.length - 1) {
        setCurrentSegmentIndex((prev) => prev + 1);
      }
    },
  });

  const playSegment = useCallback(
    async (index: number) => {
      if (index >= 0 && index < segments.length) {
        setCurrentSegmentIndex(index);
        await tts.play(segments[index]);
      }
    },
    [segments, tts]
  );

  const playAllSegments = useCallback(async () => {
    setCurrentSegmentIndex(0);
    await tts.playMultiple(segments, 800);
  }, [segments, tts]);

  const nextSegment = useCallback(() => {
    if (currentSegmentIndex < segments.length - 1) {
      const newIndex = currentSegmentIndex + 1;
      setCurrentSegmentIndex(newIndex);
      tts.play(segments[newIndex]);
    }
  }, [currentSegmentIndex, segments, tts]);

  const prevSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      const newIndex = currentSegmentIndex - 1;
      setCurrentSegmentIndex(newIndex);
      tts.play(segments[newIndex]);
    }
  }, [currentSegmentIndex, segments, tts]);

  return {
    ...tts,
    currentSegmentIndex,
    playSegment,
    playAllSegments,
    nextSegment,
    prevSegment,
  };
};

export default useTTS;
