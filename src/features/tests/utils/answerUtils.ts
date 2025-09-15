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
