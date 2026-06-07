// Prompt builders for the admin test-authoring AI assistant.
import type { RunAiRequest } from './adminTestAiApi';

const CEFR = 'A1, A2, B1, B2, C1';

const PART_FORMAT: Record<number, string> = {
  1: `PART 1 (Photographs — LISTENING). Test-takers see ONLY a photo; the four statements (A-D) are spoken aloud and are NEVER printed on screen.
RULES: "questionText" MUST be null. Provide 4 options A-D but EACH option "text" MUST be an empty string "". Put the four spoken statements in "transcript" formatted as "(A) ... (B) ... (C) ... (D) ...". Put the Vietnamese translation of the four statements in "explanation". "correctAnswer" is the label (A-D) of the statement that best describes a realistic photo.`,
  2: `PART 2 (Question-Response — LISTENING). The prompt utterance and the three responses are spoken aloud and NEVER printed.
RULES: "questionText" MUST be null. Provide EXACTLY 3 options A, B, C and EACH option "text" MUST be an empty string "". Put the spoken prompt and the three responses in "transcript" formatted as "Q: ...\\n(A) ...\\n(B) ...\\n(C) ...". Put the Vietnamese translation in "explanation". "correctAnswer" is A, B or C.`,
  3: `PART 3 (Conversations — LISTENING). A 2-3 speaker conversation is spoken (it belongs in the GROUP transcript). Each question's text IS printed and has 4 printed options A-D.`,
  4: `PART 4 (Talks — LISTENING). A single-speaker talk/announcement is spoken (GROUP transcript). Each question's text IS printed and has 4 printed options A-D.`,
  5: `PART 5 (Incomplete Sentences — READING). "questionText" is ONE sentence containing a blank written as "____". Provide 4 printed options A-D (single words or short phrases).`,
  6: `PART 6 (Text Completion — READING). A short passage with numbered blanks is the GROUP context. Each question has 4 printed options A-D (one option may be a full sentence to insert).`,
  7: `PART 7 (Reading Comprehension — READING). One or more passages are the GROUP context. Each question's text IS printed and has 4 printed options A-D.`,
};

const partFormat = (part: number) => PART_FORMAT[part] ?? `PART ${part}.`;
const optionLabels = (part: number) => (part === 2 ? 'A, B, C' : 'A, B, C, D');
const isListeningBlankPart = (part: number) => part === 1 || part === 2;

// Skill taxonomy per part (mirrors backend models/questionMetadataModel.ts).
// Exported so the admin UI can render an editable skill-tag editor.
export const SKILL_TAXONOMY: Record<number, Record<string, string[]>> = {
  1: {
    skills: [
      'identifyActionInProgress',
      'identifyStateCondition',
      'identifySpatialRelationship',
    ],
    distractorTypes: ['phoneticSimilarity', 'wrongSubjectVerb'],
  },
  2: {
    questionForm: [
      'whQuestion',
      'yesNo',
      'tagQuestion',
      'statement',
      'alternative',
      'negativeQuestion',
    ],
    question_function: [
      'informationSeeking',
      'request',
      'suggestion',
      'offer',
      'opinion',
    ],
    responseStrategy: ['direct', 'indirect'],
  },
  3: {
    skillCategory: ['GIST', 'DETAIL', 'INFERENCE', 'SPECIFIC_ACTION', 'OTHERS'],
    skillDetail: [
      'mainTopic',
      'purpose',
      'problem',
      'specificDetail',
      'reasonCause',
      'amountQuantity',
      'inferSpeakerRole',
      'inferLocation',
      'inferImplication',
      'inferFeelingAttitude',
      'futureAction',
      'recommendedAction',
      'requestedAction',
      'speakerIntent',
      'connectToGraphic',
    ],
  },
  5: {
    grammarPoint: [
      'wordForm',
      'verbTenseMood',
      'subjectVerbAgreement',
      'pronoun',
      'preposition',
      'conjunction',
      'relativeClause',
      'comparativeSuperlative',
      'participle',
    ],
    vocabPoint: ['wordChoice', 'collocation', 'phrasalVerb'],
  },
  6: {
    tagType: [
      'grammar',
      'vocabulary',
      'sentenceInsertion',
      'discourseConnector',
    ],
  },
  7: { passageType: ['single', 'double', 'triple'] },
};
SKILL_TAXONOMY[4] = SKILL_TAXONOMY[3];

const DOMAINS =
  'business, office, finance, technology, education, healthcare, travel, hospitality, manufacturing, human_resources, marketing, customer_service, logistics, retail, real_estate, legal, daily_life, general';
const GENRES =
  'conversation, announcement, advertisement, email, letter, memo, article, report, form, notice, schedule, instruction, review, message, invoice, contract, manual';

const PREAMBLE =
  'You are an expert TOEIC Listening-Reading test writer and editor. Always respond with VALID JSON only, matching the requested schema exactly. Use natural, exam-realistic English.';

// Minimal question view passed into prompts.
export interface PromptQuestion {
  questionText?: string | null;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
  media?: { transcript?: string | null } | null;
}

const questionContext = (q: PromptQuestion): string => {
  const lines = [
    `Question: ${q.questionText || '(none / spoken)'}`,
    `Options:\n${q.options.map((o) => `${o.label}. ${o.text || '(blank)'}`).join('\n')}`,
    `Marked correct answer: ${q.correctAnswer}`,
  ];
  if (q.media?.transcript) lines.push(`Transcript: ${q.media.transcript}`);
  return lines.join('\n');
};

// --------------------------------------------------------------- Group A

export const buildGenerateQuestion = (input: {
  part: number;
  difficulty?: string;
  topic?: string;
  count?: number;
}): RunAiRequest => {
  const { part, difficulty = 'B1', topic, count = 1 } = input;
  const transcriptField = isListeningBlankPart(part)
    ? ', "transcript": string (the spoken lines)'
    : '';
  return {
    temperature: 0.7,
    prompt: `${PREAMBLE}
Generate ${count} brand-new question(s). Target CEFR: ${difficulty}.${topic ? ` Topic: ${topic}.` : ''}
${partFormat(part)}
Options labels: ${optionLabels(part)}. Make distractors plausible and the key unambiguous.
Return JSON: { "questions": [ { "questionText": string|null, "options": [{ "label": string, "text": string }], "correctAnswer": string, "explanation": string${transcriptField} } ] }`,
  };
};

export const buildGenerateGroup = (input: {
  part: number;
  difficulty?: string;
  topic?: string;
  numQuestions?: number;
}): RunAiRequest => {
  const { part, difficulty = 'B1', topic, numQuestions = 3 } = input;
  const isListening = part === 3 || part === 4;
  const contextField = isListening
    ? '"transcript": string (spoken script, speakers labeled e.g. "M:"/"W:")'
    : '"passageHtml": string (HTML of the reading passage)';
  return {
    temperature: 0.7,
    prompt: `${PREAMBLE}
Create ONE question group. Target CEFR: ${difficulty}.${topic ? ` Topic: ${topic}.` : ''}
${partFormat(part)}
Generate a coherent shared context plus ${numQuestions} linked questions (4 printed options A-D each) that can ONLY be answered using the context.
Return JSON: {
  "groupContext": { ${contextField}, "translation": string (Vietnamese translation of the context) },
  "questions": [ { "questionText": string, "options": [{ "label": "A"|"B"|"C"|"D", "text": string }], "correctAnswer": string, "explanation": string } ]
}`,
  };
};

export const buildGenerateDistractors = (input: {
  part: number;
  questionText?: string | null;
  correctOptionText: string;
}): RunAiRequest => {
  const { part, questionText, correctOptionText } = input;
  const num = part === 2 ? 2 : 3;
  const types = SKILL_TAXONOMY[part]?.distractorTypes;
  const typeClause = types
    ? ` Where relevant tag each with a "distractorType" from: ${types.join(', ')}.`
    : '';
  return {
    temperature: 0.6,
    prompt: `${PREAMBLE}
${partFormat(part)}
Question stem: ${questionText || '(none / spoken)'}
The CORRECT answer is: "${correctOptionText}".
Generate ${num} plausible WRONG options (distractors) a real learner might fall for but that are clearly incorrect to an expert, each grammatically consistent with the stem.${typeClause}
Return JSON: { "options": [ { "text": string, "distractorType": string|null } ] }`,
  };
};

export const buildGenerateExplanation = (q: PromptQuestion): RunAiRequest => ({
  temperature: 0.3,
  prompt: `${PREAMBLE}
Write a clear explanation (HTML, may use <b>, <ul>, <li>) for this question: why the correct answer is right and briefly why each other option is wrong. If options are blank (Part 1/2), explain using the transcript.
${questionContext(q)}
Return JSON: { "explanation": string }`,
});

export const buildImproveQuestion = (
  part: number,
  q: PromptQuestion
): RunAiRequest => ({
  temperature: 0.3,
  prompt: `${PREAMBLE}
${partFormat(part)}
Rewrite the following question for clarity, natural English and unambiguous keying, WITHOUT changing which option is correct or the tested point. Keep the same option labels and the same format rules for this part.
${questionContext(q)}
Return JSON: { "questionText": string, "options": [{ "label": string, "text": string }], "notes": string (what you changed, in Vietnamese) }`,
});

// --------------------------------------------------------------- Group B (merged QA)

export const buildReview = (part: number, q: PromptQuestion): RunAiRequest => ({
  temperature: 0.2,
  prompt: `${PREAMBLE}
You are doing QA on a TOEIC item. Do THREE things and return them together:
1) ANSWER CHECK: independently solve the question and choose the single best option WITHOUT being influenced by the marked answer. If you cannot determine it (e.g. Part 1 needs the photo), set "predictedAnswer" to null and "confidence" to 0.
2) DIFFICULTY: estimate the CEFR level, one of [${CEFR}].
3) PROOFREAD: list spelling/grammar/style issues in the printed text and transcript (do not change meaning).
${partFormat(part)}
${questionContext(q)}
Return JSON: {
  "predictedAnswer": string|null,
  "confidence": number,
  "answerRationale": string,
  "cefr": string,
  "difficultyRationale": string,
  "issues": [ { "type": "spelling"|"grammar"|"style", "original": string, "suggestion": string, "message": string } ]
}`,
});

// --------------------------------------------------------------- Group C (auto-tag)

export const buildAutoTag = (part: number, q: PromptQuestion): RunAiRequest => {
  const taxonomy = SKILL_TAXONOMY[part] ?? {};
  const taxonomyLines = Object.entries(taxonomy)
    .map(([field, values]) => `    "${field}": one of [${values.join(', ')}]`)
    .join(',\n');
  return {
    temperature: 0.2,
    prompt: `${PREAMBLE}
Classify this TOEIC item. Use null when unsure; only use the allowed values.
${partFormat(part)}
${questionContext(q)}
Return JSON: {
  "contentTags": {
    "difficulty": one of [${CEFR}],
    "domain": array of one or more of [${DOMAINS}],
    "genre": array of zero or more of [${GENRES}]
  },
  "skillTags": {
    "part": "${part}"${taxonomyLines ? ',\n' + taxonomyLines : ''}
  }
}`,
  };
};

// --------------------------------------------------------------- Group D (enrichment)

export const buildTranslate = (text: string): RunAiRequest => ({
  temperature: 0.2,
  prompt: `${PREAMBLE}
Translate the following English TOEIC content into natural Vietnamese. Preserve any HTML tags.
Text: """${text.slice(0, 8000)}"""
Return JSON: { "translation": string }`,
});

export const buildFormatTranscript = (transcript: string): RunAiRequest => ({
  temperature: 0.2,
  prompt: `${PREAMBLE}
Format the raw TOEIC listening transcript into clean HTML, each speaker turn on its own line with the speaker bolded (e.g. <strong>Man:</strong> ...). Do not change the words.
Transcript: """${transcript.slice(0, 8000)}"""
Return JSON: { "transcriptHtml": string }`,
});

export const buildExtractVocab = (
  text: string,
  difficulty?: string
): RunAiRequest => ({
  temperature: 0.2,
  prompt: `${PREAMBLE}
Extract the most useful/challenging vocabulary (max 12 items) from this TOEIC text${difficulty ? ` around CEFR ${difficulty}` : ''}.
Text: """${text.slice(0, 6000)}"""
Return JSON: { "words": [ { "word": string, "partOfSpeech": string, "meaning": string (Vietnamese), "example": string } ] }`,
});
