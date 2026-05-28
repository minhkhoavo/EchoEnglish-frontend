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

// NOTE: Frontend-only demo key — for production move this server-side.
const API_KEY = 'AIzaSyB_IRjv1rYp-pzgUrtwJHR3w-wMcZnGAmk';
const HOST = 'generativelanguage.googleapis.com';
const MODEL = 'gemini-3.1-flash-live-preview';
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

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
- create_flashcard({front, back, category_name?, difficulty?, tags?, phonetic?, source?}) — saves to the user's account.
- list_flashcards({search?, category_id?, limit?}) — read what they've saved.
- list_flashcard_categories() — see what categories exist before passing category_name.
- delete_flashcard({flashcard_id}) — only on explicit user request.
- get_resource_text() — when the user is on a /resources/:id page, returns the article body text + each paragraph's ai_id. Use this BEFORE highlight_text on a long article so you know the exact wording.
- open_resource({resource_id}) — jump directly to a resource.

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

CAMERA/VIDEO ANNOTATIONS (only when webcam is shared):
- point_at(x, y, label), draw_box, draw_circle, add_note, draw_arrow. Coordinates 0-100 percentages of the video.
- Use draw_box to outline objects the user shows you. Use point_at + add_note to label vocabulary in real-world objects.

NAVIGATION:
- navigate_to_page for top-level routes (dashboard, flashcards, vocabulary, tests, resources, ebooks, recordings, payment, payment-history, exam-attempts, practice-drill, conversation-practice, content, profile, learning-plan-setup).
- navigate_to_url for parameterised routes like /resources/abc, /me/tests/123/analysis.

BEHAVIOR:
- Be warm, encouraging. Mix English and Vietnamese when it helps.
- Keep responses SHORT and conversational — this is voice.
- ALWAYS call get_dom_elements before pointing/clicking on a non-camera page.
- When the user asks to save a word, just do it — call create_flashcard. Don't keep asking for confirmation.
- Use annotations liberally — they make the experience feel alive.
- Clear annotations when moving to a new topic.
- Speak in Vietnamese by default unless the user uses English.`;

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
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioAmplitude, setAudioAmplitude] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
        console.warn('🌐 [LiveAPI] Already connected, ignoring');
        return;
      }

      console.log(
        '🌐 [LiveAPI] Connecting to:',
        WS_URL.replace(API_KEY, '***')
      );
      console.log('🌐 [LiveAPI] Model:', MODEL);

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🌐 [LiveAPI] ✅ WebSocket connected');

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
          text: '🟢 Connected to Gemini Live',
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
          console.log('📥 [LiveAPI] ✅ Setup complete!');
          addMessage({
            type: 'system',
            text: '✅ Ready — start talking!',
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
            addMessage({
              type: 'tool',
              text: `🔧 ${fc.name}(${JSON.stringify(fc.args).slice(0, 120)})`,
              timestamp: Date.now(),
            });

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

            addMessage({
              type: 'tool',
              text: `✅ ${fc.name} → ${JSON.stringify(response.response.result).slice(0, 120)}`,
              timestamp: Date.now(),
            });
          }

          const toolResponseMessage = {
            toolResponse: { functionResponses },
          };
          ws.send(JSON.stringify(toolResponseMessage));
        }
      };

      ws.onclose = (event) => {
        console.log(`🌐 [LiveAPI] Disconnected. Code: ${event.code}`);
        setConnected(false);
        wsRef.current = null;
        addMessage({
          type: 'system',
          text: `🔴 Disconnected (${event.code})`,
          timestamp: Date.now(),
        });
      };

      ws.onerror = (error) => {
        console.error('🌐 [LiveAPI] ❌ WebSocket error:', error);
      };
    },
    [addMessage, accumulateTranscript]
  );

  const disconnect = useCallback(() => {
    console.log('🌐 [LiveAPI] Disconnecting...');
    stopStreaming();
    wsRef.current?.close();
    wsRef.current = null;
    audioStreamerRef.current?.stop();
    audioStreamerRef.current = null;
    setConnected(false);
    setIsStreaming(false);
    setIsModelSpeaking(false);
    setAudioAmplitude(0);
  }, [stopStreaming]);

  const startStreaming = useCallback(
    async (videoElement?: HTMLVideoElement | null) => {
      if (!wsRef.current) {
        console.warn('🌐 [LiveAPI] Cannot stream — not connected');
        return;
      }
      if (isStreamingRef.current) {
        console.warn('🌐 [LiveAPI] Already streaming');
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
        console.warn('🌐 [LiveAPI] Cannot send text — not connected');
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
    sendText,
    connected,
    isStreaming,
    isModelSpeaking,
    messages,
    audioAmplitude,
  };
}
