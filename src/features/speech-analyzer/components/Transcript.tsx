import React, { useState, useCallback, useRef } from 'react';
import { Play } from 'lucide-react';
import TranscriptAudioPlayer from './TranscriptAudioPlayer';
import PronunciationWord from './PronunciationWord';
import PronunciationPopup from './PronunciationPopup';
import type {
  TranscriptData,
  TranscriptSegment,
  WordPronunciation,
} from '../types/pronunciation.types';

interface WordFeatures {
  clickToSeek: boolean;
  showAccuracyColors: boolean;
  showStressMarking: boolean;
  showErrorHighlight: boolean;
  showTooltip: boolean;
  emphasizeStress: boolean;
}

interface TranscriptProps {
  transcriptData?: TranscriptData;
  className?: string;
  features?: {
    enableWordClickToSeek?: boolean;
    showAccuracyColors?: boolean;
    autoScrollToCurrentSegment?: boolean;
  };
}

interface TranscriptSegmentProps {
  segment: TranscriptSegment;
  isActive: boolean;
  onWordClick: (offset: number) => void;
  onSegmentPlay: (startTime: number) => void;
  currentTime: number;
  wordFeatures: WordFeatures;
  audioUrl?: string;
}

const defaultFeatures = {
  enableWordClickToSeek: true,
  showAccuracyColors: true,
  autoScrollToCurrentSegment: true,
};

const formatTimeFromMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const TranscriptSegmentComponent: React.FC<TranscriptSegmentProps> = ({
  segment,
  isActive,
  onWordClick,
  onSegmentPlay,
  currentTime,
  wordFeatures,
  audioUrl,
}) => {
  const [selectedWord, setSelectedWord] = useState<WordPronunciation | null>(
    null
  );
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const segmentRef = useRef<HTMLDivElement>(null);

  const handleWordClick = useCallback(
    (word: WordPronunciation, event: React.MouseEvent) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setSelectedWord(word);
      onWordClick(word.offset);
    },
    [onWordClick]
  );

  const handleSegmentPlay = useCallback(() => {
    onSegmentPlay(segment.startTime);
  }, [onSegmentPlay, segment.startTime]);

  const closePopup = useCallback(() => {
    setSelectedWord(null);
  }, []);

  // Check if current time is within this segment
  const isCurrentSegment =
    currentTime >= segment.startTime && currentTime <= segment.endTime;

  // Find currently playing word
  const currentWordIndex = segment.words.findIndex(
    (word) =>
      currentTime >= word.offset && currentTime <= word.offset + word.duration
  );

  return (
    <div
      ref={segmentRef}
      className={`mb-6 p-4 rounded-lg border-2 ${
        isActive || isCurrentSegment
          ? 'border-blue-300 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Segment Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSegmentPlay}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="font-mono">
              {formatTimeFromMs(segment.startTime)}
            </span>
          </button>

          {/* Segment accuracy */}
          <div className="text-sm">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                segment.overallAccuracy >= 90
                  ? 'bg-green-100 text-green-700'
                  : segment.overallAccuracy >= 70
                    ? 'bg-blue-100 text-blue-700'
                    : segment.overallAccuracy >= 50
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {segment.overallAccuracy}% accuracy
            </span>
          </div>
        </div>

        {/* Segment stats */}
        <div className="text-xs text-gray-500">
          {segment.words.length} words •{' '}
          {formatTimeFromMs(segment.endTime - segment.startTime)} duration
        </div>
      </div>

      {/* Words */}
      <div className="text-base leading-relaxed">
        {segment.words.map((word, index) => {
          const isCurrentWord = index === currentWordIndex;

          return (
            <React.Fragment key={`${segment.id}-word-${index}`}>
              <span
                className={`inline-block ${
                  isCurrentWord ? 'bg-yellow-200 font-medium' : ''
                }`}
                onClick={(e) => handleWordClick(word, e)}
              >
                <PronunciationWord
                  wordData={word}
                  onWordClick={onWordClick}
                  features={wordFeatures}
                  className="mx-0.5"
                />
              </span>
              {index < segment.words.length - 1 && ' '}
            </React.Fragment>
          );
        })}
      </div>

      {/* Popup */}
      {selectedWord && (
        <PronunciationPopup
          wordData={selectedWord}
          position={popupPosition}
          isVisible={true}
          audioUrl={audioUrl}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

const Transcript: React.FC<TranscriptProps> = ({
  transcriptData,
  className = '',
  features = defaultFeatures,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const mergedFeatures = { ...defaultFeatures, ...features };
  // Handle time updates from audio player
  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
      if (!transcriptData) return;
      const currentSegment = transcriptData.segments.find(
        (segment) => time >= segment.startTime && time <= segment.endTime
      );

      if (currentSegment && currentSegment.id !== activeSegmentId) {
        setActiveSegmentId(currentSegment.id);
        if (
          mergedFeatures.autoScrollToCurrentSegment &&
          transcriptRef.current
        ) {
          const segmentElement = transcriptRef.current.querySelector(
            `[data-segment-id="${currentSegment.id}"]`
          );
          if (segmentElement) {
            segmentElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }
    },
    [activeSegmentId, transcriptData, mergedFeatures.autoScrollToCurrentSegment]
  );

  // Handle word click to seek
  const handleWordClick = useCallback(
    (offset: number) => {
      if (mergedFeatures.enableWordClickToSeek) {
        setCurrentTime(offset);
      }
    },
    [mergedFeatures.enableWordClickToSeek]
  );

  // Handle segment play
  const handleSegmentPlay = useCallback((startTime: number) => {
    setCurrentTime(startTime);
  }, []);

  // Calculate overall statistics
  const overallStats = React.useMemo(() => {
    if (!transcriptData) {
      return {
        totalWords: 0,
        totalErrors: 0,
        averageAccuracy: 0,
        totalSegments: 0,
        errorBreakdown: {},
      };
    }

    const totalWords = transcriptData.segments.reduce(
      (sum, segment) => sum + segment.words.length,
      0
    );
    const totalErrors = transcriptData.segments.reduce(
      (sum, segment) =>
        sum +
        segment.words.reduce(
          (wordSum, word) => wordSum + word.errors.length,
          0
        ),
      0
    );
    const averageAccuracy =
      transcriptData.segments.reduce(
        (sum, segment) => sum + segment.overallAccuracy,
        0
      ) / transcriptData.segments.length;

    // Calculate error type breakdown
    const errorBreakdown = transcriptData.segments.reduce(
      (breakdown, segment) => {
        segment.words.forEach((word) => {
          word.errors.forEach((error) => {
            breakdown[error.type] = (breakdown[error.type] || 0) + 1;
          });
        });
        return breakdown;
      },
      {} as Record<string, number>
    );

    return {
      totalWords,
      totalErrors,
      averageAccuracy: Math.round(averageAccuracy),
      totalSegments: transcriptData.segments.length,
      errorBreakdown,
    };
  }, [transcriptData]);

  const wordFeatures = {
    clickToSeek: mergedFeatures.enableWordClickToSeek,
    showAccuracyColors: mergedFeatures.showAccuracyColors,
    showStressMarking: true,
    showErrorHighlight: true,
    showTooltip: false, // We use popup instead
    emphasizeStress: true,
  };

  if (!transcriptData) {
    return (
      <div
        className={`mt-5 bg-white rounded-xl border-2 border-purple-100 overflow-hidden ${className}`}
      >
        <div className="p-6 text-center text-gray-600">
          <div className="text-lg font-medium mb-2">
            No transcript data available
          </div>
          <div className="text-sm">
            Recording details are loading or the recording has no transcript
            yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-5 bg-white rounded-xl border-2 border-purple-100 overflow-hidden ${className}`}
    >
      {/* Audio Player */}
      <TranscriptAudioPlayer
        audioUrl={transcriptData.audioUrl}
        currentTime={currentTime}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Header with stats */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800">
            Pronunciation Analysis
          </h3>
          <div className="text-sm text-gray-600">
            {transcriptData.metadata.language} •{' '}
            {transcriptData.metadata.assessmentType}
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded p-2">
            <div className="text-xl font-bold text-blue-600">
              {overallStats.averageAccuracy}%
            </div>
            <div className="text-xs text-gray-600">Overall Accuracy</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-xl font-bold text-green-600">
              {overallStats.totalWords}
            </div>
            <div className="text-xs text-gray-600">Total Words</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-xl font-bold text-orange-600">
              {overallStats.totalErrors}
            </div>
            <div className="text-xs text-gray-600">Issues Found</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-xl font-bold text-purple-600">
              {overallStats.totalSegments}
            </div>
            <div className="text-xs text-gray-600">Segments</div>
          </div>
        </div>

        {/* Error breakdown */}
        {overallStats.totalErrors > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Error Analysis:
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(overallStats.errorBreakdown).map(
                ([errorType, count]) => (
                  <div
                    key={errorType}
                    className="bg-white rounded px-2 py-1 border border-gray-200"
                  >
                    <span
                      className={`text-xs font-medium ${
                        errorType === 'mispronunciation'
                          ? 'text-orange-600'
                          : errorType === 'omission'
                            ? 'text-red-600'
                            : errorType === 'insertion'
                              ? 'text-purple-600'
                              : errorType === 'unexpected_break'
                                ? 'text-blue-600'
                                : errorType === 'missing_break'
                                  ? 'text-green-600'
                                  : errorType === 'monotone'
                                    ? 'text-gray-600'
                                    : 'text-gray-600'
                      }`}
                    >
                      {errorType.replace('_', ' ')}: {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transcript Content */}
      <div
        ref={transcriptRef}
        className="p-6 max-h-96 overflow-y-auto scrollbar-hide"
      >
        <h4 className="font-bold text-base mb-4 text-gray-700">
          Transcript with Pronunciation Analysis
        </h4>

        {transcriptData.segments.map((segment) => (
          <div key={segment.id} data-segment-id={segment.id}>
            <TranscriptSegmentComponent
              segment={segment}
              isActive={activeSegmentId === segment.id}
              onWordClick={handleWordClick}
              onSegmentPlay={handleSegmentPlay}
              currentTime={currentTime}
              wordFeatures={wordFeatures}
              audioUrl={transcriptData.audioUrl}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2">Legend:</div>

          {/* Color Legend */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Accuracy Colors:
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span>
                <span className="text-green-700 font-medium">●</span> Excellent
                (90%+)
              </span>
              <span>
                <span className="text-blue-700 font-medium">●</span> Good
                (70-89%)
              </span>
              <span>
                <span className="text-yellow-600 font-medium">●</span> Fair
                (50-69%)
              </span>
              <span>
                <span className="text-red-600 font-medium">●</span> Needs
                Practice (&lt;50%)
              </span>
              <span>
                <span className="text-purple-600 font-medium">ˈ</span> Stressed
                word
              </span>
            </div>
          </div>

          {/* Error Types Legend */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Error Types:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <span>
                <span className="text-orange-600">🔄</span> Mispronunciation
              </span>
              <span>
                <span className="text-red-600">❌</span> Omission
              </span>
              <span>
                <span className="text-purple-600">➕</span> Insertion
              </span>
              <span>
                <span className="text-blue-600">⏸️</span> Unexpected break
              </span>
              <span>
                <span className="text-green-600">⏩</span> Missing break
              </span>
              <span>
                <span className="text-gray-600">📏</span> Monotone
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Click any word to jump to that moment • Click words for detailed
            pronunciation analysis
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcript;
