export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-emerald-600';
  if (percentage >= 60) return 'text-blue-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

export const getProficiencyFromPercent = (
  percentage: number
): ProficiencyLevel => {
  if (percentage >= 90) return 'Expert';
  if (percentage >= 75) return 'Advanced';
  if (percentage >= 50) return 'Intermediate';
  return 'Beginner';
};

import type {
  BackendWritingResult,
  WritingOverallResult,
  WritingResultStats,
  ProficiencyLevel,
} from '../types/writing-result.types';

// Get max score per question based on part number
const getMaxScorePerQuestion = (partNumber: number): number => {
  switch (partNumber) {
    case 1:
      return 3;
    case 2:
      return 4;
    case 3:
      return 5;
    default:
      return 5; // fallback
  }
};

export function transformBackendResult(
  backendResult: BackendWritingResult
): WritingOverallResult {
  // Transform parts
  const parts = backendResult.parts.map((part) => {
    const questions = part.questions.map((question) => {
      // Extract upgraded text and summary from result
      let upgradedText = '';
      let upgradeSummary = '';
      const originalText = question.userAnswer;

      // Check for upgraded_text directly in result
      if (question.result?.upgraded_text) {
        const directUpgradedText =
          typeof question.result.upgraded_text === 'string'
            ? question.result.upgraded_text
            : '';
        // Only use upgraded text if it's different and not empty
        if (
          directUpgradedText &&
          directUpgradedText.trim() !== '' &&
          directUpgradedText.trim() !== originalText.trim()
        ) {
          upgradedText = directUpgradedText;
        }
      }

      // Extract upgrade summary
      if (question.result?.upgrade_summary) {
        const summary = question.result.upgrade_summary;
        if (summary && typeof summary === 'string' && summary.trim() !== '') {
          upgradeSummary = summary.trim();
        }
      }

      const questionScore =
        question.result?.overall_assessment?.overallScore || 0;
      const questionMaxScore = getMaxScorePerQuestion(part.partIndex);
      const questionPercentage =
        questionMaxScore > 0 ? (questionScore / questionMaxScore) * 100 : 0;

      return {
        questionId: question.questionNumber,
        questionNumber: question.questionNumber,
        questionText: question.promptText,
        imageUrl: question.promptImage,
        userAnswer: question.userAnswer,
        wordCount: question.userAnswer
          ? question.userAnswer
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length
          : 0,
        score: questionScore,
        maxScore: questionMaxScore,
        proficiencyLevel: getProficiencyFromPercent(questionPercentage),
        feedback: question.result?.overall_assessment?.summary
          ? [question.result.overall_assessment.summary]
          : [],
        strengths: question.result?.overall_assessment?.strengths || [],
        improvements:
          question.result?.overall_assessment?.areasForImprovement || [],
        upgradedText: upgradedText || undefined,
        upgradeSummary: upgradeSummary || undefined,
        timeSpent: 0, // Not available in backend
      };
    });

    const partScore = questions.reduce((sum, q) => sum + q.score, 0);
    const partMaxScore =
      questions.length * getMaxScorePerQuestion(part.partIndex);
    const partPercentage =
      partMaxScore > 0 ? (partScore / partMaxScore) * 100 : 0;

    return {
      partNumber: part.partIndex,
      partName: part.partTitle,
      description: part.partDirection,
      questionsCount: part.questions.length,
      score: partScore,
      maxScore: partMaxScore,
      proficiencyLevel: getProficiencyFromPercent(partPercentage),
      strengths: questions.flatMap((q) => q.strengths),
      improvements: questions.flatMap((q) => q.improvements),
      icon: '📝', // Default icon
      questions,
    };
  });

  const overallScore = backendResult.totalScore;
  const maxOverallScore = 200;
  const overallPercentage =
    maxOverallScore > 0 ? (overallScore / maxOverallScore) * 100 : 0;

  return {
    overallScore,
    maxOverallScore,
    proficiencyLevel: getProficiencyFromPercent(overallPercentage),
    testDate: backendResult.submissionTimestamp,
    testDuration: 60, // Default 60 minutes
    testTitle: 'TOEIC Writing Test',
    completionRate:
      (backendResult.parts.reduce(
        (sum, part) => sum + part.questions.filter((q) => q.userAnswer).length,
        0
      ) /
        backendResult.parts.reduce(
          (sum, part) => sum + part.questions.length,
          0
        )) *
      100,
    parts,
  };
}

export function calculateStats(
  result: WritingOverallResult
): WritingResultStats {
  const allQuestions = result.parts.flatMap((part) => part.questions);
  const answeredQuestions = allQuestions.filter((q) => {
    return q.userAnswer && q.userAnswer.trim().length > 0;
  });

  return {
    totalQuestions: allQuestions.length,
    answeredQuestions: answeredQuestions.length,
    totalWordCount: answeredQuestions.reduce((sum, q) => sum + q.wordCount, 0),
  };
}
