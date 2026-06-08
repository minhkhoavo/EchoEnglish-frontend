/**
 * HTML Post-Processing for AI Vision
 *
 * Walks a raw HTML string, sanitizes it, and injects stable `data-ai-id` +
 * `data-ai-role` attributes so the AI can target every interesting element.
 * Paragraphs / list items are also broken into per-sentence spans.
 */

import { splitIntoSentences } from './reader-postprocess';

const DANGEROUS_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'frame',
  'frameset',
  'meta',
  'link',
  'style',
  'base',
]);

const SENTENCE_HOST_TAGS = new Set([
  'p',
  'li',
  'blockquote',
  'figcaption',
  'dd',
]);

function tagToRole(tag: string, el: Element): string {
  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'p':
      return 'paragraph';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'list-item';
    case 'blockquote':
      return 'quote';
    case 'pre':
      return 'code-block';
    case 'code':
      return 'code';
    case 'a':
      return 'link';
    case 'button':
      return 'button';
    case 'img':
    case 'figure':
      return 'image';
    case 'table':
      return 'table';
    case 'tr':
      return 'table-row';
    case 'td':
    case 'th':
      return 'table-cell';
    case 'section':
    case 'article':
      return 'section';
    case 'input': {
      const type = el.getAttribute('type') || 'text';
      return type === 'submit' ? 'submit' : 'input';
    }
    case 'form':
      return 'form';
    default:
      return tag;
  }
}

const TAG_INTERESTING = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'a',
  'button',
  'img',
  'figure',
  'section',
  'article',
  'aside',
  'nav',
  'form',
  'input',
  'textarea',
  'select',
  'label',
  'table',
  'tr',
  'th',
  'td',
]);

function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36).slice(0, 6);
}

function slug(text: string, max = 40): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, max) || 'untitled'
  );
}

function sanitizeElement(el: Element): boolean {
  for (const attr of Array.from(el.attributes)) {
    const n = attr.name.toLowerCase();
    if (n.startsWith('on')) el.removeAttribute(attr.name);
    if ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(attr.value)) {
      el.removeAttribute(attr.name);
    }
  }
  if (
    el.tagName.toLowerCase() === 'a' &&
    el.getAttribute('href')?.startsWith('http')
  ) {
    if (!el.getAttribute('target')) el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  }
  return true;
}

interface Stats {
  total: number;
  tagged: number;
  sentences: number;
  removed: number;
  durationMs: number;
}

export interface ProcessedHtml {
  html: string;
  prefix: string;
  stats: Stats;
}

export function processHtml(raw: string, prefix?: string): ProcessedHtml {
  const t0 = performance.now();
  const stats: Stats = {
    total: 0,
    tagged: 0,
    sentences: 0,
    removed: 0,
    durationMs: 0,
  };

  const tpl = document.createElement('template');
  tpl.innerHTML = raw;
  const root = tpl.content;

  const ns = prefix || `doc-${hash(raw.slice(0, 1024))}`;

  const counters = new Map<string, number>();
  const nextCounter = (key: string) => {
    const v = (counters.get(key) || 0) + 1;
    counters.set(key, v);
    return v;
  };

  root.querySelectorAll(Array.from(DANGEROUS_TAGS).join(',')).forEach((el) => {
    el.remove();
    stats.removed++;
  });

  const all = Array.from(root.querySelectorAll<Element>('*'));
  stats.total = all.length;

  for (const el of all) {
    sanitizeElement(el);

    const tag = el.tagName.toLowerCase();
    if (!TAG_INTERESTING.has(tag)) continue;

    if (el.getAttribute('data-ai-id')) {
      stats.tagged++;
      continue;
    }

    const text = (el.textContent || '').trim();
    const idx = nextCounter(tag);
    let aiId: string;
    if (/^h[1-6]$/.test(tag) && text) {
      aiId = `${ns}-${slug(text, 32)}`;
    } else if (text) {
      aiId = `${ns}-${tag}-${idx}-${hash(text.slice(0, 64))}`;
    } else {
      aiId = `${ns}-${tag}-${idx}`;
    }

    el.setAttribute('data-ai-id', aiId);
    el.setAttribute('data-ai-role', tagToRole(tag, el));
    if (text && text.length <= 80) {
      el.setAttribute('data-ai-label', text.slice(0, 80));
    }

    if (/^h[1-6]$/.test(tag) && !el.id) {
      el.id = aiId;
    }

    stats.tagged++;

    if (SENTENCE_HOST_TAGS.has(tag) && text.length > 0) {
      const sentenceCount = wrapSentences(el, aiId);
      stats.sentences += sentenceCount;
    }
  }

  stats.durationMs = +(performance.now() - t0).toFixed(2);

  return {
    html: tpl.innerHTML,
    prefix: ns,
    stats,
  };
}

function wrapSentences(el: Element, parentId: string): number {
  let created = 0;
  const children = Array.from(el.childNodes);

  for (const node of children) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const raw = node.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    const sentences = splitIntoSentences(trimmed, parentId);
    if (sentences.length === 0) continue;

    const frag = el.ownerDocument.createDocumentFragment();
    if (leading) frag.appendChild(document.createTextNode(leading));

    sentences.forEach((s, i) => {
      const span = el.ownerDocument.createElement('span');
      span.setAttribute('data-ai-id', s.id);
      span.setAttribute('data-ai-role', 'sentence');
      span.setAttribute('data-ai-label', `Sentence ${i + 1}`);
      span.textContent = s.text;
      frag.appendChild(span);
      if (i < sentences.length - 1)
        frag.appendChild(document.createTextNode(' '));
      created++;
    });

    if (trailing) frag.appendChild(document.createTextNode(trailing));
    el.replaceChild(frag, node);
  }

  return created;
}
