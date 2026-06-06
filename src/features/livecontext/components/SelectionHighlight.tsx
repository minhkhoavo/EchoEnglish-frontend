/**
 * SelectionHighlight
 *
 * Listens to `selectionchange` globally and renders a soft animated box over
 * every line-rect of the user's current text selection. This gives an explicit
 * "this is what we're talking about" cue to both the user and the AI — when
 * the AI calls get_user_selection() the same rects are already known.
 *
 * Only renders when:
 *  - Live Mode is enabled (otherwise the AI can't see selection anyway), AND
 *  - the live chat panel is closed (otherwise the overlay would compete with
 *    the panel UI and the user is already in a chat context).
 *
 * Skips selections inside inputs/textareas/contenteditable (those are
 * already shown by the OS) and selections inside the live chat panel.
 */
import { useEffect, useState, useRef } from 'react';
import { useCompanion } from '../context/CompanionContext';

interface SelectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const HIDE_DELAY = 250; // ms — debounce empty-selection clearing
const INSIDE_LIVE_UI = (node: Node | null): boolean => {
  let n: Node | null = node;
  while (n && n !== document.body) {
    if (n instanceof HTMLElement) {
      if (
        n.closest(
          '.lc-chat-panel, .lc-companion-orb-touch, .lc-webcam-float, input, textarea, [contenteditable="true"]'
        )
      ) {
        return true;
      }
    }
    n = n.parentNode;
  }
  return false;
};

export default function SelectionHighlight() {
  const { liveModeEnabled, isPanelOpen } = useCompanion();
  const [rects, setRects] = useState<SelectionRect[]>([]);
  const [text, setText] = useState('');
  const hideTimerRef = useRef<number | null>(null);

  // Only active when Live Mode is on AND the chat panel is hidden.
  const active = liveModeEnabled && !isPanelOpen;

  useEffect(() => {
    if (!active) {
      setRects([]);
      setText('');
      return;
    }
    const update = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        // Debounce empty selection — avoid flicker when user clicks on the
        // selection itself (which momentarily collapses then restores it)
        hideTimerRef.current = window.setTimeout(() => {
          setRects([]);
          setText('');
        }, HIDE_DELAY);
        return;
      }
      const range = sel.getRangeAt(0);
      const selText = sel.toString().trim();
      if (!selText) {
        setRects([]);
        setText('');
        return;
      }
      // Skip selections inside form fields or the live UI itself
      if (INSIDE_LIVE_UI(range.startContainer)) {
        setRects([]);
        setText('');
        return;
      }
      const clientRects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 1 && r.height > 1
      );
      if (clientRects.length === 0) {
        setRects([]);
        setText('');
        return;
      }
      setRects(
        clientRects.map((r) => ({
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
        }))
      );
      setText(selText.slice(0, 80));
    };

    document.addEventListener('selectionchange', update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('selectionchange', update);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [active]);

  if (!active || rects.length === 0) return null;

  const first = rects[0];

  return (
    <div
      className="lc-selection-highlight"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99995,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {rects.map((r, i) => (
        <div
          key={i}
          className="lc-selection-highlight__rect"
          style={{
            position: 'absolute',
            top: r.top - 2,
            left: r.left - 2,
            width: r.width + 4,
            height: r.height + 4,
          }}
        />
      ))}
      {/* Tiny pill above the first line so the user knows the AI sees this */}
      <div
        className="lc-selection-highlight__pill"
        style={{
          position: 'absolute',
          top: Math.max(8, first.top - 26),
          left: Math.max(8, Math.min(first.left, window.innerWidth - 200)),
        }}
      >
        <span className="lc-selection-highlight__pill-dot" />
        AI sees:{' '}
        <span className="lc-selection-highlight__pill-text">"{text}"</span>
      </div>
    </div>
  );
}
