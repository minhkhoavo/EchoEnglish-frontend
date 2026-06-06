import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveApi, type LiveMessage } from '../hooks/use-live-api';
import type { GuidanceState } from '../components/GuidanceOverlay';
import type { AnnotationOverlayHandle } from '../components/AnnotationOverlay';
import type { DomAnnotationOverlayHandle } from '../components/DomAnnotationOverlay';
import type {
  AnnotationCommand,
  DomAnnotationCommand,
  CustomToolCallback,
} from '../utils/tools';
import {
  buildDomIndex,
  getCurrentSelection,
  summarizeIndex,
} from '../utils/dom-vision';

/**
 * A handler that receives one tool call args object and returns a result
 * (or Promise of one). Returned to the AI as the tool response.
 */
export type ToolHandler = (
  args: Record<string, unknown>
) => unknown | Promise<unknown>;

export type CompanionState =
  | 'disconnected'
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'navigating';

interface CompanionContextValue {
  // Live API
  connect: (systemPrompt?: string) => Promise<void>;
  disconnect: () => void;
  startStreaming: (videoElement?: HTMLVideoElement | null) => void;
  stopStreaming: () => void;
  sendText: (text: string) => void;
  connected: boolean;
  isStreaming: boolean;
  isModelSpeaking: boolean;
  messages: LiveMessage[];
  audioAmplitude: number;

  // Companion UI
  companionState: CompanionState;
  isPanelOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // Live mode toggle (decides whether companion replaces the legacy chatbot)
  liveModeEnabled: boolean;
  setLiveModeEnabled: (v: boolean) => void;
  toggleLiveMode: () => void;

  // Webcam (floating PiP — LOCAL preview only, never streamed to Gemini)
  webcamEnabled: boolean;
  enableWebcam: () => Promise<void>;
  disableWebcam: () => void;
  webcamStream: MediaStream | null;

  // Camera Stage (dedicated fullscreen view that DOES stream frames to Gemini)
  cameraStageOpen: boolean;
  openCameraStage: () => Promise<void>;
  closeCameraStage: () => void;
  startVideoFrames: (videoElement: HTMLVideoElement) => void;
  stopVideoFrames: () => void;
  isVideoStreaming: boolean;

  // Navigation
  navigationTarget: string | null;
  currentPage: string;

  // Visual Guidance (CSS selector based)
  guidance: GuidanceState | null;
  dismissGuidance: () => void;
  triggerHighlight: (selector: string, message?: string) => void;

  // Annotation refs
  annotationRef: RefObject<AnnotationOverlayHandle | null>;
  domAnnotationRef: RefObject<DomAnnotationOverlayHandle | null>;

  // Custom tool registration — lets feature code (RTK Query bridges,
  // page-specific helpers) expose extra tool handlers to the AI.
  registerTool: (name: string, handler: ToolHandler) => () => void;

  // Page-scoped extra context — pages can publish details (e.g. the resource
  // currently being read) and the AI sees them in get_screen_context().
  setPageContext: (key: string, value: unknown) => void;
}

const CompanionContext = createContext<CompanionContextValue | null>(null);

export function useCompanion() {
  const ctx = useContext(CompanionContext);
  if (!ctx)
    throw new Error('useCompanion must be used within CompanionProvider');
  return ctx;
}

export function CompanionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [companionState, setCompanionState] =
    useState<CompanionState>('disconnected');
  const [guidance, setGuidance] = useState<GuidanceState | null>(null);

  const [liveModeEnabled, _setLiveModeEnabled] = useState<boolean>(false);

  const setLiveModeEnabled = useCallback((v: boolean) => {
    _setLiveModeEnabled(v);
  }, []);

  const toggleLiveMode = useCallback(() => {
    setLiveModeEnabled(!liveModeEnabled);
  }, [liveModeEnabled, setLiveModeEnabled]);

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [cameraStageOpen, setCameraStageOpen] = useState(false);

  const annotationRef = useRef<AnnotationOverlayHandle | null>(null);
  const domAnnotationRef = useRef<DomAnnotationOverlayHandle | null>(null);

  // ─── Custom tool handler registry ──────────────────────────────────────
  // Components call registerTool('create_flashcard', handler) to expose
  // domain logic to the AI. The registry is keyed by tool name; the latest
  // registration wins, and the cleanup fn returned by registerTool removes it.
  const toolRegistryRef = useRef<Map<string, ToolHandler>>(new Map());

  const registerTool = useCallback((name: string, handler: ToolHandler) => {
    toolRegistryRef.current.set(name, handler);
    return () => {
      // Only remove if it's still the same handler (avoid stale unregisters)
      if (toolRegistryRef.current.get(name) === handler) {
        toolRegistryRef.current.delete(name);
      }
    };
  }, []);

  const customToolCallback = useCallback<CustomToolCallback>(
    async (name, args) => {
      const handler = toolRegistryRef.current.get(name);
      if (!handler) {
        return { error: `Tool "${name}" is not registered on this page.` };
      }
      return await handler(args);
    },
    []
  );

  // ─── Page context (resource title, exam id, etc.) ──────────────────────
  // Components feed extra context here; getScreenContext merges it in.
  const pageContextRef = useRef<Map<string, unknown>>(new Map());
  const setPageContext = useCallback((key: string, value: unknown) => {
    if (value === undefined || value === null) {
      pageContextRef.current.delete(key);
    } else {
      pageContextRef.current.set(key, value);
    }
  }, []);

  const handleNavigate = useCallback(
    (page: string) => {
      const target = page.startsWith('/') ? page : `/${page}`;
      setNavigationTarget(target);
      setTimeout(() => {
        navigate(target);
        setTimeout(() => setNavigationTarget(null), 600);
      }, 500);
    },
    [navigate]
  );

  const handleTheme = useCallback((theme: string) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const handleHighlight = useCallback(
    (g: { selector: string; message?: string } | null) => {
      setGuidance(g);
    },
    []
  );

  const dismissGuidance = useCallback(() => setGuidance(null), []);
  const triggerHighlight = useCallback((selector: string, message?: string) => {
    setGuidance({ selector, message });
  }, []);

  const handleAnnotation = useCallback(
    (cmd: AnnotationCommand): string | void => {
      const overlay = annotationRef.current;
      if (!overlay) {
        console.warn(
          '🎯 [Annotation] Overlay not mounted (no webcam visible?)'
        );
        return;
      }
      switch (cmd.action) {
        case 'clear':
          overlay.clearAnnotations();
          return;
        case 'point':
          return overlay.addAnnotation({
            type: 'point',
            x: cmd.x || 50,
            y: cmd.y || 50,
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
        case 'box':
          return overlay.addAnnotation({
            type: 'box',
            x: cmd.x || 50,
            y: cmd.y || 50,
            width: cmd.width,
            height: cmd.height,
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
        case 'circle':
          return overlay.addAnnotation({
            type: 'circle',
            x: cmd.x || 50,
            y: cmd.y || 50,
            radius: cmd.radius,
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
        case 'note':
          return overlay.addAnnotation({
            type: 'note',
            x: cmd.x || 50,
            y: cmd.y || 50,
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 10000,
          });
        case 'arrow':
          return overlay.addAnnotation({
            type: 'arrow',
            x: cmd.x || 50,
            y: cmd.y || 50,
            toX: cmd.toX,
            toY: cmd.toY,
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
      }
    },
    []
  );

  const handleDomAnnotation = useCallback(
    (cmd: DomAnnotationCommand): string | void => {
      const overlay = domAnnotationRef.current;
      if (!overlay) {
        console.warn('🔵 [DomAnn] Overlay not mounted');
        return;
      }
      switch (cmd.action) {
        case 'clear':
          overlay.clear();
          return;
        case 'point':
          return overlay.add({
            kind: 'cursor',
            target: cmd.target || '',
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
        case 'box':
          return overlay.add({
            kind: 'box',
            target: cmd.target || '',
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 8000,
          });
        case 'note':
          return overlay.add({
            kind: 'note',
            target: cmd.target || '',
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 12000,
          });
        case 'highlight-text':
          return overlay.add({
            kind: 'text-highlight',
            target: cmd.target || 'main',
            text: cmd.text || '',
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 12000,
          });
        case 'arrow':
          return overlay.add({
            kind: 'arrow-to',
            target: cmd.target || '',
            label: cmd.label,
            color: cmd.color,
            ttl: cmd.ttl || 6000,
          });
      }
    },
    []
  );

  // Screen context — exposes route + visible DOM elements to the AI
  const getScreenContext = useCallback((): Record<string, unknown> => {
    const path = location.pathname;
    const context: Record<string, unknown> = {
      currentPage: path,
      pageName: path === '/' ? 'Home' : path.slice(1),
      timestamp: new Date().toISOString(),
    };

    // Map known routes to a friendly page type
    if (path === '/dashboard') context.pageType = 'dashboard';
    else if (path === '/flashcards') context.pageType = 'flashcards';
    else if (path === '/vocabulary') context.pageType = 'vocabulary';
    else if (path === '/tests') context.pageType = 'tests-list';
    else if (path === '/resources') context.pageType = 'resources-list';
    else if (path.startsWith('/resources/'))
      context.pageType = 'resource-detail';
    else if (path === '/ebooks') context.pageType = 'ebooks';
    else if (path === '/recordings') context.pageType = 'recordings';
    else if (path === '/me/tests') context.pageType = 'exam-attempts';
    else if (path === '/payment') context.pageType = 'payment';
    else if (path === '/payment/history') context.pageType = 'payment-history';
    else if (path === '/practice-drill') context.pageType = 'practice-drill';
    else if (path === '/conversation-practice')
      context.pageType = 'conversation-practice';
    else context.pageType = 'unknown';

    const mainEl = document.querySelector('main, [data-ai-id="main"]');
    if (mainEl) {
      context.visibleTextPreview = mainEl.textContent?.slice(0, 500) || '';
    }

    try {
      const all = buildDomIndex({ onlyVisible: true });
      context.domElementsCount = all.length;
      context.domElements = summarizeIndex(all).slice(0, 40);

      const actions = all.filter((e) =>
        [
          'delete',
          'create',
          'save',
          'search',
          'filter',
          'navigation',
          'connect',
          'cancel',
          'start',
          'view',
        ].includes(e.role)
      );
      context.actionButtons = summarizeIndex(actions);
    } catch (e) {
      console.warn('[Context] Failed to build DOM index:', e);
    }

    const sel = getCurrentSelection();
    if (sel) context.userSelection = sel;

    // Merge any page-published context (resource details, exam id, etc.)
    if (pageContextRef.current.size > 0) {
      const pc: Record<string, unknown> = {};
      pageContextRef.current.forEach((v, k) => {
        pc[k] = v;
      });
      context.pageContext = pc;
    }

    return context;
  }, [location.pathname]);

  const {
    connect,
    disconnect: rawDisconnect,
    startStreaming,
    stopStreaming,
    startVideoFrames,
    stopVideoFrames,
    isVideoStreaming,
    sendText,
    connected,
    isStreaming,
    isModelSpeaking,
    messages,
    audioAmplitude,
  } = useLiveApi(
    handleNavigate,
    handleTheme,
    handleHighlight,
    getScreenContext,
    handleAnnotation,
    handleDomAnnotation,
    customToolCallback
  );

  // Webcam controls
  const enableWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setWebcamStream(stream);
      setWebcamEnabled(true);
      console.log('📹 [Webcam] Access granted');
    } catch (err) {
      console.error('📹 [Webcam] ❌ Access denied:', err);
    }
  }, []);

  const disableWebcam = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop());
    }
    setWebcamStream(null);
    setWebcamEnabled(false);
    // Closing the webcam also tears down the camera stage + frame streaming.
    stopVideoFrames();
    setCameraStageOpen(false);
    console.log('📹 [Webcam] Stopped');
  }, [webcamStream, stopVideoFrames]);

  // Camera Stage: dedicated fullscreen view that actually streams frames to
  // Gemini. Opening it ensures the webcam is on; closing stops frame upload
  // but keeps the local PiP preview alive.
  const openCameraStage = useCallback(async () => {
    if (!webcamStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setWebcamStream(stream);
        setWebcamEnabled(true);
      } catch (err) {
        console.error('📹 [CameraStage] ❌ Camera access denied:', err);
        return;
      }
    }
    setCameraStageOpen(true);
  }, [webcamStream]);

  const closeCameraStage = useCallback(() => {
    stopVideoFrames();
    setCameraStageOpen(false);
  }, [stopVideoFrames]);

  const disconnect = useCallback(() => {
    rawDisconnect();
    setIsPanelOpen(false);
    setWaitingForResponse(false);
    setGuidance(null);
    setCameraStageOpen(false);
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop());
      setWebcamStream(null);
      setWebcamEnabled(false);
    }
  }, [rawDisconnect, webcamStream]);

  // Send page context whenever the route changes (if connected)
  useEffect(() => {
    if (connected && isStreaming) {
      const ctx = getScreenContext();
      const contextMsg = `[CONTEXT UPDATE] User navigated to: ${ctx.currentPage}. Page type: ${ctx.pageType || 'unknown'}.`;
      sendText(contextMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === 'user') setWaitingForResponse(true);
      else if (lastMsg.type === 'gemini') setWaitingForResponse(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!connected) setCompanionState('disconnected');
    else if (navigationTarget) setCompanionState('navigating');
    else if (isModelSpeaking) setCompanionState('speaking');
    else if (isStreaming && waitingForResponse) setCompanionState('processing');
    else if (isStreaming) setCompanionState('listening');
    else setCompanionState('idle');
  }, [
    connected,
    isStreaming,
    isModelSpeaking,
    navigationTarget,
    waitingForResponse,
  ]);

  const togglePanel = useCallback(() => setIsPanelOpen((v) => !v), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const currentPage =
    location.pathname === '/' ? 'home' : location.pathname.slice(1);

  return (
    <CompanionContext.Provider
      value={{
        connect,
        disconnect,
        startStreaming,
        stopStreaming,
        sendText,
        connected,
        isStreaming,
        isModelSpeaking,
        messages,
        audioAmplitude,
        companionState,
        isPanelOpen,
        togglePanel,
        openPanel,
        closePanel,
        liveModeEnabled,
        setLiveModeEnabled,
        toggleLiveMode,
        webcamEnabled,
        enableWebcam,
        disableWebcam,
        webcamStream,
        cameraStageOpen,
        openCameraStage,
        closeCameraStage,
        startVideoFrames,
        stopVideoFrames,
        isVideoStreaming,
        navigationTarget,
        currentPage,
        guidance,
        dismissGuidance,
        triggerHighlight,
        annotationRef,
        domAnnotationRef,
        registerTool,
        setPageContext,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}
