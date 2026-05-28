/**
 * WebcamFloat
 *
 * Floating draggable PiP-style webcam window — like meeting apps.
 *
 * Supports three sizes (PiP, Medium, Large) plus a near-fullscreen Expanded
 * mode that fills most of the viewport so the AI's annotations (boxes,
 * arrows, circles, notes) are big enough to read and the user can clearly
 * see what's being pointed at — matches the standalone livecontext demo
 * where the camera filled the page.
 *
 * Controls (header):
 *   ⛶  expand to large viewport mode
 *   ⤢  cycle PiP → Medium → Large size
 *   ◰  minimise to a 64px badge
 *   🎤 / 📹  toggle audio-only (camera off, mic on)
 *   ✕  close (also stops media tracks)
 *
 * The AnnotationOverlay is mounted *inside* the mirrored video container so
 * percentage coordinates emitted by the AI (which sees the mirrored frame)
 * align pixel-perfectly with the rendering.
 */
import { useEffect, useRef, useState } from 'react';
import { useCompanion } from '../context/CompanionContext';
import AnnotationOverlay from './AnnotationOverlay';

interface Position {
  x: number;
  y: number;
}

type SizeMode = 'pip' | 'medium' | 'large' | 'expanded';

const SIZE_MAP: Record<SizeMode, { w: number; h: number }> = {
  pip: { w: 320, h: 240 },
  medium: { w: 480, h: 360 },
  large: { w: 720, h: 540 },
  expanded: { w: 0, h: 0 }, // computed from viewport
};

const DEFAULT_POSITION: Position = { x: 24, y: 96 };

function getExpandedSize(): { w: number; h: number } {
  const w = Math.min(window.innerWidth - 80, 1280);
  const h = Math.min(window.innerHeight - 160, 900);
  return { w, h };
}

export default function WebcamFloat() {
  const {
    webcamEnabled,
    webcamStream,
    disableWebcam,
    isStreaming,
    startStreaming,
    stopStreaming,
    connected,
    annotationRef,
    companionState,
    isModelSpeaking,
  } = useCompanion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [audioOnly, setAudioOnly] = useState(true);
  const [sizeMode, setSizeMode] = useState<SizeMode>('pip');
  const [viewportSize, setViewportSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  // Track viewport size for expanded mode
  useEffect(() => {
    const onResize = () =>
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // When webcam toggled on while connected, auto-start video frame streaming
  useEffect(() => {
    if (!webcamEnabled || !connected) return;
    if (audioOnly) return;
    const timer = setTimeout(() => {
      if (videoRef.current) startStreaming(videoRef.current);
    }, 200);
    return () => clearTimeout(timer);
  }, [webcamEnabled, connected, audioOnly, startStreaming]);

  // When audio-only toggled on, stop video stream then restart audio-only
  useEffect(() => {
    if (audioOnly) {
      stopStreaming();
      if (connected) startStreaming(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioOnly]);

  // Drag handlers (skip when expanded — the window is centered then)
  useEffect(() => {
    if (!isDragging || !dragStart) return;
    const handleMove = (e: MouseEvent) => {
      const dims =
        sizeMode === 'expanded' ? getExpandedSize() : SIZE_MAP[sizeMode];
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const maxX = window.innerWidth - dims.w - 8;
      const maxY = window.innerHeight - dims.h - 8;
      setPosition({
        x: Math.max(8, Math.min(maxX, newX)),
        y: Math.max(8, Math.min(maxY, newY)),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, dragStart, sizeMode]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (sizeMode === 'expanded') return; // disable drag in expanded mode
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const cycleSize = () => {
    setSizeMode((prev) => {
      if (prev === 'pip') return 'medium';
      if (prev === 'medium') return 'large';
      if (prev === 'large') return 'pip';
      return 'pip';
    });
  };

  const toggleExpand = () => {
    setSizeMode((prev) => (prev === 'expanded' ? 'pip' : 'expanded'));
    // Reset position when entering expanded mode
    if (sizeMode !== 'expanded') {
      const expandedDims = getExpandedSize();
      setPosition({
        x: Math.max(8, (window.innerWidth - expandedDims.w) / 2),
        y: Math.max(80, (window.innerHeight - expandedDims.h) / 2),
      });
    } else {
      setPosition(DEFAULT_POSITION);
    }
  };

  if (!webcamEnabled) return null;

  const dims = sizeMode === 'expanded' ? getExpandedSize() : SIZE_MAP[sizeMode];
  const w = minimized ? 64 : dims.w;
  const h = minimized ? 64 : dims.h;

  return (
    <div
      className={`lc-webcam-float lc-webcam-float--${sizeMode}`}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: w,
        height: h + (minimized ? 0 : 36),
        zIndex: sizeMode === 'expanded' ? 99998 : 99996,
        cursor: isDragging ? 'grabbing' : undefined,
        userSelect: 'none',
        // Use viewportSize to trigger re-layout on resize (expanded mode)
        outline: viewportSize ? 'none' : 'none',
      }}
    >
      {/* Drag handle / header */}
      <div
        ref={dragRef}
        onMouseDown={handleDragStart}
        className="lc-webcam-float__header"
        style={{
          cursor: sizeMode === 'expanded' ? 'default' : 'grab',
        }}
      >
        <div className="lc-webcam-float__title">
          <span
            className="lc-webcam-float__dot"
            style={{
              background:
                companionState === 'listening'
                  ? '#10b981'
                  : isModelSpeaking
                    ? '#a855f7'
                    : isStreaming
                      ? '#ef4444'
                      : '#6b7280',
            }}
          />
          <span>
            {audioOnly
              ? 'Audio only'
              : sizeMode === 'expanded'
                ? 'Camera — Expanded'
                : `Camera — ${sizeMode.toUpperCase()}`}
          </span>
        </div>
        <div className="lc-webcam-float__controls">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="lc-webcam-float__btn"
            title={
              sizeMode === 'expanded' ? 'Restore' : 'Expand for annotation'
            }
          >
            {sizeMode === 'expanded' ? '⤡' : '⛶'}
          </button>
          {sizeMode !== 'expanded' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleSize();
              }}
              className="lc-webcam-float__btn"
              title="Cycle size (PiP → Medium → Large)"
            >
              ⤢
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAudioOnly((v) => !v);
            }}
            className="lc-webcam-float__btn"
            title={audioOnly ? 'Enable camera' : 'Audio only'}
          >
            {audioOnly ? '📹' : '🎤'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((v) => !v);
            }}
            className="lc-webcam-float__btn"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '◰' : '—'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              disableWebcam();
            }}
            className="lc-webcam-float__btn lc-webcam-float__btn--danger"
            title="Close webcam"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <div
          className="lc-webcam-float__body"
          style={{
            width: w,
            height: h,
            background: '#000',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {audioOnly ? (
            <div className="lc-webcam-float__audio-only">
              <div className="lc-webcam-float__audio-pulse" />
              <span>Audio only — camera off</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="lc-webcam-float__video"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              {/* Annotation overlay sits inside the mirrored container so AI
                  percentage-coords map directly to the user's view. */}
              <AnnotationOverlay
                ref={annotationRef}
                visible={connected && isStreaming}
              />

              {/* Hint badge so the user understands they can ask the AI to draw */}
              {sizeMode === 'expanded' && (
                <div className="lc-webcam-float__hint">
                  Ask: "Vẽ hình vuông quanh vật này"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
