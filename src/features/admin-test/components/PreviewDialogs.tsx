import {
  Eye,
  Volume2,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type {
  TestQuestion,
  TestQuestionGroup,
} from '../types/admin-test.types';
import { useRef, useState } from 'react';

interface QuestionPreviewDialogProps {
  question: TestQuestion;
  partNumber: number;
}

export const QuestionPreviewDialog = ({
  question,
  partNumber,
}: QuestionPreviewDialogProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                Question {question.questionNumber}
              </Badge>
              <span className="text-sm text-slate-500">Part {partNumber}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="space-y-4 px-6 py-6">
            {/* Audio */}
            {question.media?.audioUrl && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                  <Volume2 className="h-4 w-4" />
                  Audio
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="bg-white"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <audio
                    ref={audioRef}
                    src={question.media.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="flex-1 h-8"
                    controls
                  />
                </div>
              </div>
            )}

            {/* Images */}
            {question.media?.imageUrls &&
              question.media.imageUrls.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {question.media.imageUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Question image ${idx + 1}`}
                        className="max-w-[200px] max-h-[150px] rounded-lg border object-contain bg-white"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Question Text */}
            {question.questionText && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  Question:
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800">
                  {question.questionText}
                </div>
              </div>
            )}

            {/* Options */}
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                Answers:
              </div>
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.label}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      option.label === question.correctAnswer
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        option.label === question.correctAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {option.label}
                    </div>
                    <span className="text-slate-700 pt-0.5">
                      {option.text || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript */}
            {question.media?.transcript && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="h-4 w-4" />
                    Transcript
                  </div>
                  <div
                    className="p-3 bg-amber-50 rounded-lg prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: question.media.transcript,
                    }}
                  />
                </div>
              </>
            )}

            {/* Explanation */}
            {question.explanation && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <BookOpen className="h-4 w-4" />
                    Explanation
                  </div>
                  <div
                    className="p-3 bg-purple-50 rounded-lg prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.explanation }}
                  />
                </div>
              </>
            )}

            {/* Tags */}
            {(question.contentTags?.difficulty ||
              question.contentTags?.domain?.length) && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {question.contentTags?.difficulty && (
                    <Badge variant="outline">
                      {question.contentTags.difficulty}
                    </Badge>
                  )}
                  {question.contentTags?.domain?.map((d) => (
                    <Badge key={d} variant="secondary">
                      {d}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface GroupPreviewDialogProps {
  group: TestQuestionGroup;
  partNumber: number;
  groupIndex: number;
}

export const GroupPreviewDialog = ({
  group,
  partNumber,
  groupIndex,
}: GroupPreviewDialogProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const questionRange =
    group.questions.length > 0
      ? `${group.questions[0].questionNumber}-${group.questions[group.questions.length - 1].questionNumber}`
      : '';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-purple-600 hover:text-purple-800"
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                Group {groupIndex + 1}
              </Badge>
              <span className="text-sm text-slate-500">
                Part {partNumber} • Questions {questionRange}
              </span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="space-y-6 px-6 py-6">
            {/* Group Context */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-4">Context</h3>

              {/* Audio */}
              {group.groupContext?.audioUrl && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                    <Volume2 className="h-4 w-4" />
                    Audio
                  </div>
                  <audio
                    ref={audioRef}
                    src={group.groupContext.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    className="w-full h-10"
                  />
                </div>
              )}

              {/* Images */}
              {group.groupContext?.imageUrls &&
                group.groupContext.imageUrls.length > 0 && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-2">
                      <ImageIcon className="h-4 w-4" />
                      Images
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.groupContext.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Group image ${idx + 1}`}
                          className="max-w-[250px] max-h-[200px] rounded-lg border object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Passage */}
              {group.groupContext?.passageHtml && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-slate-700 text-sm font-medium mb-2">
                    <FileText className="h-4 w-4" />
                    Passage
                  </div>
                  <div
                    className="p-4 bg-white rounded-lg prose prose-sm max-w-none border"
                    dangerouslySetInnerHTML={{
                      __html: group.groupContext.passageHtml,
                    }}
                  />
                </div>
              )}

              {/* Transcript */}
              {group.groupContext?.transcript && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-2">
                    <FileText className="h-4 w-4" />
                    Transcript
                  </div>
                  <div
                    className="p-4 bg-amber-50 rounded-lg prose prose-sm max-w-none border border-amber-200"
                    dangerouslySetInnerHTML={{
                      __html: group.groupContext.transcript,
                    }}
                  />
                </div>
              )}

              {/* Translation */}
              {group.groupContext?.translation && (
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium mb-2">
                    <Languages className="h-4 w-4" />
                    Translation
                  </div>
                  <div
                    className="p-4 bg-indigo-50 rounded-lg prose prose-sm max-w-none border border-indigo-200"
                    dangerouslySetInnerHTML={{
                      __html: group.groupContext.translation,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Questions */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">
                Questions ({group.questions.length})
              </h3>
              <div className="space-y-4">
                {group.questions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">
                        Question {question.questionNumber}
                      </Badge>
                      {question.contentTags?.difficulty && (
                        <Badge variant="secondary" className="text-xs">
                          {question.contentTags.difficulty}
                        </Badge>
                      )}
                    </div>

                    {question.questionText && (
                      <p className="text-slate-700 mb-3">
                        {question.questionText}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {question.options.map((option) => (
                        <div
                          key={option.label}
                          className={`flex items-center gap-2 p-2 rounded text-sm ${
                            option.label === question.correctAnswer
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              option.label === question.correctAnswer
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {option.label}
                          </span>
                          {option.text || '—'}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-slate-500 mb-1">
                          Explanation:
                        </div>
                        <div
                          className="text-sm text-slate-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: question.explanation,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
