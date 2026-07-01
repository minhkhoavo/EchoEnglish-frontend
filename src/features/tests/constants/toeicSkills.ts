// Mirrors backend src/constants/toeicSkillCatalog.ts. Values are snake_case
// to match the actual skillTags stored on questions (see
// echoEnglish-frontend/src/features/lr-analyze/types/analysis.ts for the
// full taxonomy reference).

export interface ToeicPart {
  value: string;
  label: string;
  skills: { value: string; label: string }[];
}

export const TOEIC_PARTS: ToeicPart[] = [
  {
    value: '1',
    label: 'Part 1 – Photographs',
    skills: [
      { value: 'identify_action_in_progress', label: 'Action in progress' },
      { value: 'identify_state_condition', label: 'State / condition' },
      { value: 'identify_spatial_relationship', label: 'Spatial relationship' },
    ],
  },
  {
    value: '2',
    label: 'Part 2 – Question-Response',
    skills: [
      { value: 'wh_question', label: 'Wh- question' },
      { value: 'yes_no', label: 'Yes/No question' },
      { value: 'tag_question', label: 'Tag question' },
      { value: 'statement', label: 'Statement' },
      { value: 'alternative', label: 'Alternative question' },
      { value: 'negative_question', label: 'Negative question' },
      { value: 'information_seeking', label: 'Information seeking' },
      { value: 'request', label: 'Request' },
      { value: 'suggestion', label: 'Suggestion' },
      { value: 'offer', label: 'Offer' },
      { value: 'opinion', label: 'Opinion' },
    ],
  },
  {
    value: '3',
    label: 'Part 3 – Conversations',
    skills: [
      { value: 'main_topic', label: 'Main topic' },
      { value: 'purpose', label: 'Purpose' },
      { value: 'problem', label: 'Problem' },
      { value: 'specific_detail', label: 'Specific detail' },
      { value: 'reason_cause', label: 'Reason / cause' },
      { value: 'amount_quantity', label: 'Amount / quantity' },
      { value: 'infer_speaker_role', label: 'Infer speaker role' },
      { value: 'infer_location', label: 'Infer location' },
      { value: 'infer_implication', label: 'Infer implication' },
      { value: 'infer_feeling_attitude', label: 'Infer feeling / attitude' },
      { value: 'future_action', label: 'Future action' },
      { value: 'recommended_action', label: 'Recommended action' },
      { value: 'requested_action', label: 'Requested action' },
      { value: 'speaker_intent', label: 'Speaker intent' },
      { value: 'connect_to_graphic', label: 'Connect to graphic' },
    ],
  },
  {
    value: '4',
    label: 'Part 4 – Talks',
    skills: [
      { value: 'main_topic', label: 'Main topic' },
      { value: 'purpose', label: 'Purpose' },
      { value: 'problem', label: 'Problem' },
      { value: 'specific_detail', label: 'Specific detail' },
      { value: 'reason_cause', label: 'Reason / cause' },
      { value: 'amount_quantity', label: 'Amount / quantity' },
      { value: 'infer_speaker_role', label: 'Infer speaker role' },
      { value: 'infer_location', label: 'Infer location' },
      { value: 'infer_implication', label: 'Infer implication' },
      { value: 'infer_feeling_attitude', label: 'Infer feeling / attitude' },
      { value: 'future_action', label: 'Future action' },
      { value: 'recommended_action', label: 'Recommended action' },
      { value: 'requested_action', label: 'Requested action' },
      { value: 'speaker_intent', label: 'Speaker intent' },
      { value: 'connect_to_graphic', label: 'Connect to graphic' },
    ],
  },
  {
    value: '5',
    label: 'Part 5 – Incomplete Sentences',
    skills: [
      { value: 'word_form', label: 'Word form' },
      { value: 'verb_tense_mood', label: 'Verb tense / mood' },
      { value: 'subject_verb_agreement', label: 'Subject-verb agreement' },
      { value: 'pronoun', label: 'Pronoun' },
      { value: 'preposition', label: 'Preposition' },
      { value: 'conjunction', label: 'Conjunction' },
      { value: 'relative_clause', label: 'Relative clause' },
      { value: 'comparative_superlative', label: 'Comparative / superlative' },
      { value: 'participle', label: 'Participle' },
      { value: 'word_choice', label: 'Word choice' },
      { value: 'collocation', label: 'Collocation' },
      { value: 'phrasal_verb', label: 'Phrasal verb' },
    ],
  },
  {
    value: '6',
    label: 'Part 6 – Text Completion',
    skills: [
      { value: 'grammar', label: 'Grammar' },
      { value: 'vocabulary', label: 'Vocabulary' },
      { value: 'sentence_insertion', label: 'Sentence insertion' },
      { value: 'discourse_connector', label: 'Discourse connector' },
    ],
  },
  {
    value: '7',
    label: 'Part 7 – Reading Comprehension',
    skills: [
      { value: 'main_topic_purpose', label: 'Main topic / purpose' },
      { value: 'scanning', label: 'Scanning for details' },
      { value: 'paraphrasing', label: 'Paraphrasing' },
      { value: 'infer_implication', label: 'Infer implication' },
      { value: 'infer_author_purpose', label: "Infer author's purpose" },
      { value: 'vocabulary_in_context', label: 'Vocabulary in context' },
      { value: 'sentence_insertion', label: 'Sentence insertion' },
      { value: 'cross_reference', label: 'Cross-reference' },
    ],
  },
];

export const DEFAULT_QUESTION_LIMIT = 10;
export const MAX_QUESTION_LIMIT = 50;
