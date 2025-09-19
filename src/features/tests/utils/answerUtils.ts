/**
 * Utility function chung để lấy đáp án của user
 * Thay thế việc lặp lại logic tương tự trong mỗi component
 *
 * @param showCorrectAnswers - Có hiển thị đáp án đúng không (chế độ xem lại)
 * @param getAnswer - Function từ useTestSession để lấy đáp án hiện tại
 * @param questionNumber - Số câu hỏi
 * @param mockAnswers - Mock data cho chế độ xem lại (optional)
 * @returns Đáp án của user hoặc null
 */
export function getUserAnswer(
  showCorrectAnswers: boolean,
  getAnswer: (questionNumber: number) => string | null,
  questionNumber: number,
  mockAnswers?: Record<number, string>
): string | null {
  if (showCorrectAnswers && mockAnswers) {
    return mockAnswers[questionNumber] || null;
  }
  return getAnswer(questionNumber);
}

/**
 * Function chung để xử lý khi user chọn đáp án
 * Thay thế việc lặp lại logic tương tự trong mỗi component
 *
 * @param showCorrectAnswers - Có hiển thị đáp án đúng không (nếu có thì không cho phép chọn)
 * @param saveAnswer - Function từ useTestSession để lưu đáp án
 * @param questionNumber - Số câu hỏi
 * @param answer - Đáp án được chọn
 */
export function handleAnswerSelect(
  showCorrectAnswers: boolean,
  saveAnswer: (questionNumber: number, answer: string) => void,
  questionNumber: number,
  answer: string
): void {
  if (!showCorrectAnswers) {
    saveAnswer(questionNumber, answer);
  }
}

export const getUserAnswerUnified = (
  showCorrectAnswers: boolean,
  getAnswer: (questionNumber: number) => string | null, // Updated type to match actual return type
  questionNumber: number,
  reviewAnswers: Array<{
    questionNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }>,
  userAnswers: Record<number, string>
) => {
  if (showCorrectAnswers) {
    if (reviewAnswers.length > 0) {
      const reviewAnswer = reviewAnswers.find(
        (ans) => ans.questionNumber === questionNumber
      );
      return reviewAnswer?.selectedAnswer || '';
    }
    return userAnswers[questionNumber] || '';
  }
  return getAnswer(questionNumber) || ''; // Handles null as empty string
};
