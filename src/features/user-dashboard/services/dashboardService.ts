import type {
  DashboardData,
  DailyLessonData,
  CompetencyProfileInsightResponse,
  ScoreData,
  SkillData,
  AIInsight,
} from '../types/dashboard.types';
import type { StudyPreferences } from '../components/StudyPreferences';
import { transformCompetencyData } from './dashboardApi';

// Get complete dashboard data combining API and static data
export const fetchDashboardData = (
  competencyData: CompetencyProfileInsightResponse
): DashboardData => {
  try {
    // Transform real data from API
    const transformedData = transformCompetencyData(competencyData.data);

    // Combine with remaining static data (to be replaced with actual APIs later)
    return {
      userProfile: {
        id: '1',
        name: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        currentScore: transformedData.scoreData!.overallScore,
        targetScore: transformedData.scoreData!.targetScore,
        currentLevel: transformedData.scoreData!.cefrLevel,
        studyStreak: 12,
        longestStreak: 28,
      },
      scoreData: transformedData.scoreData!,
      skillsData: transformedData.skillsData!,
      aiInsights: transformedData.aiInsights!,
      // Static data - replace with actual APIs later
      partPerformance: [
        {
          part: 'Part 1',
          score: 85,
          total: 100,
          questionsCorrect: 17,
          questionsTotal: 20,
        },
        {
          part: 'Part 2',
          score: 72,
          total: 100,
          questionsCorrect: 18,
          questionsTotal: 25,
        },
        {
          part: 'Part 3',
          score: 58,
          total: 100,
          questionsCorrect: 23,
          questionsTotal: 40,
        },
        {
          part: 'Part 4',
          score: 63,
          total: 100,
          questionsCorrect: 19,
          questionsTotal: 30,
        },
        {
          part: 'Part 5',
          score: 68,
          total: 100,
          questionsCorrect: 20,
          questionsTotal: 30,
        },
        {
          part: 'Part 6',
          score: 75,
          total: 100,
          questionsCorrect: 12,
          questionsTotal: 16,
        },
        {
          part: 'Part 7',
          score: 52,
          total: 100,
          questionsCorrect: 29,
          questionsTotal: 54,
        },
      ],
      learningPhases: [
        {
          phase: 1,
          week: '1-3',
          title: 'Foundation Building',
          status: 'completed',
          score: 650,
          color: '#10B981',
          bgColor: '#D1FAE5',
          description: 'Master the basics',
          achievements: [
            'Grammar fundamentals',
            'Core vocabulary 500+',
            'Part 1-2 mastery',
          ],
        },
        {
          phase: 2,
          week: '4-6',
          title: 'Skill Development',
          status: 'in-progress',
          score: 700,
          color: '#3B82F6',
          bgColor: '#DBEAFE',
          description: 'Advanced techniques',
          achievements: [
            'Inference training',
            'Speed reading',
            'Complex grammar',
          ],
        },
        {
          phase: 3,
          week: '7-9',
          title: 'Strategic Mastery',
          status: 'upcoming',
          score: 750,
          color: '#8B5CF6',
          bgColor: '#EDE9FE',
          description: 'Test-taking strategies',
          achievements: [
            'Time management',
            'Error pattern fix',
            'Advanced vocab 1000+',
          ],
        },
        {
          phase: 4,
          week: '10-12',
          title: 'Peak Performance',
          status: 'upcoming',
          score: 800,
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          description: 'Final push to excellence',
          achievements: [
            'Full mock tests',
            'Weak area elimination',
            '800+ Achievement',
          ],
        },
      ],
      dailyTasks: [
        {
          id: '1',
          title: 'Grammar Focus: Word Forms',
          description:
            '10 Part 5 questions targeting your adjective/adverb confusion',
          duration: '15 min',
          type: 'grammar',
          priority: 'high',
          completed: false,
          estimatedXP: 50,
        },
        {
          id: '2',
          title: 'Inference Skill Training',
          description:
            '4 Part 3 listening dialogues with inference questions (office context)',
          duration: '20 min',
          type: 'listening',
          priority: 'high',
          completed: false,
          estimatedXP: 70,
        },
        {
          id: '3',
          title: 'Finance Vocabulary Expansion',
          description: 'Interactive flashcards for business and finance terms',
          duration: '10 min',
          type: 'vocabulary',
          priority: 'medium',
          completed: false,
          estimatedXP: 40,
        },
        {
          id: '4',
          title: 'Double Passage Challenge',
          description: '1 Part 7 double reading about business contracts',
          duration: '15 min',
          type: 'reading',
          priority: 'medium',
          completed: false,
          estimatedXP: 60,
        },
      ],
      weeklyPlan: [
        {
          week: 1,
          theme: 'Foundation Building',
          status: 'completed',
          progress: 100,
          sessions: [
            {
              day: 'Monday',
              topic: 'Grammar - Word Forms',
              duration: 30,
              status: 'completed',
            },
            {
              day: 'Tuesday',
              topic: 'Vocabulary - Business',
              duration: 25,
              status: 'completed',
            },
            {
              day: 'Wednesday',
              topic: 'Part 3 - Conversations',
              duration: 40,
              status: 'completed',
            },
            {
              day: 'Thursday',
              topic: 'Part 7 - Single Passages',
              duration: 45,
              status: 'completed',
            },
            {
              day: 'Friday',
              topic: 'Mixed Review',
              duration: 35,
              status: 'completed',
            },
            {
              day: 'Saturday',
              topic: 'Mock Test - Listening',
              duration: 60,
              status: 'completed',
            },
            {
              day: 'Sunday',
              topic: 'Rest & Review',
              duration: 20,
              status: 'completed',
            },
          ],
        },
        {
          week: 2,
          theme: 'Skill Enhancement',
          status: 'in-progress',
          progress: 71,
          sessions: [
            {
              day: 'Monday',
              topic: 'Inference Skills Training',
              duration: 35,
              status: 'completed',
            },
            {
              day: 'Tuesday',
              topic: 'Finance Vocabulary',
              duration: 30,
              status: 'completed',
            },
            {
              day: 'Wednesday',
              topic: 'Part 4 - Short Talks',
              duration: 40,
              status: 'completed',
            },
            {
              day: 'Thursday',
              topic: 'Part 7 - Double Passages',
              duration: 50,
              status: 'completed',
            },
            {
              day: 'Friday',
              topic: 'Grammar - Prepositions',
              duration: 30,
              status: 'completed',
            },
            {
              day: 'Saturday',
              topic: 'Speed Reading Practice',
              duration: 45,
              status: 'current',
            },
            {
              day: 'Sunday',
              topic: 'Weak Areas Review',
              duration: 25,
              status: 'upcoming',
            },
          ],
        },
        {
          week: 3,
          theme: 'Advanced Techniques',
          status: 'upcoming',
          progress: 0,
          sessions: [
            {
              day: 'Monday',
              topic: 'Complex Inference',
              duration: 40,
              status: 'upcoming',
            },
            {
              day: 'Tuesday',
              topic: 'Technical Vocabulary',
              duration: 30,
              status: 'upcoming',
            },
            {
              day: 'Wednesday',
              topic: 'Part 6 - Text Completion',
              duration: 35,
              status: 'upcoming',
            },
            {
              day: 'Thursday',
              topic: 'Part 7 - Triple Passages',
              duration: 55,
              status: 'upcoming',
            },
            {
              day: 'Friday',
              topic: 'Conditional Sentences',
              duration: 35,
              status: 'upcoming',
            },
            {
              day: 'Saturday',
              topic: 'Full Mock Test',
              duration: 120,
              status: 'upcoming',
            },
            {
              day: 'Sunday',
              topic: 'Analysis & Planning',
              duration: 30,
              status: 'upcoming',
            },
          ],
        },
      ],
      vocabularyPlan: {
        newWords: {
          count: 25,
          topics: ['Finance & Banking', 'Business Negotiations', 'Marketing'],
          estimatedTime: '20 min',
          reason: 'Based on your weak areas in finance vocabulary',
        },
        reviewWords: {
          count: 18,
          source: "Yesterday's session",
          topics: ['Corporate Management', 'Technology'],
          estimatedTime: '12 min',
          retention: 67,
        },
        masterWords: {
          count: 142,
          lastWeek: 38,
          totalMastered: 1847,
        },
      },
      learningStats: {
        currentStreak: 12,
        longestStreak: 28,
        todayGoal: 60,
        completed: 35,
        weeklyGoal: 420,
        weeklyCompleted: 285,
        totalStudyTime: 3450,
        averageDaily: 45,
      },
      studyGoals: [
        {
          id: 'score-800',
          name: 'Reach 800+ TOEIC Score',
          current: transformedData.scoreData!.overallScore,
          target: transformedData.scoreData!.targetScore,
          timeframe: '12 weeks',
          difficulty: 'Challenging',
          estimatedHours: 120,
          priority: 'high',
          progress: Math.round(
            (transformedData.scoreData!.overallScore /
              transformedData.scoreData!.targetScore) *
              100
          ),
        },
        {
          id: 'score-750',
          name: 'Achieve 750 TOEIC Score',
          current: transformedData.scoreData!.overallScore,
          target: 750,
          timeframe: '8 weeks',
          difficulty: 'Moderate',
          estimatedHours: 80,
          priority: 'medium',
          progress: Math.round(
            (transformedData.scoreData!.overallScore / 750) * 100
          ),
        },
        {
          id: 'listening-improve',
          name: 'Improve Listening to 400+',
          current: transformedData.scoreData!.listeningScore,
          target: 400,
          timeframe: '6 weeks',
          difficulty: 'Moderate',
          estimatedHours: 60,
          priority: 'medium',
          progress: Math.round(
            (transformedData.scoreData!.listeningScore / 400) * 100
          ),
        },
      ],
      milestones: [
        {
          week: 4,
          title: 'First Assessment',
          description: 'Complete practice test to measure initial progress',
          targetScore: 680,
          status: 'upcoming',
        },
        {
          week: 8,
          title: 'Mid-Point Evaluation',
          description: 'Comprehensive skill assessment and plan adjustment',
          targetScore: 720,
          status: 'upcoming',
        },
        {
          week: 12,
          title: 'Final Goal Achievement',
          description: 'Reach target score of 800+',
          targetScore: transformedData.scoreData!.targetScore,
          status: 'upcoming',
        },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

// Fetch study preferences
export const fetchStudyPreferences = async (): Promise<StudyPreferences> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    dailyGoal: 60,
    preferredTime: '19:00 - 21:00',
    targetScore: 800,
    currentScore: 650,
    studyDays: ['T2', 'T3', 'T4', 'T5', 'T6'],
    reminderEnabled: true,
  };
};

// Fetch user learning stats
export const fetchLearningStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    currentStreak: 12,
    longestStreak: 28,
    todayGoal: 60,
    completed: 35,
    weeklyGoal: 420,
    weeklyCompleted: 285,
    totalStudyTime: 3450,
    averageDaily: 45,
  };
};
