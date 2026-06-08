/**
 * WebcamFloat
 *
 * Floating draggable PiP-style webcam window — LOCAL PREVIEW ONLY.
 *
 * IMPORTANT: This component never streams frames to Gemini. It is purely a
 * local "selfie monitor" so the user can see their camera while chatting.
 * To actually let the AI SEE the camera, the user clicks the expand (⛶)
 * button which opens the dedicated <CameraStage /> — that is the only place
 * frames are uploaded + where the AI's vision annotations are drawn.
 *
 * Controls (header):
 *   ⛶  open the AI Camera Stage (starts sending frames to Gemini)
 *   ⤢  cycle local preview size (PiP → Medium → Large)
 *   —  minimise to a 64px badge
 *   ✕  close (stops the camera track entirely)
 */
import { useEffect, useRef, useState } from 'react';
import { useCompanion } from '../context/CompanionContext';

interface Position {
  x: number;
  y: number;
}

type SizeMode = 'pip' | 'medium' | 'large';

const SIZE_MAP: Record<SizeMode, { w: number; h: number }> = {
  pip: { w: 280, h: 210 },
  medium: { w: 420, h: 315 },
  large: { w: 600, h: 450 },
};

const DEFAULT_POSITION: Position = { x: 24, y: 96 };

export default function WebcamFloat() {
  const {
    webcamEnabled,
    webcamStream,
    disableWebcam,
    cameraStageOpen,
    openCameraStage,
    connected,
    companionState,
    isModelSpeaking,
    isVideoStreaming,
  } = useCompanion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [sizeMode, setSizeMode] = useState<SizeMode>('pip');

  // Attach the shared stream to the local <video> preview.
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  // Drag handlers
  useEffect(() => {
    if (!isDragging || !dragStart) return;
    const handleMove = (e: MouseEvent) => {
      const dims = SIZE_MAP[sizeMode];
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
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const cycleSize = () => {
    setSizeMode((prev) =>
      prev === 'pip' ? 'medium' : prev === 'medium' ? 'large' : 'pip'
    );
  };

  // Hide the PiP while the full Camera Stage is open (the stage shows the feed).
  if (!webcamEnabled || cameraStageOpen) return null;

  const dims = SIZE_MAP[sizeMode];
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
        zIndex: 99996,
        cursor: isDragging ? 'grabbing' : undefined,
        userSelect: 'none',
      }}
    >
      {/* Drag handle / header */}
      <div
        ref={dragRef}
        onMouseDown={handleDragStart}
        className="lc-webcam-float__header"
        style={{ cursor: 'grab' }}
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
                    : '#6b7280',
            }}
          />
          <span>Camera (local){isVideoStreaming ? ' · AI viewing' : ''}</span>
        </div>
        <div className="lc-webcam-float__controls">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCameraStage();
            }}
            className="lc-webcam-float__btn lc-webcam-float__btn--primary"
            title="Open AI Camera Stage (let the AI see your camera)"
            disabled={!connected}
          >
            ⛶
          </button>
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

      {/* Body — LOCAL preview only, no annotation overlay, no upload */}
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
          {/* Local-only badge so it's obvious nothing is being uploaded here */}
          <div className="lc-webcam-float__local-badge">
            🔒 Local preview — click ⛶ to let AI see
          </div>
        </div>
      )}
    </div>
  );
}
