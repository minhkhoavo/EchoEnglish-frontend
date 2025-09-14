import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TooltipProps } from 'recharts';

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
  prosody?: {
    pitch_points?: Array<{ time: number; value: number }>;
    pitch_range_min?: number;
    pitch_range_max?: number;
  };
}

const PitchVariationChart: React.FC<PitchVariationChartProps> = ({
  data = [],
  targetRange,
  currentFrequency,
  prosody,
}) => {
  const chartData: Array<{ time: number; frequency: number }> =
    prosody?.pitch_points && prosody.pitch_points.length > 0
      ? prosody.pitch_points.map((p) => ({ time: p.time, frequency: p.value }))
      : data && data.length > 0
        ? data
        : [];

  // Determine target range from prosody or prop
  const derivedTargetRange =
    targetRange ??
    (prosody &&
    typeof prosody.pitch_range_min === 'number' &&
    typeof prosody.pitch_range_max === 'number'
      ? { min: prosody.pitch_range_min, max: prosody.pitch_range_max }
      : undefined);

  // Compute y-axis domain from available data and target range with padding
  const allValues: number[] = [
    ...chartData.map((d) => d.frequency),
    ...(derivedTargetRange
      ? [derivedTargetRange.min, derivedTargetRange.max]
      : []),
  ];

  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 300;
  const yMin = Math.max(0, Math.floor(dataMin - 20));
  const yMax = Math.ceil(dataMax + 20);

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
            {/* Tooltip for hover details */}
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={(props: TooltipProps<number, string>) => {
                const { active, payload } = props;
                if (!active || !payload || !payload.length) return null;
                type TooltipPayload = { time: number; frequency: number };
                const point: TooltipPayload = payload[0]
                  .payload as TooltipPayload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-md p-2 text-sm">
                    <div className="font-medium text-gray-900">
                      Time: {point.time}s
                    </div>
                    <div className="text-gray-700">
                      Pitch: {point.frequency} Hz
                    </div>
                  </div>
                );
              }}
            />
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
            {derivedTargetRange && (
              <>
                <ReferenceLine
                  y={derivedTargetRange.min}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  y={derivedTargetRange.max}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </>
            )}

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
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{
                value: `${yMax}Hz`,
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
          {currentFrequency !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span className="text-gray-700">
                Current: {currentFrequency}Hz
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <div>
            Excessive: above{' '}
            {derivedTargetRange ? derivedTargetRange.max : yMax}Hz
          </div>
          <div>
            Monotone: below {derivedTargetRange ? derivedTargetRange.min : yMin}
            Hz
          </div>
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
