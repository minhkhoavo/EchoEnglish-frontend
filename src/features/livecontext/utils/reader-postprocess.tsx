/**
 * Reader post-processing
 *
 * Splits long-form content into sentence-level <span data-ai-id="..." data-ai-role="sentence">
 * elements. This gives the AI individually addressable handles for every sentence.
 */

import { Fragment, type ReactNode } from 'react';

const ABBREV = /\b(?:e\.g|i\.e|etc|vs|Mr|Mrs|Ms|Dr|St|Jr|Sr|U\.S|U\.K)\.$/i;

export function splitIntoSentences(
  text: string,
  prefix: string
): { id: string; text: string }[] {
  if (!text) return [];
  const out: { id: string; text: string }[] = [];
  let buffer = '';
  let count = 0;

  const tokens = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [text];

  for (const tk of tokens) {
    buffer += tk;
    if (ABBREV.test(buffer.trim())) continue;
    const trimmed = buffer.trim();
    if (trimmed) {
      out.push({ id: `${prefix}-s${count++}`, text: trimmed });
    }
    buffer = '';
  }
  if (buffer.trim()) {
    out.push({ id: `${prefix}-s${count++}`, text: buffer.trim() });
  }
  return out;
}

export function renderSentences(text: string, prefix: string): ReactNode {
  const sentences = splitIntoSentences(text, prefix);
  if (sentences.length === 0) return text;

  return sentences.map((s, i) => (
    <Fragment key={s.id}>
      <span
        data-ai-id={s.id}
        data-ai-role="sentence"
        data-ai-label={`Sentence ${i + 1}`}
      >
        {s.text}
      </span>
      {i < sentences.length - 1 ? ' ' : ''}
    </Fragment>
  ));
}
