import { useState, useEffect, useRef, type RefObject } from 'react';

interface SelectionState {
  selectedText: string;
  position: { x: number; y: number };
}

export const useTextSelection = (): {
  selectedText: string;
  selectionPosition: { x: number; y: number };
  handleMouseUp: () => void;
  handleMouseDown: () => void;
  clearSelection: () => void;
  containerRef: RefObject<HTMLElement | null>;
} => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const text = selection.toString();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setSelectionPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
      });
    }
  };

  const handleMouseDown = () => {
    // Clear selection when user starts new interaction
    if (selectedText) {
      setSelectedText('');
    }
  };

  // Clear selection when clicking outside container
  useEffect(() => {
    if (!selectedText) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking on SelectionMenu, Dialog, or container
      const isSelectionMenu = target.closest('[data-selection-menu]');
      const isDialog = target.closest('[role="dialog"]');
      const isContainer = containerRef.current?.contains(target);

      // Only close if clicking outside these elements
      if (!isSelectionMenu && !isDialog && !isContainer) {
        setSelectedText('');
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [selectedText]);

  const clearSelection = () => {
    setSelectedText('');
  };

  return {
    selectedText,
    selectionPosition,
    handleMouseUp,
    handleMouseDown,
    clearSelection,
    containerRef,
  };
};
