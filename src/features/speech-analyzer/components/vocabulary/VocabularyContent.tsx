import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
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

      {/* Top Performance & Suggested Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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

        {/* Suggested Vocabulary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Suggested Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                <div className="text-center py-6 text-gray-500">
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
