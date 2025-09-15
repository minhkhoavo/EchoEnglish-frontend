import type { SpeakingOverallResult, SpeakingResultStats } from '../types';

// Mock data for TOEIC Speaking test results
export const mockSpeakingResult: SpeakingOverallResult = {
  overallScore: 156,
  maxOverallScore: 200,
  proficiencyLevel: 'Advanced',
  testDate: '2024-03-15T10:30:00Z',
  testDuration: 20,
  testTitle: 'TOEIC Speaking Practice Test #1',
  completionRate: 95,
  parts: [
    {
      partNumber: 1,
      partName: 'Read a text aloud',
      description: 'Reading fluency and pronunciation',
      questionsCount: 2,
      score: 28,
      maxScore: 32,
      proficiencyLevel: 'Advanced',
      strengths: ['Good pacing', 'Natural flow'],
      improvements: ['Volume control', 'Stress patterns'],
      icon: 'pronunciation',
      questions: [
        {
          questionId: 1,
          questionNumber: 1,
          questionText:
            "In today's economy, it is important for everyone to manage their financial resources wisely. Creating a monthly budget can help you track your expenses and identify areas where you can save money.",
          score: 14,
          maxScore: 16,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-1-sample.mp3',
          userResponseUrl: '/audio/user-response-1.mp3',
          feedback: [
            'Good pronunciation of complex words',
            'Natural pace and rhythm',
          ],
          strengths: ['Good pacing', 'Proper stress'],
          improvements: ['Volume consistency'],
          // Speaking test compatible fields
          title: 'Read the following text aloud',
          audio: '/audio/question-1-sample.mp3',
          time_to_think: 45,
          limit_time: 45,
          idea: 'Focus on clear pronunciation and natural intonation',
          sample_answer:
            'Sample reading with proper pronunciation and stress patterns',
        },
        {
          questionId: 2,
          questionNumber: 2,
          questionText:
            "The company's new environmental policy focuses on reducing waste and promoting sustainability. All employees are encouraged to participate in recycling programs and energy conservation efforts.",
          score: 14,
          maxScore: 16,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-2-sample.mp3',
          userResponseUrl: '/audio/user-response-2.mp3',
          feedback: [
            'Excellent word stress',
            'Minor hesitation on "sustainability"',
          ],
          strengths: ['Smooth delivery', 'Natural pronunciation'],
          improvements: ['Speaking confidence'],
          title: 'Read the following text aloud',
          audio: '/audio/question-2-sample.mp3',
          time_to_think: 45,
          limit_time: 45,
          idea: 'Practice difficult words before reading',
          sample_answer: 'Natural reading with emphasis on key terms',
        },
      ],
    },
    {
      partNumber: 2,
      partName: 'Describe a picture',
      description: 'Vocabulary and descriptive ability',
      questionsCount: 1,
      score: 24,
      maxScore: 32,
      proficiencyLevel: 'Intermediate',
      strengths: ['Rich vocabulary', 'Clear structure'],
      improvements: ['Grammar accuracy', 'Fluency'],
      icon: 'vocabulary',
      questions: [
        {
          questionId: 3,
          questionNumber: 3,
          questionText:
            'Look at the picture in your test book. You will have 30 seconds to prepare. Then you will have 45 seconds to speak about the picture.',
          score: 24,
          maxScore: 32,
          proficiencyLevel: 'Intermediate',
          imageUrl: '/images/speaking-picture-1.jpg',
          userResponseUrl: '/audio/user-response-3.mp3',
          feedback: [
            'Good description structure',
            'Some grammar errors',
            'Rich vocabulary usage',
          ],
          strengths: ['Detailed observations', 'Logical flow'],
          improvements: ['Grammar accuracy', 'Fluency'],
          title: 'Describe a picture',
          image: '/images/speaking-picture-1.jpg',
          time_to_think: 30,
          limit_time: 45,
          idea: 'Start with general overview, then describe specific details',
          sample_answer:
            'In this picture, I can see... The people are... This appears to be...',
        },
      ],
    },
    {
      partNumber: 3,
      partName: 'Respond to questions',
      description: 'Listening comprehension and response ability',
      questionsCount: 3,
      score: 26,
      maxScore: 32,
      proficiencyLevel: 'Advanced',
      strengths: ['Quick responses', 'Relevant content'],
      improvements: ['Detail elaboration'],
      icon: 'fluency',
      questions: [
        {
          questionId: 4,
          questionNumber: 4,
          questionText: 'What kind of music do you like to listen to?',
          score: 9,
          maxScore: 11,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-4.mp3',
          userResponseUrl: '/audio/user-response-4.mp3',
          feedback: ['Clear and natural response', 'Good examples provided'],
          strengths: ['Natural delivery', 'Personal examples'],
          improvements: ['More details'],
          title: 'Answer the question',
          audio: '/audio/question-4.mp3',
          time_to_think: 0,
          limit_time: 15,
          idea: 'Think about your favorite music genre and explain why you like it',
          sample_answer:
            'I enjoy listening to jazz music because it helps me relax and the improvisation is very creative.',
        },
        {
          questionId: 5,
          questionNumber: 5,
          questionText: 'How do you usually spend your weekends?',
          score: 8,
          maxScore: 11,
          proficiencyLevel: 'Intermediate',
          audioUrl: '/audio/question-5.mp3',
          userResponseUrl: '/audio/user-response-5.mp3',
          feedback: ['Good content', 'Some hesitation'],
          strengths: ['Relevant content', 'Clear structure'],
          improvements: ['Fluency', 'Confidence'],
          title: 'Answer the question',
          audio: '/audio/question-5.mp3',
          time_to_think: 0,
          limit_time: 15,
          idea: 'Talk about activities you do for relaxation and fun',
          sample_answer:
            'On weekends, I usually spend time with my family, go shopping, and sometimes watch movies at home.',
        },
        {
          questionId: 6,
          questionNumber: 6,
          questionText: 'What are the benefits of learning a foreign language?',
          score: 9,
          maxScore: 10,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-6.mp3',
          userResponseUrl: '/audio/user-response-6.mp3',
          feedback: ['Excellent reasoning', 'Well-structured response'],
          strengths: ['Logical arguments', 'Complex ideas'],
          improvements: ['Speaking speed'],
        },
      ],
    },
    {
      partNumber: 4,
      partName: 'Respond to questions using information',
      description: 'Information processing and communication',
      questionsCount: 3,
      score: 25,
      maxScore: 32,
      proficiencyLevel: 'Advanced',
      strengths: ['Information accuracy', 'Logical flow'],
      improvements: ['Response time'],
      icon: 'grammar',
      questions: [
        {
          questionId: 7,
          questionNumber: 7,
          questionText: 'What are the store hours on weekdays?',
          score: 8,
          maxScore: 11,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-7.mp3',
          imageUrl: '/images/store-hours.jpg',
          userResponseUrl: '/audio/user-response-7.mp3',
          feedback: ['Accurate information', 'Clear delivery'],
          strengths: ['Precise details', 'Clear pronunciation'],
          improvements: ['Response speed'],
        },
        {
          questionId: 8,
          questionNumber: 8,
          questionText: 'How much does a membership cost?',
          score: 8,
          maxScore: 11,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-8.mp3',
          userResponseUrl: '/audio/user-response-8.mp3',
          feedback: ['Complete information provided', 'Good organization'],
          strengths: ['Thorough response', 'Well organized'],
          improvements: ['Natural flow'],
        },
        {
          questionId: 9,
          questionNumber: 9,
          questionText: 'What services does the gym offer?',
          score: 9,
          maxScore: 10,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-9.mp3',
          userResponseUrl: '/audio/user-response-9.mp3',
          feedback: ['Comprehensive answer', 'Excellent delivery'],
          strengths: ['Complete details', 'Natural speech'],
          improvements: ['Minor pronunciation'],
        },
      ],
    },
    {
      partNumber: 5,
      partName: 'Express an opinion',
      description: 'Opinion expression and reasoning',
      questionsCount: 1,
      score: 27,
      maxScore: 36,
      proficiencyLevel: 'Advanced',
      strengths: ['Clear reasoning', 'Strong examples'],
      improvements: ['Complex sentences'],
      icon: 'intonation',
      questions: [
        {
          questionId: 10,
          questionNumber: 10,
          questionText:
            "Do you think it's better to work for a large company or a small company? Give reasons to support your opinion.",
          score: 27,
          maxScore: 36,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-10.mp3',
          userResponseUrl: '/audio/user-response-10.mp3',
          feedback: ['Strong arguments', 'Good examples', 'Clear structure'],
          strengths: [
            'Logical reasoning',
            'Personal examples',
            'Clear position',
          ],
          improvements: ['More complex grammar', 'Varied vocabulary'],
          title: 'Express your opinion',
          audio: '/audio/question-10.mp3',
          time_to_think: 15,
          limit_time: 60,
          idea: 'Consider pros and cons of both company sizes. Think about job security, career growth, work environment.',
          sample_answer:
            'I believe working for a large company has more advantages because of better benefits, job security, and career advancement opportunities...',
        },
      ],
    },
    {
      partNumber: 6,
      partName: 'Propose a solution',
      description: 'Problem-solving and proposal skills',
      questionsCount: 1,
      score: 26,
      maxScore: 36,
      proficiencyLevel: 'Advanced',
      strengths: ['Practical solutions', 'Clear structure'],
      improvements: ['Alternative options'],
      icon: 'vocabulary',
      questions: [
        {
          questionId: 11,
          questionNumber: 11,
          questionText:
            'Your company is planning to implement a new flexible working policy. Some employees are concerned about productivity. Propose a solution that addresses these concerns.',
          score: 26,
          maxScore: 36,
          proficiencyLevel: 'Advanced',
          audioUrl: '/audio/question-11.mp3',
          userResponseUrl: '/audio/user-response-11.mp3',
          feedback: [
            'Practical solution',
            'Good structure',
            'Addresses concerns well',
          ],
          strengths: [
            'Problem analysis',
            'Clear proposal',
            'Practical approach',
          ],
          improvements: ['Multiple solutions', 'Implementation details'],
        },
      ],
    },
  ],
};

export const mockSpeakingStats: SpeakingResultStats = {
  totalQuestions: 11,
  answeredQuestions: 11,
  averageResponseTime: 45, // seconds
  totalRecordingTime: 720, // 12 minutes total recording time
};

// Helper function to get proficiency color
export const getProficiencyColor = (level: string) => {
  switch (level) {
    case 'Expert':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Advanced':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Intermediate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Beginner':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Helper function to get score color based on percentage
export const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'text-emerald-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-orange-600';
  return 'text-red-600';
};

// Helper function to get icon path
export const getPartIcon = (iconName: string) => {
  return `/icon/speech-analyzer/icon-${iconName}.svg`;
};
