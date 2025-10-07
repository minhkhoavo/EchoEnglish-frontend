import React from 'react';

interface TestPartSidebarProps {
  parts: Array<{ id: number | string; title: string; offset: number }>;
  currentPartIndex: number;
  setCurrentPartIndex: (index: number) => void;
}

export const TestPartSidebar: React.FC<TestPartSidebarProps> = ({
  parts,
  currentPartIndex,
  setCurrentPartIndex,
}) => (
  <div className="xl:sticky xl:top-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm p-3 xl:p-4">
      <h3 className="font-semibold mb-3 xl:mb-4 text-sm xl:text-base">
        Test Parts
      </h3>
      {/* Part Overview - Horizontal on mobile, vertical on desktop */}
      <div className="flex xl:flex-col gap-2 overflow-x-auto xl:overflow-x-visible pb-2 xl:pb-0">
        {parts.map((part, index) => (
          <button
            key={part.offset}
            onClick={() => setCurrentPartIndex(index)}
            className={`flex-shrink-0 xl:flex-shrink xl:w-full text-left p-2 xl:p-3 rounded-lg border transition-colors min-w-[120px] xl:min-w-0 ${
              currentPartIndex === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <div className="font-medium text-xs xl:text-sm">
              Part {index + 1}
            </div>
            <div className="text-xs opacity-80 truncate hidden xl:block">
              {part.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);
