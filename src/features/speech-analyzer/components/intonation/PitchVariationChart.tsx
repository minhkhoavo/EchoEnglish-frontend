import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PitchVariationChartProps {
  data?: Array<{
    time: number;
    frequency: number;
  }>;
  targetRange?: {
    min: number;
    max: number;
  };
  currentFrequency?: number;
}

const PitchVariationChart: React.FC<PitchVariationChartProps> = ({
  data = [],
  targetRange = { min: 100, max: 200 },
  currentFrequency,
}) => {
  // Sample data if none provided
  const chartData =
    data.length > 0
      ? data
      : [
          { time: 0, frequency: 250 },
          { time: 5, frequency: 120 },
          { time: 10, frequency: 180 },
          { time: 15, frequency: 160 },
        ];

  return (
    <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Pitch Variation
        </h3>
        <p className="text-sm text-gray-600">
          Keep your Pitch Variation within the target range shown in green
          below.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            {/* Target range background */}
            <defs>
              <pattern
                id="targetRange"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
              >
                <rect width="4" height="4" fill="#dcfce7" />
              </pattern>
            </defs>

            {/* Target range area */}
            <ReferenceLine
              y={targetRange.min}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <ReferenceLine
              y={targetRange.max}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{
                value: 'Timeline',
                position: 'insideBottom',
                offset: -10,
                style: {
                  textAnchor: 'middle',
                  fontSize: '12px',
                  fill: '#6b7280',
                },
              }}
            />
            <YAxis
              domain={[0, 300]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{
                value: '300Hz',
                position: 'insideTopLeft',
                style: { fontSize: '12px', fill: '#6b7280' },
              }}
            />

            {/* Main pitch line */}
            <Line
              type="monotone"
              dataKey="frequency"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: '#8b5cf6',
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />

            {/* Current frequency indicator */}
            {currentFrequency && (
              <ReferenceLine
                y={currentFrequency}
                stroke="#ef4444"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart labels and legend */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-700">Your Pitch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500 border-dashed border border-green-500"></div>
            <span className="text-gray-700">Target Range</span>
          </div>
          {currentFrequency && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span className="text-gray-700">
                Current: {currentFrequency}Hz
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <div>Excessive: above {targetRange.max}Hz</div>
          <div>Monotone: below {targetRange.min}Hz</div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-4 flex gap-2">
        <div className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
          Excessive
        </div>
        <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
          Target Range
        </div>
        <div className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
          Monotone
        </div>
      </div>
    </div>
  );
};

export default PitchVariationChart;
