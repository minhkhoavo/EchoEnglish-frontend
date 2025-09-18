import { api } from '@/core/api/api';
import type {
  SpeakingOverallResult,
  SpeakingPartResult,
  SpeakingQuestionResult,
  SpeakingResultStats,
} from '../types';

// Backend response types (minimal needed) — support both legacy {$oid,$date} and new string formats
type MaybeOID = string | { $oid: string };
type MaybeISO = string | { $date: string };

// New API: `result` is the score object containing scores, overallScore and feedback
type BackendScore = {
  provider: string;
  scoredAt: MaybeISO;
  scores: Record<string, number> & {
    pronunciation?: number;
    intonationAndStress?: number;
  };
  overallScore: number;
  feedback?: {
    summary?: string;
    strengths?: string[];
    areasForImprovement?: string[];
  };
};

type BackendQuestion = {
  questionNumber: number;
  promptText: string;
  promptImage: string | null;
  s3AudioUrl: string | null; // user's response audio
  recordingId: MaybeOID | null;
  // new API uses `result` only
  result?: BackendScore | null;
};

type BackendPart = {
  partIndex: number;
  partTitle: string;
  partDirection: { text: string };
  questionType:
    | 'speaking_part1'
    | 'speaking_part2'
    | 'speaking_part3'
    | 'speaking_part4'
    | 'speaking_part5';
  questions: BackendQuestion[];
};

type BackendSpeakingResult = {
  _id: MaybeOID;
  userId: MaybeOID;
  toeicSpeakingTestId: MaybeOID;
  testIdNumeric: number;
  submissionTimestamp: MaybeISO;
  status: string;
  parts: BackendPart[];
  createdAt: MaybeISO;
};

type BackendEnvelope = { message: string; data: BackendSpeakingResult };

// Icon mapping to our UI icons
const iconByPart: Record<BackendPart['questionType'], string> = {
  speaking_part1: 'pronunciation',
  speaking_part2: 'vocabulary',
  speaking_part3: 'fluency',
  speaking_part4: 'grammar',
  speaking_part5: 'intonation',
};

// Default max score per question by part and index (fallbacks)
function getQuestionMaxScore(
  partType: BackendPart['questionType'],
  idx: number
): number {
  switch (partType) {
    case 'speaking_part5':
      return 5;
    default:
      return 3;
  }
}

function getProficiencyFromPercent(
  pct: number
): SpeakingPartResult['proficiencyLevel'] {
  if (pct >= 90) return 'Expert';
  if (pct >= 75) return 'Advanced';
  if (pct >= 50) return 'Intermediate';
  return 'Beginner';
}

function getIdString(id?: MaybeOID | null): string | undefined {
  if (!id) return undefined;
  if (typeof id === 'string') return id;
  return id.$oid;
}

function getDateString(d?: MaybeISO | null): string {
  if (!d) return new Date().toISOString();
  if (typeof d === 'string') return d;
  return d.$date;
}

// Fill missing question scores using the first available scored question in the same part as a template
// Helper: extract the canonical BackendScore (supports either q.scores or q.result)
function extractScores(q: BackendQuestion): BackendScore | null {
  return q.result ?? null;
}

// Fill missing question scores using the first available scored question in the same part as a template
function fillMissingScoresTemplate(
  questions: BackendQuestion[]
): BackendQuestion[] {
  const template = questions.map(extractScores).find(Boolean) as
    | BackendScore
    | undefined;
  if (!template) return questions; // nothing to fill from

  return questions.map((q) => {
    const existing = extractScores(q);
    if (existing) return q;
    const placeholder: BackendScore = {
      provider: template.provider,
      scoredAt: new Date().toISOString(),
      scores: { ...template.scores },
      overallScore: 0, // keep numeric score zero for unscored
      feedback: {
        summary:
          'Awaiting scoring. This is placeholder feedback copied from a scored item for consistent structure.',
        strengths: template.feedback?.strengths || [],
        areasForImprovement: template.feedback?.areasForImprovement || [],
      },
    };
    // return only `result` (new API shape)
    return {
      ...q,
      result: placeholder,
    };
  });
}

function firstSentence(text?: string): string {
  if (!text) return '';
  const idx = text.indexOf('.');
  if (idx === -1) return text;
  return text.slice(0, idx + 1);
}

function calcStats(parts: SpeakingPartResult[]): SpeakingResultStats {
  const totalQuestions = parts.reduce((acc, p) => acc + p.questions.length, 0);
  const answeredQuestions = parts.reduce(
    (acc, p) => acc + p.questions.filter((q) => !!q.userResponseUrl).length,
    0
  );
  return {
    totalQuestions,
    answeredQuestions,
    averageResponseTime: 45,
    totalRecordingTime: answeredQuestions * 30,
  };
}

function transformSpeakingResult(input: BackendSpeakingResult): {
  result: SpeakingOverallResult;
  stats: SpeakingResultStats;
} {
  const parts: SpeakingPartResult[] = input.parts.map((p) => {
    const filledQuestions = fillMissingScoresTemplate(p.questions);
    const questions: SpeakingQuestionResult[] = filledQuestions.map(
      (q, idx) => {
        const maxScore = getQuestionMaxScore(p.questionType, idx);
        const scoresObj = extractScores(q);
        const score = scoresObj?.overallScore ?? 0;
        const pct = (score / maxScore) * 100;
        const feedbackSummary = scoresObj?.feedback?.summary;
        const strengths = scoresObj?.feedback?.strengths ?? [];
        const improvements = scoresObj?.feedback?.areasForImprovement ?? [];
        return {
          questionId: q.questionNumber,
          questionNumber: q.questionNumber,
          questionText: q.promptText,
          score,
          maxScore,
          proficiencyLevel: getProficiencyFromPercent(pct),
          audioUrl: undefined, // system audio (prompt) not provided here
          imageUrl: q.promptImage ?? undefined,
          userResponseUrl: q.s3AudioUrl ?? undefined,
          feedback: feedbackSummary ? [feedbackSummary] : [],
          strengths,
          improvements,
          title: p.partTitle,
          time_to_think: undefined,
          limit_time: undefined,
          idea: undefined,
          sample_answer: undefined,
        };
      }
    );

    const score = questions.reduce((acc, q) => acc + q.score, 0);
    const maxScore = questions.reduce((acc, q) => acc + q.maxScore, 0);
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const part: SpeakingPartResult = {
      partNumber: p.partIndex,
      partName: p.partTitle.replace(/^Question\s+\d+(?:-\d+)?:\s*/i, '').trim(),
      description:
        firstSentence(p.partDirection?.text) || 'TOEIC speaking task',
      questionsCount: p.questions.length,
      score,
      maxScore,
      proficiencyLevel: getProficiencyFromPercent(pct),
      strengths: [],
      improvements: [],
      icon: iconByPart[p.questionType] || 'pronunciation',
      questions,
    };
    return part;
  });

  const overallScore = parts.reduce((acc, p) => acc + p.score, 0);
  const maxOverallScore = parts.reduce((acc, p) => acc + p.maxScore, 0);

  const testDateIso = getDateString(
    input.createdAt ?? input.submissionTimestamp
  );
  const result: SpeakingOverallResult = {
    overallScore,
    maxOverallScore,
    proficiencyLevel: getProficiencyFromPercent(
      maxOverallScore ? (overallScore / maxOverallScore) * 100 : 0
    ),
    testDate: testDateIso,
    testDuration: 20,
    testTitle: `TOEIC Speaking Test #${input.testIdNumeric}`,
    completionRate: (() => {
      const total = parts.reduce((acc, p) => acc + p.questions.length, 0);
      const answered = parts.reduce(
        (acc, p) => acc + p.questions.filter((q) => !!q.userResponseUrl).length,
        0
      );
      return total ? Math.round((answered / total) * 100) : 0;
    })(),
    parts,
  };

  const stats = calcStats(parts);
  return { result, stats };
}

export const speakingResultApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingResultById: builder.query<
      { result: SpeakingOverallResult; stats: SpeakingResultStats },
      { id: string }
    >({
      query: ({ id }) => ({ url: `/speaking/result/${id}`, method: 'GET' }),
      transformResponse: (
        response: BackendSpeakingResult | BackendEnvelope
      ) => {
        const isEnvelope = (
          r: BackendSpeakingResult | BackendEnvelope
        ): r is BackendEnvelope =>
          typeof (r as BackendEnvelope).message === 'string' &&
          typeof (r as BackendEnvelope).data === 'object';
        const payload: BackendSpeakingResult = isEnvelope(response)
          ? response.data
          : response;
        return transformSpeakingResult(payload);
      },
      providesTags: (_res, _err, arg) => [
        { type: 'SpeakingTest', id: arg.id } as const,
      ],
    }),
  }),
});

export const { useGetSpeakingResultByIdQuery } = speakingResultApi;
