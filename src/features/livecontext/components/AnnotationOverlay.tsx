import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

export interface Annotation {
  id: string;
  type: 'point' | 'box' | 'circle' | 'note' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  label?: string;
  color?: string;
  toX?: number;
  toY?: number;
  createdAt: number;
  ttl: number;
}

export interface AnnotationOverlayHandle {
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => string;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  getAnnotations: () => Annotation[];
}

interface AnnotationOverlayProps {
  visible?: boolean;
}

const AnnotationOverlay = forwardRef<
  AnnotationOverlayHandle,
  AnnotationOverlayProps
>(({ visible = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotationsRef = useRef<Annotation[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useImperativeHandle(ref, () => ({
    addAnnotation: (partial) => {
      const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const annotation: Annotation = {
        ...partial,
        id,
        createdAt: Date.now(),
      };
      setAnnotations((prev) => [...prev, annotation]);

      if (annotation.ttl > 0) {
        setTimeout(() => {
          setAnnotations((prev) => prev.filter((a) => a.id !== id));
        }, annotation.ttl);
      }
      return id;
    },
    removeAnnotation: (id) => {
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    },
    clearAnnotations: () => setAnnotations([]),
    getAnnotations: () => annotationsRef.current,
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const W = rect.width;
    const H = rect.height;
    const now = Date.now();

    for (const ann of annotationsRef.current) {
      const age = now - ann.createdAt;
      const fadeIn = Math.min(1, age / 300);
      const fadeOut =
        ann.ttl > 0
          ? Math.max(0, 1 - Math.max(0, age - ann.ttl + 500) / 500)
          : 1;
      const alpha = fadeIn * fadeOut;
      if (alpha <= 0) continue;

      const x = (ann.x / 100) * W;
      const y = (ann.y / 100) * H;
      const color = ann.color || '#6366f1';

      ctx.globalAlpha = alpha;

      switch (ann.type) {
        case 'point': {
          const pulse = 1 + 0.2 * Math.sin(age / 200);
          const ripple = (age % 1500) / 1500;

          ctx.beginPath();
          ctx.arc(x, y, 20 * ripple * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = alpha * (1 - ripple) * 0.6;
          ctx.stroke();

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, 6 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        }

        case 'box': {
          const bw = ((ann.width || 20) / 100) * W;
          const bh = ((ann.height || 15) / 100) * H;
          const bx = x - bw / 2;
          const by = y - bh / 2;

          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = -age / 50;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);

          ctx.fillStyle = color + '15';
          ctx.fillRect(bx, by, bw, bh);

          const cornerSize = 10;
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerSize);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerSize, by);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerSize, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cornerSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cornerSize);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cornerSize, by + bh);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerSize, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cornerSize);
          ctx.stroke();
          break;
        }

        case 'circle': {
          const r = ((ann.radius || 10) / 100) * Math.min(W, H);

          ctx.setLineDash([6, 4]);
          ctx.lineDashOffset = -age / 40;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = color + '12';
          ctx.fill();
          break;
        }

        case 'arrow': {
          const toX = ((ann.toX || 50) / 100) * W;
          const toY = ((ann.toY || 50) / 100) * H;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          const angle = Math.atan2(toY - y, toX - x);
          const headLen = 12;
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(
            toX - headLen * Math.cos(angle - 0.4),
            toY - headLen * Math.sin(angle - 0.4)
          );
          ctx.lineTo(
            toX - headLen * Math.cos(angle + 0.4),
            toY - headLen * Math.sin(angle + 0.4)
          );
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          break;
        }

        case 'note':
          // Rendered as HTML below
          break;
      }

      if (ann.label && ann.type !== 'note') {
        const labelY =
          ann.type === 'box'
            ? y - (((ann.height || 15) / 100) * H) / 2 - 12
            : y - 18;

        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        const metrics = ctx.measureText(ann.label);
        const padX = 8,
          padY = 4;
        const lw = metrics.width + padX * 2;
        const lh = 20 + padY;
        const lx = x - lw / 2;
        const ly = labelY - lh;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 6);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 6);
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ann.label, x, ly + lh / 2);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }

      ctx.globalAlpha = 1;
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (visible && annotations.length > 0) {
      animFrameRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [visible, annotations, draw]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30"
      style={{ overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {annotations
        .filter((a) => a.type === 'note')
        .map((ann) => {
          const age = Date.now() - ann.createdAt;
          const fadeIn = Math.min(1, age / 300);
          return (
            <div
              key={ann.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${ann.x}%`,
                top: `${ann.y}%`,
                transform: 'translate(-50%, -100%)',
                opacity: fadeIn,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div
                className="px-3 py-2 rounded-lg text-xs text-white max-w-[200px] shadow-xl"
                style={{
                  background: 'rgba(0,0,0,0.85)',
                  border: `1px solid ${ann.color || '#6366f1'}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: ann.color || '#6366f1' }}>✦</span>
                  <span
                    className="font-semibold"
                    style={{ color: ann.color || '#6366f1' }}
                  >
                    AI Note
                  </span>
                </div>
                <div className="text-white/80 leading-relaxed">{ann.label}</div>
              </div>
              <div
                className="w-0 h-0 mx-auto"
                style={{
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: `6px solid ${ann.color || '#6366f1'}`,
                }}
              />
            </div>
          );
        })}
    </div>
  );
});

AnnotationOverlay.displayName = 'AnnotationOverlay';
export default AnnotationOverlay;
