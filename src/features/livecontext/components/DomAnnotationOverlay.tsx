/**
 * DomAnnotationOverlay
 *
 * Full-screen fixed overlay that renders AI annotations anchored to DOM elements
 * or to the user's text selection. Tracks live element rects via requestAnimationFrame
 * so boxes/cursors stay aligned when the user scrolls/resizes.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { findElementByAiId, findTextRange } from '../utils/dom-vision';

export type DomAnnotationKind =
  | 'box'
  | 'cursor'
  | 'note'
  | 'text-highlight'
  | 'arrow-to';

interface DomAnnotationBase {
  id: string;
  kind: DomAnnotationKind;
  label?: string;
  color?: string;
  ttl: number;
  createdAt: number;
}

export interface DomBoxAnnotation extends DomAnnotationBase {
  kind: 'box';
  target: string;
}

export interface DomCursorAnnotation extends DomAnnotationBase {
  kind: 'cursor';
  target: string;
}

export interface DomNoteAnnotation extends DomAnnotationBase {
  kind: 'note';
  target: string;
}

export interface DomTextHighlightAnnotation extends DomAnnotationBase {
  kind: 'text-highlight';
  target: string;
  text: string;
}

export interface DomArrowToAnnotation extends DomAnnotationBase {
  kind: 'arrow-to';
  target: string;
}

export type DomAnnotation =
  | DomBoxAnnotation
  | DomCursorAnnotation
  | DomNoteAnnotation
  | DomTextHighlightAnnotation
  | DomArrowToAnnotation;

export type DomAnnotationInput =
  | Omit<DomBoxAnnotation, 'id' | 'createdAt'>
  | Omit<DomCursorAnnotation, 'id' | 'createdAt'>
  | Omit<DomNoteAnnotation, 'id' | 'createdAt'>
  | Omit<DomTextHighlightAnnotation, 'id' | 'createdAt'>
  | Omit<DomArrowToAnnotation, 'id' | 'createdAt'>;

export interface DomAnnotationOverlayHandle {
  add: (a: DomAnnotationInput) => string;
  remove: (id: string) => void;
  clear: () => void;
  list: () => DomAnnotation[];
}

function resolveTarget(target: string): HTMLElement | null {
  if (!target) return null;
  const byAi = findElementByAiId(target);
  if (byAi) return byAi;
  try {
    return document.querySelector<HTMLElement>(target);
  } catch {
    return null;
  }
}

interface ResolvedRect {
  rect: DOMRect;
  ranges?: DOMRect[];
}

function resolveRects(ann: DomAnnotation): ResolvedRect | null {
  const el = resolveTarget(ann.target);
  if (!el) return null;
  if (ann.kind === 'text-highlight') {
    const range = findTextRange(el, ann.text);
    if (!range) return { rect: el.getBoundingClientRect() };
    const rects = Array.from(range.getClientRects()).filter(
      (r) => r.width > 0 && r.height > 0
    );
    return { rect: range.getBoundingClientRect(), ranges: rects };
  }
  return { rect: el.getBoundingClientRect() };
}

const DomAnnotationOverlay = forwardRef<DomAnnotationOverlayHandle, object>(
  (_props, ref) => {
    const [annotations, setAnnotations] = useState<DomAnnotation[]>([]);
    const annRef = useRef<DomAnnotation[]>([]);
    const [rects, setRects] = useState<Map<string, ResolvedRect>>(new Map());
    const rafRef = useRef<number>(0);

    useEffect(() => {
      annRef.current = annotations;
    }, [annotations]);

    useImperativeHandle(ref, () => ({
      add: (partial) => {
        const id = `dom-ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const next: DomAnnotation = {
          ...partial,
          id,
          createdAt: Date.now(),
        } as DomAnnotation;
        setAnnotations((prev) => [...prev, next]);

        if (next.ttl > 0) {
          setTimeout(() => {
            setAnnotations((prev) => prev.filter((a) => a.id !== id));
          }, next.ttl);
        }
        return id;
      },
      remove: (id) => setAnnotations((prev) => prev.filter((a) => a.id !== id)),
      clear: () => setAnnotations([]),
      list: () => annRef.current,
    }));

    const tick = useCallback(() => {
      const next = new Map<string, ResolvedRect>();
      for (const ann of annRef.current) {
        const r = resolveRects(ann);
        if (r) next.set(ann.id, r);
      }
      setRects((prev) => {
        if (prev.size !== next.size) return next;
        for (const [k, v] of next) {
          const old = prev.get(k);
          if (
            !old ||
            old.rect.left !== v.rect.left ||
            old.rect.top !== v.rect.top ||
            old.rect.width !== v.rect.width ||
            old.rect.height !== v.rect.height ||
            (old.ranges?.length || 0) !== (v.ranges?.length || 0)
          ) {
            return next;
          }
        }
        return prev;
      });
      rafRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
      if (annotations.length === 0) {
        cancelAnimationFrame(rafRef.current);
        setRects(new Map());
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [annotations, tick]);

    if (annotations.length === 0) return null;

    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 99997 }}
        aria-hidden="true"
      >
        {annotations.map((ann) => {
          const resolved = rects.get(ann.id);
          if (!resolved) return null;
          const age = Date.now() - ann.createdAt;
          const fadeIn = Math.min(1, age / 250);
          const fadeOut =
            ann.ttl > 0
              ? Math.max(0, 1 - Math.max(0, age - ann.ttl + 400) / 400)
              : 1;
          const opacity = fadeIn * fadeOut;
          if (opacity <= 0) return null;

          const color = ann.color || '#6366f1';

          switch (ann.kind) {
            case 'box':
              return (
                <BoxRender
                  key={ann.id}
                  ann={ann}
                  rect={resolved.rect}
                  color={color}
                  opacity={opacity}
                />
              );
            case 'cursor':
              // Cursor always renders with a soft selection box too — when the
              // AI says "click this", the user sees BOTH the cursor pointer AND
              // a visual selection box around the target so there's zero
              // ambiguity about what's being pointed at.
              return (
                <CursorWithBoxRender
                  key={ann.id}
                  ann={ann}
                  rect={resolved.rect}
                  color={color}
                  opacity={opacity}
                />
              );
            case 'note':
              return (
                <NoteRender
                  key={ann.id}
                  ann={ann}
                  rect={resolved.rect}
                  color={color}
                  opacity={opacity}
                />
              );
            case 'text-highlight':
              return (
                <TextHighlightRender
                  key={ann.id}
                  ann={ann}
                  rect={resolved.rect}
                  ranges={resolved.ranges}
                  color={color}
                  opacity={opacity}
                />
              );
            case 'arrow-to':
              return (
                <ArrowToRender
                  key={ann.id}
                  ann={ann}
                  rect={resolved.rect}
                  color={color}
                  opacity={opacity}
                />
              );
          }
        })}
      </div>
    );
  }
);

DomAnnotationOverlay.displayName = 'DomAnnotationOverlay';
export default DomAnnotationOverlay;

function BoxRender({
  ann,
  rect,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  color: string;
  opacity: number;
}) {
  const pad = 6;
  const top = rect.top - pad;
  const left = rect.left - pad;
  const width = rect.width + pad * 2;
  const height = rect.height + pad * 2;

  return (
    <>
      <svg
        className="lc-dom-ann-svg"
        style={{
          position: 'absolute',
          top,
          left,
          width,
          height,
          opacity,
          overflow: 'visible',
        }}
      >
        <rect
          x={1.5}
          y={1.5}
          width={width - 3}
          height={height - 3}
          rx={10}
          ry={10}
          fill={`${color}14`}
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray="8 4"
          style={{ animation: 'lc-dom-ann-march 1s linear infinite' }}
        />
        {[
          [1.5, 1.5, 1, 1],
          [width - 1.5, 1.5, -1, 1],
          [1.5, height - 1.5, 1, -1],
          [width - 1.5, height - 1.5, -1, -1],
        ].map(([cx, cy, dx, dy], i) => (
          <g
            key={i}
            stroke="white"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          >
            <line x1={cx} y1={cy} x2={cx + dx * 10} y2={cy} />
            <line x1={cx} y1={cy} x2={cx} y2={cy + dy * 10} />
          </g>
        ))}
      </svg>

      {ann.label && (
        <div
          style={{
            position: 'absolute',
            top: top - 30,
            left: Math.max(8, Math.min(left, window.innerWidth - 250)),
            opacity,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            border: `1px solid ${color}`,
            backdropFilter: 'blur(8px)',
            maxWidth: 240,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          <span style={{ color, marginRight: 6 }}>✦</span>
          {ann.label}
        </div>
      )}
    </>
  );
}

function CursorRender({
  ann,
  rect,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  color: string;
  opacity: number;
}) {
  /*
   * Where should the cursor TIP land?
   *
   * The SVG path "M5 3 …" has its pointing tip at coordinates (5, 3) inside
   * a 24x24 viewBox rendered at 28x28 px. So the tip in the rendered cursor
   * is at offset (5/24 * 28, 3/24 * 28) ≈ (5.83, 3.5) px from the cursor
   * <div>'s top-left corner.
   *
   * We want the tip to land at center-top of the target, slightly inside
   * the button (around y = rect.top + 6) so it visibly TOUCHES the element
   * instead of floating in space above it (the old code put the tip ~28 px
   * above the button — that's what made users say "lệch lên trên").
   */
  const tipX = rect.left + rect.width / 2;
  // Bias the tip a few px inside the element so it looks like the cursor is
  // landing on (not hovering above) the button. Cap inset for tall elements.
  const tipY = rect.top + Math.min(8, Math.max(2, rect.height * 0.15));

  const cursorTipOffsetX = 5.83;
  const cursorTipOffsetY = 3.5;

  return (
    <div
      className="lc-dom-ann-cursor"
      style={{
        position: 'absolute',
        left: tipX - cursorTipOffsetX,
        top: tipY - cursorTipOffsetY,
        opacity,
        filter: `drop-shadow(0 0 8px ${color}80) drop-shadow(0 0 18px ${color}40)`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path
          d="M5 3l14 8-6.5 2L9 19.5 5 3z"
          fill={`url(#cursorGrad-${ann.id})`}
          stroke="white"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id={`cursorGrad-${ann.id}`}
            x1="5"
            y1="3"
            x2="19"
            y2="19"
          >
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      {ann.label && (
        <div
          style={{
            position: 'absolute',
            left: 28,
            top: 0,
            background: `linear-gradient(135deg, ${color}, #a855f7)`,
            color: 'white',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: `0 2px 8px ${color}60`,
          }}
        >
          {ann.label}
        </div>
      )}
    </div>
  );
}

/**
 * CursorWithBoxRender
 *
 * Renders a soft drawbox AROUND the target element together with the AI
 * cursor pointing at it. When the AI calls `point_at_element` (or our
 * 'cursor' DOM annotation), this is what the user sees — both cues at once
 * so there's no ambiguity about which element is being pointed at.
 */
function CursorWithBoxRender({
  ann,
  rect,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  color: string;
  opacity: number;
}) {
  // Soft box around the element — same dimensions as BoxRender but slightly
  // lighter so the cursor stays the main focal point.
  const pad = 5;
  const top = rect.top - pad;
  const left = rect.left - pad;
  const width = rect.width + pad * 2;
  const height = rect.height + pad * 2;

  return (
    <>
      {/* Soft "selection" box behind the cursor */}
      <div
        style={{
          position: 'absolute',
          top,
          left,
          width,
          height,
          opacity: opacity * 0.95,
          background: `${color}1a`,
          border: `2px dashed ${color}`,
          borderRadius: 10,
          boxShadow: `0 0 18px ${color}45, inset 0 0 12px ${color}25`,
          pointerEvents: 'none',
          animation: 'lc-cursor-box-pulse 1.4s ease-in-out infinite',
        }}
      />
      {/* The cursor on top of the box */}
      <CursorRender ann={ann} rect={rect} color={color} opacity={opacity} />
    </>
  );
}

function NoteRender({
  ann,
  rect,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  color: string;
  opacity: number;
}) {
  const x = rect.left + rect.width / 2;
  const y = rect.top;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y - 8,
        transform: 'translate(-50%, -100%)',
        opacity,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          background: 'rgba(14,14,22,0.95)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 10,
          fontSize: 13,
          maxWidth: 260,
          border: `1px solid ${color}`,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 24px ${color}30`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span style={{ color, fontSize: 12 }}>✦</span>
          <span
            style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}
          >
            AI NOTE
          </span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          {ann.label}
        </div>
      </div>
      <div
        style={{
          margin: '0 auto',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${color}`,
        }}
      />
    </div>
  );
}

function TextHighlightRender({
  ann,
  rect,
  ranges,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  ranges?: DOMRect[];
  color: string;
  opacity: number;
}) {
  const lineRects = ranges && ranges.length > 0 ? ranges : [rect];

  return (
    <>
      {lineRects.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: r.top - 2,
            left: r.left - 2,
            width: r.width + 4,
            height: r.height + 4,
            opacity: opacity * 0.85,
            background: `${color}33`,
            border: `1.5px solid ${color}`,
            borderRadius: 4,
            boxShadow: `0 0 12px ${color}40`,
            pointerEvents: 'none',
            transition: 'all 0.15s ease',
          }}
        />
      ))}
      {ann.label && (
        <div
          style={{
            position: 'absolute',
            top: lineRects[0].top - 30,
            left: Math.max(
              8,
              Math.min(lineRects[0].left, window.innerWidth - 240)
            ),
            opacity,
            background: `${color}`,
            color: 'white',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: `0 2px 8px ${color}60`,
          }}
        >
          {ann.label}
        </div>
      )}
    </>
  );
}

function ArrowToRender({
  ann,
  rect,
  color,
  opacity,
}: {
  ann: DomAnnotation;
  rect: DOMRect;
  color: string;
  opacity: number;
}) {
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  const startX = window.innerWidth - 80;
  const startY = window.innerHeight - 80;

  const cx = (startX + targetX) / 2;
  const cy = Math.min(startY, targetY) - 80;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${ann.id}`}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill={color} />
        </marker>
      </defs>
      <path
        d={`M ${startX} ${startY} Q ${cx} ${cy}, ${targetX} ${targetY}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="6 4"
        markerEnd={`url(#arrowhead-${ann.id})`}
        style={{
          animation: 'lc-dom-ann-march 0.8s linear infinite',
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }}
      />
    </svg>
  );
}
