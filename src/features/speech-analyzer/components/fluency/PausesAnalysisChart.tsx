import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PauseEvent {
  time: number;
  duration: number;
  type: 'good' | 'optional' | 'bad';
}

interface PausesAnalysisChartProps {
  apiData: {
    pauses: { time: number; duration: number; type: string }[];
    totalDuration: number;
  };
}

const PausesAnalysisChart: React.FC<PausesAnalysisChartProps> = ({
  apiData,
}) => {
  const [hoveredPause, setHoveredPause] = useState<PauseEvent | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const chartWidth = 800;
  const chartHeight = 280;
  const padding = 50;

  const pauses = apiData.pauses.map((p) => ({
    time: p.time,
    duration: p.duration,
    type: p.type as 'good' | 'optional' | 'bad',
  }));
  const totalDuration = apiData.totalDuration;

  const scaleX = (time: number) =>
    (time / totalDuration) * (chartWidth - padding * 2) + padding;
  const scaleY = (duration: number) =>
    chartHeight - padding - (duration / 3) * (chartHeight - padding * 2);

  const getColorByType = (type: string) => {
    switch (type) {
      case 'good':
        return '#10b981';
      case 'optional':
        return '#6b7280';
      case 'bad':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTypeCount = (type: string) =>
    pauses.filter((p) => p.type === type).length;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'good':
        return 'Good Pause';
      case 'optional':
        return 'Optional Pause';
      case 'bad':
        return 'Bad Pause';
      default:
        return 'Unknown';
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Pause Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 leading-relaxed">
          Monitor your pausing patterns to maintain natural speech flow and
          improve communication effectiveness.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Summary Stats */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50/50 rounded-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Good ({getTypeCount('good')})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Optional ({getTypeCount('optional')})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Bad ({getTypeCount('bad')})
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{pauses.length}</span> pauses
          </div>
        </div>

        <div className="relative bg-gray-50/50 rounded-lg p-4">
          {/* Tooltip */}
          {hoveredPause && (
            <div
              className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y - 10,
                transform:
                  mousePosition.x > chartWidth - 150
                    ? 'translateX(-100%)'
                    : 'none',
              }}
            >
              <div className="text-sm font-medium text-gray-900">
                Time: {hoveredPause.time}s
              </div>
              <div className="text-sm text-gray-600">
                Duration: {hoveredPause.duration}s
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: getColorByType(hoveredPause.type) }}
              >
                Type: {getTypeLabel(hoveredPause.type)}
              </div>
            </div>
          )}

          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPause(null)}
          >
            {/* Grid lines */}
            {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((duration) => (
              <line
                key={duration}
                x1={padding}
                y1={scaleY(duration)}
                x2={chartWidth - padding}
                y2={scaleY(duration)}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((duration) => (
              <text
                key={duration}
                x={padding - 15}
                y={scaleY(duration)}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-500 font-medium"
              >
                {duration}s
              </text>
            ))}

            {/* X-axis */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#d1d5db"
              strokeWidth="1"
            />

            {/* Y-axis */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="#d1d5db"
              strokeWidth="1"
            />

            {/* X-axis labels */}
            {Array.from(
              { length: Math.floor(totalDuration / 5) + 1 },
              (_, i) => i * 5
            ).map((time) => (
              <text
                key={time}
                x={scaleX(time)}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500 font-medium"
              >
                {time}s
              </text>
            ))}

            {/* Pause bars */}
            {pauses.map((pause, index) => {
              const barWidth = Math.max(
                12,
                (chartWidth - padding * 2) / Math.max(pauses.length * 2, 20)
              );
              const barHeight = Math.max(
                2,
                chartHeight - padding - scaleY(pause.duration)
              );
              const barX = scaleX(pause.time) - barWidth / 2;
              const barY = scaleY(pause.duration);

              return (
                <g key={index}>
                  {/* Bar shadow */}
                  <rect
                    x={barX + 1}
                    y={barY + 1}
                    width={barWidth}
                    height={barHeight}
                    fill="rgba(0,0,0,0.1)"
                    rx="3"
                  />
                  {/* Main bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={getColorByType(pause.type)}
                    rx="3"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredPause(pause)}
                    onMouseLeave={() => setHoveredPause(null)}
                  />
                  {/* Hover area for better UX */}
                  <rect
                    x={barX - 5}
                    y={barY - 5}
                    width={barWidth + 10}
                    height={barHeight + 10}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPause(pause)}
                    onMouseLeave={() => setHoveredPause(null)}
                  />
                </g>
              );
            })}

            {/* Axis labels */}
            <text
              x={padding - 20}
              y={chartHeight / 2}
              textAnchor="middle"
              className="text-sm fill-gray-600 font-medium"
              transform={`rotate(-90 ${padding - 40} ${chartHeight / 2})`}
            >
              Duration (seconds)
            </text>

            <text
              x={chartWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-sm fill-gray-600 font-medium"
            >
              Time (seconds)
            </text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default PausesAnalysisChart;
