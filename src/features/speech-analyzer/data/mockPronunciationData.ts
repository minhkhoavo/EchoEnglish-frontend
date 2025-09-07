import type {
  TranscriptData,
  WordPronunciation,
  TranscriptSegment,
} from '../types/pronunciation.types';

export const createMockTranscriptData = (): TranscriptData => {
  const mockWords1: WordPronunciation[] = [
    {
      word: 'the',
      accuracy: 30,
      offset: 1500,
      duration: 200,
      phonemes: [
        {
          phoneme: 'ð',
          accuracy: 0,
          offset: 1500,
          duration: 0,
          expectedPhoneme: 'ð',
          actualPhoneme: '',
          isCorrect: false,
        },
        { phoneme: 'ə', accuracy: 60, offset: 1700, duration: 100 },
      ],
      errors: [
        {
          type: 'omission',
          description: "The 'th' sound was omitted",
          expectedPhoneme: 'ð',
          actualPhoneme: '',
          confidence: 90,
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 45,
      expectedPronunciation: '/ðə/',
      actualPronunciation: '/ə/',
    },
    {
      word: 'I',
      accuracy: 45,
      offset: 2000,
      duration: 300,
      phonemes: [
        {
          phoneme: 'aɪ',
          accuracy: 45,
          offset: 2000,
          duration: 300,
          expectedPhoneme: 'aɪ',
          actualPhoneme: 'ʌɪ',
          isCorrect: false,
        },
      ],
      errors: [
        {
          type: 'mispronunciation',
          description: 'The vowel sound needs improvement',
          expectedPhoneme: 'aɪ',
          actualPhoneme: 'ʌɪ',
          confidence: 85,
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 78,
      expectedPronunciation: '/aɪ/',
      actualPronunciation: '/ʌɪ/',
      pronunciationReference: 'EYE',
      syllables: [{ syllable: 'I', stress: false, accuracy: 45 }],
    },
    {
      word: 'really',
      accuracy: 35,
      offset: 2400,
      duration: 400,
      phonemes: [
        { phoneme: 'r', accuracy: 40, offset: 2400, duration: 100 },
        { phoneme: 'ɪ', accuracy: 30, offset: 2500, duration: 150 },
        { phoneme: 'ə', accuracy: 35, offset: 2650, duration: 100 },
        { phoneme: 'l', accuracy: 40, offset: 2750, duration: 100 },
        { phoneme: 'i', accuracy: 30, offset: 2850, duration: 100 },
      ],
      errors: [
        {
          type: 'insertion',
          severity: 'medium',
          description: "Extra word 'really' was inserted",
          confidence: 82,
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 55,
      expectedPronunciation: '',
      actualPronunciation: '/ˈrɪəli/',
      pronunciationReference: 'really',
    },
    {
      word: 'need',
      accuracy: 55,
      offset: 2900,
      duration: 600,
      phonemes: [
        { phoneme: 'n', accuracy: 85, offset: 2900, duration: 150 },
        { phoneme: 'iː', accuracy: 35, offset: 3050, duration: 300 },
        { phoneme: 'd', accuracy: 65, offset: 3350, duration: 150 },
      ],
      errors: [
        {
          type: 'unexpected_break',
          severity: 'low',
          description: "Unexpected pause before 'need'",
          confidence: 75,
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 82,
      syllables: [{ syllable: 'need', stress: true, accuracy: 55 }],
    },
    {
      word: 'English',
      accuracy: 72,
      offset: 3200,
      duration: 800,
      phonemes: [
        { phoneme: 'ɪ', accuracy: 80, offset: 3200, duration: 200 },
        { phoneme: 'ŋ', accuracy: 60, offset: 3400, duration: 150 },
        { phoneme: 'ɡ', accuracy: 70, offset: 3550, duration: 100 },
        { phoneme: 'l', accuracy: 85, offset: 3650, duration: 150 },
        { phoneme: 'ɪ', accuracy: 75, offset: 3800, duration: 150 },
        { phoneme: 'ʃ', accuracy: 65, offset: 3950, duration: 150 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'low',
          description: "The 'ng' sound could be clearer",
          suggestion: "Practice the 'ŋ' sound at the back of the tongue",
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 88,
      syllables: [
        { syllable: 'Eng', stress: true, accuracy: 75 },
        { syllable: 'lish', stress: false, accuracy: 70 },
      ],
    },
    {
      word: 'need',
      accuracy: 55,
      offset: 2500,
      duration: 600,
      phonemes: [
        { phoneme: 'n', accuracy: 85, offset: 2500, duration: 150 },
        { phoneme: 'iː', accuracy: 35, offset: 2650, duration: 300 },
        { phoneme: 'd', accuracy: 65, offset: 2950, duration: 150 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'high',
          description: "The long 'ee' sound is not clear enough",
          suggestion: "Hold the 'iː' sound longer and clearer",
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 82,
      syllables: [{ syllable: 'need', stress: true, accuracy: 55 }],
    },
    {
      word: 'practice',
      accuracy: 65,
      offset: 3200,
      duration: 750,
      phonemes: [
        {
          phoneme: 'p',
          accuracy: 85,
          offset: 3200,
          duration: 100,
          expectedPhoneme: 'p',
          actualPhoneme: 'p',
          isCorrect: true,
        },
        {
          phoneme: 'ɹ',
          accuracy: 0,
          offset: 3300,
          duration: 0,
          expectedPhoneme: 'ɹ',
          actualPhoneme: '',
          isCorrect: false,
        },
        {
          phoneme: 'æ',
          accuracy: 70,
          offset: 3300,
          duration: 200,
          expectedPhoneme: 'æ',
          actualPhoneme: 'æ',
          isCorrect: true,
        },
        {
          phoneme: 'k',
          accuracy: 80,
          offset: 3500,
          duration: 150,
          expectedPhoneme: 'k',
          actualPhoneme: 'k',
          isCorrect: true,
        },
        {
          phoneme: 't',
          accuracy: 75,
          offset: 3650,
          duration: 100,
          expectedPhoneme: 't',
          actualPhoneme: 't',
          isCorrect: true,
        },
        {
          phoneme: 'ɪ',
          accuracy: 65,
          offset: 3750,
          duration: 100,
          expectedPhoneme: 'ɪ',
          actualPhoneme: 'ɪ',
          isCorrect: true,
        },
        {
          phoneme: 's',
          accuracy: 70,
          offset: 3850,
          duration: 100,
          expectedPhoneme: 's',
          actualPhoneme: 's',
          isCorrect: true,
        },
      ],
      errors: [
        {
          type: 'omission',
          severity: 'medium',
          description: "The 'r' sound was omitted",
          suggestion: "Include the 'r' sound after 'p'",
          expectedPhoneme: 'ɹ',
          actualPhoneme: '',
          confidence: 92,
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 70,
      expectedPronunciation: '/ˈpɹæk.tɪs/',
      actualPronunciation: '/ˈpæk.tɪs/',
      pronunciationReference: 'PRAK-tis',
      syllables: [
        { syllable: 'prac', stress: true, accuracy: 65 },
        { syllable: 'tice', stress: false, accuracy: 70 },
      ],
    },
    {
      word: 'to',
      accuracy: 88,
      offset: 4100,
      duration: 300,
      phonemes: [
        { phoneme: 't', accuracy: 90, offset: 4100, duration: 100 },
        { phoneme: 'uː', accuracy: 85, offset: 4200, duration: 200 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 95,
      syllables: [{ syllable: 'to', stress: false, accuracy: 88 }],
    },
    {
      word: 'continue',
      accuracy: 65,
      offset: 4500,
      duration: 900,
      phonemes: [
        { phoneme: 'k', accuracy: 80, offset: 4500, duration: 100 },
        { phoneme: 'ə', accuracy: 70, offset: 4600, duration: 150 },
        { phoneme: 'n', accuracy: 85, offset: 4750, duration: 100 },
        { phoneme: 't', accuracy: 50, offset: 4850, duration: 100 },
        { phoneme: 'ɪ', accuracy: 60, offset: 4950, duration: 150 },
        { phoneme: 'n', accuracy: 75, offset: 5100, duration: 100 },
        { phoneme: 'j', accuracy: 40, offset: 5200, duration: 100 },
        { phoneme: 'uː', accuracy: 70, offset: 5300, duration: 100 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'medium',
          description: "The 't' and 'y' sounds need improvement",
          suggestion: 'Practice the transition between syllables',
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 75,
      syllables: [
        { syllable: 'con', stress: false, accuracy: 70 },
        { syllable: 'tin', stress: true, accuracy: 55 },
        { syllable: 'ue', stress: false, accuracy: 70 },
      ],
    },
    {
      word: 'my',
      accuracy: 92,
      offset: 5500,
      duration: 400,
      phonemes: [
        { phoneme: 'm', accuracy: 95, offset: 5500, duration: 150 },
        { phoneme: 'aɪ', accuracy: 90, offset: 5650, duration: 250 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 97,
      syllables: [{ syllable: 'my', stress: false, accuracy: 92 }],
    },
    {
      word: 'work',
      accuracy: 85,
      offset: 6000,
      duration: 500,
      phonemes: [
        { phoneme: 'w', accuracy: 90, offset: 6000, duration: 100 },
        { phoneme: 'ɜː', accuracy: 80, offset: 6100, duration: 300 },
        { phoneme: 'k', accuracy: 85, offset: 6400, duration: 100 },
      ],
      errors: [],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 90,
      syllables: [{ syllable: 'work', stress: true, accuracy: 85 }],
    },
    {
      word: 'in',
      accuracy: 58,
      offset: 6600,
      duration: 300,
      phonemes: [
        { phoneme: 'ɪ', accuracy: 65, offset: 6600, duration: 150 },
        { phoneme: 'n', accuracy: 50, offset: 6750, duration: 150 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'medium',
          description: "The short 'i' sound is not clear",
          suggestion: "Make the 'ɪ' sound more distinct",
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 70,
      syllables: [{ syllable: 'in', stress: false, accuracy: 58 }],
    },
    {
      word: 'software',
      accuracy: 48,
      offset: 7000,
      duration: 800,
      phonemes: [
        {
          phoneme: 's',
          accuracy: 70,
          offset: 7000,
          duration: 100,
          expectedPhoneme: 's',
          actualPhoneme: 's',
          isCorrect: true,
        },
        {
          phoneme: 'ɒ',
          accuracy: 35,
          offset: 7100,
          duration: 150,
          expectedPhoneme: 'ɔː',
          actualPhoneme: 'ɒ',
          isCorrect: false,
        },
        {
          phoneme: 'f',
          accuracy: 80,
          offset: 7250,
          duration: 100,
          expectedPhoneme: 'f',
          actualPhoneme: 'f',
          isCorrect: true,
        },
        {
          phoneme: 't',
          accuracy: 40,
          offset: 7350,
          duration: 100,
          expectedPhoneme: 't',
          actualPhoneme: 't',
          isCorrect: true,
        },
        {
          phoneme: 'w',
          accuracy: 60,
          offset: 7450,
          duration: 100,
          expectedPhoneme: 'w',
          actualPhoneme: 'w',
          isCorrect: true,
        },
        {
          phoneme: 'eə',
          accuracy: 30,
          offset: 7550,
          duration: 250,
          expectedPhoneme: 'ɛər',
          actualPhoneme: 'eə',
          isCorrect: false,
        },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'high',
          description: 'Multiple pronunciation issues throughout the word',
          suggestion: 'Break down the word: SOFT-WARE and practice each part',
          expectedPhoneme: 'ɔː',
          actualPhoneme: 'ɒ',
          confidence: 88,
        },
        {
          type: 'missing_break',
          severity: 'medium',
          description: "Syllable break not clear between 'soft' and 'ware'",
          suggestion: 'Add clearer separation between syllables',
          expectedPhoneme: '',
          actualPhoneme: '',
          confidence: 75,
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 65,
      expectedPronunciation: '/ˈsɔːft.wɛər/',
      actualPronunciation: '/ˈsɒft.weə/',
      pronunciationReference: 'SAWFT-wair',
      syllables: [
        { syllable: 'soft', stress: true, accuracy: 55 },
        { syllable: 'ware', stress: false, accuracy: 40 },
      ],
    },
    {
      word: 'engineer',
      accuracy: 78,
      offset: 7900,
      duration: 900,
      phonemes: [
        { phoneme: 'e', accuracy: 85, offset: 7900, duration: 150 },
        { phoneme: 'n', accuracy: 80, offset: 8050, duration: 100 },
        { phoneme: 'dʒ', accuracy: 70, offset: 8150, duration: 150 },
        { phoneme: 'ɪ', accuracy: 75, offset: 8300, duration: 100 },
        { phoneme: 'n', accuracy: 85, offset: 8400, duration: 100 },
        { phoneme: 'ɪə', accuracy: 70, offset: 8500, duration: 300 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 82,
      syllables: [
        { syllable: 'en', stress: false, accuracy: 80 },
        { syllable: 'gi', stress: false, accuracy: 72 },
        { syllable: 'neer', stress: true, accuracy: 75 },
      ],
    },
  ];

  const mockWords2: WordPronunciation[] = [
    {
      word: 'And',
      accuracy: 95,
      offset: 9000,
      duration: 300,
      phonemes: [
        { phoneme: 'æ', accuracy: 95, offset: 9000, duration: 150 },
        { phoneme: 'n', accuracy: 95, offset: 9150, duration: 100 },
        { phoneme: 'd', accuracy: 95, offset: 9250, duration: 50 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 98,
      syllables: [{ syllable: 'And', stress: false, accuracy: 95 }],
    },
    // Demo từ với missing break error - màu xanh dương
    {
      word: 'alotof',
      accuracy: 45,
      offset: 9300,
      duration: 600,
      phonemes: [
        { phoneme: 'ə', accuracy: 70, offset: 9300, duration: 100 },
        { phoneme: 'l', accuracy: 60, offset: 9400, duration: 100 },
        { phoneme: 'ɒ', accuracy: 50, offset: 9500, duration: 100 },
        { phoneme: 't', accuracy: 40, offset: 9600, duration: 100 },
        { phoneme: 'ɒ', accuracy: 30, offset: 9700, duration: 100 },
        { phoneme: 'v', accuracy: 40, offset: 9800, duration: 100 },
      ],
      errors: [
        {
          type: 'missing_break',
          severity: 'high',
          description: "Missing word boundaries between 'a lot of'",
          confidence: 85,
        },
      ],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 60,
      expectedPronunciation: '/ə lɒt ɒv/',
      actualPronunciation: '/əlɒtɒv/',
      pronunciationReference: 'a lot of',
    },
    {
      word: 'develop',
      accuracy: 62,
      offset: 9400,
      duration: 700,
      phonemes: [
        { phoneme: 'd', accuracy: 80, offset: 9400, duration: 100 },
        { phoneme: 'ɪ', accuracy: 55, offset: 9500, duration: 150 },
        { phoneme: 'v', accuracy: 70, offset: 9650, duration: 100 },
        { phoneme: 'e', accuracy: 50, offset: 9750, duration: 150 },
        { phoneme: 'l', accuracy: 65, offset: 9900, duration: 100 },
        { phoneme: 'ə', accuracy: 60, offset: 10000, duration: 100 },
        { phoneme: 'p', accuracy: 45, offset: 10100, duration: 100 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'medium',
          description: 'Stress placement and vowel sounds need work',
          suggestion: 'Stress the first syllable: DE-vel-op',
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 73,
      syllables: [
        { syllable: 'de', stress: true, accuracy: 65 },
        { syllable: 'vel', stress: false, accuracy: 58 },
        { syllable: 'op', stress: false, accuracy: 53 },
      ],
    },
    {
      word: 'my',
      accuracy: 88,
      offset: 10200,
      duration: 400,
      phonemes: [
        { phoneme: 'm', accuracy: 90, offset: 10200, duration: 150 },
        { phoneme: 'aɪ', accuracy: 85, offset: 10350, duration: 250 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: true, // This is a duplicate of "my" from first segment
      confidenceScore: 92,
      syllables: [{ syllable: 'my', stress: false, accuracy: 88 }],
    },
    {
      word: 'career',
      accuracy: 58,
      offset: 10700,
      duration: 600,
      phonemes: [
        { phoneme: 'k', accuracy: 75, offset: 10700, duration: 100 },
        { phoneme: 'ə', accuracy: 50, offset: 10800, duration: 150 },
        { phoneme: 'r', accuracy: 40, offset: 10950, duration: 100 },
        { phoneme: 'ɪə', accuracy: 60, offset: 11050, duration: 250 },
      ],
      errors: [
        {
          type: 'mispronunciation',
          severity: 'high',
          description: "The 'r' sound and stress pattern are incorrect",
          suggestion:
            "Practice the American 'r' sound and stress the second syllable",
        },
      ],
      isStressed: true,
      isDuplicated: false,
      confidenceScore: 68,
      syllables: [
        { syllable: 'ca', stress: false, accuracy: 62 },
        { syllable: 'reer', stress: true, accuracy: 50 },
      ],
    },
    {
      word: 'path',
      accuracy: 82,
      offset: 11400,
      duration: 400,
      phonemes: [
        { phoneme: 'p', accuracy: 85, offset: 11400, duration: 100 },
        { phoneme: 'æ', accuracy: 80, offset: 11500, duration: 200 },
        { phoneme: 'θ', accuracy: 80, offset: 11700, duration: 100 },
      ],
      errors: [],
      isStressed: false,
      isDuplicated: false,
      confidenceScore: 87,
      syllables: [{ syllable: 'path', stress: false, accuracy: 82 }],
    },
  ];

  const segment1: TranscriptSegment = {
    id: 'segment-1',
    startTime: 1500,
    endTime: 8800,
    text: '[the] I [+] really | need English to continue my work in software engineer.',
    words: mockWords1,
    overallAccuracy: 69,
  };

  const segment2: TranscriptSegment = {
    id: 'segment-2',
    startTime: 9000,
    endTime: 11800,
    text: 'And alotof develop my career path.',
    words: mockWords2,
    overallAccuracy: 77,
  };

  return {
    audioUrl:
      'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a', // Working short audio
    segments: [segment1, segment2],
    metadata: {
      duration: 15000, // 15 seconds
      language: 'English (US)',
      assessmentType: 'pronunciation',
      createdAt: new Date().toISOString(),
    },
    advancedFeatures: {
      rhythm: {
        score: 72,
        pattern: [1.2, 0.8, 1.5, 0.9, 1.1, 0.7, 1.3],
      },
      intonation: {
        score: 68,
        contour: [100, 120, 110, 140, 130, 90, 95],
      },
      fluency: {
        score: 75,
        pauseLocations: [8800], // Pause between segments
        speechRate: 3.2, // words per second
      },
    },
  };
};

// Additional mock data for different scenarios
export const createMockDataWithErrors = (): TranscriptData => {
  const data = createMockTranscriptData();

  // Example 1: Insertion error
  data.segments[0].words[1].errors.push({
    type: 'insertion',
    severity: 'medium',
    description: "Extra sound detected before 'need'",
    suggestion: 'Avoid adding unnecessary sounds at the beginning',
    expectedPhoneme: '',
    actualPhoneme: 'ə',
    confidence: 87,
    errorDetails: {
      phonePosition: 0,
      phoneLength: 100,
    },
  });

  // Example 2: Omission error (already exists, let's enhance it)
  const omissionWord = data.segments[0].words.find(
    (w) => w.word === 'practice'
  );
  if (omissionWord) {
    omissionWord.errors = [
      {
        type: 'omission',
        severity: 'high',
        description: "The 'r' sound was omitted after 'p'",
        suggestion: "Practice the 'pr' consonant cluster: PRactice",
        expectedPhoneme: 'ɹ',
        actualPhoneme: '',
        confidence: 92,
        errorDetails: {
          phonePosition: 1,
          phoneLength: 0,
          syllablePosition: 0,
        },
      },
    ];
  }

  // Example 3: Unexpected break error
  data.segments[0].words.push({
    word: 'together',
    accuracy: 45,
    offset: 8900,
    duration: 1200,
    phonemes: [
      { phoneme: 't', accuracy: 80, offset: 8900, duration: 100 },
      { phoneme: 'ə', accuracy: 70, offset: 9000, duration: 150 },
      { phoneme: 'ɡ', accuracy: 60, offset: 9300, duration: 100 }, // Break here
      { phoneme: 'e', accuracy: 50, offset: 9500, duration: 150 },
      { phoneme: 'ð', accuracy: 40, offset: 9650, duration: 100 },
      { phoneme: 'ə', accuracy: 45, offset: 9750, duration: 150 },
    ],
    errors: [
      {
        type: 'unexpected_break',
        severity: 'medium',
        description: 'Unexpected pause detected in the middle of the word',
        suggestion: "Say 'together' as one continuous word without pausing",
        confidence: 78,
        errorDetails: {
          pauseDuration: 200,
          phonePosition: 2,
        },
      },
    ],
    isStressed: false,
    isDuplicated: false,
    confidenceScore: 65,
    expectedPronunciation: '/təˈɡeðər/',
    actualPronunciation: '/tə ˈɡeðər/',
    pronunciationReference: 'tuh-GETH-er',
  });

  // Example 4: Missing break error
  data.segments[1].words.push({
    word: 'thank',
    accuracy: 52,
    offset: 11900,
    duration: 400,
    phonemes: [
      { phoneme: 'θ', accuracy: 70, offset: 11900, duration: 150 },
      { phoneme: 'æ', accuracy: 45, offset: 12050, duration: 150 },
      { phoneme: 'ŋ', accuracy: 40, offset: 12200, duration: 100 },
    ],
    errors: [],
    isStressed: false,
    isDuplicated: false,
    confidenceScore: 70,
    expectedPronunciation: '/θæŋk/',
    actualPronunciation: '/θæŋk/',
    pronunciationReference: 'thank',
  });

  data.segments[1].words.push({
    word: 'you',
    accuracy: 48,
    offset: 12300,
    duration: 300,
    phonemes: [
      { phoneme: 'j', accuracy: 50, offset: 12300, duration: 100 },
      { phoneme: 'uː', accuracy: 45, offset: 12400, duration: 200 },
    ],
    errors: [
      {
        type: 'missing_break',
        severity: 'low',
        description: "Missing pause between 'thank' and 'you'",
        suggestion: "Add a slight pause between words: 'thank ... you'",
        confidence: 72,
        errorDetails: {
          pauseDuration: 0,
          phonePosition: 0,
        },
      },
    ],
    isStressed: false,
    isDuplicated: false,
    confidenceScore: 68,
    expectedPronunciation: '/juː/',
    actualPronunciation: '/juː/',
    pronunciationReference: 'you',
  });

  // Example 5: Monotone error
  data.segments[1].words.push({
    word: 'speaking',
    accuracy: 35,
    offset: 12700,
    duration: 800,
    phonemes: [
      { phoneme: 's', accuracy: 70, offset: 12700, duration: 100 },
      { phoneme: 'p', accuracy: 65, offset: 12800, duration: 100 },
      { phoneme: 'iː', accuracy: 25, offset: 12900, duration: 200 },
      { phoneme: 'k', accuracy: 60, offset: 13100, duration: 100 },
      { phoneme: 'ɪ', accuracy: 30, offset: 13200, duration: 150 },
      { phoneme: 'ŋ', accuracy: 40, offset: 13350, duration: 150 },
    ],
    errors: [
      {
        type: 'monotone',
        severity: 'high',
        description: 'Speech lacks natural intonation and rhythm variation',
        suggestion:
          'Practice varying your pitch and stress: SPEAK-ing with rising intonation',
        confidence: 85,
        errorDetails: {
          intonationScore: 25,
          stressAccuracy: 30,
          fluencyScore: 20,
        },
      },
    ],
    isStressed: true,
    isDuplicated: false,
    confidenceScore: 45,
    expectedPronunciation: '/ˈspiːkɪŋ/',
    actualPronunciation: '/spiːkɪŋ/',
    pronunciationReference: 'SPEAK-ing',
  });

  // Update segment text and timing
  data.segments[0].text =
    'I need English to continue my work in software engineer together.';
  data.segments[0].endTime = 9100;

  data.segments[1].text = 'And develop my career path. Thank you speaking.';
  data.segments[1].endTime = 13500;

  // Update overall accuracy scores
  data.segments[0].overallAccuracy = 58; // Lower due to more errors
  data.segments[1].overallAccuracy = 52; // Lower due to more errors

  return data;
};

export const createExcellentPronunciationData = (): TranscriptData => {
  const data = createMockTranscriptData();
  data.segments.forEach((segment) => {
    segment.overallAccuracy = Math.min(95, segment.overallAccuracy + 25);
    segment.words.forEach((word) => {
      word.accuracy = Math.min(98, word.accuracy + 30);
      word.errors = [];
      word.phonemes.forEach((phoneme) => {
        phoneme.accuracy = Math.min(100, phoneme.accuracy + 25);
      });
    });
  });

  return data;
};
