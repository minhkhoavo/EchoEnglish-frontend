import React, { useState, useCallback, useRef } from 'react';
import { Play, Filter, X, MousePointerClick } from 'lucide-react';
import TranscriptAudioPlayer from './TranscriptAudioPlayer';
import PronunciationWord from './PronunciationWord';
import PronunciationPopup from './PronunciationPopup';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  toggleErrorFilter,
  setAllErrorFilters,
  setShowErrorFilter,
  selectVisibleErrorTypes,
} from '../../slices/speechAnalyzerSlice';
import type { ErrorFilterSettings } from '../../slices/speechAnalyzerSlice';
import type {
  TranscriptData,
  TranscriptSegment,
  WordPronunciation,
} from '../../types/pronunciation.types';

interface WordFeatures {
  clickToSeek: boolean;
  showAccuracyColors: boolean;
  showStressMarking: boolean;
  showErrorHighlight: boolean;
  showTooltip: boolean;
  emphasizeStress: boolean;
  visibleErrorTypes: Set<string>;
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
  const dispatch = useAppDispatch();
  const { errorFilter, showErrorFilter } = useAppSelector(
    (state) => state.speechAnalyzer
  );
  const visibleErrorTypes = useAppSelector(selectVisibleErrorTypes);
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

  // Handle error filter toggle
  const handleErrorFilterToggle = useCallback(
    (errorType: keyof ErrorFilterSettings) => {
      dispatch(toggleErrorFilter(errorType));
    },
    [dispatch]
  );

  // Handle select all/none error filters
  const handleSelectAllErrors = useCallback(() => {
    dispatch(setAllErrorFilters(true));
  }, [dispatch]);

  const handleSelectNoneErrors = useCallback(() => {
    dispatch(setAllErrorFilters(false));
  }, [dispatch]);

  // Calculate overall statistics
  const overallStats = React.useMemo(() => {
    if (!transcriptData) {
      return {
        totalWords: 0,
        totalErrors: 0,
        averageAccuracy: 0,
        totalSegments: 0,
        errorBreakdown: {},
        filteredErrorBreakdown: {},
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

    // Calculate filtered error breakdown
    const filteredErrorBreakdown = Object.entries(errorBreakdown)
      .filter(
        ([errorType]) => errorFilter[errorType as keyof ErrorFilterSettings]
      )
      .reduce(
        (acc, [errorType, count]) => {
          acc[errorType] = count;
          return acc;
        },
        {} as Record<string, number>
      );

    return {
      totalWords,
      totalErrors,
      averageAccuracy: Math.round(averageAccuracy),
      totalSegments: transcriptData.segments.length,
      errorBreakdown,
      filteredErrorBreakdown,
    };
  }, [transcriptData, errorFilter]);

  const wordFeatures = {
    clickToSeek: mergedFeatures.enableWordClickToSeek,
    showAccuracyColors: mergedFeatures.showAccuracyColors,
    showStressMarking: true,
    showErrorHighlight: true,
    showTooltip: false, // We use popup instead
    emphasizeStress: false,
    visibleErrorTypes,
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
          <h3 className="text-lg font-bold text-gray-800">Speech Analysis</h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {transcriptData.metadata.language} •{' '}
              {transcriptData.metadata.assessmentType}
            </div>
            <div className="relative">
              <button
                onClick={() => dispatch(setShowErrorFilter(!showErrorFilter))}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter Errors
              </button>

              {/* Error Filter Dropdown */}
              {showErrorFilter && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Error Types</h4>
                      <button
                        onClick={() => dispatch(setShowErrorFilter(false))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={handleSelectAllErrors}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleSelectNoneErrors}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Select None
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          key: 'mispronunciation',
                          label: 'Mispronunciation',
                          color: 'text-orange-600',
                          icon: '🔄',
                        },
                        {
                          key: 'omission',
                          label: 'Omission',
                          color: 'text-red-600',
                          icon: '❌',
                        },
                        {
                          key: 'insertion',
                          label: 'Insertion',
                          color: 'text-purple-600',
                          icon: '➕',
                        },
                        {
                          key: 'unexpected_break',
                          label: 'Unexpected Break',
                          color: 'text-blue-600',
                          icon: '⏸️',
                        },
                        {
                          key: 'missing_break',
                          label: 'Missing Break',
                          color: 'text-green-600',
                          icon: '⏩',
                        },
                        {
                          key: 'monotone',
                          label: 'Monotone',
                          color: 'text-gray-600',
                          icon: '📏',
                        },
                      ].map(({ key, label, color, icon }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              errorFilter[key as keyof ErrorFilterSettings]
                            }
                            onChange={() =>
                              handleErrorFilterToggle(
                                key as keyof ErrorFilterSettings
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{icon}</span>
                          <span className={`text-sm font-medium ${color}`}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
        {Object.keys(overallStats.filteredErrorBreakdown).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Error Analysis (Filtered):
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(overallStats.filteredErrorBreakdown).map(
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
      <div className="bg-gray-50 p-5 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Accuracy Colors */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Accuracy Colors
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Excellent (90%+)',
                  dot: 'bg-green-500',
                  pill: 'bg-green-50 text-green-700 border-green-200',
                },
                {
                  label: 'Good (70-89%)',
                  dot: 'bg-blue-500',
                  pill: 'bg-blue-50 text-blue-700 border-blue-200',
                },
                {
                  label: 'Fair (50-69%)',
                  dot: 'bg-yellow-500',
                  pill: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                },
                {
                  label: 'Needs Practice (<50%)',
                  dot: 'bg-red-500',
                  pill: 'bg-red-50 text-red-700 border-red-200',
                },
              ].map(({ label, dot, pill }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pill}`}
                >
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  {label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium">
                <span className="font-bold">ˈ</span> Stressed word
              </span>
            </div>
          </div>

          {/* Error Types */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Error Types
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  icon: '🔄',
                  label: 'Mispronunciation',
                  pill: 'bg-orange-50 text-orange-700 border-orange-200',
                },
                {
                  icon: '❌',
                  label: 'Omission',
                  pill: 'bg-red-50 text-red-700 border-red-200',
                },
                {
                  icon: '➕',
                  label: 'Insertion',
                  pill: 'bg-purple-50 text-purple-700 border-purple-200',
                },
                {
                  icon: '⏸️',
                  label: 'Unexpected break',
                  pill: 'bg-blue-50 text-blue-700 border-blue-200',
                },
                {
                  icon: '⏩',
                  label: 'Missing break',
                  pill: 'bg-green-50 text-green-700 border-green-200',
                },
                {
                  icon: '📏',
                  label: 'Monotone',
                  pill: 'bg-gray-100 text-gray-700 border-gray-200',
                },
              ].map(({ icon, label, pill }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pill}`}
                >
                  <span>{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200">
          <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
          Click any word to jump to that moment and see detailed pronunciation
          analysis
        </div>
      </div>
    </div>
  );
};

export default Transcript;
