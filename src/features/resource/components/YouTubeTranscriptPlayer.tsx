import React, { useState, useRef, useEffect } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptSegment {
  text: string;
  start: number;
  duration?: number;
  end?: number;
}

interface YouTubeTranscriptPlayerProps {
  videoUrl: string;
  transcript: TranscriptSegment[];
  className?: string;
}

const YouTubeTranscriptPlayer: React.FC<YouTubeTranscriptPlayerProps> = ({
  videoUrl,
  transcript,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerRef = useRef<{
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    getCurrentTime: () => number;
  } | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from URL
  const getVideoId = (url: string): string => {
    const match = url.match(/(?:embed\/|v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const videoId = getVideoId(videoUrl);

  // YouTube player options
  const opts: YouTubeProps['opts'] = {
    height: '500',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      fs: 0,
    },
  };

  // Update current time and active segment
  useEffect(() => {
    const updateCurrentTime = () => {
      if (playerRef.current && isPlaying) {
        try {
          if (playerRef.current.getCurrentTime) {
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);

            // Find active transcript segment
            const activeIndex = transcript.findIndex(
              (segment) =>
                time >= segment.start &&
                time <= (segment.end || segment.start + (segment.duration || 0))
            );

            if (activeIndex !== -1 && activeIndex !== activeSegmentIndex) {
              setActiveSegmentIndex(activeIndex);

              // Auto-scroll to active segment
              if (transcriptContainerRef.current) {
                const activeElement =
                  transcriptContainerRef.current.querySelector(
                    `[data-segment-index="${activeIndex}"]`
                  ) as HTMLElement;

                if (activeElement) {
                  activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating current time:', error);
        }
      }
    };

    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(updateCurrentTime, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, transcript, activeSegmentIndex]);

  // YouTube player event handlers
  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setPlayerError(null); // Clear any previous errors
  };

  const onError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube player error:', event);
    setPlayerError(
      'Failed to load video. Please check your network connection.'
    );
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    setIsPlaying(event.data === 1);
  };

  // Seek to specific time when clicking transcript segment
  const handleSegmentClick = (segment: TranscriptSegment, index: number) => {
    if (playerRef.current) {
      try {
        if (playerRef.current.seekTo) {
          playerRef.current.seekTo(segment.start, true);
          setActiveSegmentIndex(index);
        }
      } catch (error) {
        console.error('Error seeking to time:', error);
      }
    }
  };

  // Player controls
  const handlePlayPause = () => {
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error controlling video playback:', error);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Invalid YouTube URL provided
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 min-h-[500px]">
          {/* Video Player - Left Side */}
          <div className="bg-black flex items-center justify-center">
            {playerError ? (
              <div className="text-center p-8">
                <div className="text-red-400 mb-4">{playerError}</div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Watch on YouTube
                </a>
              </div>
            ) : (
              <div className="w-full">
                <YouTube
                  videoId={videoId}
                  opts={opts}
                  onReady={onReady}
                  onError={onError}
                  onStateChange={onStateChange}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Transcript - Right Side */}
          <div className="border-l">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Interactive Transcript
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on any sentence to jump to that part of the video
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  className="ml-4"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {transcript && transcript.length > 0 ? (
              <div
                ref={transcriptContainerRef}
                className="h-[400px] overflow-y-auto p-4 space-y-2"
              >
                {transcript.map((segment, index) => (
                  <div
                    key={index}
                    data-segment-index={index}
                    onClick={() => handleSegmentClick(segment, index)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 border-l-4',
                      activeSegmentIndex === index
                        ? 'bg-blue-100 border-blue-500 shadow-sm'
                        : 'bg-gray-50 border-transparent hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-gray-500 min-w-[60px] mt-0.5 bg-gray-200 px-2 py-1 rounded">
                        {formatTime(segment.start)}
                      </span>
                      <p
                        className={cn(
                          'text-sm leading-relaxed flex-1',
                          activeSegmentIndex === index
                            ? 'text-blue-900 font-medium'
                            : 'text-gray-700'
                        )}
                        dangerouslySetInnerHTML={{ __html: segment.text }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-gray-500">
                <div className="text-center">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transcript available for this video</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeTranscriptPlayer;
