/**
 * RawHtmlRenderer
 *
 * Renders a raw HTML string from a backend, after running it through `processHtml`
 * to inject AI-vision attributes. Every interesting element gets a data-ai-id and
 * data-ai-role; paragraphs and list items are broken into per-sentence spans.
 */

import { useMemo } from 'react';
import { processHtml, type ProcessedHtml } from '../utils/html-postprocess';

interface RawHtmlRendererProps {
  html: string;
  prefix?: string;
  className?: string;
  onStats?: (info: ProcessedHtml) => void;
}

export default function RawHtmlRenderer({
  html,
  prefix,
  className,
  onStats,
}: RawHtmlRendererProps) {
  const processed = useMemo(() => {
    const result = processHtml(html, prefix);
    console.log(
      `🧠 [HtmlPostProcess] ns="${result.prefix}" tagged=${result.stats.tagged}/${result.stats.total} ` +
        `sentences=${result.stats.sentences} removed=${result.stats.removed} ` +
        `in ${result.stats.durationMs}ms`
    );
    return result;
  }, [html, prefix]);

  useMemo(() => onStats?.(processed), [processed, onStats]);

  return (
    <div
      className={`lc-raw-html-content ${className || ''}`}
      data-ai-id={processed.prefix}
      data-ai-role="article-body"
      dangerouslySetInnerHTML={{ __html: processed.html }}
    />
  );
}
