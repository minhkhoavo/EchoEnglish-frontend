// components/TopErrors.tsx
import ErrorCard from './ErrorCard';
import TopErrorsChart from './TopErrorsChart';
import type { TopMistake } from '../../types/pronunciation.types';

export interface TopErrorsProps {
  chartData: Array<{ sound: string; errorRate: number }>;
  topMistakes: TopMistake[];
}

const TopErrors = ({ chartData, topMistakes }: TopErrorsProps) => (
  <div className="mt-8 space-y-6">
    <TopErrorsChart data={chartData} />
    <div>
      <h3 className="text-lg font-bold text-gray-800">
        Your Top Errors and Suggestions for Improvement
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {topMistakes.map((mistake, index) => (
          <ErrorCard
            key={index}
            sound={`Sound ${mistake.sound}`}
            mistakes={[
              {
                description: mistake.mistakeSummary,
                words: mistake.wordsWithMistakes.map(
                  (w: { word: string; phoneticTranscription?: string }) =>
                    w.phoneticTranscription
                      ? `${w.word} ${w.phoneticTranscription}`
                      : w.word
                ),
              },
            ]}
            improvement={mistake.howToImprove}
          />
        ))}
      </div>
    </div>
  </div>
);

export default TopErrors;
