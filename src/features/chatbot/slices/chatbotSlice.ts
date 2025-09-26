import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ChatbotState,
  ChatMessage,
  ChatSession,
  ChatbotCommand,
} from '../types';

// Simple UUID generator since uuid package might not be available
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initial state
const initialState: ChatbotState = {
  isOpen: false,
  isTyping: false,
  currentSessionId: '',
  sessions: {},
  pendingCommands: [],
  settings: {
    theme: 'light',
    soundEnabled: true,
    position: 'bottom-right',
  },
  error: undefined,
};

// Create initial session
const createInitialSession = (): ChatSession => ({
  id: generateId(),
  messages: [],
  createdAt: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  title: 'New Conversation',
});

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleChatbot: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen && !state.currentSessionId) {
        const session = createInitialSession();
        state.sessions[session.id] = session;
        state.currentSessionId = session.id;
      }
    },

    openChatbot: (state) => {
      state.isOpen = true;
      if (!state.currentSessionId) {
        const session = createInitialSession();
        state.sessions[session.id] = session;
        state.currentSessionId = session.id;
      }
    },

    closeChatbot: (state) => {
      state.isOpen = false;
    },

    startNewSession: (state) => {
      const session = createInitialSession();
      state.sessions[session.id] = session;
      state.currentSessionId = session.id;
    },

    switchSession: (state, action: PayloadAction<string>) => {
      if (state.sessions[action.payload]) {
        state.currentSessionId = action.payload;
        state.sessions[action.payload].lastActivity = new Date().toISOString();
      }
    },

    addMessage: (
      state,
      action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>
    ) => {
      const currentSession = state.sessions[state.currentSessionId];
      if (currentSession) {
        const message: ChatMessage = {
          ...action.payload,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        currentSession.messages.push(message);
        currentSession.lastActivity = new Date().toISOString();

        // Update session title based on first user message
        if (message.type === 'user' && currentSession.messages.length === 1) {
          currentSession.title =
            message.content.slice(0, 30) +
            (message.content.length > 30 ? '...' : '');
        }
      }
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        status: ChatMessage['status'];
      }>
    ) => {
      const currentSession = state.sessions[state.currentSessionId];
      if (currentSession) {
        const message = currentSession.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.status = action.payload.status;
        }
      }
    },

    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    addPendingCommand: (state, action: PayloadAction<ChatbotCommand>) => {
      state.pendingCommands.push(action.payload);
    },

    executePendingCommand: (state, action: PayloadAction<string>) => {
      state.pendingCommands = state.pendingCommands.filter(
        (cmd) => cmd.action !== action.payload
      );
    },

    clearPendingCommands: (state) => {
      state.pendingCommands = [];
    },

    updateSettings: (
      state,
      action: PayloadAction<Partial<ChatbotState['settings']>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = undefined;
    },

    deleteSession: (state, action: PayloadAction<string>) => {
      delete state.sessions[action.payload];
      if (state.currentSessionId === action.payload) {
        const sessionIds = Object.keys(state.sessions);
        if (sessionIds.length > 0) {
          state.currentSessionId = sessionIds[0];
        } else {
          const session = createInitialSession();
          state.sessions[session.id] = session;
          state.currentSessionId = session.id;
        }
      }
    },

    clearAllSessions: (state) => {
      state.sessions = {};
      const session = createInitialSession();
      state.sessions[session.id] = session;
      state.currentSessionId = session.id;
    },

    addImageToMessage: (
      state,
      action: PayloadAction<{ messageId: string; imageData: string }>
    ) => {
      const currentSession = state.sessions[state.currentSessionId];
      if (currentSession) {
        const message = currentSession.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.images = message.images || [];
          message.images.push(action.payload.imageData);
        }
      }
    },
  },
});

export const {
  toggleChatbot,
  openChatbot,
  closeChatbot,
  startNewSession,
  switchSession,
  addMessage,
  updateMessageStatus,
  setTyping,
  addPendingCommand,
  executePendingCommand,
  clearPendingCommands,
  updateSettings,
  setError,
  clearError,
  deleteSession,
  clearAllSessions,
  addImageToMessage,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;

// Selectors
export const selectChatbotIsOpen = (state: { chatbot: ChatbotState }) =>
  state.chatbot.isOpen;
export const selectCurrentSession = (state: { chatbot: ChatbotState }) =>
  state.chatbot.sessions[state.chatbot.currentSessionId];
export const selectAllSessions = (state: { chatbot: ChatbotState }) =>
  Object.values(state.chatbot.sessions);
export const selectIsTyping = (state: { chatbot: ChatbotState }) =>
  state.chatbot.isTyping;
export const selectPendingCommands = (state: { chatbot: ChatbotState }) =>
  state.chatbot.pendingCommands;
export const selectChatbotSettings = (state: { chatbot: ChatbotState }) =>
  state.chatbot.settings;
export const selectChatbotError = (state: { chatbot: ChatbotState }) =>
  state.chatbot.error;
