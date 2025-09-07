import { useState } from 'react';
import Transcript from './Transcript';
import { createMockTranscriptData, createMockDataWithErrors, createExcellentPronunciationData } from '../data/mockPronunciationData'; // prettier-ignore

const PronunciationDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState<
    'normal' | 'errors' | 'excellent'
  >('normal');

  const getTranscriptData = () => {
    switch (selectedDemo) {
      case 'errors':
        return createMockDataWithErrors();
      case 'excellent':
        return createExcellentPronunciationData();
      default:
        return createMockTranscriptData();
    }
  };

  const transcriptData = getTranscriptData();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pronunciation Assessment Demo
        </h1>
        <p className="text-gray-600">
          Advanced transcript with Azure Pronunciation Assessment integration
        </p>
      </div>

      {/* Demo Selector */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Demo Scenarios</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedDemo('normal')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedDemo === 'normal'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
            }`}
          >
            Mixed Performance
          </button>
          <button
            onClick={() => setSelectedDemo('errors')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedDemo === 'errors'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
            }`}
          >
            Common Errors
          </button>
          <button
            onClick={() => setSelectedDemo('excellent')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedDemo === 'excellent'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
            }`}
          >
            Excellent Performance
          </button>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Features Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-600">Audio Controls</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Play/Pause with spacebar</li>
              <li>• Skip forward/backward 5 seconds</li>
              <li>• Volume control</li>
              <li>• Progress bar with seek</li>
              <li>• Real-time sync with transcript</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-green-600">Word Analysis</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click words to jump to audio position</li>
              <li>• Color-coded accuracy levels</li>
              <li>• Stress word highlighting</li>
              <li>• Simple error indicators</li>
              <li>• Duplicated word detection</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-purple-600">
              Pronunciation Details
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Overall accuracy percentage</li>
              <li>• Simple error descriptions</li>
              <li>• Basic pronunciation tips</li>
              <li>• Confidence scores</li>
              <li>• Word timing information</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-orange-600">Azure Integration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Azure Pronunciation Assessment API</li>
              <li>• Confidence scores</li>
              <li>• Advanced fluency metrics</li>
              <li>• Rhythm and intonation analysis</li>
              <li>• Speech rate detection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">How to Use</h2>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            <strong>🎯 Click any word</strong> to jump to that moment in the
            audio
          </p>
          <p>
            <strong>🎨 Color meanings:</strong> Green = Excellent, Blue = Good,
            Yellow = Fair, Red = Needs Practice
          </p>
          <p>
            <strong>⭐ Bold words</strong> with accent marks are stressed in the
            sentence
          </p>
          <p>
            <strong> Click words</strong> for simple pronunciation analysis
            popup
          </p>
          <p>
            <strong>📊 Segment accuracy</strong> shows overall performance for
            each sentence
          </p>
        </div>
      </div>

      {/* Current Demo Info */}
      <div className="bg-gray-50 rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">
          Current Demo:
          <span
            className={`ml-2 ${
              selectedDemo === 'excellent'
                ? 'text-green-600'
                : selectedDemo === 'errors'
                  ? 'text-red-600'
                  : 'text-blue-600'
            }`}
          >
            {selectedDemo === 'excellent'
              ? 'Excellent Performance'
              : selectedDemo === 'errors'
                ? 'Common Errors'
                : 'Mixed Performance'}
          </span>
        </h2>
        <div className="text-sm text-gray-600">
          {selectedDemo === 'excellent' &&
            'This demo shows near-perfect pronunciation with high accuracy scores across all words and phonemes.'}
          {selectedDemo === 'errors' &&
            'This demo showcases common pronunciation errors including omissions, insertions, and mispronunciations.'}
          {selectedDemo === 'normal' &&
            'This demo represents typical learner performance with a mix of accurate and problematic pronunciations.'}
        </div>
      </div>

      {/* Main Component */}
      <Transcript
        transcriptData={transcriptData}
        features={{
          enableWordClickToSeek: true,
          showAccuracyColors: true,
          autoScrollToCurrentSegment: true,
        }}
      />

      {/* Technical Notes */}
      <div className="bg-gray-50 rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Technical Implementation</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Components:</strong> TranscriptAudioPlayer,
            PronunciationWord, PronunciationPopup, Transcript
          </p>
          <p>
            <strong>Data Structure:</strong> Supports Azure Pronunciation
            Assessment format with simplified display
          </p>
          <p>
            <strong>Features:</strong> Reusable components, customizable
            features, TypeScript support, responsive design
          </p>
          <p>
            <strong>UI:</strong> Clean and simple interface focused on essential
            pronunciation feedback
          </p>
        </div>
      </div>
    </div>
  );
};

export default PronunciationDemo;
