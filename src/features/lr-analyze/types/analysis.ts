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

// Question attempt detail for pattern analysis
export interface QuestionAttemptDetail {
  questionId: string;
  questionNumber: number;
  partNumber: PartNumber;
  skillTested: string;
  isCorrect: boolean;
  timeSpent?: number; // seconds
  changes?: number; // number of answer changes
  skipped?: boolean;
}

// Time-based answer patterns
export type AnswerPattern =
  | 'quick_correct' // Fast + Correct (mastered)
  | 'slow_correct' // Slow + Correct (not familiar)
  | 'quick_incorrect' // Fast + Wrong (misunderstanding)
  | 'slow_incorrect'; // Slow + Wrong (confused)

export interface TimeBasedAnalysis {
  pattern: AnswerPattern;
  count: number;
  percentage: number;
  avgTime: number;
  description: string;
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
export interface OverallSkillDimensions {
  GIST: number; // percentage
  DETAIL: number;
  INFERENCE: number;
  GRAMMAR: number;
  VOCABULARY: number;
  COHESION: number;
}

// Weakness severity levels
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

// Diagnosis insight
export interface DiagnosisInsight {
  id: string;
  severity: SeverityLevel;
  category: string;
  title: string;
  description: string;
  affectedParts: PartNumber[];
  userAccuracy: number;
  impactScore: number; // 0-100, how much this affects overall score
  relatedPattern?: AnswerPattern; // Related time-based pattern
}

// Learning resource
export interface LearningResource {
  id: string;
  type: 'video' | 'article' | 'flashcard' | 'drill';
  title: string;
  description: string;
  url?: string;
}

// Weakness drill
export interface WeaknessDrill {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  totalQuestions: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Study plan item
export interface StudyPlanItem {
  id: string;
  priority: number; // 1, 2, 3
  title: string;
  description: string;
  targetWeakness: string;
  skillsToImprove: string[];
  resources: LearningResource[];
  drills: WeaknessDrill[];
  progress: number; // 0-100
}

// Complete exam analysis result
export interface ExamAnalysisResult {
  examAttemptId: string;
  userId: string;
  examDate: Date;

  // Overall scores
  listeningScore: number;
  readingScore: number;
  totalScore: number;

  // All user answers
  answers: UserAnswer[];

  // Aggregated analysis
  overallSkills: OverallSkillDimensions;
  partAnalyses: PartAnalysis[];

  // Time-based patterns
  timeAnalysis: TimeBasedAnalysis[];

  // Diagnosis
  weaknesses: DiagnosisInsight[];
  strengths: string[]; // List of strong skills

  // Study plan
  studyPlan: StudyPlanItem[];

  // Question attempt details for pattern analysis
  questionAttempts: QuestionAttemptDetail[];
}

// Mock data generator helpers
export interface MockAnalysisOptions {
  includeWeaknesses?: boolean;
  weaknessAreas?: string[];
  overallLevel?: 'low' | 'medium' | 'high';
}
