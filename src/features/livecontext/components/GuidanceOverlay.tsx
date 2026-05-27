import { useEffect, useState, useCallback, useRef } from 'react';

export interface GuidanceState {
  selector: string;
  message?: string;
  type?: 'spotlight' | 'border' | 'pulse';
}

interface GuidanceOverlayProps {
  guidance: GuidanceState | null;
  onDismiss: () => void;
}

export default function GuidanceOverlay({
  guidance,
  onDismiss,
}: GuidanceOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const animRef = useRef<number>(0);

  const updateRect = useCallback(() => {
    if (!guidance) {
      setRect(null);
      setCursorPos(null);
      return;
    }
    const el = document.querySelector(guidance.selector);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
      setCursorPos({ x: r.left + r.width / 2 - 12, y: r.top - 28 });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setRect(null);
      setCursorPos(null);
    }
  }, [guidance]);

  useEffect(() => {
    if (!guidance) {
      setVisible(false);
      setRect(null);
      setCursorPos(null);
      return;
    }

    const initTimer = setTimeout(() => {
      updateRect();
      setVisible(true);
    }, 100);

    const dismissTimer = setTimeout(onDismiss, 12000);

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(dismissTimer);
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [guidance, updateRect, onDismiss]);

  if (!visible || !guidance) return null;

  if (!rect) {
    return (
      <div className="lc-guidance-overlay" onClick={onDismiss}>
        <div className="lc-guidance-not-found">
          <div className="lc-guidance-not-found__icon">🔍</div>
          <div className="lc-guidance-not-found__text">
            Element not found: <code>{guidance.selector}</code>
          </div>
          {guidance.message && (
            <div className="lc-guidance-not-found__msg">{guidance.message}</div>
          )}
        </div>
      </div>
    );
  }

  const pad = 8;
  const top = rect.top - pad;
  const left = rect.left - pad;
  const width = rect.width + pad * 2;
  const height = rect.height + pad * 2;

  return (
    <div className="lc-guidance-overlay" onClick={onDismiss}>
      <svg className="lc-guidance-backdrop" width="100%" height="100%">
        <defs>
          <mask id="lc-guidance-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={left}
              y={top}
              width={width}
              height={height}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#lc-guidance-mask)"
        />
      </svg>

      <div
        className="lc-guidance-highlight"
        style={{ top, left, width, height }}
      >
        <div className="lc-guidance-highlight__ring" />
        <div className="lc-guidance-highlight__ring lc-guidance-highlight__ring--2" />
      </div>

      {cursorPos && (
        <div
          className="lc-ai-cursor"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 3l14 8-6.5 2L9 19.5 5 3z"
              fill="url(#lc-cursor-grad)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="lc-cursor-grad" x1="5" y1="3" x2="19" y2="19">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="lc-ai-cursor__label">AI</div>
        </div>
      )}

      {guidance.message && (
        <div
          className="lc-guidance-tooltip"
          style={{
            top: top + height + 16,
            left: Math.max(16, Math.min(left, window.innerWidth - 340)),
          }}
        >
          <div className="lc-guidance-tooltip__header">
            <span className="lc-guidance-tooltip__icon">✦</span>
            <span className="lc-guidance-tooltip__label">AI Guide</span>
          </div>
          <div className="lc-guidance-tooltip__text">{guidance.message}</div>
          <div className="lc-guidance-tooltip__dismiss">
            Click anywhere to dismiss
          </div>
        </div>
      )}
    </div>
  );
}
