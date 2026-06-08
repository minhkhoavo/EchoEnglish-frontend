/**
 * Tool definitions for the Gemini Live API function calling.
 * Adapted to EchoEnglish navigation routes & domain (flashcards, tests, resources).
 */

import {
  buildDomIndex,
  getCurrentSelection,
  summarizeIndex,
} from './dom-vision';

export interface ToolDefinition {
  functionDeclarations: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<
      string,
      { type: string; description: string; enum?: string[] }
    >;
    required?: string[];
  };
}

export interface FunctionCall {
  name: string;
  id: string;
  args: Record<string, unknown>;
}

export interface FunctionResponse {
  name: string;
  id: string;
  response: { result: unknown };
}

export const toolDeclarations: ToolDefinition[] = [
  {
    functionDeclarations: [
      {
        name: 'navigate_to_page',
        description:
          'Navigate the user to a different page in EchoEnglish. Use this when the user asks to go to a section.',
        parameters: {
          type: 'OBJECT',
          properties: {
            page: {
              type: 'STRING',
              description: 'The page to navigate to',
              enum: [
                'dashboard',
                'flashcards',
                'vocabulary',
                'tests',
                'resources',
                'ebooks',
                'recordings',
                'payment',
                'payment-history',
                'exam-attempts',
                'practice-drill',
                'conversation-practice',
                'content',
                'profile',
                'learning-plan-setup',
              ],
            },
          },
          required: ['page'],
        },
      },
      {
        name: 'navigate_to_url',
        description:
          'Navigate the user to a specific URL/route in the app (e.g. /resources/abc123, /me/tests, /flashcards?tab=review). Prefer this for parameterised routes.',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: { type: 'STRING', description: 'The route (starts with /)' },
          },
          required: ['url'],
        },
      },
      {
        name: 'get_current_time',
        description: 'Get the current date and time.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'set_theme',
        description: 'Change the application theme/color scheme.',
        parameters: {
          type: 'OBJECT',
          properties: {
            theme: {
              type: 'STRING',
              description: 'The theme to apply',
              enum: ['light', 'dark'],
            },
          },
          required: ['theme'],
        },
      },
      {
        name: 'highlight_element',
        description:
          'Highlight a specific element on the user screen via CSS selector to draw their attention.',
        parameters: {
          type: 'OBJECT',
          properties: {
            selector: {
              type: 'STRING',
              description: 'CSS selector of the element to highlight',
            },
            message: {
              type: 'STRING',
              description: 'Guidance message to display near it',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'get_screen_context',
        description:
          'Get information about what the user is currently viewing on screen: current route, page type, visible elements, current text selection.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'click_element',
        description:
          'Click a button or interactive element on the page by its ai_id. Use this when the user says "click X for me", "open X", "start the test", etc. Always discover the ai_id with get_dom_elements first.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the element to click',
            },
          },
          required: ['ai_id'],
        },
      },
      {
        name: 'focus_element',
        description:
          'Focus an input or interactive element by ai_id (e.g. focus the search box).',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the element to focus',
            },
          },
          required: ['ai_id'],
        },
      },
      {
        name: 'fill_input',
        description:
          'Fill the value of an input/textarea by ai_id and dispatch input events.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the input element',
            },
            value: { type: 'STRING', description: 'New value to set' },
          },
          required: ['ai_id', 'value'],
        },
      },
      {
        name: 'scroll_to_element',
        description: 'Smooth-scroll an element by ai_id into view.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the element to scroll to',
            },
          },
          required: ['ai_id'],
        },
      },
      // ─── Video Annotation Tools ───────────────────────────────
      {
        name: 'point_at',
        description:
          'Point at a location in the camera view. Coordinates are percentages 0-100 (0=left/top, 100=right/bottom).',
        parameters: {
          type: 'OBJECT',
          properties: {
            x: { type: 'NUMBER', description: 'Horizontal % (0-100)' },
            y: { type: 'NUMBER', description: 'Vertical % (0-100)' },
            label: {
              type: 'STRING',
              description: 'Short label (e.g. object name)',
            },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: {
              type: 'NUMBER',
              description: 'TTL seconds (default 8)',
            },
          },
          required: ['x', 'y'],
        },
      },
      {
        name: 'draw_box',
        description: 'Draw a highlighted bounding box on the camera view.',
        parameters: {
          type: 'OBJECT',
          properties: {
            x: { type: 'NUMBER', description: 'Center X %' },
            y: { type: 'NUMBER', description: 'Center Y %' },
            width: { type: 'NUMBER', description: 'Width % (default 20)' },
            height: { type: 'NUMBER', description: 'Height % (default 15)' },
            label: { type: 'STRING', description: 'Label' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['x', 'y'],
        },
      },
      {
        name: 'draw_circle',
        description: 'Draw a circle highlight on the camera view.',
        parameters: {
          type: 'OBJECT',
          properties: {
            x: { type: 'NUMBER', description: 'Center X %' },
            y: { type: 'NUMBER', description: 'Center Y %' },
            radius: { type: 'NUMBER', description: 'Radius % (default 10)' },
            label: { type: 'STRING', description: 'Label' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['x', 'y'],
        },
      },
      {
        name: 'add_note',
        description:
          'Add a floating text note at a specific position on the camera view.',
        parameters: {
          type: 'OBJECT',
          properties: {
            x: { type: 'NUMBER', description: 'X %' },
            y: { type: 'NUMBER', description: 'Y %' },
            text: { type: 'STRING', description: 'Note text' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['x', 'y', 'text'],
        },
      },
      {
        name: 'draw_arrow',
        description:
          'Draw an arrow from one point to another on the camera view.',
        parameters: {
          type: 'OBJECT',
          properties: {
            from_x: { type: 'NUMBER', description: 'Start X %' },
            from_y: { type: 'NUMBER', description: 'Start Y %' },
            to_x: { type: 'NUMBER', description: 'End X %' },
            to_y: { type: 'NUMBER', description: 'End Y %' },
            label: { type: 'STRING', description: 'Label at midpoint' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['from_x', 'from_y', 'to_x', 'to_y'],
        },
      },
      {
        name: 'clear_annotations',
        description: 'Clear all visual annotations from the camera view.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      // ─── DOM Vision Tools ─────────────────────────────────────
      {
        name: 'get_dom_elements',
        description:
          'List every interactable / important element on the current page with ai_id, role, label, viewport position. Use BEFORE pointing/clicking on non-camera pages. Roles include: delete, create, save, search, filter, navigation, start, view, paragraph, sentence, heading, section, input.',
        parameters: {
          type: 'OBJECT',
          properties: {
            role: {
              type: 'STRING',
              description:
                'Optional role filter (delete, create, search, view, etc.)',
            },
            search: {
              type: 'STRING',
              description: 'Optional substring match on label/text',
            },
            visible_only: {
              type: 'STRING',
              description: 'If "true", only viewport-visible elements',
              enum: ['true', 'false'],
            },
          },
        },
      },
      {
        name: 'point_at_element',
        description:
          'Show an animated AI cursor pointing at a UI element AND a soft glowing box around it (rendered together — you do NOT also need to call draw_box_element for the same target). The user sees both visual cues at once: cursor tip lands on the button, box surrounds it. Use whenever you want the user to click/tap an element. The cursor follows the element on scroll.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'The ai_id from get_dom_elements',
            },
            label: {
              type: 'STRING',
              description: 'Short text (e.g. "Click here")',
            },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['ai_id'],
        },
      },
      {
        name: 'draw_box_element',
        description:
          'Draw an animated dashed box around a UI element. Great for outlining a flashcard, a test card, a paragraph, a section.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'The ai_id from get_dom_elements',
            },
            label: {
              type: 'STRING',
              description: 'Optional label above the box',
            },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['ai_id'],
        },
      },
      {
        name: 'highlight_text',
        description:
          'Highlight an exact text substring inside a container element on the page (works in the reader). Multi-line ranges supported.',
        parameters: {
          type: 'OBJECT',
          properties: {
            container_ai_id: {
              type: 'STRING',
              description: 'ai_id of the container (defaults to main)',
            },
            text: {
              type: 'STRING',
              description: 'Exact substring to highlight',
            },
            label: { type: 'STRING', description: 'Optional label' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#fbbf24',
                '#10b981',
                '#ef4444',
                '#6366f1',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['text'],
        },
      },
      {
        name: 'add_dom_note',
        description: 'Attach a floating note above a UI element by ai_id.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the target element',
            },
            text: { type: 'STRING', description: 'Note content' },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['ai_id', 'text'],
        },
      },
      {
        name: 'arrow_to_element',
        description:
          'Draw a curved animated arrow from the AI orb to a specific element. Dramatic "look here!" emphasis.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the target element',
            },
            label: {
              type: 'STRING',
              description: 'Optional label at arrow tip',
            },
            color: {
              type: 'STRING',
              description: 'Color',
              enum: [
                '#6366f1',
                '#ef4444',
                '#10b981',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
              ],
            },
            duration_seconds: { type: 'NUMBER', description: 'TTL seconds' },
          },
          required: ['ai_id'],
        },
      },
      {
        name: 'clear_dom_annotations',
        description: 'Remove all DOM-anchored annotations.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'get_user_selection',
        description:
          'Return the text the user currently has highlighted on the page, plus its container element. Use when the user says "what does this mean?" / "translate this".',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'select_option',
        description:
          'Choose an option from a dropdown / select (works with the app\'s custom Radix selects AND native <select>). Pass the ai_id of the select trigger and the visible text of the option to choose, e.g. select_option({ai_id:"flashcard-form-difficulty", option_text:"Hard"}). Use this for difficulty pickers, category pickers, filters, etc. — fill_input does NOT work on these.',
        parameters: {
          type: 'OBJECT',
          properties: {
            ai_id: {
              type: 'STRING',
              description: 'ai_id of the select trigger element',
            },
            option_text: {
              type: 'STRING',
              description:
                'Visible text of the option to pick (case-insensitive substring)',
            },
          },
          required: ['ai_id', 'option_text'],
        },
      },
      // ─── EchoEnglish domain tools ────────────────────────────────────────
      {
        name: 'create_flashcard',
        description:
          'Create a new flashcard in the user\'s flashcard collection. Use when the user says things like "save this word as a flashcard", "tạo flashcard cho từ này", or when you have identified a useful word/phrase the user is learning. If the user has selected text on the page, prefer using that as `front`. If a `category_name` is provided that does not yet exist, the backend will reject it — call list_flashcard_categories first or omit category to use a default.',
        parameters: {
          type: 'OBJECT',
          properties: {
            front: {
              type: 'STRING',
              description: 'Front side text — usually the English word/phrase',
            },
            back: {
              type: 'STRING',
              description:
                'Back side text — translation, definition, or example',
            },
            category_id: {
              type: 'STRING',
              description:
                'Optional category _id (from list_flashcard_categories)',
            },
            category_name: {
              type: 'STRING',
              description:
                'Optional category name (will be matched case-insensitively against existing categories)',
            },
            difficulty: {
              type: 'STRING',
              description: 'Difficulty',
              enum: ['Easy', 'Medium', 'Hard'],
            },
            tags: { type: 'STRING', description: 'Comma-separated tags' },
            phonetic: { type: 'STRING', description: 'IPA phonetic notation' },
            source: {
              type: 'STRING',
              description: 'Where the word came from (URL, resource id)',
            },
          },
          required: ['front', 'back'],
        },
      },
      {
        name: 'list_flashcards',
        description:
          'Get the user\'s flashcard collection (or a category subset). Use when the user asks "show me my flashcards", "how many words have I saved?", "what\'s in my [category]?".',
        parameters: {
          type: 'OBJECT',
          properties: {
            search: {
              type: 'STRING',
              description: 'Optional substring filter on front/back',
            },
            category_id: {
              type: 'STRING',
              description: 'Optional category _id to filter by',
            },
            limit: { type: 'NUMBER', description: 'Max results (default 20)' },
          },
        },
      },
      {
        name: 'list_flashcard_categories',
        description: "List the user's flashcard categories.",
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'delete_flashcard',
        description:
          'Delete a flashcard by id. Use when the user explicitly asks to remove a saved word ("xoá flashcard này", "delete the card about X").',
        parameters: {
          type: 'OBJECT',
          properties: {
            flashcard_id: {
              type: 'STRING',
              description: 'The _id of the flashcard to delete',
            },
          },
          required: ['flashcard_id'],
        },
      },
      {
        name: 'open_flashcard_dialog',
        description:
          'Open the "Create Flashcard" dialog ON SCREEN and pre-fill it so the user watches the form populate. Navigates to the Flashcards page first if needed. Prefer THIS over create_flashcard when the user is watching / on a demo / says "show me" — it is visual. Set auto_submit:true to also save it automatically after filling. Leave fields empty to just open a blank dialog for the user to fill.',
        parameters: {
          type: 'OBJECT',
          properties: {
            front: {
              type: 'STRING',
              description: 'Front side (English word/phrase)',
            },
            back: {
              type: 'STRING',
              description: 'Back side (translation/definition/example)',
            },
            category_name: {
              type: 'STRING',
              description:
                'Category name (matched case-insensitively to an existing category)',
            },
            difficulty: {
              type: 'STRING',
              description: 'Difficulty',
              enum: ['Easy', 'Medium', 'Hard'],
            },
            tags: { type: 'STRING', description: 'Comma-separated tags' },
            phonetic: { type: 'STRING', description: 'IPA phonetic notation' },
            source: { type: 'STRING', description: 'Source of the word' },
            auto_submit: {
              type: 'STRING',
              description:
                'If "true", auto-save after filling (default just fills + waits)',
              enum: ['true', 'false'],
            },
          },
        },
      },
      {
        name: 'get_resource_text',
        description:
          'Return the full text content of the resource currently being displayed on the resource detail page (article body, key points, summary). Use when the user asks about the article they\'re reading: "tóm tắt giúp tôi", "explain paragraph 2", "what is this article about?".',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'open_resource',
        description:
          'Open a specific resource by id (navigate to /resources/:id).',
        parameters: {
          type: 'OBJECT',
          properties: {
            resource_id: {
              type: 'STRING',
              description: 'The resource _id to open',
            },
          },
          required: ['resource_id'],
        },
      },
    ],
  },
];

// ─── Local storage ────────────────────────────────────────────────────────
const TRANSCRIPT_KEY = 'echo_live_transcripts';

export interface TranscriptEntry {
  speaker: 'user' | 'gemini' | 'system';
  text: string;
  timestamp: number;
}

export function getTranscripts(): TranscriptEntry[] {
  try {
    const stored = localStorage.getItem(TRANSCRIPT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTranscript(entry: TranscriptEntry) {
  const transcripts = getTranscripts();
  transcripts.push(entry);
  if (transcripts.length > 500) transcripts.splice(0, transcripts.length - 500);
  localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(transcripts));
}

export function clearTranscripts() {
  localStorage.removeItem(TRANSCRIPT_KEY);
}

// ─── Callback types ───────────────────────────────────────────────────────
export type NavigateCallback = (page: string) => void;
export type ThemeCallback = (theme: string) => void;
export type HighlightCallback = (
  guidance: { selector: string; message?: string } | null
) => void;
export type ScreenContextCallback = () => Record<string, unknown>;

export interface AnnotationCommand {
  action: 'point' | 'box' | 'circle' | 'note' | 'arrow' | 'clear';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  toX?: number;
  toY?: number;
  label?: string;
  color?: string;
  ttl?: number;
}
export type AnnotationCallback = (command: AnnotationCommand) => string | void;

export interface DomAnnotationCommand {
  action: 'point' | 'box' | 'note' | 'highlight-text' | 'arrow' | 'clear';
  target?: string;
  text?: string;
  label?: string;
  color?: string;
  ttl?: number;
}
export type DomAnnotationCallback = (
  command: DomAnnotationCommand
) => string | void;

/**
 * Custom tool handler — invoked for tool names not handled by the built-in
 * switch. Must return a JSON-serialisable result (or a Promise of one).
 * Used to wire EchoEnglish domain tools (create_flashcard, list_flashcards,
 * get_resource_text, …) to RTK Query / Redux from outside React.
 */
export type CustomToolCallback = (
  name: string,
  args: Record<string, unknown>
) => unknown | Promise<unknown>;

// ─── EchoEnglish page → route map ─────────────────────────────────────────
const PAGE_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  flashcards: '/flashcards',
  vocabulary: '/vocabulary',
  tests: '/tests',
  resources: '/resources',
  ebooks: '/ebooks',
  recordings: '/recordings',
  payment: '/payment',
  'payment-history': '/payment/history',
  'exam-attempts': '/me/tests',
  'practice-drill': '/practice-drill',
  'conversation-practice': '/conversation-practice',
  content: '/content',
  profile: '/profile',
  'learning-plan-setup': '/learning-plan/setup',
};

// ─── Element interaction helpers ──────────────────────────────────────────
function resolveAiElement(aiId: string): HTMLElement | null {
  if (!aiId) return null;
  return (
    document.querySelector<HTMLElement>(`[data-ai-id="${CSS.escape(aiId)}"]`) ||
    document.getElementById(aiId)
  );
}

function clickByAiId(aiId: string): { success: boolean; reason?: string } {
  const el = resolveAiElement(aiId);
  if (!el) return { success: false, reason: 'Element not found' };
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Defer click so the user can see what's about to happen
  setTimeout(() => {
    try {
      (el as HTMLElement).click();
    } catch (e) {
      console.error('[Tools] click failed', e);
    }
  }, 250);
  return { success: true };
}

function focusByAiId(aiId: string): { success: boolean; reason?: string } {
  const el = resolveAiElement(aiId);
  if (!el) return { success: false, reason: 'Element not found' };
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  try {
    (el as HTMLElement).focus();
  } catch (e) {
    console.error('[Tools] focus failed', e);
  }
  return { success: true };
}

function fillByAiId(
  aiId: string,
  value: string
): { success: boolean; reason?: string } {
  const el = resolveAiElement(aiId);
  if (!el) return { success: false, reason: 'Element not found' };

  // Pick the native value setter for the ELEMENT'S OWN type. Using the
  // HTMLInputElement setter on a <textarea> throws "Illegal invocation", so the
  // previous `inputSetter || textareaSetter` logic silently failed on textareas
  // (the flashcard front/back fields). Match the prototype to the instance.
  let proto: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null =
    null;
  if (el instanceof HTMLTextAreaElement) proto = HTMLTextAreaElement.prototype;
  else if (el instanceof HTMLInputElement) proto = HTMLInputElement.prototype;
  else if (el instanceof HTMLSelectElement) proto = HTMLSelectElement.prototype;
  else {
    // contentEditable fallback
    if ((el as HTMLElement).isContentEditable) {
      (el as HTMLElement).focus();
      (el as HTMLElement).textContent = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return { success: true };
    }
    return { success: false, reason: 'Not a fillable element' };
  }

  el.focus();
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    // React tracks the previous value on the element; setting via the native
    // setter lets React's onChange fire on the dispatched input event.
    setter.call(el, value);
  } else {
    (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value =
      value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { success: true };
}

function scrollByAiId(aiId: string): { success: boolean; reason?: string } {
  const el = resolveAiElement(aiId);
  if (!el) return { success: false, reason: 'Element not found' };
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return { success: true };
}

/**
 * Pick an option from a dropdown. Handles:
 *  - Native <select>: sets value + dispatches change.
 *  - Radix Select (the app's <Select>): clicks the trigger to open the
 *    listbox portal, then clicks the [role="option"] whose text matches.
 */
function selectOptionByAiId(
  aiId: string,
  optionText: string
): { success: boolean; reason?: string } {
  const el = resolveAiElement(aiId);
  if (!el) return { success: false, reason: 'Element not found' };
  const wanted = optionText.trim().toLowerCase();

  // Native <select>
  if (el instanceof HTMLSelectElement) {
    const opt = Array.from(el.options).find((o) =>
      o.textContent?.toLowerCase().includes(wanted)
    );
    if (!opt) return { success: false, reason: 'Option not found' };
    el.value = opt.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { success: true };
  }

  // Radix Select trigger (button[role="combobox"]) or any custom trigger:
  // open it, then click the matching option in the portal.
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.click();
  // The listbox renders in a portal a tick later.
  setTimeout(() => {
    const options = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]')
    );
    const match =
      options.find((o) => o.textContent?.trim().toLowerCase() === wanted) ||
      options.find((o) => o.textContent?.toLowerCase().includes(wanted));
    if (match) {
      match.click();
    } else {
      console.warn(
        `[Tools] select_option: "${optionText}" not found in listbox`
      );
      // Close the listbox to avoid leaving it stuck open.
      document.body.click();
    }
  }, 220);
  return { success: true };
}

// ─── Execute ──────────────────────────────────────────────────────────────
export async function executeToolCall(
  functionCall: FunctionCall,
  onNavigate?: NavigateCallback,
  onTheme?: ThemeCallback,
  onHighlight?: HighlightCallback,
  getScreenContext?: ScreenContextCallback,
  onAnnotation?: AnnotationCallback,
  onDomAnnotation?: DomAnnotationCallback,
  customToolCallback?: CustomToolCallback
): Promise<FunctionResponse> {
  const { name, id, args } = functionCall;
  console.log(`[Tools] Executing tool: ${name}`, args);

  switch (name) {
    case 'navigate_to_page': {
      const page = args.page as string;
      const route = PAGE_ROUTES[page] || `/${page}`;
      console.log(`[Tools] Navigating to: ${route}`);
      if (onNavigate) onNavigate(route);
      return {
        name,
        id,
        response: { result: { success: true, navigated_to: route } },
      };
    }

    case 'navigate_to_url': {
      const url = args.url as string;
      if (onNavigate) onNavigate(url);
      return {
        name,
        id,
        response: { result: { success: true, navigated_to: url } },
      };
    }

    case 'get_current_time': {
      const now = new Date();
      return {
        name,
        id,
        response: {
          result: {
            time: now.toLocaleTimeString('vi-VN'),
            date: now.toLocaleDateString('vi-VN'),
          },
        },
      };
    }

    case 'set_theme': {
      const theme = args.theme as string;
      if (onTheme) onTheme(theme);
      return { name, id, response: { result: { success: true, theme } } };
    }

    case 'highlight_element': {
      const selector = args.selector as string;
      const message = args.message as string | undefined;
      if (onHighlight) onHighlight({ selector, message });
      return {
        name,
        id,
        response: { result: { success: true, highlighted: selector } },
      };
    }

    case 'get_screen_context': {
      if (getScreenContext) {
        const context = getScreenContext();
        return { name, id, response: { result: context } };
      }
      return {
        name,
        id,
        response: { result: { error: 'Screen context not available' } },
      };
    }

    case 'click_element': {
      const r = clickByAiId(args.ai_id as string);
      return { name, id, response: { result: r } };
    }

    case 'focus_element': {
      const r = focusByAiId(args.ai_id as string);
      return { name, id, response: { result: r } };
    }

    case 'fill_input': {
      const r = fillByAiId(args.ai_id as string, args.value as string);
      return { name, id, response: { result: r } };
    }

    case 'scroll_to_element': {
      const r = scrollByAiId(args.ai_id as string);
      return { name, id, response: { result: r } };
    }

    case 'select_option': {
      const r = selectOptionByAiId(
        args.ai_id as string,
        args.option_text as string
      );
      return { name, id, response: { result: r } };
    }

    // ─── Video Annotation Tool Handlers ─────────────────────
    case 'point_at': {
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onAnnotation?.({
        action: 'point',
        x: args.x as number,
        y: args.y as number,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: true, annotation_id: annId } },
      };
    }

    case 'draw_box': {
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onAnnotation?.({
        action: 'box',
        x: args.x as number,
        y: args.y as number,
        width: args.width as number | undefined,
        height: args.height as number | undefined,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: true, annotation_id: annId } },
      };
    }

    case 'draw_circle': {
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onAnnotation?.({
        action: 'circle',
        x: args.x as number,
        y: args.y as number,
        radius: args.radius as number | undefined,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: true, annotation_id: annId } },
      };
    }

    case 'add_note': {
      const ttl = ((args.duration_seconds as number) || 10) * 1000;
      const annId = onAnnotation?.({
        action: 'note',
        x: args.x as number,
        y: args.y as number,
        label: args.text as string,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: true, annotation_id: annId } },
      };
    }

    case 'draw_arrow': {
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onAnnotation?.({
        action: 'arrow',
        x: args.from_x as number,
        y: args.from_y as number,
        toX: args.to_x as number,
        toY: args.to_y as number,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: true, annotation_id: annId } },
      };
    }

    case 'clear_annotations': {
      onAnnotation?.({ action: 'clear' });
      return { name, id, response: { result: { success: true } } };
    }

    // ─── DOM Vision Tool Handlers ──────────────────────────────
    case 'get_dom_elements': {
      const role = (args.role as string | undefined)?.toLowerCase();
      const search = (args.search as string | undefined)?.toLowerCase();
      const visibleOnly = args.visible_only === 'true';
      const all = buildDomIndex({ onlyVisible: visibleOnly });
      let filtered = all;
      if (role)
        filtered = filtered.filter(
          (e) =>
            e.role.toLowerCase() === role || e.role.toLowerCase().includes(role)
        );
      if (search)
        filtered = filtered.filter(
          (e) =>
            e.label.toLowerCase().includes(search) ||
            e.text.toLowerCase().includes(search) ||
            e.aiId.toLowerCase().includes(search)
        );
      const summary = summarizeIndex(filtered);
      return {
        name,
        id,
        response: { result: { count: summary.length, elements: summary } },
      };
    }

    case 'point_at_element': {
      const aiId = args.ai_id as string;
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onDomAnnotation?.({
        action: 'point',
        target: aiId,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: !!annId, annotation_id: annId } },
      };
    }

    case 'draw_box_element': {
      const aiId = args.ai_id as string;
      const ttl = ((args.duration_seconds as number) || 8) * 1000;
      const annId = onDomAnnotation?.({
        action: 'box',
        target: aiId,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: !!annId, annotation_id: annId } },
      };
    }

    case 'highlight_text': {
      const containerAiId = (args.container_ai_id as string) || 'main';
      const text = args.text as string;
      const ttl = ((args.duration_seconds as number) || 12) * 1000;
      const annId = onDomAnnotation?.({
        action: 'highlight-text',
        target: containerAiId,
        text,
        label: args.label as string | undefined,
        color: (args.color as string) || '#fbbf24',
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: !!annId, annotation_id: annId } },
      };
    }

    case 'add_dom_note': {
      const aiId = args.ai_id as string;
      const ttl = ((args.duration_seconds as number) || 12) * 1000;
      const annId = onDomAnnotation?.({
        action: 'note',
        target: aiId,
        label: args.text as string,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: !!annId, annotation_id: annId } },
      };
    }

    case 'arrow_to_element': {
      const aiId = args.ai_id as string;
      const ttl = ((args.duration_seconds as number) || 6) * 1000;
      const annId = onDomAnnotation?.({
        action: 'arrow',
        target: aiId,
        label: args.label as string | undefined,
        color: args.color as string | undefined,
        ttl,
      });
      return {
        name,
        id,
        response: { result: { success: !!annId, annotation_id: annId } },
      };
    }

    case 'clear_dom_annotations': {
      onDomAnnotation?.({ action: 'clear' });
      return { name, id, response: { result: { success: true } } };
    }

    case 'get_user_selection': {
      const sel = getCurrentSelection();
      return {
        name,
        id,
        response: {
          result: sel || { text: null, message: 'No text currently selected' },
        },
      };
    }

    default: {
      // Delegate unknown tools to the custom handler (RTK Query bridge etc.)
      if (customToolCallback) {
        try {
          const result = await customToolCallback(name, args);
          return { name, id, response: { result } };
        } catch (e) {
          console.error(`[Tools] ❌ Custom tool "${name}" threw`, e);
          return {
            name,
            id,
            response: {
              result: { error: e instanceof Error ? e.message : String(e) },
            },
          };
        }
      }
      console.warn(`[Tools] ⚠️ Unknown tool: ${name}`);
      return {
        name,
        id,
        response: { result: { error: `Unknown tool: ${name}` } },
      };
    }
  }
}
