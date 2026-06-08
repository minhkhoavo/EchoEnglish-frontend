export interface PracticeDrillOption {
  label: string;
  text: string;
}

export interface PracticeDrillQuestion {
  questionNumber: number;
  questionText: string | null;
  options: PracticeDrillOption[];
  correctAnswer: string;
  explanation: string;
  media?: {
    audioUrl?: string;
    transcript?: string;
    imageUrls?: string[];
  };
  contentTags: {
    difficulty: string;
  };
  skillTags: {
    part: string;
  };
  _id: {
    $oid: string;
  };
  groupId?: {
    $oid: string;
  };
}

export interface PracticeDrillGroupContext {
  audioUrl?: string;
  transcript?: string;
  translation?: string;
  imageUrls?: string[];
  passageHtml?: string;
}

export interface PracticeDrillQuestionGroup {
  groupContext: PracticeDrillGroupContext;
  questions: PracticeDrillQuestion[];
}

export interface PracticeDrillPart {
  partName: string;
  questions?: PracticeDrillQuestion[];
  questionGroups?: PracticeDrillQuestionGroup[];
}

export interface PracticeDrillData {
  title: string;
  parts: PracticeDrillPart[];
}
