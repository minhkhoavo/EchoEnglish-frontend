import { useEffect, useState } from 'react';
import type { LiveMessage } from '../hooks/use-live-api';

interface TranscriptOverlayProps {
  messages: LiveMessage[];
  isVisible: boolean;
}

const DISPLAY_DURATION: Record<string, number> = {
  user: 10000,
  gemini: 12000,
  tool: 6000,
};

const FADE_ZONE = 0.3;

export default function TranscriptOverlay({
  messages,
  isVisible,
}: TranscriptOverlayProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const now = Date.now();

  const recentMessages = messages
    .filter((m) => {
      if (m.type === 'system') return false;
      const duration = DISPLAY_DURATION[m.type] || 8000;
      return now - m.timestamp < duration;
    })
    .slice(-3);

  if (recentMessages.length === 0) return null;

  return (
    <div className="lc-transcript-overlay">
      {recentMessages.map((msg, i) => {
        const duration = DISPLAY_DURATION[msg.type] || 8000;
        const age = now - msg.timestamp;
        const fadeStart = duration * (1 - FADE_ZONE);
        const opacity =
          age > fadeStart
            ? Math.max(0.15, 1 - (age - fadeStart) / (duration * FADE_ZONE))
            : 1;

        return (
          <div
            key={`${msg.type}-${i}-${Math.floor(msg.timestamp / 1000)}`}
            className={`lc-transcript-bubble lc-transcript-bubble--${msg.type}`}
            style={{ opacity }}
          >
            <span className="lc-transcript-bubble__icon">
              {msg.type === 'user' ? '🗣️' : msg.type === 'gemini' ? '✦' : '🔧'}
            </span>
            <span className="lc-transcript-bubble__text">{msg.text}</span>
          </div>
        );
      })}
    </div>
  );
}
