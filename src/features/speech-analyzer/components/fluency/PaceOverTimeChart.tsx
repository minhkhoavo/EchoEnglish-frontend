import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PacePoint {
  time: number;
  wpm: number;
}

interface PaceOverTimeChartProps {
  apiData: {
    points: { time: number; value: number }[];
    totalDuration: number;
  };
}

const PaceOverTimeChart: React.FC<PaceOverTimeChartProps> = ({ apiData }) => {
  const [hoveredPoint, setHoveredPoint] = useState<PacePoint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const chartWidth = 820;
  const chartHeight = 280;
  const padding = 50;

  const points = apiData.points.map((p) => ({ time: p.time, wpm: p.value }));
  const totalDuration = apiData.totalDuration;

  // Scale functions
  const scaleX = (time: number) =>
    (time / totalDuration) * (chartWidth - padding * 2) + padding;
  const scaleY = (wpm: number) =>
    chartHeight -
    padding -
    ((wpm - 60) / (200 - 60)) * (chartHeight - padding * 2);

  // Create smooth curve path
  const createSmoothPath = () => {
    if (points.length === 0) return '';

    let path = `M ${scaleX(points[0].time)} ${scaleY(points[0].wpm)}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];

      const prevX = scaleX(prevPoint.time);
      const prevY = scaleY(prevPoint.wpm);
      const currentX = scaleX(currentPoint.time);
      const currentY = scaleY(currentPoint.wpm);

      const cp1x = prevX + (currentX - prevX) * 0.3;
      const cp1y = prevY;
      const cp2x = currentX - (currentX - prevX) * 0.3;
      const cp2y = currentY;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentX} ${currentY}`;
    }

    return path;
  };

  // Create gradient area path
  const createAreaPath = () => {
    if (points.length === 0) return '';

    let path = `M ${scaleX(points[0].time)} ${chartHeight - padding}`;
    path += ` L ${scaleX(points[0].time)} ${scaleY(points[0].wpm)}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];

      const prevX = scaleX(prevPoint.time);
      const prevY = scaleY(prevPoint.wpm);
      const currentX = scaleX(currentPoint.time);
      const currentY = scaleY(currentPoint.wpm);

      const cp1x = prevX + (currentX - prevX) * 0.3;
      const cp1y = prevY;
      const cp2x = currentX - (currentX - prevX) * 0.3;
      const cp2y = currentY;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentX} ${currentY}`;
    }

    path += ` L ${scaleX(points[points.length - 1].time)} ${chartHeight - padding}`;
    path += ` Z`;

    return path;
  };

  const getStatusText = (wpm: number) => {
    if (wpm >= 120 && wpm <= 180) return 'Optimal';
    if (wpm > 180) return 'Too Fast';
    return 'Too Slow';
  };

  const getStatusColor = (wpm: number) => {
    if (wpm >= 120 && wpm <= 180) return '#10b981';
    return '#ef4444';
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
          Pace Analysis
        </CardTitle>
        <p className="text-sm text-gray-600 leading-relaxed">
          Maintain a natural speaking pace between 120-180 words per minute for
          optimal clarity and engagement.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative bg-gray-50/50 rounded-lg p-4">
          {/* Tooltip */}
          {hoveredPoint && (
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
                Time: {hoveredPoint.time}s
              </div>
              <div className="text-sm text-gray-600">
                Speed: {hoveredPoint.wpm} WPM
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: getStatusColor(hoveredPoint.wpm) }}
              >
                Status: {getStatusText(hoveredPoint.wpm)}
              </div>
            </div>
          )}

          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient
                id="paceGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient
                id="optimalZone"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Optimal range background */}
            <rect
              x={padding}
              y={scaleY(180)}
              width={chartWidth - padding * 2}
              height={scaleY(120) - scaleY(180)}
              fill="url(#optimalZone)"
              rx="4"
            />

            {/* Grid lines */}
            {[80, 120, 160, 200].map((wpm) => (
              <line
                key={wpm}
                x1={padding}
                y1={scaleY(wpm)}
                x2={chartWidth - padding}
                y2={scaleY(wpm)}
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}

            {/* Y-axis labels */}
            {[80, 120, 160, 200].map((wpm) => (
              <text
                key={wpm}
                x={padding - 15}
                y={scaleY(wpm)}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-500 font-medium"
              >
                {wpm}
              </text>
            ))}

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

            {/* Optimal range labels */}
            <text
              x={chartWidth - padding - 10}
              y={scaleY(150)}
              textAnchor="end"
              className="text-xs fill-emerald-600 font-semibold"
            >
              Optimal Range
            </text>

            {/* Area under curve */}
            <path d={createAreaPath()} fill="url(#paceGradient)" />

            {/* Main curve */}
            <path
              d={createSmoothPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={scaleX(point.time)}
                  cy={scaleY(point.wpm)}
                  r={hoveredPoint === point ? '8' : '6'}
                  fill="white"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={scaleX(point.time)}
                  cy={scaleY(point.wpm)}
                  r={hoveredPoint === point ? '4' : '3'}
                  fill="#3b82f6"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Hover area for better UX */}
                <circle
                  cx={scaleX(point.time)}
                  cy={scaleY(point.wpm)}
                  r="15"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={padding - 30}
              y={chartHeight / 2}
              textAnchor="middle"
              className="text-sm fill-gray-600 font-medium"
              transform={`rotate(-90 ${padding - 40} ${chartHeight / 2})`}
            >
              Words per minute
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

export default PaceOverTimeChart;
