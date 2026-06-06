/**
 * LiveContextRoot
 *
 * Single entry that mounts all the global LiveContext overlays — companion orb,
 * DOM annotation overlay, floating webcam. Drop this once near the root.
 */
import { useCompanion } from '../context/CompanionContext';
import CompanionOrb from './CompanionOrb';
import DomAnnotationOverlay from './DomAnnotationOverlay';
import WebcamFloat from './WebcamFloat';
import CameraStage from './CameraStage';
import LiveToolBridge from './LiveToolBridge';
import SelectionHighlight from './SelectionHighlight';
import '../styles/livecontext.css';

export default function LiveContextRoot() {
  const { domAnnotationRef, liveModeEnabled } = useCompanion();

  // Overlays are cheap to render; we still gate the orb / webcam on liveMode.
  // DomAnnotationOverlay is always mounted so even legacy chatbot can use it later.
  // LiveToolBridge always-on so AI tools (create flashcard, list, etc.) work
  // immediately when the user enables Live Mode.
  return (
    <>
      <DomAnnotationOverlay ref={domAnnotationRef} />
      <LiveToolBridge />
      {/* Visual feedback for the user's text selection — always on so the
          AI and the user share the same "what we're talking about" cue. */}
      <SelectionHighlight />
      {liveModeEnabled && (
        <>
          <CompanionOrb />
          <WebcamFloat />
          <CameraStage />
        </>
      )}
    </>
  );
}
