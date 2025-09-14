import React, { useRef, useState } from 'react';
import { Volume2, Headphones } from 'lucide-react';
import type { WordPronunciation } from '../../types/pronunciation.types';

interface PronunciationPopupProps {
  wordData: WordPronunciation;
  position: { x: number; y: number };
  isVisible: boolean;
  audioUrl?: string;
  onClose?: () => void;
  className?: string;
}

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'text-green-500';
  if (accuracy >= 70) return 'text-blue-500';
  if (accuracy >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

const getErrorTypeIcon = (errorType: string): string => {
  switch (errorType) {
    case 'mispronunciation':
      return '🔄';
    case 'omission':
      return '❌';
    case 'insertion':
      return '➕';
    case 'unexpected_break':
      return '⏸️';
    case 'missing_break':
      return '⏩';
    case 'monotone':
      return '📏';
    default:
      return '⚠️';
  }
};

const getErrorTypeColor = (errorType: string): string => {
  switch (errorType) {
    case 'mispronunciation':
      return 'text-orange-600';
    case 'omission':
      return 'text-red-600';
    case 'insertion':
      return 'text-purple-600';
    case 'unexpected_break':
      return 'text-blue-600';
    case 'missing_break':
      return 'text-green-600';
    case 'monotone':
      return 'text-gray-600';
    default:
      return 'text-red-600';
  }
};

const PronunciationPopup: React.FC<PronunciationPopupProps> = ({
  wordData,
  position,
  isVisible,
  audioUrl,
  onClose,
  className = '',
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement>(null);
  const userAudioRef = useRef<HTMLAudioElement>(null);

  if (!isVisible) return null;

  const playTTSPronunciation = async () => {
    if (isPlayingTTS || !ttsAudioRef.current) return;

    setIsPlayingTTS(true);
    ttsAudioRef.current.src = `https://classmate-vuive.vn/tts?text=${encodeURIComponent(wordData.word)}`;
    ttsAudioRef.current.play().catch(console.error);
  };

  const playUserPronunciation = async () => {
    if (isPlayingUser || !audioUrl || !userAudioRef.current) return;

    setIsPlayingUser(true);
    userAudioRef.current.src = audioUrl;
    userAudioRef.current.currentTime = wordData.offset / 1000;
    userAudioRef.current.play().catch(console.error);

    setTimeout(() => {
      userAudioRef.current?.pause();
      setIsPlayingUser(false);
    }, wordData.duration);
  };

  const popupWidth = 280;
  const popupHeight = 360;
  const margin = 10;

  const left = Math.max(
    margin,
    Math.min(
      position.x - popupWidth / 2,
      window.innerWidth - popupWidth - margin
    )
  );
  const top =
    position.y - popupHeight - 10 < margin
      ? position.y + 20
      : position.y - popupHeight - 10;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}
        style={{
          left: left,
          top: Math.max(margin, top),
          width: popupWidth,
          maxHeight: popupHeight,
        }}
      >
        {/* Hidden audio elements */}
        <audio
          ref={ttsAudioRef}
          onEnded={() => setIsPlayingTTS(false)}
          onError={() => setIsPlayingTTS(false)}
        />
        <audio
          ref={userAudioRef}
          onEnded={() => setIsPlayingUser(false)}
          onError={() => setIsPlayingUser(false)}
        />

        {/* Compact Header */}
        <div className="bg-blue-500 text-white p-2 rounded-t-lg header">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">"{wordData.word}"</span>
              <span
                className={`text-lg font-bold ${getAccuracyColor(wordData.accuracy).replace('text-', 'text-white bg-').replace('-500', '-600')} px-1 rounded`}
              >
                {wordData.accuracy}%
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {/* TTS Pronunciation Button */}
              <button
                onClick={playTTSPronunciation}
                disabled={isPlayingTTS}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 text-sm transition-colors disabled:opacity-50"
                title="Listen to correct pronunciation"
              >
                <Volume2
                  className={`w-4 h-4 ${isPlayingTTS ? 'animate-pulse' : ''}`}
                />
              </button>

              {/* User Pronunciation Button */}
              {audioUrl && (
                <button
                  onClick={playUserPronunciation}
                  disabled={isPlayingUser}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 text-sm transition-colors disabled:opacity-50"
                  title="Listen to your pronunciation"
                >
                  <Headphones
                    className={`w-4 h-4 ${isPlayingUser ? 'animate-pulse' : ''}`}
                  />
                </button>
              )}

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className="scrollbar-hide p-3 text-xs overflow-y-auto"
          style={{ maxHeight: '280px' }}
        >
          {/* Pronunciation comparison */}
          {(wordData.expectedPronunciation || wordData.actualPronunciation) && (
            <div className="mb-3 bg-blue-50 p-2 rounded">
              <div className="text-xs font-medium text-blue-800 mb-1 flex items-center">
                🎯 Pronunciation Comparison
              </div>
              <div className="space-y-1">
                {wordData.expectedPronunciation && (
                  <div className="flex items-center text-xs">
                    <span className="text-green-600 font-semibold mr-2 min-w-[60px]">
                      Expected:
                    </span>
                    <span className="font-mono bg-green-100 px-1 rounded">
                      {wordData.expectedPronunciation}
                    </span>
                  </div>
                )}
                {wordData.actualPronunciation && (
                  <div className="flex items-center text-xs">
                    <span className="text-blue-600 font-semibold mr-2 min-w-[60px]">
                      Your said:
                    </span>
                    <span className="font-mono bg-blue-100 px-1 rounded">
                      {wordData.actualPronunciation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accuracy Score */}
          <div className="mb-3 bg-gray-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                Overall Accuracy:
              </span>
              <span
                className={`text-lg font-bold ${getAccuracyColor(wordData.accuracy)}`}
              >
                {wordData.accuracy}%
              </span>
            </div>
          </div>

          {/* Phoneme comparison - focus on expected vs actual */}
          {wordData.phonemes && wordData.phonemes.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                🔊 Phoneme Analysis
              </div>
              <div className="space-y-1">
                {wordData.phonemes.map((phoneme, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {phoneme.expectedPhoneme && phoneme.actualPhoneme ? (
                        <>
                          <span className="text-green-600 font-mono">
                            /{phoneme.expectedPhoneme}/
                          </span>
                          <span className="text-gray-400">→</span>
                          <span
                            className={`text-blue-600 ${phoneme.isCorrect ? 'font-mono' : 'font-bold text-red-600'}`}
                          >
                            /{phoneme.actualPhoneme}/
                          </span>
                        </>
                      ) : (
                        <span className="font-mono">/{phoneme.phoneme}/</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-medium ${
                          phoneme.accuracy >= 80
                            ? 'text-green-600'
                            : phoneme.accuracy >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {phoneme.accuracy}%
                      </span>
                      {phoneme.isCorrect === false && (
                        <span className="text-red-600">✗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simple error display - just type and confidence */}
          {wordData.errors.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-red-600 mb-2 flex items-center">
                ⚠️ Issues ({wordData.errors.length})
              </div>
              <div className="space-y-1">
                {wordData.errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs bg-red-50 p-2 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="mr-1">
                        {getErrorTypeIcon(error.type)}
                      </span>
                      <span
                        className={`capitalize ${getErrorTypeColor(error.type)}`}
                      >
                        {error.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status badges */}
          {(wordData.isStressed || wordData.isDuplicated) && (
            <div className="flex gap-1">
              {wordData.isStressed && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  ⭐ Stressed
                </span>
              )}
              {wordData.isDuplicated && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                  🔄 Duplicate
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PronunciationPopup;
