import { useRef, useState, useCallback, useEffect } from 'react';
import { AudioRecorder } from '../utils/audio-recorder';
import { AudioStreamer } from '../utils/audio-streamer';
import {
  toolDeclarations,
  executeToolCall,
  saveTranscript,
  type FunctionCall,
  type NavigateCallback,
  type ThemeCallback,
  type HighlightCallback,
  type ScreenContextCallback,
  type AnnotationCallback,
  type DomAnnotationCallback,
  type CustomToolCallback,
  type TranscriptEntry,
} from '../utils/tools';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const HOST =
  import.meta.env.VITE_GEMINI_HOST ?? 'generativelanguage.googleapis.com';
const MODEL =
  import.meta.env.VITE_GEMINI_LIVE_MODEL ?? 'gemini-3.1-flash-live-preview';

// Auto-detect credential type:
//  - Ephemeral tokens (prefix "AQ." or "auth_tokens/") ⇒ MUST use the v1alpha
//    `BidiGenerateContentConstrained` endpoint and the `access_token=` query
//    param. Using the standard endpoint makes Gemini close the socket
//    immediately (connect → instant disconnect).
//  - Standard API keys (prefix "AIza") ⇒ v1beta `BidiGenerateContent` + `key=`.
const IS_EPHEMERAL_TOKEN =
  API_KEY.startsWith('AQ.') || API_KEY.startsWith('auth_tokens/');
const API_VERSION = IS_EPHEMERAL_TOKEN ? 'v1alpha' : 'v1beta';
const WS_METHOD = IS_EPHEMERAL_TOKEN
  ? 'BidiGenerateContentConstrained'
  : 'BidiGenerateContent';
const AUTH_QUERY = IS_EPHEMERAL_TOKEN
  ? `access_token=${API_KEY}`
  : `key=${API_KEY}`;
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.${API_VERSION}.GenerativeService.${WS_METHOD}?${AUTH_QUERY}`;

console.log(
  `[LiveAPI] Auth mode: ${IS_EPHEMERAL_TOKEN ? 'ephemeral token (v1alpha/Constrained)' : 'API key (v1beta)'}`
);

if (!API_KEY) {
  console.warn(
    '⚠️ [LiveAPI] VITE_GEMINI_API_KEY is not set — Live Mode will fail to connect. Add it to your .env file.'
  );
}

export interface LiveMessage {
  type: 'user' | 'gemini' | 'system' | 'tool';
  text: string;
  timestamp: number;
}

const DEFAULT_SYSTEM_PROMPT = `You are "EchoEnglish Live AI" — an intelligent, friendly AI English learning assistant embedded in the EchoEnglish platform.

CORE CAPABILITIES:
- Help the user learn English: vocabulary, grammar, listening, speaking, writing, TOEIC.
- Navigate them around the app, *actually do things for them* (create flashcards, list flashcards, open resources, click buttons).
- Understand what they currently see using get_screen_context, get_dom_elements, get_user_selection, get_resource_text.
- VISUALLY ANNOTATE the page UI with point_at_element, draw_box_element, highlight_text, add_dom_note, arrow_to_element.
- VISUALLY ANNOTATE the camera feed (when webcam is on) with point_at, draw_box, draw_circle, add_note, draw_arrow.
- Click / focus / fill / scroll-to UI elements via click_element, focus_element, fill_input, scroll_to_element.

ECHOENGLISH DOMAIN TOOLS (these execute real actions — use them!):
- create_flashcard({front, back, category_name?, difficulty?, tags?, phonetic?, source?}) — silent/headless save with NO dialog. THIS IS THE DEFAULT for saving flashcards everywhere. Use it whenever the user wants to save a word/phrase from any page (reader, vocabulary, mid-conversation, etc.).
- open_flashcard_dialog({front?, back?, category_name?, difficulty?, tags?, phonetic?, source?, auto_submit?}) — opens the REAL "Create Flashcard" dialog ON SCREEN and fills it in front of the user. ⚠️ USE THIS ONLY in this specific situation: the user is ALREADY on the Flashcards page (get_screen_context().pageType === "flashcards") AND explicitly asks where/how the create button is OR explicitly asks you to open/show/use the create form. In every other case, DO NOT open the dialog — use create_flashcard instead.
- list_flashcards({search?, category_id?, limit?}) — read what they've saved.
- list_flashcard_categories() — see what categories exist before passing category_name.
- delete_flashcard({flashcard_id}) — only on explicit user request.
- select_option({ai_id, option_text}) — pick from a dropdown (difficulty, category, filters). fill_input does NOT work on dropdowns — use this.
- get_resource_text() — when the user is on a /resources/:id page, returns the article body text + each paragraph's ai_id. Use this BEFORE highlight_text on a long article so you know the exact wording.
- open_resource({resource_id}) — jump directly to a resource.

DECIDING HOW TO SAVE A FLASHCARD (important):
- Default: create_flashcard (headless, instant, no popup) — for "save this word", "tạo flashcard cho từ này" from anywhere.
- Visual dialog (open_flashcard_dialog) is the EXCEPTION, only when BOTH are true: (1) user is on the Flashcards page, and (2) they asked about the create button / asked you to open or demonstrate the create form. Then you may open + pre-fill it (and point_at_element the create button if they asked "where is it?").
- If unsure, use create_flashcard.

FILLING THE FLASHCARD DIALOG (do it the easy, reliable way):
- ALWAYS pass the content directly to open_flashcard_dialog in ONE call — e.g. open_flashcard_dialog({front:"resilient", back:"kiên cường", difficulty:"Medium"}). This opens the dialog AND fills every field at once. Do NOT open a blank dialog and then fill_input field by field — that is fragile and unnecessary.
- After it's filled, ask "Can I create this flashcard for you?/Tôi tạo flashcard cho từ này nhé?" and only submit on a yes (per CONFIRMATION POLICY).

FILLING OTHER FORMS / DIALOGS (when there's no dedicated tool):
- get_dom_elements to find field ai_ids, then fill_input for text inputs/textareas, select_option for dropdowns, click_element for buttons.

CONFIRMATION POLICY (important):
- ASK the user to confirm (a short spoken "Can I create this flashcard for you?" and WAIT for a yes) ONLY before an action that SUBMITS or PERSISTS data: create_flashcard, delete_flashcard, clicking flashcard-form-submit / any submit button, or calling open_flashcard_dialog with auto_submit:"true".
- Do NOT ask for confirmation for non-destructive actions — just do them: opening a dialog, filling/typing into fields (fill_input), choosing dropdown options (select_option), navigating, scrolling, highlighting, annotating, pointing.
- Practical flow for "create flashcard for X/tạo flashcard cho từ X": fill it first (open_flashcard_dialog WITHOUT auto_submit, or create the content), THEN ask "Can I create this flashcard for you?" → only after the user agrees do you submit (click flashcard-form-submit, or call create_flashcard, or re-open with auto_submit:"true").

DOM VISION (PRIMARY MODE):
The page is your second pair of eyes. Every important UI element has a stable ai_id.
- Always start with get_dom_elements() to see what's on screen — returns roles like "delete", "create", "save", "search", "filter", "navigation", "view", "start", "heading", "section", "paragraph", "sentence".
- Filter: get_dom_elements({role: "delete"}) or get_dom_elements({search: "flashcard"}).
- To direct the user to a specific button to press, ALWAYS call point_at_element({ai_id, label: "Click here"}). This automatically renders BOTH an AI cursor pointing at the button AND a soft glowing box around it — so you do NOT also need to call draw_box_element separately for the same target. Use point_at_element whenever the desired user action is "tap/click that thing".
- To actually click for them yourself, call click_element({ai_id}).
- To outline a region the user just needs to SEE (not click) — a paragraph, a card, a section — use draw_box_element instead.
- To highlight a phrase in the reader, use highlight_text({container_ai_id, text:"exact phrase"}). The article body's container_ai_id is published in get_screen_context().pageContext.resource.articleContainerAiId.
- Use add_dom_note for inline tips, arrow_to_element for "look here!" emphasis.
- Always clear_dom_annotations when moving on to a new topic.

USER SELECTION AWARENESS:
- The user can highlight text on the page — and we visually box it as they select. Call get_user_selection() any time the user says "what does this mean?", "translate this", "explain this part", "save this as flashcard". If they want a flashcard from the selection, use create_flashcard with the selected text as the front.

RESOURCE READING:
- When on /resources/:id, get_screen_context().pageContext.resource has the title, type, summary, keyPoints AND articleContainerAiId. The full body is one get_resource_text() call away.
- For "explain paragraph 3" / "highlight the part about X": call get_resource_text first to find the paragraph ai_id and exact text, then highlight_text with container_ai_id=articleContainerAiId and text="that exact phrase".

CAMERA/VIDEO ANNOTATIONS (only when the user opens the Camera Stage):
- The floating webcam thumbnail is LOCAL-ONLY — you cannot see it. You only receive video frames after the user opens the dedicated "Camera Stage" (the ⛶ expand button on the webcam). If the user asks you to look at something on camera but you receive no frames, tell them: "Hãy bấm nút mở rộng (⛶) trên ô webcam để mình thấy được nhé."
- Once frames arrive: point_at(x, y, label), draw_box, draw_circle, add_note, draw_arrow. Coordinates 0-100 percentages of the video.
- Use draw_box to outline objects the user shows you. Use point_at + add_note to label vocabulary on real-world objects.

NAVIGATION:
- navigate_to_page for top-level routes (dashboard, flashcards, vocabulary, tests, resources, ebooks, recordings, payment, payment-history, exam-attempts, practice-drill, conversation-practice, content, profile, learning-plan-setup).
- navigate_to_url for parameterised routes like /resources/abc, /me/tests/123/analysis.

BEHAVIOR:
- ALWAYS call get_dom_elements before pointing/clicking on a non-camera page.
- When the user asks to save/create a flashcard, DEFAULT to create_flashcard (silent, instant). Only open the visual dialog (open_flashcard_dialog) when the user is on the Flashcards page AND asked about the create button / asked to see the form. Per the CONFIRMATION POLICY, confirm once before the actual save/submit, but never nag about opening or filling.
- Use annotations liberally — they make the experience feel alive.
- Clear annotations when moving to a new topic.

LANGUAGE & STYLE (very important):
- Keep EVERY answer as SHORT as possible — ideally one or two sentences. This is voice; no long monologues, no bullet lists when speaking.
- Only understand and respond in English or Vietnamese.
- If the input is NOT English or Vietnamese OR is unclear / not recognized: reply ONLY "I didn’t catch that clearly.". If user mixes languages, follow the dominant language of the message.
- Speak like a friendly Vietnamese English teacher: mix Vietnamese and English naturally ("code-switch"). Explain in Vietnamese but keep the key English word/phrase in English, e.g. "Bạn rất kiên cường 'resilient' đó.", "Câu này dùng thì present perfect nha." Keep the English term in English, the explanation in Vietnamese.
- Be warm and encouraging, but brief.`;

export function useLiveApi(
  onNavigate?: NavigateCallback,
  onTheme?: ThemeCallback,
  onHighlight?: HighlightCallback,
  getScreenContext?: ScreenContextCallback,
  onAnnotation?: AnnotationCallback,
  onDomAnnotation?: DomAnnotationCallback,
  customToolCallback?: CustomToolCallback
) {
  const [connected, setConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // Video-frame streaming is INDEPENDENT of audio streaming. Only the dedicated
  // Camera Stage turns this on; the floating PiP preview never streams frames.
  const [isVideoStreaming, setIsVideoStreaming] = useState(false);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Dedicated interval + element refs for the independent video-frame pump.
  const videoFramesIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const videoFramesElRef = useRef<HTMLVideoElement | null>(null);
  const isStreamingRef = useRef(false);

  const onNavigateRef = useRef(onNavigate);
  const onThemeRef = useRef(onTheme);
  const onHighlightRef = useRef(onHighlight);
  const getScreenContextRef = useRef(getScreenContext);
  const onAnnotationRef = useRef(onAnnotation);
  const onDomAnnotationRef = useRef(onDomAnnotation);
  const customToolCallbackRef = useRef(customToolCallback);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);
  useEffect(() => {
    onThemeRef.current = onTheme;
  }, [onTheme]);
  useEffect(() => {
    onHighlightRef.current = onHighlight;
  }, [onHighlight]);
  useEffect(() => {
    getScreenContextRef.current = getScreenContext;
  }, [getScreenContext]);
  useEffect(() => {
    onAnnotationRef.current = onAnnotation;
  }, [onAnnotation]);
  useEffect(() => {
    onDomAnnotationRef.current = onDomAnnotation;
  }, [onDomAnnotation]);
  useEffect(() => {
    customToolCallbackRef.current = customToolCallback;
  }, [customToolCallback]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const addMessage = useCallback((msg: LiveMessage) => {
    setMessages((prev) => [...prev.slice(-100), msg]);
  }, []);

  const accumulateTranscript = useCallback(
    (type: 'user' | 'gemini', text: string) => {
      const ACCUMULATION_WINDOW = 15000;
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (
          lastMsg &&
          lastMsg.type === type &&
          Date.now() - lastMsg.timestamp < ACCUMULATION_WINDOW
        ) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMsg,
            text: lastMsg.text + text,
            timestamp: Date.now(),
          };
          return updated;
        }
        return [...prev.slice(-100), { type, text, timestamp: Date.now() }];
      });
    },
    []
  );

  // ── Independent video-frame pump ───────────────────────────────────────
  // Sends mirrored+cropped JPEG frames to Gemini at ~0.5 FPS, decoupled from
  // audio. Used only by the dedicated Camera Stage so the floating PiP can be
  // a pure local preview that never uploads anything.
  const stopVideoFrames = useCallback(() => {
    if (videoFramesIntervalRef.current) {
      clearInterval(videoFramesIntervalRef.current);
      videoFramesIntervalRef.current = null;
    }
    videoFramesElRef.current = null;
    setIsVideoStreaming(false);
    console.log('📹 [LiveAPI] Video frames stopped');
  }, []);

  const startVideoFrames = useCallback((videoElement: HTMLVideoElement) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('📹 [LiveAPI] Cannot stream frames — not connected');
      return;
    }
    if (videoFramesIntervalRef.current) {
      console.warn('📹 [LiveAPI] Video frames already running');
      return;
    }
    videoFramesElRef.current = videoElement;
    if (!videoCanvasRef.current) {
      videoCanvasRef.current = document.createElement('canvas');
    }
    const canvas = videoCanvasRef.current;

    const sendFrame = () => {
      const el = videoFramesElRef.current;
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      if (!el || el.readyState < el.HAVE_ENOUGH_DATA) return;

      const ctx2 = canvas.getContext('2d');
      if (!ctx2) return;

      const displayW = el.clientWidth;
      const displayH = el.clientHeight;
      const videoW = el.videoWidth;
      const videoH = el.videoHeight;
      if (displayW === 0 || displayH === 0 || videoW === 0 || videoH === 0)
        return;

      const displayAspect = displayW / displayH;
      const videoAspect = videoW / videoH;

      let sx: number, sy: number, sw: number, sh: number;
      if (videoAspect > displayAspect) {
        sh = videoH;
        sw = videoH * displayAspect;
        sy = 0;
        sx = (videoW - sw) / 2;
      } else {
        sw = videoW;
        sh = videoW / displayAspect;
        sx = 0;
        sy = (videoH - sh) / 2;
      }

      const scale = Math.min(1, 640 / sw);
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);

      // Mirror to match the CSS scale-x-[-1] preview the user sees.
      ctx2.save();
      ctx2.translate(canvas.width, 0);
      ctx2.scale(-1, 1);
      ctx2.drawImage(el, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      ctx2.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
      const base64Image = dataUrl.split(',')[1];

      wsRef.current.send(
        JSON.stringify({
          realtimeInput: {
            video: { data: base64Image, mimeType: 'image/jpeg' },
          },
        })
      );
    };

    videoFramesIntervalRef.current = setInterval(sendFrame, 2000);
    setIsVideoStreaming(true);
    console.log('📹 [LiveAPI] Video frames started (Camera Stage, ~0.5 FPS)');
  }, []);

  const stopStreaming = useCallback(() => {
    console.log('🛑 [LiveAPI] Stopping streaming...');
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;

    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    setIsStreaming(false);
    isStreamingRef.current = false;
    setAudioAmplitude(0);
  }, []);

  const connect = useCallback(
    async (systemPrompt?: string) => {
      if (wsRef.current) {
        console.warn('[LiveAPI] Already connected, ignoring');
        return;
      }

      console.log('[LiveAPI] Connecting to:', WS_URL.replace(API_KEY, '***'));
      console.log('[LiveAPI] Model:', MODEL);

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[LiveAPI] WebSocket connected');

        const setupMessage = {
          setup: {
            model: `models/${MODEL}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
            },
            systemInstruction: {
              parts: [{ text: systemPrompt || DEFAULT_SYSTEM_PROMPT }],
            },
            tools: toolDeclarations,
          },
        };

        ws.send(JSON.stringify(setupMessage));
        setConnected(true);
        addMessage({
          type: 'system',
          text: 'Connected to Gemini Live',
          timestamp: Date.now(),
        });
      };

      ws.onmessage = async (event) => {
        let data: Record<string, unknown>;
        try {
          if (event.data instanceof Blob) {
            data = JSON.parse(await event.data.text());
          } else {
            data = JSON.parse(event.data as string);
          }
        } catch (e) {
          console.error('📥 [LiveAPI] ❌ Failed to parse message:', e);
          return;
        }

        if (data.setupComplete) {
          console.log('📥 [LiveAPI] Setup complete!');
          addMessage({
            type: 'system',
            text: 'Ready — start talking!',
            timestamp: Date.now(),
          });
          audioStreamerRef.current = new AudioStreamer();
          return;
        }

        const serverContent = data.serverContent as
          | Record<string, unknown>
          | undefined;
        if (serverContent) {
          const modelTurn = serverContent.modelTurn as
            | {
                parts?: Array<{
                  inlineData?: { data: string; mimeType: string };
                }>;
              }
            | undefined;
          if (modelTurn?.parts) {
            setIsModelSpeaking(true);
            for (const part of modelTurn.parts) {
              if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
                audioStreamerRef.current?.addPCM16(part.inlineData.data);
              }
            }
          }

          if (serverContent.turnComplete) {
            setIsModelSpeaking(false);
          }

          const inputTx = serverContent.inputTranscription as
            | { text: string }
            | undefined;
          if (inputTx?.text) {
            accumulateTranscript('user', inputTx.text);
            saveTranscript({
              speaker: 'user',
              text: inputTx.text,
              timestamp: Date.now(),
            } as TranscriptEntry);
          }

          const outputTx = serverContent.outputTranscription as
            | { text: string }
            | undefined;
          if (outputTx?.text) {
            accumulateTranscript('gemini', outputTx.text);
            saveTranscript({
              speaker: 'gemini',
              text: outputTx.text,
              timestamp: Date.now(),
            } as TranscriptEntry);
          }
        }

        const toolCall = data.toolCall as
          | { functionCalls: FunctionCall[] }
          | undefined;
        if (toolCall?.functionCalls) {
          const functionResponses = [];
          for (const fc of toolCall.functionCalls) {
            // NOTE: tool calls are intentionally NOT surfaced in the chat UI.
            // They run silently in the background; we only log to the console
            // for debugging. (Previously these were rendered as `tool` bubbles.)
            console.log(
              `[LiveAPI] tool → ${fc.name}(${JSON.stringify(fc.args).slice(0, 200)})`
            );

            const response = await executeToolCall(
              fc,
              onNavigateRef.current,
              onThemeRef.current,
              onHighlightRef.current,
              getScreenContextRef.current,
              onAnnotationRef.current,
              onDomAnnotationRef.current,
              customToolCallbackRef.current
            );
            functionResponses.push(response);

            console.log(
              `[LiveAPI] tool ✓ ${fc.name} → ${JSON.stringify(response.response.result).slice(0, 200)}`
            );
          }

          const toolResponseMessage = {
            toolResponse: { functionResponses },
          };
          ws.send(JSON.stringify(toolResponseMessage));
        }
      };

      ws.onclose = (event) => {
        const reason = event.reason || 'no reason';
        console.log(
          `[LiveAPI] Disconnected. Code: ${event.code}, reason: ${reason}`
        );
        // 1007/1008/1011 right after connecting almost always = bad auth or
        // wrong endpoint/model. Surface a helpful hint instead of a bare code.
        let hint = '';
        if (event.code === 1007 || event.code === 1008) {
          hint = IS_EPHEMERAL_TOKEN
            ? ' — token có thể đã hết hạn hoặc sai. Tạo token mới.'
            : ' — API key sai hoặc model không hợp lệ. Kiểm tra VITE_GEMINI_API_KEY / VITE_GEMINI_LIVE_MODEL.';
        }
        setConnected(false);
        wsRef.current = null;
        addMessage({
          type: 'system',
          text: `Disconnected (${event.code}: ${reason})${hint}`,
          timestamp: Date.now(),
        });
      };

      ws.onerror = (error) => {
        console.error('[LiveAPI] ❌ WebSocket error:', error);
      };
    },
    [addMessage, accumulateTranscript]
  );

  const disconnect = useCallback(() => {
    console.log('[LiveAPI] Disconnecting...');
    stopStreaming();
    stopVideoFrames();
    wsRef.current?.close();
    wsRef.current = null;
    audioStreamerRef.current?.stop();
    audioStreamerRef.current = null;
    setConnected(false);
    setIsStreaming(false);
    setIsModelSpeaking(false);
    setAudioAmplitude(0);
  }, [stopStreaming, stopVideoFrames]);

  const startStreaming = useCallback(
    async (videoElement?: HTMLVideoElement | null) => {
      if (!wsRef.current) {
        console.warn('[LiveAPI] Cannot stream — not connected');
        return;
      }
      if (isStreamingRef.current) {
        console.warn('[LiveAPI] Already streaming');
        return;
      }

      try {
        audioRecorderRef.current = new AudioRecorder(
          (base64Audio) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  realtimeInput: {
                    audio: {
                      data: base64Audio,
                      mimeType: 'audio/pcm;rate=16000',
                    },
                  },
                })
              );
            }
          },
          (amplitude) => setAudioAmplitude(amplitude)
        );
        await audioRecorderRef.current.start();

        if (videoElement) {
          if (!videoCanvasRef.current) {
            videoCanvasRef.current = document.createElement('canvas');
          }
          const canvas = videoCanvasRef.current;

          const sendFrame = () => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
              return;
            if (
              !videoElement ||
              videoElement.readyState < videoElement.HAVE_ENOUGH_DATA
            )
              return;

            const ctx2 = canvas.getContext('2d');
            if (!ctx2) return;

            const displayW = videoElement.clientWidth;
            const displayH = videoElement.clientHeight;
            const videoW = videoElement.videoWidth;
            const videoH = videoElement.videoHeight;
            if (
              displayW === 0 ||
              displayH === 0 ||
              videoW === 0 ||
              videoH === 0
            )
              return;

            const displayAspect = displayW / displayH;
            const videoAspect = videoW / videoH;

            let sx: number, sy: number, sw: number, sh: number;
            if (videoAspect > displayAspect) {
              sh = videoH;
              sw = videoH * displayAspect;
              sy = 0;
              sx = (videoW - sw) / 2;
            } else {
              sw = videoW;
              sh = videoW / displayAspect;
              sx = 0;
              sy = (videoH - sh) / 2;
            }

            const scale = Math.min(1, 640 / sw);
            canvas.width = Math.round(sw * scale);
            canvas.height = Math.round(sh * scale);

            ctx2.save();
            ctx2.translate(canvas.width, 0);
            ctx2.scale(-1, 1);
            ctx2.drawImage(
              videoElement,
              sx,
              sy,
              sw,
              sh,
              0,
              0,
              canvas.width,
              canvas.height
            );
            ctx2.restore();

            const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
            const base64Image = dataUrl.split(',')[1];

            wsRef.current.send(
              JSON.stringify({
                realtimeInput: {
                  video: { data: base64Image, mimeType: 'image/jpeg' },
                },
              })
            );
          };

          videoIntervalRef.current = setInterval(sendFrame, 2000);
          console.log('📹 [LiveAPI] Video streaming at 0.5 FPS (optimized)');
        }

        setIsStreaming(true);
        isStreamingRef.current = true;
        addMessage({
          type: 'system',
          text: '🎤 Streaming started',
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('🚀 [LiveAPI] ❌ Error starting stream:', error);
        setIsStreaming(false);
        isStreamingRef.current = false;
      }
    },
    [addMessage]
  );

  const sendText = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn('[LiveAPI] Cannot send text — not connected');
        return;
      }
      wsRef.current.send(JSON.stringify({ realtimeInput: { text } }));
      addMessage({ type: 'user', text, timestamp: Date.now() });
    },
    [addMessage]
  );

  return {
    connect,
    disconnect,
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
  };
}
