import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface AiSuggestion {
  id: string;
  title: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  /** Preview content built by the caller. */
  body: ReactNode;
  /** If present, an "Apply" button is shown. */
  onApply?: () => void;
  applyLabel?: string;
}

interface AiAssistContextValue {
  suggestion: AiSuggestion | null;
  show: (suggestion: AiSuggestion) => void;
  dismiss: () => void;
}

const AiAssistContext = createContext<AiAssistContextValue | null>(null);

export const AiAssistProvider = ({ children }: { children: ReactNode }) => {
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);

  const show = useCallback((s: AiSuggestion) => setSuggestion(s), []);
  const dismiss = useCallback(() => setSuggestion(null), []);

  return (
    <AiAssistContext.Provider value={{ suggestion, show, dismiss }}>
      {children}
    </AiAssistContext.Provider>
  );
};

export const useAiAssist = () => {
  const ctx = useContext(AiAssistContext);
  if (!ctx) {
    throw new Error('useAiAssist must be used within an AiAssistProvider');
  }
  return ctx;
};
