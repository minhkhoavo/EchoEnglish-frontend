import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, Crown } from 'lucide-react';

interface UpgradeWord {
  basic: string;
  advanced: string;
  basicLevel: string;
  advancedLevel: string;
  context: string;
  improvement: string;
}

interface VocabularyUpgradeProps {
  upgradeSuggestions?: UpgradeWord[];
}

const VocabularyUpgrade: React.FC<VocabularyUpgradeProps> = ({
  upgradeSuggestions = [],
}) => {
  const defaultSuggestions: UpgradeWord[] = [
    {
      basic: 'good',
      advanced: 'exceptional',
      basicLevel: 'A1',
      advancedLevel: 'C1',
      context: 'Quality description',
      improvement: 'Shows sophisticated vocabulary usage',
    },
    {
      basic: 'big',
      advanced: 'substantial',
      basicLevel: 'A1',
      advancedLevel: 'B2',
      context: 'Size description',
      improvement: 'More precise and academic',
    },
    {
      basic: 'important',
      advanced: 'paramount',
      basicLevel: 'A2',
      advancedLevel: 'C1',
      context: 'Significance',
      improvement: 'Demonstrates advanced vocabulary',
    },
  ];

  const suggestions =
    upgradeSuggestions.length > 0 ? upgradeSuggestions : defaultSuggestions;

  const levelColors = {
    A1: 'bg-blue-100 text-blue-800',
    A2: 'bg-blue-200 text-blue-900',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800',
    C2: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
          <Crown className="w-5 h-5 text-amber-600" />
          Vocabulary Upgrade
          <Badge className="bg-amber-100 text-amber-800 text-xs">
            Pro Tips
          </Badge>
        </CardTitle>
        <p className="text-sm text-amber-700">
          Transform your basic vocabulary into sophisticated expressions
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-3 bg-white/70 rounded-lg border border-amber-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  {suggestion.basic}
                </span>
                <Badge
                  className={`text-xs ${levelColors[suggestion.basicLevel as keyof typeof levelColors]}`}
                >
                  {suggestion.basicLevel}
                </Badge>
              </div>

              <ArrowRight className="w-4 h-4 text-amber-600" />

              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-800">
                  {suggestion.advanced}
                </span>
                <Badge
                  className={`text-xs ${levelColors[suggestion.advancedLevel as keyof typeof levelColors]}`}
                >
                  {suggestion.advancedLevel}
                </Badge>
              </div>

              <TrendingUp className="w-4 h-4 text-green-600 ml-auto" />
            </div>

            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Context:</span> {suggestion.context}
            </div>

            <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
              💡 {suggestion.improvement}
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Crown className="w-4 h-4" />
            <span className="font-medium">
              Upgrade Score: +{suggestions.length * 15} Vocabulary Points
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Using advanced vocabulary demonstrates linguistic sophistication and
            improves your speaking score.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularyUpgrade;
