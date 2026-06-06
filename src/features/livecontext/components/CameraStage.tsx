import { useEffect, useRef } from 'react';
import { useCompanion } from '../context/CompanionContext';
import AnnotationOverlay from './AnnotationOverlay';

export default function CameraStage() {
  const {
    cameraStageOpen,
    closeCameraStage,
    webcamStream,
    connected,
    isStreaming,
    isModelSpeaking,
    companionState,
    startStreaming,
    stopStreaming,
    startVideoFrames,
    stopVideoFrames,
    isVideoStreaming,
    annotationRef,
    sendText,
  } = useCompanion();

  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream + kick off frame streaming once the video is playing.
  useEffect(() => {
    if (!cameraStageOpen) return;
    const videoEl = videoRef.current;
    if (!videoEl || !webcamStream) return;

    videoEl.srcObject = webcamStream;

    let started = false;
    const tryStart = () => {
      if (started) return;
      if (!connected) return;
      if (videoEl.readyState >= videoEl.HAVE_ENOUGH_DATA) {
        started = true;
        // Ensure the mic is on so the AI can hear questions about the scene.
        if (!isStreaming) startStreaming(null);
        startVideoFrames(videoEl);
      }
    };

    videoEl.addEventListener('loadeddata', tryStart);
    // Also try immediately in case the stream is already buffered.
    const t = setTimeout(tryStart, 300);

    return () => {
      videoEl.removeEventListener('loadeddata', tryStart);
      clearTimeout(t);
      stopVideoFrames();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraStageOpen, webcamStream, connected]);

  if (!cameraStageOpen) return null;

  return (
    <div className="lc-camera-stage">
      <div className="lc-camera-stage__frame">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="lc-camera-stage__video"
        />

        {/* AI vision annotations — drawn inside the mirrored container so the
            AI's percentage coordinates line up with what the user sees. */}
        <AnnotationOverlay
          ref={annotationRef}
          visible={connected && isVideoStreaming}
        />

        {/* Status badges (top-left) */}
        <div className="lc-camera-stage__badges">
          <div className="lc-camera-stage__badge">
            <span
              className="lc-camera-stage__dot"
              style={{ background: connected ? '#10b981' : '#ef4444' }}
            />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          {isVideoStreaming && (
            <div className="lc-camera-stage__badge">
              <span
                className="lc-camera-stage__dot"
                style={{ background: '#ef4444' }}
              />
              AI VIEWING
            </div>
          )}
        </div>

        {/* Speaking indicator (top-right) */}
        {isModelSpeaking && (
          <div className="lc-camera-stage__speaking">
            <div className="lc-camera-stage__bars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="lc-camera-stage__bar" />
              ))}
            </div>
            AI Speaking
          </div>
        )}

        {/* Companion state (bottom-center) */}
        {connected &&
          companionState !== 'idle' &&
          companionState !== 'disconnected' && (
            <div className="lc-camera-stage__state">
              <span
                className="lc-camera-stage__dot"
                style={{
                  background:
                    companionState === 'listening'
                      ? '#34d399'
                      : companionState === 'processing'
                        ? '#fbbf24'
                        : companionState === 'speaking'
                          ? '#a855f7'
                          : '#818cf8',
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>
                {companionState}
              </span>
            </div>
          )}

        {/* Hint */}
        <div className="lc-camera-stage__hint">
          Thử nói: "Vật trước mặt tôi tiếng Anh là gì?" hoặc "Vẽ khung quanh
          chiếc cốc"
        </div>
      </div>

      {/* Controls bar */}
      <div className="lc-camera-stage__controls">
        <button
          type="button"
          className="lc-camera-stage__ctrl"
          onClick={() => sendText('Bạn thấy gì trong camera của tôi?')}
          disabled={!connected}
          title="Ask the AI what it sees"
        >
          👁 What do you see?
        </button>
        <button
          type="button"
          className={`lc-camera-stage__ctrl ${isStreaming ? 'lc-camera-stage__ctrl--active' : ''}`}
          onClick={() => (isStreaming ? stopStreaming() : startStreaming(null))}
          disabled={!connected}
          title={isStreaming ? 'Mute mic' : 'Unmute mic'}
        >
          {isStreaming ? '🎤 Mic on' : '🔇 Mic off'}
        </button>
        <button
          type="button"
          className="lc-camera-stage__ctrl lc-camera-stage__ctrl--close"
          onClick={closeCameraStage}
          title="Close camera stage (back to local preview)"
        >
          ✕ Close stage
        </button>
      </div>
    </div>
  );
}
