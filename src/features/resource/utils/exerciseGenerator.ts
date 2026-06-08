/**
 * Exercise Generator Utilities
 * Utility functions for exercise components
 */

// ============================================================================
// ANSWER COMPARISON
// ============================================================================

/**
 * So sánh 2 string (case-insensitive, bỏ punctuation)
 */
export const compareAnswers = (
  userAnswer: string,
  correctAnswer: string
): boolean => {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  return normalize(userAnswer) === normalize(correctAnswer);
};

/**
 * Tính điểm tương đồng (0-1) sử dụng Levenshtein distance
 */
export const calculateSimilarity = (
  userAnswer: string,
  correctAnswer: string
): number => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const a = normalize(userAnswer);
  const b = normalize(correctAnswer);

  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
};
