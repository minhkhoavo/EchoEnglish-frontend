// Task within a topic
export interface ConversationTask {
  id: string;
  description: string;
  examplePhrases: string[];
}

// Checklist item for tracking progress
export interface ChecklistItem {
  taskId: string;
  isCompleted: boolean;
}

// Individual topic
export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  tasks: ConversationTask[];
}

// Category containing topics
export interface ConversationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  topicIds: string[];
  topics: ConversationTopic[];
}

// Chat message in conversation
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// Start conversation request
export interface StartConversationRequest {
  topicId?: string;
  userPrompt?: string;
}

// Start conversation response
export interface StartConversationResponse {
  topic: ConversationTopic;
  starterMessage: string;
  checklist: ChecklistItem[];
  isCompleted: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
}

// Send message request
export interface SendMessageRequest {
  topicId: string;
  userMessage: string;
  chatHistory: ChatMessage[];
  checklist: ChecklistItem[];
}

// Send message response
export interface SendMessageResponse {
  assistantMessage: string;
  checklist: ChecklistItem[];
  isCompleted: boolean;
  feedback?: string;
  completedTasksCount: number;
  totalTasksCount: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Conversation state
export interface ConversationState {
  categories: ConversationCategory[];
  selectedTopic: ConversationTopic | null;
  chatHistory: ChatMessage[];
  checklist: ChecklistItem[];
  isCompleted: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  inputMode: 'text' | 'voice';
  isRecording: boolean;
  starterMessage: string;
  feedback: string | null;
}

// Voice settings
export interface VoiceSettings {
  speed: number;
  pitch: number;
  voice: string;
}

// Conversation settings
export interface ConversationSettings {
  autoPlayResponse: boolean;
  showExamplePhrases: boolean;
  voiceSettings: VoiceSettings;
}
