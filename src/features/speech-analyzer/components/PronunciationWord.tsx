import React, { useState, useRef, useCallback } from 'react';
import type {
  WordPronunciation,
  AccuracyLevel,
} from '../types/pronunciation.types';

interface PronunciationWordProps {
  wordData: WordPronunciation;
  onWordClick?: (offset: number) => void;
  className?: string;
  features?: {
    clickToSeek?: boolean;
    showAccuracyColors?: boolean;
    showStressMarking?: boolean;
    showErrorHighlight?: boolean;
    showTooltip?: boolean;
    emphasizeStress?: boolean;
  };
}

const defaultFeatures = {
  clickToSeek: true,
  showAccuracyColors: true,
  showStressMarking: true,
  showErrorHighlight: true,
  showTooltip: true,
  emphasizeStress: true,
};

const ACCURACY_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
  poor: 0,
};

const getAccuracyLevel = (accuracy: number): AccuracyLevel => {
  if (accuracy >= ACCURACY_THRESHOLDS.excellent) return 'excellent';
  if (accuracy >= ACCURACY_THRESHOLDS.good) return 'good';
  if (accuracy >= ACCURACY_THRESHOLDS.fair) return 'fair';
  return 'poor';
};

const getAccuracyStyles = (
  level: AccuracyLevel,
  hasErrors: boolean
): string => {
  const baseStyles = 'cursor-pointer hover:opacity-80';

  if (hasErrors) {
    return `${baseStyles} text-red-600 underline decoration-red-400 decoration-2`;
  }

  switch (level) {
    case 'excellent':
      return `${baseStyles} text-green-700 hover:text-green-800`;
    case 'good':
      return `${baseStyles} text-blue-700 hover:text-blue-800`;
    case 'fair':
      return `${baseStyles} text-yellow-600 hover:text-yellow-700`;
    case 'poor':
      return `${baseStyles} text-red-600 hover:text-red-700`;
    default:
      return `${baseStyles} text-gray-700`;
  }
};

const getWordDisplayFormat = (
  wordData: WordPronunciation
): { displayText: string; styles: string; prefix?: string } => {
  let displayText = wordData.word;
  let styles = '';
  let prefix = '';

  const hasOmission = wordData.errors.some(
    (error) => error.type === 'omission'
  );
  const hasMissingBreak = wordData.errors.some(
    (error) => error.type === 'missing_break'
  );
  const hasInsertion = wordData.errors.some(
    (error) => error.type === 'insertion'
  );
  const hasUnexpectedBreak = wordData.errors.some(
    (error) => error.type === 'unexpected_break'
  );
  const hasMonotone = wordData.errors.some(
    (error) => error.type === 'monotone'
  );
  const hasMispronunciation = wordData.errors.some(
    (error) => error.type === 'mispronunciation'
  );

  if (hasOmission) {
    displayText = `[${wordData.word}]`;
    styles += ' line-through text-gray-500 italic bg-gray-100 px-1 rounded';
  } else if (hasInsertion) {
    prefix = '[+] ';
    styles += ' text-red-600 bg-red-100 px-1 rounded';
  } else if (hasUnexpectedBreak) {
    prefix = '[ ]';
    styles += ' text-pink-600';
  } else if (hasMissingBreak) {
    prefix = '[] ';
    styles += ' text-gray-500 border-b border-gray-400 border-dashed';
  } else if (hasMonotone) {
    styles += ' bg-purple-50 px-1 rounded opacity-75';
  } else if (hasMispronunciation) {
    styles += ' text-orange-600';
  }

  if (wordData.isDuplicated) {
    styles += ' line-through decoration-2 decoration-gray-500';
  }

  return { displayText, styles, prefix };
};

const PronunciationWord: React.FC<PronunciationWordProps> = ({
  wordData,
  onWordClick,
  className = '',
  features = defaultFeatures,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const wordRef = useRef<HTMLSpanElement>(null);

  const mergedFeatures = { ...defaultFeatures, ...features };

  const handleClick = useCallback(() => {
    if (mergedFeatures.clickToSeek && onWordClick) {
      onWordClick(wordData.offset);
    }
  }, [mergedFeatures.clickToSeek, onWordClick, wordData.offset]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!mergedFeatures.showTooltip) return;

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setShowTooltip(true);
    },
    [mergedFeatures.showTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const accuracyLevel = getAccuracyLevel(wordData.accuracy);
  const hasErrors = wordData.errors.length > 0;

  const {
    displayText,
    styles: errorStyles,
    prefix,
  } = getWordDisplayFormat(wordData);

  let wordStyles = className;
  if (mergedFeatures.showErrorHighlight) {
    wordStyles += ' ' + errorStyles;
  }

  if (mergedFeatures.showAccuracyColors && !hasErrors) {
    wordStyles += ' ' + getAccuracyStyles(accuracyLevel, hasErrors);
  } else if (mergedFeatures.showAccuracyColors && hasErrors && !errorStyles) {
    wordStyles += ' ' + getAccuracyStyles(accuracyLevel, hasErrors);
  }

  if (mergedFeatures.showStressMarking && wordData.isStressed) {
    wordStyles +=
      ' font-black text-2xl leading-relaxed mx-1 px-1 inline-block tracking-wide';
    if (mergedFeatures.emphasizeStress) {
      wordStyles += ' font-extrabold';
    }
  }

  return (
    <>
      {prefix && (
        <span
          className={`inline-block -mr-1 text-base font-mono ${
            prefix.includes('[+]')
              ? 'text-pink-500'
              : prefix.includes('[ ]')
                ? 'line-through text-pink-600'
                : prefix.includes('[]')
                  ? 'text-gray-400'
                  : ''
          }`}
        >
          {prefix}
        </span>
      )}

      <span
        ref={wordRef}
        className={wordStyles.trim()}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-offset={wordData.offset}
        data-accuracy={wordData.accuracy}
        title={`Accuracy: ${wordData.accuracy}% | Click to play`}
      >
        {displayText}
      </span>

      {/* Tooltip */}
      {showTooltip && mergedFeatures.showTooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="text-center">
            <div className="font-semibold">"{wordData.word}"</div>
            <div
              className={`text-sm font-medium ${
                accuracyLevel === 'excellent'
                  ? 'text-green-400'
                  : accuracyLevel === 'good'
                    ? 'text-blue-400'
                    : accuracyLevel === 'fair'
                      ? 'text-yellow-400'
                      : 'text-red-400'
              }`}
            >
              {wordData.accuracy}%
            </div>

            {wordData.isStressed && (
              <div className="text-xs text-blue-400">⭐ Stressed</div>
            )}

            {wordData.errors.length > 0 && (
              <div className="text-xs text-red-400 mt-1">
                {wordData.errors[0].description}
              </div>
            )}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </>
  );
};

export default PronunciationWord;
