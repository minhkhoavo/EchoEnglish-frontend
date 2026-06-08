/**
 * LiveContext feature — entry point.
 *
 * Provides a Gemini Live-powered AI companion that can talk to the user, see
 * the page, navigate, click, highlight, annotate, and stream the webcam.
 *
 * Usage in App.tsx (inside <Router>):
 *   import { CompanionProvider, LiveContextRoot } from '@/features/livecontext';
 *   <CompanionProvider>
 *     <Routes>...</Routes>
 *     <LiveContextRoot />
 *   </CompanionProvider>
 */

export { CompanionProvider, useCompanion } from './context/CompanionContext';
export type { CompanionState } from './context/CompanionContext';
export { default as CompanionOrb } from './components/CompanionOrb';
export { default as DomAnnotationOverlay } from './components/DomAnnotationOverlay';
export { default as WebcamFloat } from './components/WebcamFloat';
export { default as LiveModeToggle } from './components/LiveModeToggle';
export { default as LiveContextRoot } from './components/LiveContextRoot';
export { default as RawHtmlRenderer } from './components/RawHtmlRenderer';
export {
  renderSentences,
  splitIntoSentences,
} from './utils/reader-postprocess';
export { processHtml } from './utils/html-postprocess';
export {
  buildDomIndex,
  findElementByAiId,
  getCurrentSelection,
} from './utils/dom-vision';
export { emitUiAction, subscribeUiAction } from './utils/ui-actions';
export type {
  UiActionType,
  UiActionMap,
  FlashcardDialogPayload,
} from './utils/ui-actions';
