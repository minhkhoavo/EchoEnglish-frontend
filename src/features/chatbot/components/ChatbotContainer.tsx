import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAppDispatch,
  useAppSelector,
  type RootState,
} from '@/core/store/store';
import ChatBubble from './ChatBubble';
import {
  toggleChatbot,
  closeChatbot,
  addMessage,
  updateMessageStatus,
  setTyping,
  executePendingCommand,
  setError,
  clearError,
} from '../slices/chatbotSlice';
import { useRunChatMutation } from '../services/chatbotApi';
import type { ChatbotCommand, ChatMessage } from '../types';

interface ChatbotContainerProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const ChatbotContainer: React.FC<ChatbotContainerProps> = ({
  className = 'bottom-4 right-4',
  position = 'bottom-right',
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [runChat] = useRunChatMutation();

  const isOpen = useAppSelector((state: RootState) => state.chatbot.isOpen);
  const currentSession = useAppSelector(
    (state: RootState) => state.chatbot.sessions[state.chatbot.currentSessionId]
  );
  const isTyping = useAppSelector((state: RootState) => state.chatbot.isTyping);
  const pendingCommands = useAppSelector(
    (state: RootState) => state.chatbot.pendingCommands
  );
  const error = useAppSelector((state: RootState) => state.chatbot.error);

  const messages = currentSession?.messages || [];

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Send welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // TODO: Replace with real API call
      // const welcomeResponse = MockChatbotService.getWelcomeMessage();
      // dispatch(addMessage({
      //   type: 'assistant',
      //   content: welcomeResponse.message,
      //   response: welcomeResponse,
      //   status: 'sent',
      // }));
    }
  }, [isOpen, messages.length, dispatch]);

  const handleSendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!content.trim() && !images?.length) return;

      try {
        // Add user message
        const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
          type: 'user',
          content,
          status: 'sending',
          images,
        };

        dispatch(addMessage(userMessage));

        // Start typing indicator
        dispatch(setTyping(true));

        const response = await runChat({ prompt: content }).unwrap();

        // Stop typing indicator
        dispatch(setTyping(false));

        // Update user message status to sent
        // Note: In a real app, you'd track the actual message ID
        dispatch(
          updateMessageStatus({
            messageId: 'temp-id', // This would be the actual message ID
            status: 'sent',
          })
        );

        // Add AI response
        dispatch(
          addMessage({
            type: 'assistant',
            content: response.message,
            response: response,
            status: 'sent',
          })
        );

        // TODO: Add any pending actions (for confirmation dialogs) when backend is integrated
        // if (response.actions) {
        //   response.actions.forEach(action => {
        //     if (action.confirm) {
        //       dispatch(addPendingCommand({
        //         action: action.type,
        //         payload: {
        //           ...(action.href && { href: action.href }),
        //           ...(action.route && { route: action.route }),
        //           ...(action.tool && { tool: action.tool }),
        //           ...(action.args && { args: action.args }),
        //         },
        //         confirmationRequired: action.confirm,
        //         buttonText: action.label,
        //       }));
        //     }
        //   });
        // }
      } catch (error) {
        console.error('Error sending message:', error);
        dispatch(setTyping(false));
        dispatch(setError('Failed to send message. Please try again.'));
      }
    },
    [dispatch, runChat]
  );

  const handleExecuteCommand = useCallback(
    async (command: ChatbotCommand) => {
      try {
        // Show confirmation if required
        if (command.confirmationRequired) {
          const confirmed = window.confirm(
            `Are you sure you want to ${command.buttonText || command.action}?`
          );
          if (!confirmed) return;
        }

        // Execute the command based on its action
        switch (command.action) {
          case 'NAVIGATE':
            if (command.payload?.route) {
              navigate(command.payload.route as string);
            }
            break;

          case 'OPEN_URL':
            if (command.payload?.href) {
              window.open(command.payload.href as string, '_blank');
            }
            break;

          case 'RUN_TOOL': {
            const tool = command.payload?.tool as string;
            const args = command.payload?.args as Record<string, unknown>;

            if (tool === 'download_material') {
              dispatch(
                addMessage({
                  type: 'assistant',
                  content: `Your material is being downloaded. Check your downloads folder.`,
                  status: 'sent',
                })
              );
            } else if (tool === 'schedule_exam') {
              dispatch(
                addMessage({
                  type: 'assistant',
                  content: `Great! Your exam has been scheduled for ${args?.date} at ${args?.time}. You'll receive a confirmation email shortly.`,
                  status: 'sent',
                })
              );
            } else if (tool === 'book_lesson') {
              dispatch(
                addMessage({
                  type: 'assistant',
                  content:
                    "Perfect! I've submitted your lesson booking request. Our team will contact you within 24 hours to confirm your schedule.",
                  status: 'sent',
                })
              );
            } else {
              console.log('Executing tool:', tool, 'with args:', args);
              toast.info(`Executed tool: ${tool}`);
            }
            break;
          }

          // Legacy support
          case 'navigate':
            if (command.navigate) {
              navigate(command.navigate);
            }
            break;

          case 'create_payment':
            if (command.navigate) {
              navigate(command.navigate, {
                state: {
                  paymentData: command.payload,
                },
              });
            }
            break;

          case 'open_test':
            if (command.navigate) {
              navigate(command.navigate);
              toast.success('Opening test...');
            }
            break;

          case 'schedule_exam':
            toast.success('Exam scheduled successfully!');
            dispatch(
              addMessage({
                type: 'assistant',
                content: `Great! Your exam has been scheduled for ${command.payload?.date} at ${command.payload?.time}. You'll receive a confirmation email shortly.`,
                status: 'sent',
              })
            );
            break;

          case 'download_material':
            toast.success('Download started!');
            dispatch(
              addMessage({
                type: 'assistant',
                content: `Your ${command.payload?.type || 'material'} is being downloaded. Check your downloads folder.`,
                status: 'sent',
              })
            );
            break;

          case 'show_progress':
            if (command.navigate) {
              navigate(command.navigate);
              toast.success('Opening progress page...');
            }
            break;

          case 'create_flashcard':
            if (command.navigate) {
              navigate(command.navigate, {
                state: {
                  flashcardData: command.payload,
                },
              });
              toast.success('Creating flashcards...');
            }
            break;

          case 'start_quiz':
            if (command.navigate) {
              navigate(command.navigate, {
                state: {
                  quizData: command.payload,
                },
              });
              toast.success('Starting quiz...');
            }
            break;

          case 'book_lesson':
            toast.success('Lesson booking requested!');
            dispatch(
              addMessage({
                type: 'assistant',
                content:
                  "Perfect! I've submitted your lesson booking request. Our team will contact you within 24 hours to confirm your schedule.",
                status: 'sent',
              })
            );
            break;

          case 'update_profile':
            if (command.navigate) {
              navigate(command.navigate);
              toast.success('Opening profile settings...');
            }
            break;

          case 'show_recommendations':
            dispatch(
              addMessage({
                type: 'assistant',
                content:
                  'Based on your progress, I recommend focusing on listening comprehension and vocabulary building. Would you like me to create a personalized study plan?',
                commands: [
                  {
                    action: 'create_payment',
                    navigate: '/payment',
                    buttonText: 'Get Premium Study Plan',
                    payload: { plan: 'premium', feature: 'study-plan' },
                  },
                ],
                status: 'sent',
              })
            );
            break;

          default:
            console.log('Executing command:', command);
            toast.info(`Executed: ${command.action}`);
        }

        // Mark command as executed
        dispatch(executePendingCommand(command.action));
      } catch (error) {
        console.error('Error executing command:', error);
        dispatch(
          setError(`Failed to execute ${command.action}. Please try again.`)
        );
      }
    },
    [dispatch, navigate]
  );

  return (
    <ChatBubble
      isOpen={isOpen}
      onToggle={() => dispatch(toggleChatbot())}
      onClose={() => dispatch(closeChatbot())}
      onSendMessage={handleSendMessage}
      onExecuteCommand={handleExecuteCommand}
      messages={messages}
      isTyping={isTyping}
      className={className}
    />
  );
};

export default ChatbotContainer;
