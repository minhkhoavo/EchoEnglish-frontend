import type {
  RoadmapAiInput,
  RoadmapPipelineInput,
  DailyPlanContext,
  DailySessionPipelineInput,
  RoadmapWeeklyFocus,
} from '../types/playground.types';

// Versioned playground presets. Each carries a full input payload for every
// generator + fidelity, plus a matching mock insight dataset. Components only
// read from here / the data provider — never hardcode scenario data inline.

export interface MockInsights {
  competency: {
    currentLevel: string;
    skills: Array<{ skillName: string; percentage: number }>;
    aiInsights: Array<{ title: string; description: string }>;
  };
  weaknesses: Array<{ skillName: string; severity: string; accuracy: number }>;
  resources: Array<{ title: string; type: string; domain?: string }>;
}

export interface Preset {
  id: string;
  label: string;
  version: string;
  roadmapAi: RoadmapAiInput;
  roadmapPipeline: RoadmapPipelineInput;
  dailyAi: DailyPlanContext;
  dailyPipeline: DailySessionPipelineInput;
  insights: MockInsights;
}

const sampleWeek = (
  weekNumber: number,
  title: string,
  focusSkills: string[],
  domains: string[]
): RoadmapWeeklyFocus => ({
  weekNumber,
  title,
  summary: `${title} — strengthen ${focusSkills.join(', ')}.`,
  focusSkills,
  targetWeaknesses: focusSkills.map((s, i) => ({
    skillKey: s.toLowerCase().replace(/\s+/g, '_'),
    skillName: s,
    severity: i === 0 ? 'high' : 'medium',
    category: 'grammar',
    userAccuracy: 45 + i * 10,
  })),
  recommendedDomains: domains,
  status: weekNumber === 1 ? 'in-progress' : 'upcoming',
  mistakes: [
    {
      questionId: 'q-2001',
      questionText: `A sample ${focusSkills[0]} question the learner missed.`,
      contentTags: focusSkills,
      skillTag: focusSkills[0].toLowerCase().replace(/\s+/g, '_'),
      partNumber: 5,
      difficulty: 'medium',
      mistakeCount: 2,
    },
  ],
  dailyFocuses: [
    {
      dayNumber: 1,
      dayOfWeek: new Date().getDay(),
      focus: `${focusSkills[0]} drills`,
      targetSkills: focusSkills,
      suggestedDomains: domains,
      estimatedMinutes: 30,
      status: 'pending',
    },
  ],
});

const beginner: Preset = {
  id: 'beginner',
  label: 'Beginner (target 500)',
  version: 'v1',
  roadmapAi: {
    userId: 'playground-user',
    userPrompt: 'I am a beginner and want a solid TOEIC foundation.',
    targetScore: 500,
    studyTimePerDay: 30,
    studyDaysPerWeek: 5,
    userPreferences: {
      primaryGoal: 'toeic_preparation',
      currentLevel: 'beginner',
      preferredStudyTime: 'evening',
      contentInterests: ['business', 'travel'],
      studyDaysOfWeek: [1, 2, 3, 4, 5],
    },
    testAnalysis: {
      score: 350,
      weaknesses: [
        { skillName: 'Part 5 Grammar', severity: 'high', userAccuracy: 35 },
        { skillName: 'Listening Part 2', severity: 'high', userAccuracy: 40 },
      ],
      strengths: ['Vocabulary basics'],
      summary: 'Foundational gaps in grammar and listening comprehension.',
      domainsPerformance: [],
    },
    todayDayOfWeek: new Date().getDay(),
  },
  roadmapPipeline: {
    userId: 'playground-user',
    userPrompt: 'I am a beginner and want a solid TOEIC foundation.',
    targetScore: 500,
    studyTimePerDay: 30,
    studyDaysPerWeek: 5,
    weaknesses: [
      {
        skillKey: 'part5_grammar',
        skillName: 'Part 5 Grammar',
        severity: 'high',
        category: 'grammar',
        accuracy: 35,
      },
    ],
    userPreferences: {
      primaryGoal: 'toeic_preparation',
      currentLevel: 'beginner',
      preferredStudyTime: 'evening',
      contentInterests: ['business'],
      studyDaysOfWeek: [1, 2, 3, 4, 5],
    },
    testAnalysis: {
      score: 350,
      weaknesses: [
        { skillName: 'Part 5 Grammar', severity: 'high', userAccuracy: 35 },
      ],
      strengths: ['Vocabulary basics'],
      summary: 'Foundational gaps in grammar.',
    },
  },
  dailyAi: {
    dailyFocus: {
      focus: 'Part 5 grammar fundamentals',
      targetSkills: ['Tenses', 'Prepositions'],
      suggestedDomains: ['business'],
      estimatedMinutes: 30,
    },
    weekFocus: {
      weekNumber: 1,
      title: 'Grammar Foundations',
      summary: 'Build core grammar accuracy for Part 5.',
      focusSkills: ['Tenses', 'Prepositions'],
      targetWeaknesses: [
        {
          skillKey: 'tenses',
          skillName: 'Tenses',
          severity: 'high',
          category: 'grammar',
          userAccuracy: 35,
        },
      ],
      recommendedDomains: ['business'],
    },
    competencyProfile: {
      currentLevel: 'A2',
      lowestSkills: [
        { skill: 'Tenses', currentAccuracy: 35, proficiency: 'weak' },
      ],
    },
    userPreferences: {
      preferredStudyTime: 'evening',
      contentInterests: ['business'],
    },
    mistakesToReview: [
      {
        questionId: 'q-1001',
        questionText: 'The report ____ by the team will be presented tomorrow.',
        contentTags: ['passive voice', 'participles'],
        skillTag: 'grammar_participle',
        partNumber: 5,
        difficulty: 'medium',
        mistakeCount: 3,
      },
      {
        questionId: 'q-1002',
        questionText: 'She has worked here ____ five years.',
        contentTags: ['prepositions', 'time'],
        skillTag: 'grammar_preposition',
        partNumber: 5,
        difficulty: 'easy',
        mistakeCount: 2,
      },
    ],
    availableResources: [
      {
        type: 'article',
        title: 'Passive Voice in Business English',
        description: 'How passive constructions appear in Part 5/6.',
        domain: 'business',
        topics: ['grammar', 'passive voice'],
      },
    ],
    missedSessions: [
      {
        focus: 'Prepositions of time',
        targetSkills: ['Prepositions'],
        suggestedDomains: ['business'],
      },
    ],
    userDirectives: {
      focus: 'Study the attached grammar article on tenses',
      note: 'Please ground today around this article.',
      materials: [
        {
          title: 'Mastering English Tenses',
          type: 'article',
          domain: 'business',
        },
      ],
    },
  },
  dailyPipeline: {
    userId: 'playground-user',
    roadmap: {
      _id: 'pg-roadmap-1',
      userId: 'playground-user',
      currentLevel: 'A2',
      studyTimePerDay: 30,
      weeklyFocuses: [
        sampleWeek(
          1,
          'Grammar Foundations',
          ['Tenses', 'Prepositions'],
          ['business']
        ),
      ],
    },
    targetWeekNumber: 1,
    targetDayOfWeek: new Date().getDay(),
    isBlocked: false,
  },
  insights: {
    competency: {
      currentLevel: 'A2',
      skills: [
        { skillName: 'Grammar', percentage: 35 },
        { skillName: 'Listening', percentage: 40 },
        { skillName: 'Reading', percentage: 45 },
        { skillName: 'Vocabulary', percentage: 55 },
      ],
      aiInsights: [
        {
          title: 'Grammar is your biggest gap',
          description: 'Focus on tenses and prepositions in Part 5.',
        },
      ],
    },
    weaknesses: [
      { skillName: 'Part 5 Grammar', severity: 'high', accuracy: 35 },
      { skillName: 'Listening Part 2', severity: 'high', accuracy: 40 },
    ],
    resources: [
      { title: 'TOEIC Grammar Basics', type: 'article', domain: 'business' },
      { title: 'Listening Part 2 Practice', type: 'video', domain: 'business' },
    ],
  },
};

const intermediate: Preset = {
  ...beginner,
  id: 'intermediate',
  label: 'Intermediate (target 750)',
  version: 'v1',
  roadmapAi: {
    ...beginner.roadmapAi,
    userPrompt: 'I scored ~600 and want to reach 750.',
    targetScore: 750,
    userPreferences: {
      ...beginner.roadmapAi.userPreferences,
      currentLevel: 'intermediate',
    },
    testAnalysis: {
      score: 600,
      weaknesses: [
        { skillName: 'Inference', severity: 'medium', userAccuracy: 55 },
      ],
      strengths: ['Grammar', 'Vocabulary'],
      summary: 'Solid base; needs inference and reading speed.',
      domainsPerformance: [],
    },
  },
  roadmapPipeline: {
    ...beginner.roadmapPipeline,
    targetScore: 750,
    userPreferences: {
      ...beginner.roadmapPipeline.userPreferences,
      currentLevel: 'intermediate',
    },
    testAnalysis: {
      score: 600,
      weaknesses: [
        { skillName: 'Inference', severity: 'medium', userAccuracy: 55 },
      ],
      strengths: ['Grammar'],
      summary: 'Needs inference practice.',
    },
  },
  insights: {
    competency: {
      currentLevel: 'B1',
      skills: [
        { skillName: 'Grammar', percentage: 70 },
        { skillName: 'Listening', percentage: 65 },
        { skillName: 'Reading', percentage: 60 },
        { skillName: 'Inference', percentage: 55 },
      ],
      aiInsights: [
        {
          title: 'Reading speed limits your score',
          description: 'Work on inference and skimming for Part 7.',
        },
      ],
    },
    weaknesses: [
      { skillName: 'Inference', severity: 'medium', accuracy: 55 },
      { skillName: 'Reading speed', severity: 'medium', accuracy: 58 },
    ],
    resources: [
      { title: 'Part 7 Inference Strategies', type: 'article' },
      { title: 'Speed Reading Drills', type: 'video' },
    ],
  },
};

const weakListening: Preset = {
  ...beginner,
  id: 'weak-listening',
  label: 'Weak in Listening (target 700)',
  version: 'v1',
  roadmapAi: {
    ...beginner.roadmapAi,
    userPrompt: 'My listening is much weaker than my reading.',
    targetScore: 700,
    testAnalysis: {
      score: 520,
      weaknesses: [
        {
          skillName: 'Listening Part 3',
          severity: 'critical',
          userAccuracy: 30,
        },
        { skillName: 'Listening Part 4', severity: 'high', userAccuracy: 38 },
      ],
      strengths: ['Reading', 'Grammar'],
      summary: 'Large listening gap vs reading.',
      domainsPerformance: [],
    },
  },
  dailyAi: {
    ...beginner.dailyAi,
    dailyFocus: {
      focus: 'Listening Part 3 conversations',
      targetSkills: ['Listening comprehension', 'Note-taking'],
      suggestedDomains: ['office', 'business'],
      estimatedMinutes: 40,
    },
    weekFocus: {
      ...beginner.dailyAi.weekFocus,
      title: 'Listening Bootcamp',
      focusSkills: ['Listening comprehension'],
      targetWeaknesses: [
        {
          skillKey: 'listening_part3',
          skillName: 'Listening Part 3',
          severity: 'critical',
          category: 'listening',
          userAccuracy: 30,
        },
      ],
    },
  },
  insights: {
    competency: {
      currentLevel: 'B1',
      skills: [
        { skillName: 'Grammar', percentage: 72 },
        { skillName: 'Reading', percentage: 68 },
        { skillName: 'Listening', percentage: 34 },
        { skillName: 'Vocabulary', percentage: 60 },
      ],
      aiInsights: [
        {
          title: 'Listening drags your total down',
          description: 'Daily Part 3/4 practice with transcripts.',
        },
      ],
    },
    weaknesses: [
      { skillName: 'Listening Part 3', severity: 'critical', accuracy: 30 },
      { skillName: 'Listening Part 4', severity: 'high', accuracy: 38 },
    ],
    resources: [
      { title: 'Part 3 Conversation Practice', type: 'video' },
      { title: 'Listening Transcripts Pack', type: 'article' },
    ],
  },
};

export const PRESETS: Preset[] = [beginner, intermediate, weakListening];

export const getPreset = (id: string): Preset =>
  PRESETS.find((p) => p.id === id) ?? PRESETS[0];
