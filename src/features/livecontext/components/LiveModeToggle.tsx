/**
 * LiveModeToggle
 *
 * Small pill the user can drop into any UI (header, chatbot, sidebar) to switch
 * the legacy text chatbot off and bring up the LiveContext companion instead.
 */
import { useCompanion } from '../context/CompanionContext';

interface LiveModeToggleProps {
  className?: string;
  /** Called immediately after the user enables Live Mode (e.g. close the legacy panel). */
  onEnable?: () => void;
}

export default function LiveModeToggle({
  className,
  onEnable,
}: LiveModeToggleProps) {
  const {
    liveModeEnabled,
    setLiveModeEnabled,
    openPanel,
    connect,
    disconnect,
  } = useCompanion();

  const handleClick = () => {
    if (!liveModeEnabled) {
      setLiveModeEnabled(true);
      // Open the live panel so the orb is visible right away.
      openPanel();
      connect();
      onEnable?.();
    } else {
      // Toggling off: disconnect the websocket and hide the orb.
      disconnect();
      setLiveModeEnabled(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`lc-live-mode-toggle ${className || ''}`}
      title={liveModeEnabled ? 'Exit Live Mode' : 'Enter Live AI Mode'}
      data-ai-id="lc-live-mode-toggle"
      data-ai-label="Toggle Live AI Mode"
    >
      <span className="lc-live-mode-toggle__dot" />
      {liveModeEnabled ? 'Live ON — tap to exit' : 'Live AI Mode'}
    </button>
  );
}
