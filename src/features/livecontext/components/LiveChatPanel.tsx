import { useState, useRef, useEffect } from 'react';
import { useCompanion } from '../context/CompanionContext';

export default function LiveChatPanel() {
  const {
    messages,
    sendText,
    connected,
    isStreaming,
    startStreaming,
    stopStreaming,
    closePanel,
    isPanelOpen,
    companionState,
    triggerHighlight,
    webcamEnabled,
    enableWebcam,
    disableWebcam,
    setLiveModeEnabled,
    disconnect,
  } = useCompanion();

  const [textInput, setTextInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && connected) {
      sendText(textInput.trim());
      setTextInput('');
    }
  };

  const handleToggleMic = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const handleToggleWebcam = async () => {
    if (webcamEnabled) {
      disableWebcam();
    } else {
      await enableWebcam();
    }
  };

  const handleExitLiveMode = () => {
    disconnect();
    setLiveModeEnabled(false);
  };

  const chatMessages = messages.filter((m) => m.type !== 'system');

  return (
    <div
      className={`lc-chat-panel ${isPanelOpen ? 'lc-chat-panel--open' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="lc-chat-panel__header">
        <div className="lc-chat-panel__header-left">
          <div
            className={`lc-chat-panel__status lc-chat-panel__status--${companionState}`}
          />
          <span className="lc-chat-panel__title">EchoEnglish Live AI</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleExitLiveMode}
            className="lc-chat-panel__close"
            aria-label="Exit Live Mode"
            title="Exit Live Mode (return to chatbot)"
          >
            ↩
          </button>
          <button
            onClick={closePanel}
            className="lc-chat-panel__close"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="lc-chat-panel__messages" ref={scrollRef}>
        {chatMessages.length === 0 ? (
          <div className="lc-chat-panel__empty">
            <div className="lc-chat-panel__empty-icon">✦</div>
            <p>Start a conversation...</p>
            <p className="lc-chat-panel__empty-hint">
              Type, tap the mic, or share webcam to talk to the AI.
            </p>
          </div>
        ) : (
          chatMessages.map((msg, i) => (
            <div
              key={`${msg.timestamp}-${i}`}
              className={`lc-chat-msg lc-chat-msg--${msg.type}`}
            >
              <div className="lc-chat-msg__bubble">
                <span className="lc-chat-msg__text">{msg.text}</span>
                <span className="lc-chat-msg__time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="lc-chat-panel__input-area">
        <div className="lc-chat-panel__quick-actions">
          <button
            className="lc-chat-panel__chip"
            onClick={() =>
              sendText(
                'Hãy xem trang hiện tại của tôi. Liệt kê các nút quan trọng và đề xuất hành động tiếp theo.'
              )
            }
            disabled={!connected}
          >
            🔦 Guide Me
          </button>
          <button
            className="lc-chat-panel__chip"
            onClick={() => sendText('Mở trang flashcards giúp tôi.')}
            disabled={!connected}
          >
            📚 Flashcards
          </button>
          <button
            className="lc-chat-panel__chip"
            onClick={() =>
              sendText('Cho tôi xem các bài thi gần nhất của tôi.')
            }
            disabled={!connected}
          >
            📊 My Tests
          </button>
          <button
            className="lc-chat-panel__chip"
            onClick={() =>
              sendText('Đề xuất một tài nguyên học IELTS hôm nay.')
            }
            disabled={!connected}
          >
            📖 Resources
          </button>
          <button
            className="lc-chat-panel__chip lc-chat-panel__chip--test"
            onClick={() => {
              const testSelectors = [
                { sel: 'main', msg: 'Đây là khu vực nội dung chính.' },
                { sel: '[data-ai-id="main"]', msg: 'Đây là main content.' },
              ];
              const found = testSelectors.find((t) =>
                document.querySelector(t.sel)
              );
              if (found) triggerHighlight(found.sel, found.msg);
            }}
          >
            🧪 Test Guide
          </button>
        </div>

        <form onSubmit={handleSend} className="lc-chat-panel__form">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`lc-chat-panel__mic ${isStreaming ? 'lc-chat-panel__mic--active' : ''}`}
            disabled={!connected}
            aria-label={isStreaming ? 'Stop mic' : 'Start mic'}
            title={isStreaming ? 'Stop mic' : 'Start mic'}
          >
            {isStreaming ? '⏸' : '🎤'}
          </button>
          <button
            type="button"
            onClick={handleToggleWebcam}
            className={`lc-chat-panel__mic ${webcamEnabled ? 'lc-chat-panel__mic--active' : ''}`}
            disabled={!connected}
            aria-label={webcamEnabled ? 'Stop webcam' : 'Share webcam'}
            title={webcamEnabled ? 'Stop webcam' : 'Share webcam'}
          >
            {webcamEnabled ? '📷' : '📹'}
          </button>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              connected ? 'Type a message...' : 'Tap orb to connect...'
            }
            disabled={!connected}
            className="lc-chat-panel__input"
          />
          <button
            type="submit"
            disabled={!connected || !textInput.trim()}
            className="lc-chat-panel__send"
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
