import type {
  TestQuestion,
  TestMedia,
} from '@/features/tests/types/toeic-test.types';

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function buildExamQuestionContext(
  question: TestQuestion,
  partName: string,
  showCorrectAnswers: boolean,
  groupContext?: TestMedia | null
): string {
  const lines: string[] = [
    `=== TOEIC Question Context (Q${question.questionNumber} · ${partName}) ===`,
    '',
  ];

  if (groupContext?.passageHtml) {
    lines.push('[Reading Passage]', stripHtml(groupContext.passageHtml), '');
  }
  if (groupContext?.transcript) {
    lines.push('[Audio Transcript]', groupContext.transcript, '');
  }
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

  // Only reveal answers/explanations in review mode – not during active exam
  if (showCorrectAnswers) {
    if (question.correctAnswer)
      lines.push(`Correct Answer: ${question.correctAnswer}`);
    if (question.explanation)
      lines.push(`Explanation: ${question.explanation}`);
    const translation =
      groupContext?.translation || question.media?.translation;
    if (translation) lines.push(`Vietnamese Translation: ${translation}`);
    lines.push('');
  }

  lines.push("Please answer the user's question about this TOEIC question.");
  return lines.join('\n');
}
