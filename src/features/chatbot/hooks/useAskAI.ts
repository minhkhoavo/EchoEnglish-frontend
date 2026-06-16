import { useCallback } from 'react';
import { useAppDispatch } from '@/core/store/store';
import { openChatbot, setExamContext } from '../slices/chatbotSlice';
import { buildExamQuestionContext } from '../utils/examContext';
import type {
  TestQuestion,
  TestMedia,
} from '@/features/tests/types/toeic-test.types';

export function useAskAI(partName: string, showCorrectAnswers: boolean) {
  const dispatch = useAppDispatch();

  return useCallback(
    (question: TestQuestion, groupContext?: TestMedia | null) => () => {
      const context = buildExamQuestionContext(
        question,
        partName,
        showCorrectAnswers,
        groupContext
      );
      dispatch(setExamContext(context));
      dispatch(openChatbot());
    },
    [dispatch, partName, showCorrectAnswers]
  );
}
