import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface PracticeDrillContextValue {
  saveAnswer: (questionNumber: number, answer: string) => void;
  getAnswer: (questionNumber: number) => string | null;
  isSubmitted: boolean;
}

export const PracticeDrillContext =
  createContext<PracticeDrillContextValue | null>(null);

export const PracticeDrillProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: PracticeDrillContextValue;
}) => {
  return (
    <PracticeDrillContext.Provider value={value}>
      {children}
    </PracticeDrillContext.Provider>
  );
};

export const usePracticeDrillContext = () => {
  const context = useContext(PracticeDrillContext);
  if (!context) {
    // Return empty functions if not in practice drill context
    return {
      saveAnswer: () => {},
      getAnswer: () => null,
      isSubmitted: false,
    };
  }
  return context;
};
