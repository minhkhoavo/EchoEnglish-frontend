import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  useGetConversationTopicsQuery,
  useStartConversationMutation,
  useSendConversationMessageMutation,
} from '../services/conversationPracticeApi';
import {
  startConversation,
  addUserMessage,
  addAssistantMessage,
  updateChecklist,
  setIsCompleted,
  setIsTyping,
  setInputMode,
  setIsRecording,
  setFeedback,
  resetConversation,
} from '../slices/conversationPracticeSlice';
import type { ConversationTopic, ChatMessage } from '../types';

import TopicSelection from './TopicSelection';
import ChatInterface from './ChatInterface';
import SettingsPanel from './SettingsPanel';
import CongratulationModal from './CongratulationModal';

// SpeechRecognition types
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        results: {
          [index: number]: { [index: number]: { transcript: string } };
        };
      }) => void)
    | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Type for pending transcript from speech recognition
type PendingTranscript = string | null;

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const ConversationPracticeContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  // Store the transcript while recording - only send when user explicitly stops
  const pendingTranscriptRef = useRef<PendingTranscript>(null);

  // Redux state
  const {
    selectedTopic,
    chatHistory,
    checklist,
    isCompleted,
    completedTasksCount,
    totalTasksCount,
    isTyping,
    inputMode,
    isRecording,
    feedback,
  } = useAppSelector((state) => state.conversationPractice);

  // Local state
  const [showCongrats, setShowCongrats] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // API hooks
  const { data: categories, isLoading: isLoadingTopics } =
    useGetConversationTopicsQuery();
  const [startConversationApi] = useStartConversationMutation();
  const [sendMessageApi] = useSendConversationMessageMutation();

  // Show congratulation modal when completed
  useEffect(() => {
    if (isCompleted && selectedTopic) {
      setShowCongrats(true);
    }
  }, [isCompleted, selectedTopic]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onerror = (event: Event & { error?: string }) => {
        console.error('Speech recognition error:', event.error);
        dispatch(setIsRecording(false));
        if (event.error === 'not-allowed') {
          toast.error(
            'Microphone access denied. Please enable it in your browser settings.'
          );
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        dispatch(setIsRecording(false));
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [dispatch]);

  // Handle topic selection
  const handleSelectTopic = useCallback(
    async (topic: ConversationTopic) => {
      setIsStarting(true);
      try {
        const response = await startConversationApi(topic.id).unwrap();
        dispatch(
          startConversation({
            topic: response.topic,
            starterMessage: response.starterMessage,
            checklist: response.checklist,
            totalTasksCount: response.totalTasksCount,
          })
        );
      } catch (error) {
        console.error('Failed to start conversation:', error);
        toast.error('Failed to start conversation. Please try again.');
      } finally {
        setIsStarting(false);
      }
    },
    [dispatch, startConversationApi]
  );

  // Handle send message
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedTopic || !message.trim()) return;

      // Clear previous feedback
      dispatch(setFeedback(null));

      // Add user message to chat
      dispatch(addUserMessage(message));
      dispatch(setIsTyping(true));

      try {
        // Prepare chat history for API (exclude timestamps)
        const apiChatHistory: ChatMessage[] = chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Add current message to history
        apiChatHistory.push({
          role: 'user',
          content: message,
        });

        const response = await sendMessageApi({
          topicId: selectedTopic.id,
          userMessage: message,
          chatHistory: apiChatHistory,
          checklist,
        }).unwrap();

        // Update state with response
        dispatch(addAssistantMessage(response.assistantMessage));
        dispatch(updateChecklist(response.checklist));
        dispatch(setIsCompleted(response.isCompleted));

        // Set feedback if available
        if (response.feedback) {
          dispatch(setFeedback(response.feedback));
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message. Please try again.');
      } finally {
        dispatch(setIsTyping(false));
      }
    },
    [dispatch, selectedTopic, chatHistory, checklist, sendMessageApi]
  );

  // Handle input mode change
  const handleInputModeChange = useCallback(
    (mode: 'text' | 'voice') => {
      dispatch(setInputMode(mode));
    },
    [dispatch]
  );

  // Handle clear feedback
  const handleClearFeedback = useCallback(() => {
    dispatch(setFeedback(null));
  }, [dispatch]);

  // Handle start recording
  const handleStartRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // Clear any pending transcript
        pendingTranscriptRef.current = null;

        // Set up the result handler - only store transcript, don't send yet
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            // Store the transcript, will be sent when user clicks stop
            pendingTranscriptRef.current = transcript;
          }
        };

        // Enable continuous mode to keep listening
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.start();
        dispatch(setIsRecording(true));
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast.error('Failed to start recording. Please try again.');
      }
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
  }, [dispatch]);

  // Handle stop recording - this is when we actually send the message
  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      dispatch(setIsRecording(false));

      // Now send the message if we have a transcript
      if (pendingTranscriptRef.current) {
        handleSendMessage(pendingTranscriptRef.current);
        pendingTranscriptRef.current = null;
      }
    }
  }, [dispatch, handleSendMessage]);

  // Handle back to topics
  const handleBack = useCallback(() => {
    dispatch(resetConversation());
  }, [dispatch]);

  // Handle try another topic
  const handleTryAnother = useCallback(() => {
    setShowCongrats(false);
    dispatch(resetConversation());
  }, [dispatch]);

  // Handle go home
  const handleGoHome = useCallback(() => {
    setShowCongrats(false);
    dispatch(resetConversation());
    navigate('/');
  }, [dispatch, navigate]);

  // Handle close congratulation modal
  const handleCloseCongrats = useCallback(() => {
    setShowCongrats(false);
  }, []);

  // Render topic selection if no topic is selected
  if (!selectedTopic) {
    return (
      <div className="h-[calc(100vh-64px)] bg-slate-50">
        <TopicSelection
          categories={categories || []}
          onSelectTopic={handleSelectTopic}
          isLoading={isLoadingTopics || isStarting}
        />
      </div>
    );
  }

  // Render conversation interface
  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-50">
      {/* Settings Panel - Left Side */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <SettingsPanel
          topic={selectedTopic}
          checklist={checklist}
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
          onBack={handleBack}
        />
      </div>

      {/* Chat Interface - Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium"
            >
              ← Back
            </button>
            <div className="text-center flex-1 mx-4">
              <h2 className="font-semibold text-slate-900 truncate">
                {selectedTopic.title}
              </h2>
              <p className="text-xs text-slate-500">
                {completedTasksCount}/{totalTasksCount} tasks completed
              </p>
            </div>
            <div className="w-12" /> {/* Spacer for alignment */}
          </div>
        </div>

        <ChatInterface
          messages={chatHistory}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          inputMode={inputMode}
          onInputModeChange={handleInputModeChange}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          disabled={isTyping}
          feedback={feedback}
          onClearFeedback={handleClearFeedback}
        />
      </div>

      {/* Congratulation Modal */}
      <CongratulationModal
        isOpen={showCongrats}
        onClose={handleCloseCongrats}
        topic={selectedTopic}
        checklist={checklist}
        onTryAnother={handleTryAnother}
        onGoHome={handleGoHome}
      />
    </div>
  );
};

export default ConversationPracticeContainer;
