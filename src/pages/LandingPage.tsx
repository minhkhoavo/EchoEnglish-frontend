import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/core/store/store';
import {
  Mic,
  BookOpen,
  Brain,
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Zap,
  MessageSquare,
  Target,
  ArrowRight,
  Play,
  ChevronRight,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: 'AI Speech Analyzer',
      description:
        'Analyze your pronunciation with advanced AI technology, receive detailed feedback and improve instantly.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Smart Flashcards',
      description:
        'Learn vocabulary intelligently with a personalized flashcard system based on your learning progress.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Practice Drills',
      description:
        'Practice with targeted exercises designed scientifically, focusing on your weak areas.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Progress Tracking',
      description:
        'Track your learning progress in detail with an intuitive dashboard and in-depth analytical reports.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Rich Content Library',
      description:
        'Rich content library with thousands of high-quality lessons, videos and learning materials.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Exam Preparation',
      description:
        'Prepare for international exams with practice test sets and detailed result analysis.',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Assessment',
      description:
        'Create a free account and take an initial test to determine your proficiency level.',
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: '02',
      title: 'Personalized Learning Path',
      description:
        'Receive a customized learning path designed based on your goals and proficiency level.',
      icon: <Target className="w-6 h-6" />,
    },
    {
      number: '03',
      title: 'Learn & Practice',
      description:
        'Learn through interactive lessons, practice with AI and receive instant feedback.',
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      number: '04',
      title: 'Track & Improve',
      description:
        'View detailed progress reports and adjust your path to achieve your goals faster.',
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  const testimonials = [
    {
      name: 'Nguyen Minh Anh',
      role: 'Student',
      avatar: '👩‍🎓',
      content:
        'EchoEnglish helped me improve my IELTS Speaking score from 5.5 to 7.5 in just 3 months. The speech analysis tool is amazing!',
      rating: 5,
    },
    {
      name: 'Tran Duc Minh',
      role: 'Office Worker',
      avatar: '👨‍💼',
      content:
        'I am very busy but can still learn effectively with the flexible curriculum. Smart flashcards help me remember words much longer.',
      rating: 5,
    },
    {
      name: 'Le Thu Ha',
      role: 'Teacher',
      avatar: '👩‍🏫',
      content:
        'Excellent platform for both teachers and students. The detailed dashboard helps me track student progress easily.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '50K+', label: 'Students' },
    { number: '95%', label: 'Satisfaction' },
    { number: '1M+', label: 'Lessons' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                EchoEnglish
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                How it works
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Reviews
              </a>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
              >
                Get started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5">
                <Sparkles className="w-4 h-4 mr-2" />
                Advanced AI Technology
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Learn English{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
                  intelligently
                </span>{' '}
                with AI
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                A personalized English learning platform with AI technology,
                helping you improve pronunciation, vocabulary and communication
                skills 3 times more effectively than traditional methods.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-xl shadow-blue-500/30 text-lg px-8 py-6 h-auto"
                >
                  Try for free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 text-lg px-8 py-6 h-auto hover:bg-gray-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Speech Analysis
                          </div>
                          <div className="text-sm text-gray-600">
                            Analyzing...
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-8 bg-gradient-to-t from-blue-600 to-cyan-500 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Pronunciation
                          </span>
                        </div>
                        <Badge className="bg-green-600 text-white">92%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Fluency
                          </span>
                        </div>
                        <Badge className="bg-blue-600 text-white">88%</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Vocabulary
                          </span>
                        </div>
                        <Badge className="bg-purple-600 text-white">95%</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            AI Feedback
                          </div>
                          <p className="text-sm text-gray-600">
                            Your pronunciation is very good! Try to pay more
                            attention to intonation in sentences to sound more
                            natural.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 mb-4">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                master English
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive learning system with advanced AI technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                ></div>
                <CardContent className="p-6 relative">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-gradient-to-b from-blue-50/50 to-white"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-1.5 mb-4">
              Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start with just{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                4 simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your English learning journey starts today
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2 z-0"></div>
                )}
                <Card className="relative z-10 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-full">
                  <CardContent className="p-6">
                    <div className="text-6xl font-bold text-blue-100 mb-4">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-1.5 mb-4">
              Reviews
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What students say about{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                EchoEnglish
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thousands of students have improved their English
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            <CardContent className="p-12 md:p-16 text-center relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to start your journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of students improving their English every day.
                Try it free for 14 days, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6 h-auto font-semibold"
                >
                  Start for free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-whit hover:bg-white/10 hover:text-white text-lg px-8 py-6 h-auto"
                >
                  Contact support
                </Button>
              </div>
              <p className="text-white/80 text-sm mt-6">
                ✓ No credit card required &nbsp;&nbsp; ✓ Cancel anytime
                &nbsp;&nbsp; ✓ 24/7 support
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">EchoEnglish</span>
              </div>
              <p className="text-gray-400">
                Smart English learning platform with AI technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Partners
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EchoEnglish. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
