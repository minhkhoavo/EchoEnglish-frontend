// Core skill taxonomy types based on system specification

export type PartNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7';

// Part 1: Photographs
export interface Part1Skills {
  part: '1';
  skills: (
    | 'identify_action_in_progress'
    | 'identify_state_condition'
    | 'identify_spatial_relationship'
  )[];
  distractorTypes: ('phonetic_similarity' | 'wrong_subject_verb')[];
}

// Part 2: Question-Response
export type QuestionForm =
  | 'wh_question'
  | 'yes_no'
  | 'tag_question'
  | 'statement'
  | 'alternative'
  | 'negative_question';
export type QuestionFunction =
  | 'information_seeking'
  | 'request'
  | 'suggestion'
  | 'offer'
  | 'opinion';
export type ResponseStrategy = 'direct' | 'indirect';

export interface Part2Skills {
  part: '2';
  questionForm: QuestionForm;
  questionFunction: QuestionFunction;
  responseStrategy: ResponseStrategy;
}

// Parts 3 & 4: Conversations & Talks
export type Part34SkillCategory =
  | 'GIST'
  | 'DETAIL'
  | 'INFERENCE'
  | 'SPECIFIC_ACTION'
  | 'OTHERS';
export type Part34SkillDetail =
  | 'main_topic'
  | 'purpose'
  | 'problem' // GIST
  | 'specific_detail'
  | 'reason_cause'
  | 'amount_quantity' // DETAIL
  | 'infer_speaker_role'
  | 'infer_location'
  | 'infer_implication'
  | 'infer_feeling_attitude' // INFERENCE
  | 'future_action'
  | 'recommended_action'
  | 'requested_action' // SPECIFIC_ACTION
  | 'speaker_intent'
  | 'connect_to_graphic'; // OTHERS

export interface Part34Skills {
  part: '3' | '4';
  skillCategory: Part34SkillCategory;
  skillDetail: Part34SkillDetail;
}

// Part 5: Incomplete Sentences
export type GrammarPoint =
  | 'word_form'
  | 'verb_tense_mood'
  | 'subject_verb_agreement'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'relative_clause'
  | 'comparative_superlative'
  | 'participle';

export type VocabPoint = 'word_choice' | 'collocation' | 'phrasal_verb';

export interface Part5Skills {
  part: '5';
  grammarPoint?: GrammarPoint;
  vocabPoint?: VocabPoint;
}

// Part 6: Text Completion
export type Part6TagType =
  | 'grammar'
  | 'vocabulary'
  | 'sentence_insertion'
  | 'discourse_connector';

export interface Part6Skills {
  part: '6';
  tagType: Part6TagType;
  grammarPoint?: GrammarPoint;
  vocabPoint?: VocabPoint;
}

// Part 7: Reading Comprehension
export type Part7SkillCategory = 'GIST' | 'DETAIL' | 'INFERENCE' | 'OTHERS';
export type Part7SkillDetail =
  | 'main_topic_purpose' // GIST
  | 'scanning'
  | 'paraphrasing' // DETAIL
  | 'infer_implication'
  | 'infer_author_purpose' // INFERENCE
  | 'vocabulary_in_context'
  | 'sentence_insertion'
  | 'cross_reference'; // OTHERS

export type PassageType = 'single' | 'double' | 'triple';

export interface Part7Skills {
  part: '7';
  skillCategory: Part7SkillCategory;
  skillDetail: Part7SkillDetail;
  passageType: PassageType;
  requiresCrossReference: boolean;
}

// Content Tags
export interface ContentTags {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  style: string;
  domain: string[];
  genre: string[];
  setting: string[];
}

// Question metadata
export interface QuestionMetadata {
  questionId: string;
  part: PartNumber;
  contentTags: ContentTags;
  skillTags:
    | Part1Skills
    | Part2Skills
    | Part34Skills
    | Part5Skills
    | Part6Skills
    | Part7Skills;
}

// User answer record
export interface UserAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  metadata: QuestionMetadata;
  timeTaken: number; // seconds
}

// ============================================================================
// TIME ANALYSIS TYPES (Based on Backend Response)
// ============================================================================

export interface PartTimeMetrics {
  partName: string;
  questionsCount: number;
  totalTime: number; // milliseconds
  averageTimePerQuestion: number; // milliseconds
  answerChangeRate: number; // percentage (0-100)
  slowestQuestions: number[]; // question numbers
}

export interface OverallTimeMetrics {
  totalActiveTime: number; // milliseconds
  averageTimePerQuestion: number; // milliseconds
  totalAnswerChanges: number;
  confidenceScore: number; // 0-100
  timeDistribution: Record<string, number>; // part percentages
}

export interface HesitationQuestion {
  questionNumber: number;
  answerChanges: number;
  timeToFirstAnswer: number; // milliseconds
  totalTimeSpent: number; // milliseconds
  finalAnswer: string; // A, B, C, D
  isCorrect: boolean;
  changeHistory: string[]; // answer sequence
}

export interface HesitationAnalysis {
  topHesitationQuestions: HesitationQuestion[];
  averageChangesPerQuestion: number;
  questionsWithMultipleChanges: number;
}

export interface AnswerChangePatterns {
  correctToIncorrect: number;
  incorrectToCorrect: number;
  incorrectToIncorrect: number;
}

export interface TimeAnalysis {
  partMetrics: PartTimeMetrics[];
  overallMetrics: OverallTimeMetrics;
  hesitationAnalysis: HesitationAnalysis;
  answerChangePatterns: AnswerChangePatterns;
}

export interface SkippedQuestionsAnalysis {
  skippedQuestions?: number[];
  skippedThenAnswered?: number[];
  neverAnswered?: number[];
}

// Aggregated performance by skill
export interface SkillPerformance {
  skillName: string;
  skillKey: string;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number; // percentage
  avgTime?: number; // average time spent on this skill
}

// Part-specific analysis
export interface PartAnalysis {
  partNumber: PartNumber;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  skillBreakdown: SkillPerformance[];
  contextualAnalysis?: {
    byDomain: Record<string, SkillPerformance>;
    byDifficulty: Record<string, SkillPerformance>;
  };
}

// Overall skill dimensions for radar chart
// Maps skill keys to accuracy percentages
export interface OverallSkillDimensions {
  GIST: number; // percentage
  DETAIL: number;
  INFERENCE: number;
  SPECIFIC_ACTION: number;
  GRAMMAR: number;
  VOCABULARY: number;
  COHESION: number;
  OTHERS: number;
}

// Domain performance tracking
export interface DomainPerformance {
  domain: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  isWeak: boolean;
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RepresentativeQuestion {
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface DiagnosisInsight {
  id: string;
  severity: SeverityLevel;
  skillKey: string;
  skillName: string;
  category: string;
  title: string;
  description: string;
  affectedParts: PartNumber[];
  userAccuracy: number;
  benchmarkAccuracy: number;
  impactScore: number;
  incorrectCount: number;
  totalCount: number;
  representativeQuestions: RepresentativeQuestion[];
  relatedPattern?: string;
}

export interface LearningResource {
  _id?: string;
  type:
    | 'video'
    | 'article'
    | 'flashcard'
    | 'drill'
    | 'vocabulary_set'
    | 'personalized_guide';
  title: string;
  description: string;
  url?: string;
  estimatedTime?: number; // minutes
  resourceId?: string;
  completed?: boolean;
  generatedContent?: {
    words?: Array<{
      word: string;
      partOfSpeech: string;
      definition: string;
      example: string;
      usageNote?: string;
    }>;
    sections?: Array<{
      heading: string;
      content: string;
    }>;
    quickTips?: string[];
  };
}

export interface WeaknessDrill {
  _id?: string;
  skillTags?: {
    skillCategory: string;
    specificSkills: string[];
  };
  title: string;
  description: string;
  totalQuestions: number;
  estimatedTime?: number; // minutes
  partNumbers?: PartNumber[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
  attempts?: number;
  id?: string;
  targetSkill?: string;
}

export interface StudyPlanItem {
  _id?: string;
  targetWeakness: {
    skillKey: string;
    skillName: string;
    severity: SeverityLevel;
  };
  priority: number; // 1, 2, 3
  title: string;
  description: string;
  skillsToImprove: string[];
  resources: LearningResource[];
  practiceDrills: WeaknessDrill[]; // Backend uses "practiceDrills"
  progress: number; // 0-100
  estimatedWeeks?: number; // Backend provides this
  // Legacy fields (kept for backward compatibility)
  id?: string;
  drills?: WeaknessDrill[];
}

// Study plan (from backend)
export interface StudyPlan {
  _id: string;
  userId: string;
  analysisResultId: string;
  planItems: StudyPlanItem[];
  overallProgress: number; // 0-100
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Analysis data structure (nested in ExamAnalysisResult)
export interface AnalysisData {
  overallSkills?: OverallSkillDimensions;
  partAnalyses?: PartAnalysis[];
  weaknesses?: DiagnosisInsight[]; // Legacy, kept for backward compatibility
  strengths?: string[];

  // Time analysis from backend
  timeAnalysis?: TimeAnalysis;

  // Backend actual structure (nested)
  examAnalysis?: {
    overallSkills: OverallSkillDimensions;
    partAnalyses: PartAnalysis[];
    topWeaknesses: DiagnosisInsight[]; // New field from backend
    weaknesses?: DiagnosisInsight[]; // Legacy, may still exist
    strengths: string[];
    weakDomains: string[];
    keyInsights: string[]; // New field: array of key insight strings
    domainPerformance: DomainPerformance[]; // New field: domain-level performance
    summary: string; // New field: overall summary text
    generatedAt: {
      $date: string;
    };
  };
}

// Complete exam analysis result
export interface ExamAnalysisResult {
  testResultId: string;
  userId: string;
  testId?: string;
  examDate: string | Date;

  listeningScore: number;
  readingScore: number;
  totalScore: number;

  analysis: AnalysisData;

  studyPlanId?: StudyPlan;

  createdAt?: string;
  updatedAt?: string;

  _id?: string;
  examAttemptId?: string;
  answers?: UserAnswer[];
  studyPlan?: StudyPlanItem[];

  overallSkills?: OverallSkillDimensions;
  partAnalyses?: PartAnalysis[];
  weaknesses?: DiagnosisInsight[];
  topWeaknesses?: DiagnosisInsight[];
  strengths?: string[];
  keyInsights?: string[];
  domainPerformance?: DomainPerformance[];
  summary?: string;
  timeAnalysis?: TimeAnalysis;
}

export interface AnalysisApiResponse {
  success: boolean;
  data: ExamAnalysisResult;
}
