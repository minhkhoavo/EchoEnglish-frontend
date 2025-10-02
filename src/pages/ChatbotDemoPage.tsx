import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Zap, Bot, Command, Palette, Globe } from 'lucide-react';
import { useAppDispatch } from '@/core/store/store';
import { openChatbot } from '@/features/chatbot/slices/chatbotSlice';
import ChatbotContainer from '@/features/chatbot/components/ChatbotContainer';

const ChatbotDemoPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const features = [
    {
      icon: MessageCircle,
      title: 'Smart Conversations',
      description:
        'Natural language understanding with personalized responses based on your learning progress.',
      badge: 'AI Powered',
    },
    {
      icon: Command,
      title: 'System Commands',
      description:
        'Execute actions like creating payments, scheduling exams, and opening tests directly from chat.',
      badge: 'Interactive',
    },
    {
      icon: Palette,
      title: 'Rich HTML Content',
      description:
        'Backend-rendered HTML content with progress charts, payment plans, and interactive elements.',
      badge: 'Dynamic',
    },
    {
      icon: Zap,
      title: 'Instant Actions',
      description:
        'One-click buttons for payments, navigation, downloads, and booking with confirmation dialogs.',
      badge: 'Fast',
    },
    {
      icon: Bot,
      title: 'Context Aware',
      description:
        'Remembers conversation history and provides relevant suggestions based on your TOEIC journey.',
      badge: 'Smart',
    },
    {
      icon: Globe,
      title: 'Clipboard Images',
      description:
        'Paste images directly from clipboard or drag & drop for visual question generation.',
      badge: 'Visual',
    },
  ];

  const tryExamples = [
    {
      text: 'Hello',
      description: 'Get a personalized greeting with action buttons',
    },
    {
      text: 'I want to upgrade to premium',
      description: 'See payment plans with HTML content and payment buttons',
    },
    {
      text: 'Show my progress',
      description: 'View progress charts and statistics',
    },
    {
      text: 'I need help with tests',
      description: 'Get test recommendations with direct access buttons',
    },
    {
      text: 'Schedule an exam',
      description: 'See available time slots with booking buttons',
    },
    {
      text: 'Download study materials',
      description: 'Access downloadable resources',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-800">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl mr-6 shadow-lg">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EchoEnglish AI
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Intelligent Assistant
              </p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            An intelligent chatbot for your TOEIC learning platform with system
            integration, HTML rendering, and command execution capabilities.
          </p>

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => dispatch(openChatbot())}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="mr-3 h-6 w-6" />
              Try the AI Assistant
            </Button>
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                🚀 Real-time responses
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                💡 Smart commands
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                🎨 Rich HTML content
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click the chat bubble in the bottom-right corner anytime
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm group animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Try Examples */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Try These Examples
            </h2>
            <p className="text-gray-600">
              Click any example to see the chatbot in action
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tryExamples.map((example, index) => (
              <div
                key={index}
                className="group border border-gray-200 rounded-2xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                onClick={() => dispatch(openChatbot())}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      "{example.text}"
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {example.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm mb-4">
              Click any example above or use your own questions
            </p>
            <Button
              onClick={() => dispatch(openChatbot())}
              variant="outline"
              className="rounded-2xl border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chatting Now
            </Button>
          </div>
        </Card>

        {/* Image Upload Demo */}
        <Card className="p-8 mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl inline-flex mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Image Upload Feature
            </h2>
            <p className="text-gray-600 mb-6">
              Send images to get visual assistance with your TOEIC learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="bg-green-100 p-3 rounded-full inline-flex mb-3">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Paste (Ctrl+V)
              </h3>
              <p className="text-sm text-gray-600">
                Copy any image and paste directly into the chat input
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full inline-flex mb-3">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Drag & Drop</h3>
              <p className="text-sm text-gray-600">
                Drag image files directly into the chat area
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg">
              <div className="bg-purple-100 p-3 rounded-full inline-flex mb-3">
                <Command className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">File Upload</h3>
              <p className="text-sm text-gray-600">
                Click the paperclip icon to select image files
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => dispatch(openChatbot())}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-2xl px-8 py-3"
            >
              <Globe className="mr-2 h-4 w-4" />
              Try Image Upload Now
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Support: JPG, PNG, GIF up to 5MB each
            </p>
          </div>
        </Card>

        {/* Technical Details */}
        <div className="mt-12 bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Technical Implementation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Frontend Architecture
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  • <strong>React + TypeScript:</strong> Modern component-based
                  UI
                </li>
                <li>
                  • <strong>Redux Toolkit:</strong> State management for chat
                  sessions
                </li>
                <li>
                  • <strong>Shadcn/UI:</strong> Consistent design system
                  components
                </li>
                <li>
                  • <strong>Tailwind CSS:</strong> Utility-first styling
                  approach
                </li>
                <li>
                  • <strong>React Router:</strong> Navigation integration
                </li>
                <li>
                  • <strong>Sonner:</strong> Toast notifications for feedback
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  • <strong>Command System:</strong> JSON-based action execution
                </li>
                <li>
                  • <strong>HTML Rendering:</strong> Backend-controlled rich
                  content
                </li>
                <li>
                  • <strong>Image Support:</strong> Clipboard paste and drag &
                  drop
                </li>
                <li>
                  • <strong>Session Persistence:</strong> Chat history
                  management
                </li>
                <li>
                  • <strong>Mock Service:</strong> Realistic LLM response
                  simulation
                </li>
                <li>
                  • <strong>Type Safety:</strong> Full TypeScript coverage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Container */}
      <ChatbotContainer />
    </div>
  );
};

export default ChatbotDemoPage;
