import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ConversationState,
  ConversationCategory,
  ConversationTopic,
  ChatMessage,
  ChecklistItem,
} from '../types';

const initialState: ConversationState = {
  categories: [],
  selectedTopic: null,
  chatHistory: [],
  checklist: [],
  isCompleted: false,
  completedTasksCount: 0,
  totalTasksCount: 0,
  isLoading: false,
  isTyping: false,
  error: null,
  inputMode: 'text',
  isRecording: false,
  starterMessage: '',
  feedback: null,
};

const conversationPracticeSlice = createSlice({
  name: 'conversationPractice',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<ConversationCategory[]>) => {
      state.categories = action.payload;
    },
    setSelectedTopic: (
      state,
      action: PayloadAction<ConversationTopic | null>
    ) => {
      state.selectedTopic = action.payload;
    },
    startConversation: (
      state,
      action: PayloadAction<{
        topic: ConversationTopic;
        starterMessage: string;
        checklist: ChecklistItem[];
        totalTasksCount: number;
      }>
    ) => {
      state.selectedTopic = action.payload.topic;
      state.starterMessage = action.payload.starterMessage;
      state.checklist = action.payload.checklist;
      state.totalTasksCount = action.payload.totalTasksCount;
      state.completedTasksCount = 0;
      state.isCompleted = false;
      state.chatHistory = [
        {
          role: 'assistant',
          content: action.payload.starterMessage,
          timestamp: new Date().toISOString(),
        },
      ];
      state.error = null;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.chatHistory.push({
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      state.chatHistory.push({
        role: 'assistant',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    updateChecklist: (state, action: PayloadAction<ChecklistItem[]>) => {
      state.checklist = action.payload;
      state.completedTasksCount = action.payload.filter(
        (item) => item.isCompleted
      ).length;
    },
    setIsCompleted: (state, action: PayloadAction<boolean>) => {
      state.isCompleted = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInputMode: (state, action: PayloadAction<'text' | 'voice'>) => {
      state.inputMode = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setFeedback: (state, action: PayloadAction<string | null>) => {
      state.feedback = action.payload;
    },
    resetConversation: (state) => {
      state.selectedTopic = null;
      state.chatHistory = [];
      state.checklist = [];
      state.isCompleted = false;
      state.completedTasksCount = 0;
      state.totalTasksCount = 0;
      state.starterMessage = '';
      state.error = null;
      state.isTyping = false;
      state.isRecording = false;
      state.feedback = null;
    },
  },
});

export const {
  setCategories,
  setSelectedTopic,
  startConversation,
  addUserMessage,
  addAssistantMessage,
  updateChecklist,
  setIsCompleted,
  setIsLoading,
  setIsTyping,
  setError,
  setInputMode,
  setIsRecording,
  setFeedback,
  resetConversation,
} = conversationPracticeSlice.actions;

export default conversationPracticeSlice.reducer;
