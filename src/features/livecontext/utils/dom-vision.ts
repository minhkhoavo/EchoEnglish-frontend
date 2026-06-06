/**
 * DOM Vision — spatial index + element resolution for the AI companion.
 *
 * Scans the DOM for elements tagged with `data-ai-id` (explicit) plus generic
 * semantic tags (button, h1-h4, input, section[id]…) and exposes each one as
 * a structured record with rects in both pixels and viewport percentages.
 */

export interface AiElement {
  aiId: string;
  selector: string;
  tag: string;
  role: string;
  label: string;
  text: string;
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
    pctX: number;
    pctY: number;
    pctW: number;
    pctH: number;
  };
  visible: boolean;
  interactable: boolean;
}

export interface UserSelection {
  text: string;
  containerAiId?: string;
  containerSelector?: string;
  rect?: { pctX: number; pctY: number; pctW: number; pctH: number };
}

let autoIdCounter = 0;

const SEMANTIC_SELECTORS = [
  '[data-ai-id]',
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'h1, h2, h3, h4',
  'section[id]',
  'main',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
].join(', ');

function generateAutoId(el: HTMLElement): string {
  const text = (
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    (el.textContent || '').trim()
  )
    .slice(0, 24)
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  const tag = el.tagName.toLowerCase();
  return text
    ? `${tag}-${text}-${++autoIdCounter}`
    : `${tag}-${++autoIdCounter}`;
}

function inferRole(el: HTMLElement): string {
  if (el.dataset.aiRole) return el.dataset.aiRole;
  const tag = el.tagName.toLowerCase();
  const text = (el.textContent || '').trim().toLowerCase();
  const aria = (el.getAttribute('aria-label') || '').toLowerCase();
  const all = `${text} ${aria} ${el.className}`;

  if (tag === 'button' || tag === 'a' || el.getAttribute('role') === 'button') {
    if (/delete|remove|trash|✕|×/.test(all)) return 'delete';
    if (/create|add|new|\+/.test(all)) return 'create';
    if (/save|submit|update/.test(all)) return 'save';
    if (/search/.test(all)) return 'search';
    if (/filter|category/.test(all)) return 'filter';
    if (/back|cancel|close/.test(all)) return 'cancel';
    if (/connect|disconnect/.test(all)) return 'connect';
    if (/start|play|begin|launch/.test(all)) return 'start';
    if (/view|open|detail/.test(all)) return 'view';
    if (/navigate|nav|menu/.test(all) || el.closest('nav')) return 'navigation';
    return 'button';
  }
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type;
    if (
      type === 'search' ||
      /search/.test(el.getAttribute('placeholder') || '')
    )
      return 'search';
    return 'input';
  }
  if (tag === 'select' || tag === 'textarea') return 'input';
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'section') return 'section';
  return el.getAttribute('role') || tag;
}

function getLabel(el: HTMLElement): string {
  return (
    el.dataset.aiLabel ||
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    (el.textContent || '').trim().split('\n')[0].slice(0, 80) ||
    el.tagName.toLowerCase()
  );
}

export function buildDomIndex(options?: {
  onlyVisible?: boolean;
  rootSelector?: string;
}): AiElement[] {
  const { onlyVisible = false, rootSelector } = options || {};
  const root = rootSelector
    ? document.querySelector(rootSelector) || document
    : document;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const elements: AiElement[] = [];

  root.querySelectorAll<HTMLElement>(SEMANTIC_SELECTORS).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const style = window.getComputedStyle(el);
    if (
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0'
    )
      return;

    const visible = r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    if (onlyVisible && !visible) return;

    let aiId = el.dataset.aiId || el.id;
    if (!aiId) {
      aiId = generateAutoId(el);
      el.dataset.aiId = aiId;
    } else if (!el.dataset.aiId) {
      el.dataset.aiId = aiId;
    }

    const role = inferRole(el);
    const label = getLabel(el);
    const text = (el.textContent || '')
      .trim()
      .slice(0, 140)
      .replace(/\s+/g, ' ');

    elements.push({
      aiId,
      selector: `[data-ai-id="${aiId}"]`,
      tag: el.tagName.toLowerCase(),
      role,
      label,
      text,
      rect: {
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
        pctX: +((r.left / vw) * 100).toFixed(2),
        pctY: +((r.top / vh) * 100).toFixed(2),
        pctW: +((r.width / vw) * 100).toFixed(2),
        pctH: +((r.height / vh) * 100).toFixed(2),
      },
      visible,
      interactable: el.matches(
        'button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"]'
      ),
    });
  });

  return elements;
}

export function findElementByAiId(aiId: string): HTMLElement | null {
  if (!aiId) return null;
  return (
    document.querySelector<HTMLElement>(`[data-ai-id="${CSS.escape(aiId)}"]`) ||
    document.getElementById(aiId)
  );
}

export function getCurrentSelection(): UserSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const text = sel.toString().trim();
  if (!text) return null;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let node: Node | null = range.commonAncestorContainer;
  let containerAiId: string | undefined;
  let containerSelector: string | undefined;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      if (node.dataset.aiId) {
        containerAiId = node.dataset.aiId;
        containerSelector = `[data-ai-id="${node.dataset.aiId}"]`;
        break;
      }
      if (node.id) {
        containerAiId = node.id;
        containerSelector = `#${node.id}`;
        break;
      }
    }
    node = node.parentNode;
  }

  return {
    text: text.slice(0, 500),
    containerAiId,
    containerSelector,
    rect:
      rect.width > 0 && rect.height > 0
        ? {
            pctX: +((rect.left / vw) * 100).toFixed(2),
            pctY: +((rect.top / vh) * 100).toFixed(2),
            pctW: +((rect.width / vw) * 100).toFixed(2),
            pctH: +((rect.height / vh) * 100).toFixed(2),
          }
        : undefined,
  };
}

/**
 * Find a Range matching the given text inside a container element.
 * Handles text spanning multiple text nodes (e.g., text broken by inline spans).
 */
export function findTextRange(
  container: HTMLElement,
  text: string
): Range | null {
  if (!text) return null;
  const needle = text.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!needle) return null;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeValue ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes: { node: Text; start: number; end: number }[] = [];
  let flat = '';
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = (n.nodeValue || '').replace(/\s+/g, ' ');
    nodes.push({
      node: n as Text,
      start: flat.length,
      end: flat.length + t.length,
    });
    flat += t;
  }

  const idx = flat.toLowerCase().indexOf(needle);
  if (idx < 0) return null;
  const endIdx = idx + needle.length;

  const startNode = nodes.find((nn) => idx >= nn.start && idx < nn.end);
  const endNode = nodes.find((nn) => endIdx > nn.start && endIdx <= nn.end);
  if (!startNode || !endNode) return null;

  const range = document.createRange();
  try {
    range.setStart(
      startNode.node,
      Math.min(idx - startNode.start, startNode.node.length)
    );
    range.setEnd(
      endNode.node,
      Math.min(endIdx - endNode.start, endNode.node.length)
    );
  } catch {
    return null;
  }
  return range;
}

export function summarizeIndex(elements: AiElement[]) {
  return elements
    .filter((e) => e.visible)
    .slice(0, 80)
    .map((e) => ({
      ai_id: e.aiId,
      role: e.role,
      label: e.label.slice(0, 50),
      tag: e.tag,
      pos: `${e.rect.pctX.toFixed(0)},${e.rect.pctY.toFixed(0)} ${e.rect.pctW.toFixed(0)}x${e.rect.pctH.toFixed(0)}`,
      interactable: e.interactable || undefined,
    }));
}
