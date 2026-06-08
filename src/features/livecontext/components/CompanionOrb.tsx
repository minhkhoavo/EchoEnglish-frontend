import { useCompanion } from '../context/CompanionContext';
import OrbVisual from './OrbVisual';
import TranscriptOverlay from './TranscriptOverlay';
import LiveChatPanel from './LiveChatPanel';
import NavigationTransition from './NavigationTransition';
import GuidanceOverlay from './GuidanceOverlay';

export default function CompanionOrb() {
  const {
    connected,
    companionState,
    audioAmplitude,
    messages,
    togglePanel,
    isPanelOpen,
    connect,
    guidance,
    dismissGuidance,
    liveModeEnabled,
  } = useCompanion();

  // Only render when Live Mode is enabled
  if (!liveModeEnabled) return null;

  return (
    <>
      <GuidanceOverlay guidance={guidance} onDismiss={dismissGuidance} />

      <NavigationTransition />

      {/*
        Container is always pointer-events:auto while Live Mode is enabled so
        the orb stays clickable from the first render. The orb only appears
        once the user has entered Live Mode — by default the original
        EchoEnglish chatbot icon is shown instead.
      */}
      <div
        className="lc-companion-container lc-companion-container--visible"
        id="lc-companion-orb"
      >
        <TranscriptOverlay
          messages={messages}
          isVisible={connected && !isPanelOpen}
        />

        {/* AI thinking indicator — sleek animated bubble while processing */}
        {connected && companionState === 'processing' && !isPanelOpen && (
          <div className="lc-thinking" aria-live="polite">
            <span className="lc-thinking__label">AI đang soạn</span>
            <span className="lc-thinking__dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}

        <LiveChatPanel />

        <div
          className={`lc-companion-orb-touch ${isPanelOpen ? 'lc-companion-orb-touch--panel-open' : ''}`}
          onClick={() => {
            if (!connected) {
              connect();
            } else {
              togglePanel();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={
            connected ? 'Toggle AI companion panel' : 'Connect to AI companion'
          }
          data-ai-id="lc-companion-orb-button"
          data-ai-label="AI Companion Orb"
        >
          <OrbVisual
            state={companionState}
            amplitude={audioAmplitude}
            size={60}
          />
        </div>
      </div>

      {isPanelOpen && (
        <div
          className="lc-companion-backdrop"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
    </>
  );
}
