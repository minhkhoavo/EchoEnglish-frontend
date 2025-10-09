import type {
  ExamAnalysisResult,
  OverallSkillDimensions,
  PartAnalysis,
  DiagnosisInsight,
  StudyPlanItem,
  SkillPerformance,
  QuestionAttemptDetail,
} from '../types/analysis';

/**
 * Generate mock exam analysis data for UI development
 * This simulates what the backend analytics engine would produce
 */
export function generateMockAnalysisData(): ExamAnalysisResult {
  const overallSkills: OverallSkillDimensions = {
    GIST: 82,
    DETAIL: 68,
    INFERENCE: 45, // Major weakness
    GRAMMAR: 71,
    VOCABULARY: 58, // Weakness in collocations
    COHESION: 75,
  };

  // Generate mock question attempt details for pattern analysis
  const questionAttempts: QuestionAttemptDetail[] = [
    // Câu phân vân nhiều lần (hesitation)
    {
      questionId: 'q15',
      questionNumber: 15,
      partNumber: '2',
      skillTested: 'WH Questions',
      isCorrect: false,
      timeSpent: 45,
      changes: 4,
    },
    {
      questionId: 'q27',
      questionNumber: 27,
      partNumber: '2',
      skillTested: 'Yes/No Questions',
      isCorrect: true,
      timeSpent: 38,
      changes: 3,
    },
    {
      questionId: 'q42',
      questionNumber: 42,
      partNumber: '3',
      skillTested: 'Main Topic',
      isCorrect: false,
      timeSpent: 52,
      changes: 5,
    },
    {
      questionId: 'q58',
      questionNumber: 58,
      partNumber: '4',
      skillTested: 'Inference',
      isCorrect: true,
      timeSpent: 47,
      changes: 3,
    },
    {
      questionId: 'q89',
      questionNumber: 89,
      partNumber: '5',
      skillTested: 'Word Form',
      isCorrect: false,
      timeSpent: 41,
      changes: 4,
    },
    {
      questionId: 'q112',
      questionNumber: 112,
      partNumber: '6',
      skillTested: 'Sentence Insertion',
      isCorrect: false,
      timeSpent: 68,
      changes: 5,
    },
    {
      questionId: 'q145',
      questionNumber: 145,
      partNumber: '7',
      skillTested: 'Inference',
      isCorrect: true,
      timeSpent: 55,
      changes: 3,
    },
    {
      questionId: 'q178',
      questionNumber: 178,
      partNumber: '7',
      skillTested: 'Cross Reference',
      isCorrect: false,
      timeSpent: 82,
      changes: 6,
    },

    // Câu thay đổi đáp án (answer changes)
    {
      questionId: 'q8',
      questionNumber: 8,
      partNumber: '1',
      skillTested: 'Spatial Relationship',
      isCorrect: true,
      timeSpent: 28,
      changes: 2,
    },
    {
      questionId: 'q22',
      questionNumber: 22,
      partNumber: '2',
      skillTested: 'Tag Questions',
      isCorrect: true,
      timeSpent: 32,
      changes: 1,
    },
    {
      questionId: 'q35',
      questionNumber: 35,
      partNumber: '3',
      skillTested: 'Specific Detail',
      isCorrect: false,
      timeSpent: 44,
      changes: 2,
    },
    {
      questionId: 'q47',
      questionNumber: 47,
      partNumber: '3',
      skillTested: 'Purpose',
      isCorrect: true,
      timeSpent: 36,
      changes: 1,
    },
    {
      questionId: 'q63',
      questionNumber: 63,
      partNumber: '4',
      skillTested: 'Future Action',
      isCorrect: false,
      timeSpent: 48,
      changes: 2,
    },
    {
      questionId: 'q78',
      questionNumber: 78,
      partNumber: '5',
      skillTested: 'Preposition',
      isCorrect: true,
      timeSpent: 29,
      changes: 1,
    },
    {
      questionId: 'q95',
      questionNumber: 95,
      partNumber: '5',
      skillTested: 'Verb Tense',
      isCorrect: true,
      timeSpent: 31,
      changes: 2,
    },
    {
      questionId: 'q108',
      questionNumber: 108,
      partNumber: '6',
      skillTested: 'Vocabulary',
      isCorrect: false,
      timeSpent: 42,
      changes: 2,
    },
    {
      questionId: 'q132',
      questionNumber: 132,
      partNumber: '7',
      skillTested: 'Scanning',
      isCorrect: true,
      timeSpent: 38,
      changes: 1,
    },
    {
      questionId: 'q156',
      questionNumber: 156,
      partNumber: '7',
      skillTested: 'Paraphrasing',
      isCorrect: false,
      timeSpent: 51,
      changes: 2,
    },

    // Câu tốn thời gian nhất (slowest)
    {
      questionId: 'q187',
      questionNumber: 187,
      partNumber: '7',
      skillTested: 'Cross Reference (Triple)',
      isCorrect: false,
      timeSpent: 125,
    },
    {
      questionId: 'q195',
      questionNumber: 195,
      partNumber: '7',
      skillTested: 'Inference (Double)',
      isCorrect: true,
      timeSpent: 118,
    },
    {
      questionId: 'q172',
      questionNumber: 172,
      partNumber: '7',
      skillTested: 'Cross Reference (Double)',
      isCorrect: false,
      timeSpent: 108,
    },
    {
      questionId: 'q163',
      questionNumber: 163,
      partNumber: '7',
      skillTested: 'Sentence Insertion',
      isCorrect: true,
      timeSpent: 95,
    },
    {
      questionId: 'q149',
      questionNumber: 149,
      partNumber: '7',
      skillTested: 'Main Topic',
      isCorrect: true,
      timeSpent: 88,
    },
    {
      questionId: 'q118',
      questionNumber: 118,
      partNumber: '6',
      skillTested: 'Discourse Connector',
      isCorrect: false,
      timeSpent: 76,
    },
    {
      questionId: 'q67',
      questionNumber: 67,
      partNumber: '4',
      skillTested: 'Inference (Location)',
      isCorrect: false,
      timeSpent: 72,
    },
    {
      questionId: 'q51',
      questionNumber: 51,
      partNumber: '3',
      skillTested: 'Connect to Graphic',
      isCorrect: true,
      timeSpent: 69,
    },
    {
      questionId: 'q102',
      questionNumber: 102,
      partNumber: '5',
      skillTested: 'Relative Clause',
      isCorrect: false,
      timeSpent: 58,
    },
    {
      questionId: 'q141',
      questionNumber: 141,
      partNumber: '7',
      skillTested: 'Vocabulary in Context',
      isCorrect: true,
      timeSpent: 54,
    },

    // Câu bỏ qua (skipped)
    {
      questionId: 'q199',
      questionNumber: 199,
      partNumber: '7',
      skillTested: 'Cross Reference',
      isCorrect: false,
      skipped: true,
    },
    {
      questionId: 'q196',
      questionNumber: 196,
      partNumber: '7',
      skillTested: 'Inference',
      isCorrect: false,
      skipped: true,
    },

    // Câu bình thường (normal)
    {
      questionId: 'q1',
      questionNumber: 1,
      partNumber: '1',
      skillTested: 'Action in Progress',
      isCorrect: true,
      timeSpent: 15,
    },
    {
      questionId: 'q3',
      questionNumber: 3,
      partNumber: '1',
      skillTested: 'State/Condition',
      isCorrect: true,
      timeSpent: 18,
    },
    {
      questionId: 'q11',
      questionNumber: 11,
      partNumber: '2',
      skillTested: 'WH Questions',
      isCorrect: true,
      timeSpent: 22,
    },
    {
      questionId: 'q18',
      questionNumber: 18,
      partNumber: '2',
      skillTested: 'Alternative Questions',
      isCorrect: true,
      timeSpent: 19,
    },
    {
      questionId: 'q33',
      questionNumber: 33,
      partNumber: '3',
      skillTested: 'Main Topic',
      isCorrect: true,
      timeSpent: 25,
    },
    {
      questionId: 'q71',
      questionNumber: 71,
      partNumber: '5',
      skillTested: 'Word Choice',
      isCorrect: true,
      timeSpent: 24,
    },
    {
      questionId: 'q85',
      questionNumber: 85,
      partNumber: '5',
      skillTested: 'Subject-Verb Agreement',
      isCorrect: true,
      timeSpent: 21,
    },
    {
      questionId: 'q125',
      questionNumber: 125,
      partNumber: '7',
      skillTested: 'Scanning',
      isCorrect: true,
      timeSpent: 32,
    },
  ];

  const part1Analysis: PartAnalysis = {
    partNumber: '1',
    totalQuestions: 6,
    correctAnswers: 5,
    accuracy: 83.3,
    skillBreakdown: [
      {
        skillName: 'Identify Action in Progress',
        skillKey: 'identify_action_in_progress',
        total: 3,
        correct: 3,
        incorrect: 0,
        accuracy: 100,
      },
      {
        skillName: 'Identify State/Condition',
        skillKey: 'identify_state_condition',
        total: 2,
        correct: 1,
        incorrect: 1,
        accuracy: 50,
      },
      {
        skillName: 'Spatial Relationships',
        skillKey: 'identify_spatial_relationship',
        total: 1,
        correct: 1,
        incorrect: 0,
        accuracy: 100,
      },
    ],
  };

  const part2Analysis: PartAnalysis = {
    partNumber: '2',
    totalQuestions: 25,
    correctAnswers: 19,
    accuracy: 76,
    skillBreakdown: [
      {
        skillName: 'WH Questions',
        skillKey: 'wh_question',
        total: 15,
        correct: 12,
        incorrect: 3,
        accuracy: 80,
      },
      {
        skillName: 'Yes/No Questions',
        skillKey: 'yes_no',
        total: 5,
        correct: 3,
        incorrect: 2,
        accuracy: 60,
      },
      {
        skillName: 'Alternative Questions',
        skillKey: 'alternative',
        total: 5,
        correct: 4,
        incorrect: 1,
        accuracy: 80,
      },
    ],
  };

  const part34Analysis: PartAnalysis = {
    partNumber: '3',
    totalQuestions: 39,
    correctAnswers: 26,
    accuracy: 66.7,
    skillBreakdown: [
      {
        skillName: 'Main Topic/Gist',
        skillKey: 'main_topic',
        total: 8,
        correct: 7,
        incorrect: 1,
        accuracy: 87.5,
      },
      {
        skillName: 'Specific Details',
        skillKey: 'specific_detail',
        total: 12,
        correct: 10,
        incorrect: 2,
        accuracy: 83.3,
      },
      {
        skillName: 'Inference',
        skillKey: 'infer_implication',
        total: 10,
        correct: 4,
        incorrect: 6,
        accuracy: 40,
      },
      {
        skillName: 'Future Action',
        skillKey: 'future_action',
        total: 5,
        correct: 3,
        incorrect: 2,
        accuracy: 60,
      },
      {
        skillName: 'Connect to Graphic',
        skillKey: 'connect_to_graphic',
        total: 4,
        correct: 2,
        incorrect: 2,
        accuracy: 50,
      },
    ],
  };

  const part5Analysis: PartAnalysis = {
    partNumber: '5',
    totalQuestions: 30,
    correctAnswers: 21,
    accuracy: 70,
    skillBreakdown: [
      {
        skillName: 'Word Form',
        skillKey: 'word_form',
        total: 8,
        correct: 5,
        incorrect: 3,
        accuracy: 62.5,
      },
      {
        skillName: 'Verb Tense',
        skillKey: 'verb_tense_mood',
        total: 7,
        correct: 6,
        incorrect: 1,
        accuracy: 85.7,
      },
      {
        skillName: 'Preposition',
        skillKey: 'preposition',
        total: 5,
        correct: 3,
        incorrect: 2,
        accuracy: 60,
      },
      {
        skillName: 'Word Choice/Vocabulary',
        skillKey: 'word_choice',
        total: 6,
        correct: 4,
        incorrect: 2,
        accuracy: 66.7,
      },
      {
        skillName: 'Conjunction',
        skillKey: 'conjunction',
        total: 4,
        correct: 3,
        incorrect: 1,
        accuracy: 75,
      },
    ],
  };

  const part6Analysis: PartAnalysis = {
    partNumber: '6',
    totalQuestions: 16,
    correctAnswers: 10,
    accuracy: 62.5,
    skillBreakdown: [
      {
        skillName: 'Grammar',
        skillKey: 'grammar',
        total: 6,
        correct: 4,
        incorrect: 2,
        accuracy: 66.7,
      },
      {
        skillName: 'Vocabulary',
        skillKey: 'vocabulary',
        total: 4,
        correct: 2,
        incorrect: 2,
        accuracy: 50,
      },
      {
        skillName: 'Sentence Insertion',
        skillKey: 'sentence_insertion',
        total: 4,
        correct: 2,
        incorrect: 2,
        accuracy: 50,
      },
      {
        skillName: 'Discourse Connector',
        skillKey: 'discourse_connector',
        total: 2,
        correct: 2,
        incorrect: 0,
        accuracy: 100,
      },
    ],
  };

  const part7Analysis: PartAnalysis = {
    partNumber: '7',
    totalQuestions: 54,
    correctAnswers: 35,
    accuracy: 64.8,
    skillBreakdown: [
      {
        skillName: 'Main Topic/Purpose',
        skillKey: 'main_topic_purpose',
        total: 9,
        correct: 7,
        incorrect: 2,
        accuracy: 77.8,
      },
      {
        skillName: 'Scanning',
        skillKey: 'scanning',
        total: 15,
        correct: 12,
        incorrect: 3,
        accuracy: 80,
      },
      {
        skillName: 'Paraphrasing',
        skillKey: 'paraphrasing',
        total: 10,
        correct: 6,
        incorrect: 4,
        accuracy: 60,
      },
      {
        skillName: 'Inference',
        skillKey: 'infer_implication',
        total: 12,
        correct: 5,
        incorrect: 7,
        accuracy: 41.7,
      },
      {
        skillName: 'Cross-Reference',
        skillKey: 'cross_reference',
        total: 8,
        correct: 5,
        incorrect: 3,
        accuracy: 62.5,
      },
    ],
  };

  const weaknesses: DiagnosisInsight[] = [
    {
      id: 'w1',
      severity: 'critical',
      category: 'Inference',
      title: 'Weak Inference Skills (Listening & Reading)',
      description:
        'You struggle with questions requiring inference, especially in Parts 3, 4, and 7 where implicit meaning must be derived.',
      affectedParts: ['3', '4', '7'],
      userAccuracy: 42,
      impactScore: 88,
    },
    {
      id: 'w2',
      severity: 'critical',
      category: 'Vocabulary',
      title: 'Collocation & Contextual Vocabulary',
      description:
        'Limited knowledge of common business collocations and contextual word usage affecting Parts 5, 6, and 7.',
      affectedParts: ['5', '6', '7'],
      userAccuracy: 55,
      impactScore: 75,
    },
    {
      id: 'w3',
      severity: 'high',
      category: 'Part 6',
      title: 'Text Completion Sentence Insertion',
      description:
        'Difficulty selecting the correct sentence that fits the overall flow and context of a passage.',
      affectedParts: ['6'],
      userAccuracy: 50,
      impactScore: 65,
    },
    {
      id: 'w4',
      severity: 'high',
      category: 'Part 3/4',
      title: 'Connect to Graphic Questions',
      description:
        'Trouble correlating spoken information with visual graphics like charts, schedules, or tables.',
      affectedParts: ['3', '4'],
      userAccuracy: 50,
      impactScore: 60,
    },
    {
      id: 'w5',
      severity: 'high',
      category: 'Part 7',
      title: 'Paraphrasing Recognition',
      description:
        'Difficulty identifying paraphrased versions of information in reading passages.',
      affectedParts: ['7'],
      userAccuracy: 60,
      impactScore: 58,
    },
    {
      id: 'w6',
      severity: 'medium',
      category: 'Grammar',
      title: 'Word Form Selection',
      description:
        'Inconsistent performance choosing the correct form (noun/verb/adjective/adverb) in Part 5.',
      affectedParts: ['5'],
      userAccuracy: 62.5,
      impactScore: 45,
    },
  ];

  const studyPlan: StudyPlanItem[] = [
    {
      id: 'plan1',
      priority: 1,
      title: 'Master Inference Skills',
      description:
        'Focus on understanding implied meaning, speaker intent, and reading between the lines.',
      targetWeakness: 'Inference',
      skillsToImprove: [
        'Infer Implication',
        'Infer Speaker Role',
        'Infer Author Purpose',
      ],
      resources: [
        {
          id: 'r1',
          type: 'video',
          title: 'Inference Strategies for TOEIC',
          description:
            'Learn systematic approaches to identify implicit information.',
          url: '#',
        },
        {
          id: 'r2',
          type: 'article',
          title: 'Common Inference Question Patterns',
          description:
            'Study the most frequent inference question types and how to tackle them.',
          url: '#',
        },
      ],
      drills: [
        {
          id: 'd1',
          title: 'Part 3 Inference Drill',
          description:
            '30 questions focusing purely on inferring speaker roles, feelings, and implications.',
          targetSkill: 'inference',
          totalQuestions: 30,
          difficulty: 'intermediate',
        },
        {
          id: 'd2',
          title: 'Part 7 Implicit Meaning Practice',
          description:
            '25 questions requiring identification of unstated but implied information.',
          targetSkill: 'inference',
          totalQuestions: 25,
          difficulty: 'advanced',
        },
      ],
      progress: 0,
    },
    {
      id: 'plan2',
      priority: 1,
      title: 'Build Collocation & Vocabulary Bank',
      description:
        'Expand knowledge of common business collocations and high-frequency TOEIC vocabulary.',
      targetWeakness: 'Collocation & Vocabulary',
      skillsToImprove: ['Collocation', 'Word Choice', 'Vocabulary in Context'],
      resources: [
        {
          id: 'r3',
          type: 'flashcard',
          title: 'TOEIC Business Collocation Set',
          description: '500 essential collocations organized by topic.',
          url: '#',
        },
        {
          id: 'r4',
          type: 'video',
          title: 'Mastering Contextual Vocabulary',
          description:
            'Techniques for using context clues to understand unfamiliar words.',
          url: '#',
        },
      ],
      drills: [
        {
          id: 'd3',
          title: 'Part 5 Vocabulary Intensive',
          description:
            '40 questions focusing on word choice, collocations, and phrasal verbs.',
          targetSkill: 'vocabulary',
          totalQuestions: 40,
          difficulty: 'intermediate',
        },
      ],
      progress: 0,
    },
    {
      id: 'plan3',
      priority: 2,
      title: 'Improve Paraphrasing Recognition',
      description:
        'Train to quickly identify rephrased information in reading passages.',
      targetWeakness: 'Paraphrasing',
      skillsToImprove: ['Paraphrasing', 'Synonym Recognition'],
      resources: [
        {
          id: 'r5',
          type: 'article',
          title: 'TOEIC Paraphrasing Patterns',
          description:
            'Common ways TOEIC rephrases information in answer choices.',
          url: '#',
        },
      ],
      drills: [
        {
          id: 'd5',
          title: 'Part 7 Paraphrasing Drills',
          description:
            '20 passages with focus on matching paraphrased information.',
          targetSkill: 'paraphrasing',
          totalQuestions: 20,
          difficulty: 'intermediate',
        },
      ],
      progress: 0,
    },
  ];

  return {
    examAttemptId: 'exam_12345',
    userId: 'user_001',
    examDate: new Date('2025-10-01'),
    listeningScore: 365,
    readingScore: 385,
    totalScore: 750,
    answers: [],
    overallSkills,
    partAnalyses: [
      part1Analysis,
      part2Analysis,
      part34Analysis,
      part5Analysis,
      part6Analysis,
      part7Analysis,
    ],
    timeAnalysis: [],
    weaknesses,
    strengths: [
      'GIST - Main Topic Recognition (87.5% accuracy)',
      'Verb Tense Selection (85.7% accuracy)',
      'Scanning for Explicit Details (80% accuracy)',
    ],
    studyPlan,
    questionAttempts,
  };
}
