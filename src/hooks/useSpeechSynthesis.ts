import { useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Add error handling
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
      };

      utterance.onstart = () => {
        console.debug('Speech synthesis started');
      };

      utterance.onend = () => {
        console.debug('Speech synthesis ended');
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Failed to initialize speech synthesis:', error);
    }
  }, []);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn('Failed to cancel speech synthesis:', error);
      }
    }
  }, []);

  return { speak, cancel };
};
