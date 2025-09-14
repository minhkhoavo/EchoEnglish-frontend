import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react'; // prettier-ignore
import type { AudioPlayerState } from '../../types/pronunciation.types';

interface AudioPlayerProps {
  audioUrl: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TranscriptAudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  currentTime: externalCurrentTime,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: false,
  });

  // Sync external currentTime with audio element
  useEffect(() => {
    if (audioRef.current && externalCurrentTime !== undefined) {
      const timeDifference = Math.abs(
        audioRef.current.currentTime - externalCurrentTime / 1000
      );
      if (timeDifference > 0.1) {
        // Only seek if difference is significant
        audioRef.current.currentTime = externalCurrentTime / 1000;
      }
    }
  }, [externalCurrentTime]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime * 1000; // Convert to milliseconds
      setPlayerState((prev: AudioPlayerState) => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    }
  }, [onTimeUpdate]);

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const duration = audioRef.current.duration * 1000; // Convert to milliseconds
      setPlayerState((prev: AudioPlayerState) => ({ ...prev, duration }));
      onDurationChange?.(duration);
    }
  }, [onDurationChange]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (playerState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [playerState.isPlaying]);

  // Seek to specific time
  const seekTo = useCallback(
    (timeInMs: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = timeInMs / 1000;
        setPlayerState((prev: AudioPlayerState) => ({
          ...prev,
          currentTime: timeInMs,
        }));
        onTimeUpdate?.(timeInMs);
      }
    },
    [onTimeUpdate]
  );

  // Skip forward/backward
  const skipForward = useCallback(() => {
    const newTime = Math.min(
      playerState.currentTime + 5000,
      playerState.duration
    );
    seekTo(newTime);
  }, [playerState.currentTime, playerState.duration, seekTo]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(playerState.currentTime - 5000, 0);
    seekTo(newTime);
  }, [playerState.currentTime, seekTo]);

  // Volume control
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newVolume = playerState.volume > 0 ? 0 : 1;
      audioRef.current.volume = newVolume;
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        volume: newVolume,
      }));
    }
  }, [playerState.volume]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setPlayerState((prev: AudioPlayerState) => ({ ...prev, volume }));
    }
  }, []);

  // Progress bar interaction
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (progressRef.current && playerState.duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * playerState.duration;
        seekTo(newTime);
      }
    },
    [playerState.duration, seekTo]
  );

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        isPlaying: true,
      }));
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        isPlaying: false,
      }));
      onPlayStateChange?.(false);
    };

    const handleLoadStart = () => {
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        isLoading: true,
      }));
    };

    const handleCanPlay = () => {
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        isLoading: false,
      }));
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setPlayerState((prev: AudioPlayerState) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load audio',
      }));
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, onPlayStateChange]);

  const progressPercentage =
    playerState.duration > 0
      ? (playerState.currentTime / playerState.duration) * 100
      : 0;

  return (
    <div className={`bg-gray-50 border-b border-gray-200 p-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center space-x-4">
        {/* Main Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={skipBackward}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Backward 5s"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={playerState.isLoading}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
          >
            {playerState.isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playerState.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-sm text-gray-600 font-mono min-w-[100px]">
          {formatTime(playerState.currentTime / 1000)} /{' '}
          {formatTime(playerState.duration / 1000)}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center space-x-3">
          <div
            ref={progressRef}
            className="relative w-full bg-gray-300 rounded-full h-2 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 bg-blue-500 h-2 rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-sm cursor-pointer"
              style={{
                left: `calc(${progressPercentage}% - 6px)`,
                opacity: progressPercentage > 0 ? 1 : 0,
              }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {playerState.volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerState.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {playerState.error && (
        <div className="mt-2 text-sm text-red-500">{playerState.error}</div>
      )}
    </div>
  );
};

export default TranscriptAudioPlayer;
