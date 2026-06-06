# LiveContext — AI Companion for EchoEnglish

A complete port of the standalone **livecontext** demo into EchoEnglish-frontend.
Gives the app a Gemini Live powered voice + screen-aware AI companion that can
hear the user, see the page (and optionally the webcam), navigate, click, scroll,
fill inputs, highlight text, and draw annotations directly on the UI.

---

## 1. Overview

The legacy EchoEnglish chatbot (`features/chatbot`) remains the **default** text
experience. Users can opt into **Live Mode** from a pill inside the chatbot
header. While Live Mode is on:

- The legacy chatbot bubble is **hidden** (`App.tsx` checks `liveModeEnabled`).
- A floating **Companion Orb** appears in the bottom-right of every (non-admin)
  page.
- An optional **floating webcam window** can be opened from the live panel.
- A **DOM Annotation Overlay** is always mounted globally so the AI can draw
  boxes/arrows/cursors on top of any page element.

Switching back out of Live Mode disconnects the WebSocket, closes webcam,
clears overlays and restores the original chatbot.

---

## 2. File layout

```
src/features/livecontext/
├── context/
│   └── CompanionContext.tsx        Single source of truth for live state.
│                                   Wires the Gemini hook to navigation,
│                                   theme, highlight, annotation refs.
├── hooks/
│   └── use-live-api.ts             WebSocket lifecycle + audio/video streaming
│                                   + transcript accumulation + tool dispatch.
├── components/
│   ├── CompanionOrb.tsx            Floating orb, toggles panel, mounts overlays.
│   ├── OrbVisual.tsx               Animated orb with idle/listening/processing/
│   │                               speaking/navigating states + waveform.
│   ├── LiveChatPanel.tsx           Slide-up panel: messages, quick chips,
│   │                               mic/cam/exit-live buttons, text input.
│   ├── TranscriptOverlay.tsx       Fading bubbles for user/model transcripts.
│   ├── NavigationTransition.tsx    Cinematic page-change splash.
│   ├── GuidanceOverlay.tsx         Selector-based spotlight + AI cursor + tooltip.
│   ├── AnnotationOverlay.tsx       Canvas overlay for camera annotations
│   │                               (point/box/circle/arrow/note).
│   ├── DomAnnotationOverlay.tsx    rAF-tracked overlay anchored to live DOM
│   │                               rects: box / cursor / note / text-highlight
│   │                               / curved arrow-to.
│   ├── WebcamFloat.tsx             Draggable PiP webcam with minimise +
│   │                               audio-only toggle + close + per-frame send.
│   ├── RawHtmlRenderer.tsx         Wraps backend HTML in `processHtml` then
│   │                               renders with `dangerouslySetInnerHTML`.
│   ├── LiveContextRoot.tsx         Mounts orb, dom-overlay, webcam globally.
│   └── LiveModeToggle.tsx          Pill button that flips into / out of Live.
├── utils/
│   ├── audio-recorder.ts           16 kHz mic capture → base64 PCM + amplitude.
│   ├── audio-streamer.ts           24 kHz playback for Gemini PCM audio.
│   ├── dom-vision.ts               Spatial index of every `data-ai-id` element
│   │                               + role inference, text-range lookup,
│   │                               current selection extraction.
│   ├── tools.ts                    Tool declarations + EchoEnglish-aware
│   │                               executors (navigate / click / fill / scroll
│   │                               / annotate / highlight / theme).
│   ├── reader-postprocess.tsx      `renderSentences(text, prefix)` helper.
│   └── html-postprocess.ts         Sanitize raw HTML + inject `data-ai-id` &
│                                   sentence spans (idempotent, hashed ids).
├── styles/
│   └── livecontext.css             All `lc-*` prefixed styles (no collisions).
├── index.ts                        Public exports.
└── README.md                       (this file)
```

Every CSS class, component name, and tool callback is prefixed with `lc-` /
`Lc` so nothing collides with existing EchoEnglish classes.

---

## 3. Wiring inside the host app

`src/App.tsx` is wrapped like:

```tsx
<Router>
  <CompanionProvider>
    <Routes>… all existing routes …</Routes>
    <Toaster />
    <ChatbotWrapper /> {/* legacy bot, hidden when liveModeEnabled */}
    <LiveContextRoot /> {/* orb + dom overlay + webcam, all global */}
  </CompanionProvider>
</Router>
```

`CompanionProvider` **must live inside** the `Router` because it consumes
`useNavigate` / `useLocation` to receive navigation commands from the AI and to
push page-change context to the model.

The `Layout`'s `<main>` got `data-ai-id="main"` so the AI can default-target
the page body when the user says "highlight this".

The legacy chatbot's `ChatBubble` now renders a `<LiveModeToggle />` pill in its
header (next to the minimise/close buttons). Clicking it:

1. Sets `liveModeEnabled=true` (persisted in `localStorage`).
2. Closes the legacy chatbot via the provided `onEnable` callback.
3. Opens the live panel so the orb is immediately interactive.

---

## 4. Capabilities mirrored from the livecontext demo

| Capability                                                               | Demo source                                     | EchoEnglish location                                                                                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini Live WebSocket setup + audio/video pipeline                       | `hooks/use-live-api.ts`                         | `livecontext/hooks/use-live-api.ts`                                                                                                                             |
| Companion orb (idle/listening/processing/speaking/navigating animations) | `components/companion/OrbVisual.tsx`            | `livecontext/components/OrbVisual.tsx`                                                                                                                          |
| Slide-up chat panel + quick action chips                                 | `components/companion/ChatPanel.tsx`            | `livecontext/components/LiveChatPanel.tsx`                                                                                                                      |
| Spatial DOM index + ai-id role inference                                 | `utils/dom-vision.ts`                           | `livecontext/utils/dom-vision.ts`                                                                                                                               |
| Sentence-level text splitting                                            | `utils/reader-postprocess.tsx`                  | `livecontext/utils/reader-postprocess.tsx`                                                                                                                      |
| Raw-HTML sanitiser + auto-tag with `data-ai-id`                          | `utils/html-postprocess.ts`                     | `livecontext/utils/html-postprocess.ts`                                                                                                                         |
| Tool declarations + execute switch                                       | `utils/tools.ts`                                | `livecontext/utils/tools.ts` (adapted to EchoEnglish routes + new `click_element`, `focus_element`, `fill_input`, `scroll_to_element`, `navigate_to_url` tools) |
| Camera annotation overlay                                                | `components/companion/AnnotationOverlay.tsx`    | `livecontext/components/AnnotationOverlay.tsx` (now mounted inside `WebcamFloat`)                                                                               |
| DOM annotation overlay (boxes/cursors/text-highlight/arrows)             | `components/companion/DomAnnotationOverlay.tsx` | `livecontext/components/DomAnnotationOverlay.tsx`                                                                                                               |
| Selector-based spotlight tooltip                                         | `components/companion/GuidanceOverlay.tsx`      | `livecontext/components/GuidanceOverlay.tsx`                                                                                                                    |
| Transcript fading bubbles                                                | `components/companion/TranscriptOverlay.tsx`    | `livecontext/components/TranscriptOverlay.tsx`                                                                                                                  |
| Cinematic navigation transition                                          | `components/companion/NavigationTransition.tsx` | `livecontext/components/NavigationTransition.tsx`                                                                                                               |

### New in EchoEnglish-frontend

- **Floating webcam PiP** (`WebcamFloat.tsx`) — meeting-app style; draggable;
  4 size modes (PiP / Medium / Large / **Expanded** — covers most of the
  viewport so AI annotations are big and readable); audio-only toggle; minimise;
  close.
- **`click_element`/`focus_element`/`fill_input`/`scroll_to_element`** tools —
  let the AI actually drive the existing EchoEnglish UI, not just point at it.
- **`navigate_to_url`** — fallback for any parameterised route.
- **Live Mode toggle** — context-aware switch that hides/shows the original
  chatbot to keep impact minimal.
- **Reactive Webcam streaming** — when the user turns the webcam on while
  connected, the hook auto-starts video frame streaming; flipping audio-only
  cleanly stops video.
- **EchoEnglish domain tools** (`LiveToolBridge.tsx`) — `create_flashcard`,
  `list_flashcards`, `list_flashcard_categories`, `delete_flashcard`,
  `open_resource`, `get_resource_text`. These call real RTK Query mutations
  so the AI actually creates rows in your DB, not just describes the action.
- **Custom tool registry** — `registerTool(name, handler)` from
  `useCompanion()` lets any component expose domain tools; the bridge uses
  this to plug RTK Query mutations in from outside the websocket hook.
- **Page context registry** — `setPageContext(key, value)` lets pages
  publish state (e.g. the current resource title, summary, container ai_id)
  into `get_screen_context().pageContext` so the AI doesn't have to guess.
- **Selection highlight overlay** (`SelectionHighlight.tsx`) — listens to
  the browser's `selectionchange` event and renders an animated soft box
  around every line of the user's text selection, plus a pill ("AI sees:
  ...") above it. This gives the user explicit visual confirmation that
  the AI is aware of what they're highlighting.
- **HTML article AI-vision** — `ResourceDetailPage` now wraps article
  content in `RawHtmlRenderer`, so every heading / paragraph / list-item /
  sentence inside the article gets a stable `data-ai-id` _and_ the resource
  metadata (title, summary, keyPoints, articleContainerAiId) is published
  into pageContext. The AI can now call `get_resource_text()` then
  `highlight_text({container_ai_id, text})` to highlight an exact phrase.

---

## 5. AI vocabulary (`data-ai-*` attributes)

The companion needs **stable handles** on every interactive element. We added
`data-ai-id` / `data-ai-label` / `data-ai-role` attributes to:

| File                                               | Element                                         |
| -------------------------------------------------- | ----------------------------------------------- |
| `components/layout/Layout.tsx`                     | `<main>`                                        |
| `components/layout/Sidebar.tsx`                    | sidebar `<aside>` + every nav link              |
| `pages/FlashcardsPage.tsx`                         | page wrapper + each tab trigger                 |
| `features/flashcard/components/FlashcardBoard.tsx` | "Create Flashcard" button + search input        |
| `pages/VocabularyBrowsePage.tsx`                   | page wrapper + back button                      |
| `pages/resource/ResourcePage.tsx`                  | page wrapper + header + list container          |
| `pages/resource/ResourceDetailPage.tsx`            | page wrapper + main + back button               |
| `pages/ExamAttemptsPage.tsx`                       | page wrapper + header + "Start New Test" button |

Beyond explicit tags, the `dom-vision` indexer **auto-discovers** every
`button, a[href], input, select, textarea, h1-h4, section[id], [role="button"]`
so even un-tagged elements become reachable. Auto-generated ids are persisted
on the element via `el.dataset.aiId` so subsequent calls find the same node.

For long-form content rendered through `RawHtmlRenderer`, `processHtml`
auto-tags every heading / paragraph / list-item / blockquote / image / link /
button / table, **and** splits each paragraph into per-sentence
`<span data-ai-role="sentence">` elements so the AI can target an exact
sentence the user asked about.

---

## 6. Tools the AI can call

(For full schemas see `utils/tools.ts`.)

**Navigation & state**

- `navigate_to_page(page)` — `dashboard | flashcards | vocabulary | tests | resources | ebooks | recordings | payment | payment-history | exam-attempts | practice-drill | conversation-practice | content | profile | learning-plan-setup`
- `navigate_to_url(url)` — any parameterised route (`/resources/abc-123`, `/me/tests/42/analysis`).
- `set_theme(light|dark)`
- `get_current_time()`
- `get_screen_context()` — returns current route, page type, visible-text
  preview, DOM elements summary, action buttons, current user selection.

**UI interaction (new)**

- `get_dom_elements({role?, search?, visible_only?})`
- `click_element({ai_id})`
- `focus_element({ai_id})`
- `fill_input({ai_id, value})`
- `scroll_to_element({ai_id})`
- `get_user_selection()` — returns the text the user has highlighted.

**Visual guidance**

- `point_at_element({ai_id, label, color})` → animated AI cursor.
- `draw_box_element({ai_id, label, color})` → dashed border + corner brackets.
- `highlight_text({container_ai_id, text, label, color})` → multi-line text
  highlight inside a container.
- `add_dom_note({ai_id, text, color})` → floating note above an element.
- `arrow_to_element({ai_id, label, color})` → curved arrow from the orb.
- `clear_dom_annotations()`

**Camera annotations** (only meaningful when webcam shared)

- `point_at`, `draw_box`, `draw_circle`, `add_note`, `draw_arrow`, `clear_annotations`

**EchoEnglish domain (real actions)**

- `open_flashcard_dialog({front?, back?, category_name?, difficulty?, tags?, phonetic?, source?, auto_submit?})` — **opens the real Create-Flashcard dialog on screen and fills it in front of the user** (navigates to Flashcards first). Visual, demo-friendly. `auto_submit:"true"` also saves it.
- `create_flashcard({front, back, category_name?, difficulty?, tags?, phonetic?, source?})` — silent/headless save (no dialog).
- `select_option({ai_id, option_text})` — pick from a dropdown (Radix or native): opens the trigger, clicks the matching option. Use for difficulty/category/filter pickers (`fill_input` can't touch these).
- `list_flashcards({search?, category_id?, limit?})`
- `list_flashcard_categories()`
- `delete_flashcard({flashcard_id})`
- `get_resource_text()` — full article text + every paragraph's ai_id from the current `/resources/:id` page.
- `open_resource({resource_id})`

**Dialog automation — UI Action Bus** (`utils/ui-actions.ts`)

A tiny typed event bus (`emitUiAction` / `subscribeUiAction`) lets tools drive
_visible_ dialog flows instead of headless API calls. `open_flashcard_dialog`
emits `open-flashcard-dialog`; `CreateEditFlashcardDialog` subscribes, opens
itself, pre-fills `formData` (mapping `category_name`→id), and optionally
auto-submits after a 900 ms "watch it fill" delay. Every dialog field also has
a stable `data-ai-id` (`flashcard-form-front`, `-back`, `-category`,
`-difficulty`, `-phonetic`, `-source`, `-tag-input`, `-submit`, `-cancel`) so
the AI can alternatively drive it field-by-field via `fill_input` +
`select_option` + `click_element`. To wire a new dialog: add an action type to
`UiActionMap`, `subscribeUiAction(...)` inside that dialog, and a tool in
`LiveToolBridge` that `emitUiAction(...)`.

**Legacy**

- `highlight_element({selector, message})` — CSS-selector spotlight (still used
  by the manual "Test Guide" chip).

All annotations follow live `getBoundingClientRect()` via `requestAnimationFrame`
inside `DomAnnotationOverlay`, so boxes/cursors stay glued to elements during
scroll/resize/layout shifts.

---

## 7. Webcam float

`WebcamFloat.tsx` is a draggable, meeting-app style picture-in-picture window.

- Toggled from the live panel's `📹` button.
- **Drag** the title bar to reposition.
- **`—`** minimises the window to a 64-px badge.
- **`🎤` ↔ `📹`** toggles **audio-only mode** — when on, the camera shuts off
  visually (pulsing orb placeholder) but mic keeps streaming. The hook restarts
  streaming with `null` video element so audio chunks continue to flow.
- **`✕`** stops the media stream and closes the window.

While the camera is live, video frames are mirrored + cropped to match the CSS
`scale-x-[-1] object-cover` rendering, then sent as base64 JPEGs at ~2 fps so
Gemini's coordinates align with the user's view (necessary for `point_at`).
The `AnnotationOverlay` canvas is rendered **inside** the mirrored container so
the AI's percentage coordinates map directly to the user's eyes.

---

## 8. State machine

`CompanionState` (derived in `CompanionContext.useEffect`):

```
disconnected   ws closed
idle           ws open, no audio streaming
listening      streaming + last msg from user
processing     streaming + waiting for model
speaking       model is producing audio (isModelSpeaking)
navigating     navigation transition in flight
```

The orb's animation, the chat panel's status dot, and the webcam header dot all
react to this state in real time.

---

## 9. How to drive it as the user

1. Open any non-admin page → click the floating blue chatbot bubble.
2. In the chatbot header, click the **"Live AI"** pill.
3. The chatbot collapses; the **orb** appears bottom-right.
4. Click the orb to connect (it negotiates the WebSocket with Gemini).
5. Click the orb again to open the slide-up panel; press `🎤` to start
   talking. The AI can immediately call `get_screen_context` and `get_dom_elements`.
6. Try: _"Cho tôi xem trang flashcard của tôi và chỉ vào nút tạo mới."_ — the
   AI navigates to `/flashcards`, finds the create button via `get_dom_elements`,
   then `point_at_element({ai_id})`.
7. Press `📹` to share webcam → the floating window opens and starts streaming.
   Try: _"What do you see in front of me?"_ — Gemini will describe the frame.
8. Press `🎤` in the webcam to drop into audio-only.
9. Press `↩` in the live panel header (or the pill again from the chatbot) to
   exit Live Mode and return to the normal text chatbot.

---

## 10. Configuration knobs

- **API key**: hard-coded as `API_KEY` inside `use-live-api.ts` (frontend-only
  demo, per the brief). In production move this server-side and authenticate
  the WebSocket through a backend proxy.
- **Model**: `gemini-3.1-flash-live-preview` — change `MODEL` in the same file.
- **System prompt**: `DEFAULT_SYSTEM_PROMPT` lives next to the hook; tweak
  there or pass a custom prompt to `connect(prompt)`.
- **Live Mode persistence**: stored under `localStorage.echo_live_mode_enabled`.
- **Transcripts**: stored under `localStorage.echo_live_transcripts` (capped
  at 500 entries).

---

## 11. Adding `data-ai-id` to more elements

The bare minimum is `data-ai-id="some-stable-id"`. Optional but helpful:

- `data-ai-label="Human-readable name"` — what the AI reads when describing.
- `data-ai-role="create | delete | save | search | filter | navigation | start | view | cancel | connect"` — overrides the heuristic role inference.

If you skip `data-ai-id`, the indexer will auto-generate one from the element's
text + tag and **persist it back on the element**, so the AI can refer to it
across calls within the same session.

---

## 12. Known limitations / things to do later

- The Gemini API key is hard-coded for demo purposes — move server-side before
  shipping.
- Some EchoEnglish pages still rely on auto-tagged ai-ids only; if a page's
  layout changes drastically the AI's first `get_dom_elements` call resolves
  the new ones automatically, but explicit `data-ai-id`s give better stability.
- `highlight_text` operates on the container's plain text — heavy markdown
  rendering with custom React tree may need a custom container ai-id pinned to
  the rendered root.
- No backend-mediated tool execution (everything happens on the client). Tools
  that need server state (e.g. "create a flashcard from this word") should call
  through the existing RTK Query mutations; wiring those is a straightforward
  next step (just add a case in `executeToolCall`).
