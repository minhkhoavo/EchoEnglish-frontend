/**
 * Convert stored rich-text/HTML (e.g. `<p>…</p>`) into clean plain text for
 * display in the audio-generation fields. TOEIC content/options/transcripts are
 * stored as HTML; the spoken script must be plain text.
 */
export function htmlToText(html?: string | null): string {
  if (!html) return '';
  // Plain text fast-path (no tags/entities).
  if (!/[<&]/.test(html)) return html.trim();

  const prepared = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|tr|blockquote)\s*>/gi, '\n');

  const doc = new DOMParser().parseFromString(prepared, 'text/html');
  const text = doc.body.textContent ?? '';

  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
