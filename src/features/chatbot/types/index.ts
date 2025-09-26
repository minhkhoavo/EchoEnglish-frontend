export interface ChatbotAction {
  type: 'OPEN_URL' | 'NAVIGATE' | 'RUN_TOOL';
  label: string;
  href?: string;
  route?: string;
  tool?: string;
  args?: Record<string, unknown>;
  confirm?: boolean;
}

export interface ChatbotResponse {
  intent: string;
  layout: 'notice' | 'list' | 'detail' | 'result' | 'html_embed';
  message: string;
  actions?: ChatbotAction[];

  // Layout-specific payloads
  // Notice layout
  status?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  subtitle?: string;

  // List layout
  items?: Array<{
    title: string;
    description?: string;
    right_label?: string;
    tags?: string[];
    thumbnail?: string;
    item_actions?: ChatbotAction[];
  }>;

  // Detail layout
  properties?: Array<{
    label: string;
    value: string;
  }>;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'info' | 'error' | 'neutral';
  };
  note?: string;

  // Result layout
  headline?: string;
  summary_points?: string[];
  next_steps?: string[];

  // HTML Embed layout
  html?: string;
  height_hint?: number;
  fallback_text?: string;

  // Attachments (optional additional content)
  attachments?: ChatbotResponse[];
}

// Legacy types for backward compatibility
export interface ChatbotCommand {
  action: string;
  payload?: Record<string, unknown>;
  navigate?: string;
  confirmationRequired?: boolean;
  buttonText?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  html?: string;
  commands?: ChatbotCommand[];
  // New contract response
  response?: ChatbotResponse;
  timestamp: string;
  status: 'sending' | 'sent' | 'failed';
  images?: string[];
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
  title?: string;
}

export interface ChatbotState {
  isOpen: boolean;
  isTyping: boolean;
  currentSessionId: string;
  sessions: Record<string, ChatSession>;
  pendingCommands: ChatbotCommand[];
  settings: {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    position: 'bottom-right' | 'bottom-left';
  };
  error?: string;
}

// Command Action Types (legacy)
export type CommandAction =
  | 'create_payment'
  | 'navigate'
  | 'open_test'
  | 'schedule_exam'
  | 'download_material'
  | 'show_progress'
  | 'create_flashcard'
  | 'start_quiz'
  | 'book_lesson'
  | 'update_profile'
  | 'show_recommendations';

// Mock User Intent Types
export type UserIntent =
  | 'greeting'
  | 'payment_inquiry'
  | 'test_help'
  | 'schedule_request'
  | 'progress_check'
  | 'study_material'
  | 'general_question'
  | 'complaint'
  | 'compliment'
  | 'lesson_summary'
  | 'error_analysis'
  | 'achievement_unlock'
  | 'flashcard12';
