import { Play, Pause, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { setIsPlayingAudio } from '../slices/quizSlice';
import { useState } from 'react';

interface MediaPlayerProps {
  audio: string;
  audioId: string;
  className?: string;
}

export const MediaPlayer = ({ audio, audioId, className }: MediaPlayerProps) => {
  const dispatch = useAppDispatch();
  const { isPlayingAudio } = useAppSelector((state) => state.quiz);
  const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);

  const playAudio = (audioUrl: string, id: string) => {
    if (currentAudioElement) {
      currentAudioElement.pause();
      dispatch(setIsPlayingAudio({ audioId: currentAudioElement.id, isPlaying: false }));
    }

    const audio = new Audio(audioUrl);
    audio.id = id;
    audio.addEventListener('ended', () => {
      dispatch(setIsPlayingAudio({ audioId: id, isPlaying: false }));
      setCurrentAudioElement(null);
    });
    
    audio.play();
    setCurrentAudioElement(audio);
    dispatch(setIsPlayingAudio({ audioId: id, isPlaying: true }));
  };

  const stopAudio = (id: string) => {
    if (currentAudioElement && currentAudioElement.id === id) {
      currentAudioElement.pause();
      setCurrentAudioElement(null);
    }
    dispatch(setIsPlayingAudio({ audioId: id, isPlaying: false }));
  };

  return (
    <div className={cn("flex items-center space-x-2 p-2 bg-muted/30 rounded-lg", className)}>
      <Headphones className="h-4 w-4 text-primary" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => isPlayingAudio[audioId] ? stopAudio(audioId) : playAudio(audio, audioId)}
        className="h-8 w-8 p-0"
      >
        {isPlayingAudio[audioId] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <span className="text-sm text-muted-foreground">
        {isPlayingAudio[audioId] ? 'Playing...' : 'Click to play'}
      </span>
    </div>
  );
};
