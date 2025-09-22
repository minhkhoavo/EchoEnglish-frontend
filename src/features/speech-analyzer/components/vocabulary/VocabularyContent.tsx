import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  BookOpen,
  Lightbulb,
  Crown,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FileText,
} from 'lucide-react';
import type {
  VocabularyDistribution,
  VocabularyScore,
  TopPerformance,
  SuggestedWord,
} from '../../types/vocabulary.types';

interface VocabularyContentProps {
  analysis: {
    distribution: VocabularyDistribution;
    scores: VocabularyScore;
    topPerformances: TopPerformance[];
    suggestedWords?: SuggestedWord[];
  };
}

const VocabularyContent: React.FC<VocabularyContentProps> = ({ analysis }) => {
  const {
    distribution,
    scores,
    topPerformances,
    suggestedWords = [],
  } = analysis;

  // Color mapping cho CEFR levels
  const levelColors = {
    A1: 'bg-blue-200',
    A2: 'bg-blue-400',
    B1: 'bg-yellow-400',
    B2: 'bg-orange-500',
    C1: 'bg-red-500',
    C2: 'bg-purple-600',
  };

  const levelBadgeColors = {
    A1: 'bg-blue-100 text-blue-800',
    A2: 'bg-blue-200 text-blue-900',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800',
    C2: 'bg-purple-100 text-purple-800',
  };

  // Vocabulary Upgrade suggestions với chi tiết hơn
  const vocabularyUpgrades = [
    {
      basic: 'good',
      advanced: 'exceptional',
      basicLevel: 'A1',
      advancedLevel: 'C1',
      context: 'Quality description',
      example: "This meal is exceptional (not just 'good')",
      impact: '+25 points',
    },
    {
      basic: 'big',
      advanced: 'substantial',
      basicLevel: 'A1',
      advancedLevel: 'B2',
      context: 'Size/amount',
      example: 'A substantial improvement in performance',
      impact: '+15 points',
    },
    {
      basic: 'important',
      advanced: 'paramount',
      basicLevel: 'A2',
      advancedLevel: 'C1',
      context: 'Significance',
      example: 'This issue is paramount to our success',
      impact: '+20 points',
    },
    {
      basic: 'very',
      advanced: 'remarkably',
      basicLevel: 'A1',
      advancedLevel: 'B2',
      context: 'Intensifier',
      example: 'The results were remarkably consistent',
      impact: '+10 points',
    },
  ];

  // Paraphrase suggestions
  const paraphraseSuggestions = [
    {
      original: 'I think this is important',
      paraphrase: 'In my opinion, this holds significant value',
      technique: 'Opinion expression + formal vocabulary',
    },
    {
      original: 'This is a big problem',
      paraphrase: 'This represents a considerable challenge',
      technique: 'Nominalization + academic tone',
    },
    {
      original: 'People should do this',
      paraphrase:
        'It would be advisable for individuals to pursue this approach',
      technique: 'Modal softening + formal register',
    },
    {
      original: "It's very good",
      paraphrase: 'It demonstrates exceptional quality',
      technique: 'Active voice + specific adjectives',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vocabulary Analysis
            </h2>
            <p className="text-gray-600">
              Comprehensive insights into your English vocabulary performance
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-bold text-blue-600">
              {distribution.totalWords}
            </div>
            <div className="text-xs text-gray-600">Total Words</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-bold text-green-600">
              {distribution.uniqueWords}
            </div>
            <div className="text-xs text-gray-600">Unique Words</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-bold text-purple-600">
              {distribution.advancedVocabularyPercentage}%
            </div>
            <div className="text-xs text-gray-600">Advanced</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-bold text-orange-600">
              {Math.round(
                (distribution.uniqueWords / distribution.totalWords) * 100
              )}
              %
            </div>
            <div className="text-xs text-gray-600">Diversity</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vocabulary Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Vocabulary Distribution
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Advanced Vocabulary Percentage */}
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {distribution.advancedVocabularyPercentage}%
                </div>
                <div className="text-sm text-gray-600 text-center">
                  Advanced
                  <br />
                  Vocabulary
                </div>
              </div>

              {/* CEFR Levels Distribution */}
              <div className="flex-1 space-y-2">
                {distribution.cefrLevels.map((level) => (
                  <div key={level.level} className="flex items-center gap-2">
                    <Badge
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${levelColors[level.level]}`}
                    >
                      {level.level}
                    </Badge>

                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${levelColors[level.level]}`}
                          style={{ width: `${level.percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-800">
                            {level.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CEFR Guide (compact) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CEFR Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {distribution.cefrLevels.map((level) => (
                <div key={level.level} className="flex items-center gap-2">
                  <Badge
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${levelBadgeColors[level.level]}`}
                  >
                    {level.level}
                  </Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{level.name}</div>
                    <div className="text-xs text-gray-500">
                      {level.count} words
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths - Đặt riêng */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topPerformances.map((performance, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-green-900 text-sm">
                      {performance.category}
                    </h4>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {performance.score}
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700">
                    {performance.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary Upgrade & Paraphrase Tips - Gộp chung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vocabulary Upgrade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="w-5 h-5 text-amber-600" />
              Vocabulary Upgrade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vocabularyUpgrades.slice(0, 4).map((upgrade, index) => (
                <div
                  key={index}
                  className="p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      {upgrade.basic}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-600" />
                    <span className="px-2 py-1 bg-amber-100 rounded text-xs font-semibold text-amber-800">
                      {upgrade.advanced}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Context:</span>{' '}
                    {upgrade.context}
                  </div>
                  <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded italic">
                    💬 "{upgrade.example}"
                  </div>
                </div>
              ))}
              <p className="text-xs text-amber-700 mt-2 text-center">
                ✨ Transform basic words into sophisticated expressions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Paraphrase Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Paraphrase Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paraphraseSuggestions.map((paraphrase, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">Original:</div>
                    <div className="text-xs text-gray-700 italic">
                      "{paraphrase.original}"
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-blue-600 mb-1 font-medium">
                      Paraphrased:
                    </div>
                    <div className="text-xs text-blue-800 font-medium">
                      "{paraphrase.paraphrase}"
                    </div>
                  </div>
                  <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    📝 {paraphrase.technique}
                  </div>
                </div>
              ))}
              <p className="text-xs text-blue-700 mt-2 text-center">
                🔄 Express the same idea in different ways
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Words - Chuyển xuống dưới */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Suggested Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedWords.length > 0 ? (
                suggestedWords.map((word, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-yellow-900">
                          {word.word}
                        </span>
                        <Badge
                          className={`text-xs ${levelBadgeColors[word.cefrLevel]}`}
                        >
                          {word.cefrLevel}
                        </Badge>
                      </div>
                      <span className="text-xs text-yellow-600">
                        {word.category}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mb-1">
                      {word.definition}
                    </p>
                    <p className="text-xs text-yellow-600 italic">
                      "{word.example}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No word suggestions available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VocabularyContent;
