import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Volume2, Check } from 'lucide-react';
import type { VocabularyWord } from '../types/vocabulary.types';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface VocabularyCardProps {
  word: VocabularyWord;
  isImported: boolean;
  isImporting: boolean;
  onImportClick: (word: VocabularyWord) => void;
}

export function VocabularyCard({
  word,
  isImported,
  isImporting,
  onImportClick,
}: VocabularyCardProps) {
  const { speak } = useSpeechSynthesis();

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.warn('Failed to play audio from URL:', error);
        // Fallback to Web Speech API
        speak(word.word, 'en-US');
      });
    } else {
      speak(word.word, 'en-US');
    }
  };

  return (
    <Card
      className={`rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group h-full flex flex-col ${
        isImported
          ? 'border-2 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20'
          : ''
      }`}
    >
      <CardHeader
        className={`border-b rounded-t-xl ${
          isImported
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {word.word}
            </CardTitle>
            {word.phonetics[0] && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">
                  {word.phonetics[0].text}
                </span>
                {word.phonetics[0].audio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={() => playAudio(word.phonetics[0].audio!)}
                  >
                    <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {word.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              Vietnamese
            </p>
            <p className="text-base font-medium">{word.translation.vi}</p>
          </div>
          {word.example.en && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                Example
              </p>
              <p className="text-sm italic text-muted-foreground mb-1">
                {word.example.en}
              </p>
              {word.example.vi && <p className="text-sm">{word.example.vi}</p>}
            </div>
          )}
        </div>
        <Button
          className={`w-full h-11 font-semibold mt-auto ${
            isImported
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
          }`}
          onClick={() => onImportClick(word)}
          disabled={isImporting || isImported}
        >
          {isImporting ? (
            'Importing...'
          ) : isImported ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Imported
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Add to Flashcards
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
