import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  BookOpen,
  Lightbulb,
  Crown,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FileText,
  Plus,
  Check,
} from 'lucide-react';
import type { RecordingAnalysis } from '../../types/pronunciation.types';
import type { Recording } from '../../../recordings/types/recordings.types';
import { useCreateFlashcardMutation } from '../../../flashcard/services/flashcardApi';
import { toast } from 'sonner';

interface VocabularyStats {
  totalWords?: number;
  uniqueWords?: number;
  knownWords?: number;
  distribution?: {
    A1?: number;
    A2?: number;
    B1?: number;
    B2?: number;
    C1?: number;
    C2?: number;
  };
}

interface VocabularyContentProps {
  recording?: Recording | null;
}

const VocabularyContent: React.FC<VocabularyContentProps> = ({ recording }) => {
  const analysis = (recording?.analysis as RecordingAnalysis) || undefined;
  const vocabulary = analysis?.analyses?.vocabulary;
  const [createFlashcard] = useCreateFlashcardMutation();
  const [createdFlashcards, setCreatedFlashcards] = useState<Set<string>>(
    new Set()
  );

  const handleCreateFlashcard = async (
    word: string,
    definition?: string,
    example?: string,
    category?: string
  ) => {
    try {
      await createFlashcard({
        front: word,
        back: definition || '',
        category: '',
        difficulty: 'Medium' as const,
        tags: ['vocabulary', 'speech-analysis'],
        source: 'speech-analyzer',
        isAIGenerated: true,
      }).unwrap();

      setCreatedFlashcards((prev) => new Set(prev).add(word));
      toast.success(`Flashcard created for "${word}"`);
    } catch (error) {
      toast.error('Failed to create flashcard');
    }
  };

  const topPerformances = vocabulary?.topPerformances || [];
  const suggestedWords = vocabulary?.suggestedWords || [];
  const vocabularyUpgrades = vocabulary?.vocabularyUpgrades || [];

  // Get stats safely
  const vocabularyStats = vocabulary?.stats as
    | VocabularyStats
    | null
    | undefined;

  // Use real stats from API or fallback defaults
  const distribution = vocabularyStats
    ? {
        totalWords: vocabularyStats.totalWords || 0,
        uniqueWords: vocabularyStats.uniqueWords || 0,
        advancedVocabularyPercentage:
          vocabularyStats.knownWords &&
          vocabularyStats.totalWords &&
          vocabularyStats.totalWords > 0
            ? Math.round(
                (vocabularyStats.knownWords / vocabularyStats.totalWords) * 100
              )
            : 0,
        cefrLevels: [
          {
            level: 'A1',
            name: 'Beginner',
            percentage:
              vocabularyStats.distribution?.A1 &&
              vocabularyStats.totalWords &&
              vocabularyStats.totalWords > 0
                ? Math.round(
                    (vocabularyStats.distribution.A1 /
                      vocabularyStats.totalWords) *
                      100
                  )
                : 0,
            count: vocabularyStats.distribution?.A1 || 0,
            description: 'Basic vocabulary',
          },
          {
            level: 'A2',
            name: 'Elementary',
            percentage:
              vocabularyStats.distribution?.A2 &&
              vocabularyStats.totalWords &&
              vocabularyStats.totalWords > 0
                ? Math.round(
                    (vocabularyStats.distribution.A2 /
                      vocabularyStats.totalWords) *
                      100
                  )
                : 0,
            count: vocabularyStats.distribution?.A2 || 0,
            description: 'Elementary vocabulary',
          },
          {
            level: 'B1',
            name: 'Intermediate',
            percentage:
              vocabularyStats.distribution?.B1 &&
              vocabularyStats.totalWords &&
              vocabularyStats.totalWords > 0
                ? Math.round(
                    (vocabularyStats.distribution.B1 /
                      vocabularyStats.totalWords) *
                      100
                  )
                : 0,
            count: vocabularyStats.distribution?.B1 || 0,
            description: 'Intermediate vocabulary',
          },
          {
            level: 'B2',
            name: 'Upper Intermediate',
            percentage: 0,
            count: 0,
            description: 'Upper intermediate vocabulary',
          },
          {
            level: 'C1',
            name: 'Advanced',
            percentage: 0,
            count: 0,
            description: 'Advanced vocabulary',
          },
          {
            level: 'C2',
            name: 'Proficient',
            percentage: 0,
            count: 0,
            description: 'Proficient vocabulary',
          },
        ],
      }
    : {
        totalWords: recording ? recording.transcript.split(' ').length : 0,
        uniqueWords: 0, // TODO: calculate unique words
        advancedVocabularyPercentage: 0,
        cefrLevels: [
          {
            level: 'A1',
            name: 'Beginner',
            percentage: 20,
            count: 10,
            description: 'Basic vocabulary',
          },
          {
            level: 'A2',
            name: 'Elementary',
            percentage: 25,
            count: 12,
            description: 'Elementary vocabulary',
          },
          {
            level: 'B1',
            name: 'Intermediate',
            percentage: 30,
            count: 15,
            description: 'Intermediate vocabulary',
          },
          {
            level: 'B2',
            name: 'Upper Intermediate',
            percentage: 15,
            count: 8,
            description: 'Upper intermediate vocabulary',
          },
          {
            level: 'C1',
            name: 'Advanced',
            percentage: 8,
            count: 4,
            description: 'Advanced vocabulary',
          },
          {
            level: 'C2',
            name: 'Proficient',
            percentage: 2,
            count: 1,
            description: 'Proficient vocabulary',
          },
        ],
      };

  // Default scores
  const scores = {
    overall: analysis?.overall?.AccuracyScore || 0,
    complexity: 0,
    variety: 0,
    accuracy: 0,
    appropriateness: 0,
  };

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

  const paraphraseSuggestions = vocabulary?.paraphraseSuggestions || [
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${levelColors[level.level as keyof typeof levelColors]}`}
                    >
                      {level.level}
                    </Badge>

                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${levelColors[level.level as keyof typeof levelColors]}`}
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${levelBadgeColors[level.level as keyof typeof levelBadgeColors]}`}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-amber-200 ml-auto"
                      onClick={() =>
                        handleCreateFlashcard(
                          upgrade.advanced,
                          upgrade.context,
                          upgrade.example || '',
                          'vocabulary-upgrade'
                        )
                      }
                      disabled={createdFlashcards.has(upgrade.basic)}
                    >
                      {createdFlashcards.has(upgrade.basic) ? (
                        <Check className="h-2 w-2 text-green-600" />
                      ) : (
                        <Plus className="h-2 w-2" />
                      )}
                    </Button>
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
                          className={`text-xs ${levelBadgeColors[word.cefrLevel as keyof typeof levelBadgeColors]}`}
                        >
                          {word.cefrLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-600">
                          {word.category}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-yellow-100"
                          onClick={() =>
                            handleCreateFlashcard(
                              word.word,
                              word.definition,
                              word.example,
                              word.category
                            )
                          }
                          disabled={createdFlashcards.has(word.word)}
                        >
                          {createdFlashcards.has(word.word) ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
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
