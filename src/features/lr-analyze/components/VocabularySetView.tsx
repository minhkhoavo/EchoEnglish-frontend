import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb, Volume2 } from 'lucide-react';
import type { LearningResource } from '../types/analysis';

interface VocabularySetViewProps {
  resource: LearningResource;
}

export function VocabularySetView({ resource }: VocabularySetViewProps) {
  const words = resource.generatedContent?.words || [];

  const handlePronounce = (word: string) => {
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (words.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748b]">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No vocabulary words available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#e5e7eb]">
        <div className="p-2 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0f172a] truncate">
            {resource.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-[#8b5cf6] text-white border-0 text-xs">
              {words.length} words
            </Badge>
            {resource.estimatedTime && (
              <span className="text-xs text-[#94a3b8]">
                ~{resource.estimatedTime} min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="grid gap-3">
        {words.map((word, index) => (
          <Card
            key={index}
            className="p-3 border border-[#f1f5f9] hover:border-[#8b5cf6] transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Word Number */}
              <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {/* Word and Part of Speech */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-bold text-[#0f172a]">
                    {word.word}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-[#f3e8ff]"
                    onClick={() => handlePronounce(word.word)}
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  </Button>
                  <Badge
                    variant="outline"
                    className="text-xs border-[#8b5cf6] text-[#8b5cf6]"
                  >
                    {word.partOfSpeech}
                  </Badge>
                </div>

                {/* Definition */}
                <div>
                  <p className="text-sm text-[#1e293b] leading-relaxed">
                    {word.definition}
                  </p>
                </div>

                {/* Example */}
                <div className="bg-[#f8fafc] p-2 rounded border-l-2 border-[#8b5cf6]">
                  <p className="text-xs text-[#64748b] mb-0.5 font-medium">
                    Example
                  </p>
                  <p className="text-sm text-[#475569] italic">
                    "{word.example}"
                  </p>
                </div>

                {/* Usage Note */}
                {word.usageNote && (
                  <div className="bg-[#fffbeb] p-2 rounded flex gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#78350f] leading-relaxed">
                      {word.usageNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
