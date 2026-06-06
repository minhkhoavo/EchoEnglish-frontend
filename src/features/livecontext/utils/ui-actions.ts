/**
 * UI Action Bus
 *
 * A tiny typed event bus that lets AI tools drive *visible* UI flows — opening
 * dialogs and pre-filling their forms on screen — instead of only hitting APIs
 * headlessly. Tools `emit(...)`, mounted components `subscribe(...)`.
 *
 * This keeps the AI's actions transparent to the user (they watch the form
 * populate) and is reusable: add a new action type + a listener in any dialog.
 */

export interface FlashcardDialogPayload {
  front?: string;
  back?: string;
  /** Matched case-insensitively against existing category names */
  categoryName?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
  phonetic?: string;
  source?: string;
  /** If true, submit the form automatically once front+back are present */
  autoSubmit?: boolean;
}

export interface UiActionMap {
  'open-flashcard-dialog': FlashcardDialogPayload;
}

export type UiActionType = keyof UiActionMap;

interface UiActionEnvelope<T extends UiActionType = UiActionType> {
  id: string;
  type: T;
  payload: UiActionMap[T];
}

const EVENT_NAME = 'lc-ui-action';

// Remember the most recent action of each type so a listener that mounts a
// moment AFTER the emit (e.g. the flashcard dialog right after navigation)
// can still pick it up. Without this, the AI's open+prefill is lost when the
// tool emits before the dialog has subscribed.
const REPLAY_WINDOW_MS = 2500;
const lastActions = new Map<
  UiActionType,
  { envelope: UiActionEnvelope; ts: number }
>();

/** Fire a UI action. Returns the action id (for de-duplication if needed). */
export function emitUiAction<T extends UiActionType>(
  type: T,
  payload: UiActionMap[T]
): string {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const envelope: UiActionEnvelope<T> = { id, type, payload };
  lastActions.set(type, {
    envelope: envelope as UiActionEnvelope,
    ts: Date.now(),
  });
  window.dispatchEvent(
    new CustomEvent<UiActionEnvelope<T>>(EVENT_NAME, { detail: envelope })
  );
  return id;
}

/**
 * Subscribe to a specific UI action type. Returns an unsubscribe function.
 * Each envelope id is delivered once per listener to avoid double-handling.
 * If a matching action fired within REPLAY_WINDOW_MS just before this
 * listener mounted, it is delivered immediately (covers emit-before-subscribe).
 */
export function subscribeUiAction<T extends UiActionType>(
  type: T,
  handler: (payload: UiActionMap[T], id: string) => void
): () => void {
  const seen = new Set<string>();
  const deliver = (envelope: UiActionEnvelope) => {
    if (seen.has(envelope.id)) return;
    seen.add(envelope.id);
    handler(envelope.payload as UiActionMap[T], envelope.id);
  };

  const listener = (e: Event) => {
    const detail = (e as CustomEvent<UiActionEnvelope>).detail;
    if (!detail || detail.type !== type) return;
    deliver(detail);
  };
  window.addEventListener(EVENT_NAME, listener as EventListener);

  // Replay a very recent action that may have fired before we subscribed.
  const recent = lastActions.get(type);
  if (recent && Date.now() - recent.ts < REPLAY_WINDOW_MS) {
    deliver(recent.envelope);
  }

  return () =>
    window.removeEventListener(EVENT_NAME, listener as EventListener);
}
