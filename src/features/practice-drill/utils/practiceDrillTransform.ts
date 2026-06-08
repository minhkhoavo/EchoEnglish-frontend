import type {
  PracticeDrillData,
  PracticeDrillPart,
} from '../types/practice-drill.types';
import type {
  TestPart,
  TestQuestion,
  TestQuestionGroup,
  TestMedia,
  TestOption,
} from '../../tests/types/toeic-test.types';

export const transformPracticeDrillToTestPart = (
  part: PracticeDrillPart
): TestPart => {
  // Transform questions if present (for Part 1, 2, 5)
  const questions: TestQuestion[] | undefined = part.questions?.map((q) => ({
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    options: q.options as TestOption[],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    media: {
      audioUrl: q.media?.audioUrl || null,
      imageUrls: q.media?.imageUrls || null,
      passageHtml: null,
      transcript: q.media?.transcript || null,
      translation: null,
    } as TestMedia,
  }));

  // Transform question groups if present (for Part 3, 4, 6, 7)
  const questionGroups: TestQuestionGroup[] | undefined =
    part.questionGroups?.map((group) => ({
      groupContext: {
        audioUrl: group.groupContext.audioUrl || null,
        imageUrls: group.groupContext.imageUrls || null,
        passageHtml: group.groupContext.passageHtml || null,
        transcript: group.groupContext.transcript || null,
        translation: group.groupContext.translation || null,
      } as TestMedia,
      questions: group.questions.map((q) => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options as TestOption[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        media: {
          audioUrl: null,
          imageUrls: null,
          passageHtml: null,
          transcript: null,
          translation: null,
        } as TestMedia,
      })),
    }));

  return {
    partName: part.partName,
    partId: part.partName.toLowerCase().replace(/\s+/g, '-'), // Generate partId from partName
    questions,
    questionGroups,
  };
};

/**
 * Transform complete Practice Drill data to array of TestParts
 */
export const transformPracticeDrillData = (
  data: PracticeDrillData
): TestPart[] => {
  return data.parts.map(transformPracticeDrillToTestPart);
};
