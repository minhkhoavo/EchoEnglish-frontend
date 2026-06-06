import { useMemo } from 'react';
import type { CompanionState } from '../context/CompanionContext';

interface OrbVisualProps {
  state: CompanionState;
  amplitude: number;
  size?: number;
}

const stateLabels: Record<CompanionState, string> = {
  disconnected: '',
  idle: '',
  listening: 'Listening...',
  processing: 'Thinking...',
  speaking: 'Speaking...',
  navigating: 'Navigating...',
};

export default function OrbVisual({
  state,
  amplitude,
  size = 64,
}: OrbVisualProps) {
  const dynamicScale = useMemo(() => {
    if (state === 'listening' || state === 'speaking') {
      return 1 + Math.min(amplitude * 8, 0.25);
    }
    return 1;
  }, [state, amplitude]);

  const label = stateLabels[state];

  return (
    <div className="lc-orb-wrapper" style={{ width: size, height: size }}>
      <div className={`lc-orb-glow lc-orb-glow--1 lc-orb-state--${state}`} />
      <div className={`lc-orb-glow lc-orb-glow--2 lc-orb-state--${state}`} />

      {state === 'listening' && (
        <>
          <div className="lc-orb-ripple lc-orb-ripple--1" />
          <div className="lc-orb-ripple lc-orb-ripple--2" />
          <div className="lc-orb-ripple lc-orb-ripple--3" />
        </>
      )}

      {state === 'processing' && <div className="lc-orb-spinner" />}

      <div
        className={`lc-orb-body lc-orb-state--${state}`}
        style={{
          width: size,
          height: size,
          transform: `scale(${dynamicScale})`,
        }}
      >
        <div className="lc-orb-core" />

        {state === 'speaking' && (
          <div className="lc-orb-waveform">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="lc-orb-wave-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {state !== 'speaking' && <div className="lc-orb-icon">✦</div>}
      </div>

      {label && <div className="lc-orb-label">{label}</div>}
    </div>
  );
}
