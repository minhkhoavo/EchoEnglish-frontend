import React, { useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/core/store/store';
import { openChatbot, setExamContext } from '../slices/chatbotSlice';
import type {
  TOEICTestDetail,
  TestQuestion,
  TestMedia,
} from '@/features/tests/types/toeic-test.types';

interface Props {
  testData: TOEICTestDetail | undefined;
  currentQuestion: number;
  isReviewMode: boolean;
}

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function findQuestion(
  testData: TOEICTestDetail,
  qNum: number
): {
  question: TestQuestion;
  groupContext: TestMedia | null;
  partName: string;
} | null {
  for (const part of testData.parts) {
    if (part.questions) {
      const q = part.questions.find((q) => q.questionNumber === qNum);
      if (q)
        return { question: q, groupContext: null, partName: part.partName };
    }
    if (part.questionGroups) {
      for (const group of part.questionGroups) {
        const q = group.questions.find((q) => q.questionNumber === qNum);
        if (q)
          return {
            question: q,
            groupContext: group.groupContext,
            partName: part.partName,
          };
      }
    }
  }
  return null;
}

function buildContext(
  found: NonNullable<ReturnType<typeof findQuestion>>,
  isReviewMode: boolean
): string {
  const { question, groupContext, partName } = found;
  const lines: string[] = [
    `=== TOEIC Question Context (Q${question.questionNumber} · ${partName}) ===`,
    '',
  ];

  // Group-level reading passage
  if (groupContext?.passageHtml) {
    lines.push('[Reading Passage]', stripHtml(groupContext.passageHtml), '');
  }
  // Group-level audio transcript
  if (groupContext?.transcript) {
    lines.push('[Audio Transcript]', groupContext.transcript, '');
  }
  // Question-level passage (Part 6/7 standalone)
  if (question.media?.passageHtml && !groupContext?.passageHtml) {
    lines.push('[Reading Passage]', stripHtml(question.media.passageHtml), '');
  }
  if (question.media?.transcript && !groupContext?.transcript) {
    lines.push('[Audio Transcript]', question.media.transcript, '');
  }

  if (question.questionText) {
    lines.push(`Question: ${question.questionText}`, '');
  }

  if (question.options?.length > 0) {
    lines.push('Options:');
    question.options.forEach((opt) =>
      lines.push(`  ${opt.label}. ${opt.text}`)
    );
    lines.push('');
  }

  // Only show answers and explanations in review mode (not during active exam)
  if (isReviewMode) {
    if (question.correctAnswer) {
      lines.push(`Correct Answer: ${question.correctAnswer}`);
    }
    if (question.explanation) {
      lines.push(`Explanation: ${question.explanation}`);
    }
    const translation =
      groupContext?.translation || question.media?.translation;
    if (translation) {
      lines.push(`Vietnamese Translation: ${translation}`);
    }
    lines.push('');
  }

  lines.push("Please answer the user's question about this TOEIC question.");
  return lines.join('\n');
}

const ExamChatbotButton: React.FC<Props> = ({
  testData,
  currentQuestion,
  isReviewMode,
}) => {
  const dispatch = useAppDispatch();

  const found = useMemo(() => {
    if (!testData || !currentQuestion) return null;
    return findQuestion(testData, currentQuestion);
  }, [testData, currentQuestion]);

  // Clear exam context when unmounting (user leaves exam page)
  useEffect(() => {
    return () => {
      dispatch(setExamContext(null));
    };
  }, [dispatch]);

  if (!found) return null;

  const handleClick = () => {
    dispatch(setExamContext(buildContext(found, isReviewMode)));
    dispatch(openChatbot());
  };

  return (
    <div className="fixed z-[9998]" style={{ bottom: '4.5rem', right: '1rem' }}>
      <Button
        onClick={handleClick}
        size="sm"
        title={`Ask AI about Question ${currentQuestion}`}
        className="h-9 px-3 rounded-full shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-medium gap-1.5 border-0 transition-all duration-200 hover:shadow-xl"
      >
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
        Ask AI · Q{currentQuestion}
      </Button>
    </div>
  );
};

export default ExamChatbotButton;
