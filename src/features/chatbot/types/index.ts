export type ChatbotAction =
  | { type: 'OPEN_URL'; label: string; href: string; confirm?: boolean }
  | {
      type: 'NAVIGATE';
      label: string;
      route: string;
      args?: Record<string, unknown>;
      confirm?: boolean;
    }
  | {
      type: 'RUN_TOOL';
      label: string;
      tool: string;
      args?: Record<string, unknown>;
      confirm?: boolean;
    };

// Citation for knowledge base references
export interface Citation {
  id: number;
  resourceId: string;
  title: string;
  url: string;
}

export interface ChatbotResponse {
  intent: string;
  layout: 'notice' | 'list' | 'detail' | 'result' | 'html_embed';
  message: string;
  actions?: ChatbotAction[];
  payload?:
    | NoticePayload
    | ListPayload
    | DetailPayload
    | ResultPayload
    | HtmlEmbedPayload;
  citations?: Citation[];
}

export interface NoticePayload {
  status: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  subtitle?: string;
}
export interface ListPayload {
  title?: string;
  items: Array<ListItem>;
}
export interface ListItem {
  title: string;
  description?: string;
  right_label?: string;
  tags?: string[];
  thumbnail?: string;
  item_actions?: ChatbotAction[];
  kind?: 'flashcard' | 'article' | 'generic';
  meta?: Record<string, unknown>;
}

export interface DetailPayload {
  headline?: string;
  properties: Array<{ label: string; value: string }>;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'info' | 'error' | 'neutral';
  };
  note?: string;
}

export interface ResultPayload {
  status: 'success' | 'warning' | 'error';
  headline: string;
  summary_points?: string[];
  next_steps?: string[];
}
export interface HtmlEmbedPayload {
  title?: string;
  html: string;
  height_hint?: number;
  fallback_text?: string;
}

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
  response?: ChatbotResponse;
  timestamp: string;
  status: 'sending' | 'sent' | 'failed';
  images?: string[];
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  url?: string;
  file?: File;
  size?: number;
  mimeType?: string;
  preview?: string; // base64 or blob URL for preview
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
