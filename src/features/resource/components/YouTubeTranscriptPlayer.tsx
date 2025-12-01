import React, { useState, useRef, useEffect, useCallback } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Volume2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyncedExercisePanel } from './exercises';
import type { TranscriptSegment } from '../types/resource.type';

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
  const [activeTab, setActiveTab] = useState<'transcript' | 'practice'>(
    'transcript'
  );
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

  // Play a specific segment (for exercises)
  const handlePlaySegment = useCallback(
    (startTime: number, endTime?: number) => {
      if (playerRef.current) {
        try {
          playerRef.current.seekTo(startTime, true);
          playerRef.current.playVideo();

          // Optionally pause at end time
          if (endTime) {
            const duration = (endTime - startTime) * 1000;
            setTimeout(() => {
              if (playerRef.current && isPlaying) {
                const currentT = playerRef.current.getCurrentTime();
                if (currentT >= endTime - 0.5) {
                  playerRef.current.pauseVideo();
                }
              }
            }, duration);
          }
        } catch (error) {
          console.error('Error playing segment:', error);
        }
      }
    },
    [isPlaying]
  );

  // Seek to specific time
  const handleSeek = useCallback((time: number) => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(time, true);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  }, []);

  // Navigate to specific segment (for synced exercises)
  const handleNavigateSegment = useCallback(
    (index: number) => {
      if (index >= 0 && index < transcript.length) {
        const segment = transcript[index];
        setActiveSegmentIndex(index);
        if (playerRef.current) {
          try {
            playerRef.current.seekTo(segment.start, true);
          } catch (error) {
            console.error('Error navigating to segment:', error);
          }
        }
      }
    },
    [transcript]
  );

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

          {/* Right Side - Tabs for Transcript and Practice */}
          <div className="border-l flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as 'transcript' | 'practice')
              }
              className="flex flex-col h-full"
            >
              {/* Tab Headers */}
              <div className="p-3 border-b bg-gray-50">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transcript" className="gap-2">
                    <Volume2 className="w-4 h-4" />
                    Transcript
                  </TabsTrigger>
                  <TabsTrigger value="practice" className="gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Practice
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Transcript Tab */}
              <TabsContent
                value="transcript"
                className="flex-1 m-0 overflow-hidden"
              >
                <div className="p-3 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Click on any sentence to jump to that part
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
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
                    className="h-[380px] overflow-y-auto p-4 space-y-2"
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
                  <div className="flex items-center justify-center h-[380px] text-gray-500">
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No transcript available for this video</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Practice Tab */}
              <TabsContent
                value="practice"
                className="flex-1 m-0 overflow-auto"
              >
                {transcript && transcript.length > 0 ? (
                  <div className="p-4 h-[430px] overflow-y-auto">
                    <SyncedExercisePanel
                      transcript={transcript}
                      currentSegmentIndex={
                        activeSegmentIndex >= 0 ? activeSegmentIndex : 0
                      }
                      onPlaySegment={handlePlaySegment}
                      onSeek={handleSeek}
                      onNavigateSegment={handleNavigateSegment}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[430px] text-gray-500">
                    <div className="text-center">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Transcript required for practice exercises</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeTranscriptPlayer;
