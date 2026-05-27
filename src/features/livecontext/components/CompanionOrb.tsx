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
    disconnect,
    guidance,
    dismissGuidance,
    liveModeEnabled,
    setLiveModeEnabled,
  } = useCompanion();

  // Only render when Live Mode is enabled
  if (!liveModeEnabled) return null;

  const handleExitLiveMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    disconnect();
    setLiveModeEnabled(false);
  };

  return (
    <>
      <GuidanceOverlay guidance={guidance} onDismiss={dismissGuidance} />

      <NavigationTransition />

      {/*
        Container is always pointer-events:auto while Live Mode is enabled so
        the dormant "Connect Live AI" orb stays clickable. (The previous
        `isVisible = connected || isPanelOpen` gate made the orb visible but
        un-clickable on first render, stranding the user.)
      */}
      <div
        className="lc-companion-container lc-companion-container--visible"
        id="lc-companion-orb"
      >
        <TranscriptOverlay
          messages={messages}
          isVisible={connected && !isPanelOpen}
        />

        <LiveChatPanel />

        {/* Exit-Live pill — only shown when not connected so the user can
            always escape back to the legacy chatbot, even without connecting. */}
        {!connected && !isPanelOpen && (
          <button
            type="button"
            className="lc-exit-live-pill"
            onClick={handleExitLiveMode}
            title="Exit Live Mode → show normal chatbot"
            data-ai-id="lc-exit-live-pill"
            data-ai-label="Exit Live Mode"
          >
            ← Back to chatbot
          </button>
        )}

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
          {connected ? (
            <OrbVisual
              state={companionState}
              amplitude={audioAmplitude}
              size={60}
            />
          ) : (
            <div className="lc-orb-dormant">
              <div className="lc-orb-dormant__body">
                <span className="lc-orb-dormant__icon">✦</span>
              </div>
              <div className="lc-orb-dormant__label">Connect Live AI</div>
            </div>
          )}
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
