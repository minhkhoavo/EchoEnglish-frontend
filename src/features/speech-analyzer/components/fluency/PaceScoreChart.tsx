import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PaceScoreChartProps {
  score: number; // WPM (Words Per Minute)
}

const PaceScoreChart: React.FC<PaceScoreChartProps> = ({ score = 0 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  // Calculate the position on the semicircle based on score
  const getScorePosition = (wpm: number): number => {
    const minWpm = 50;
    const maxWpm = 250;
    const normalizedScore = Math.max(
      0,
      Math.min(100, ((wpm - minWpm) / (maxWpm - minWpm)) * 100)
    );
    return normalizedScore;
  };

  const getScoreLevel = (wpm: number): string => {
    if (wpm < 100) return 'Slow';
    if (wpm <= 180) return 'Natural';
    if (wpm <= 200) return 'Optimal';
    return 'Very Fast';
  };

  const getScoreData = (wpm: number) => {
    if (wpm >= 120 && wpm <= 180) {
      return {
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgGradient: 'from-emerald-50 to-emerald-100',
        icon: TrendingUp,
        status: 'excellent',
      };
    }
    if (wpm >= 120 && wpm <= 200) {
      return {
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgGradient: 'from-amber-50 to-amber-100',
        icon: Minus,
        status: 'good',
      };
    }
    return {
      color: '#ef4444',
      gradient: 'from-red-400 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      icon: TrendingDown,
      status: 'needs-improvement',
    };
  };

  const position = getScorePosition(animatedScore);
  const level = getScoreLevel(score);
  const scoreData = getScoreData(score);
  const Icon = scoreData.icon;

  // Calculate needle rotation: map position [0..100] to degrees [-90..90]
  // so 0 -> -90 (left), 50 -> 0 (center), 100 -> 90 (right)
  const needleRotation = (position / 100) * 180 - 90;
  const strokeDasharray = `${(position / 100) * 157} 157`;

  // SVG arc constants (center and radius match the SVG path above)
  const minWpm = 50;
  const maxWpm = 250;
  const cx = 70;
  const cy = 65;
  const radius = 55;

  // Optimal pace range (WPM) — same as the score data logic
  const optimalStartWpm = 120;
  const optimalEndWpm = 180;

  // Convert WPM to percentage along semicircle [0..100]
  const toPercent = (w: number) =>
    Math.max(0, Math.min(100, ((w - minWpm) / (maxWpm - minWpm)) * 100));

  // Convert percent (0..100) to angle in radians for the semicircle path
  // percent=0 => leftmost (angle = PI), percent=100 => rightmost (angle = 0)
  const percentToAngle = (p: number) => Math.PI * (1 - p / 100);

  const startPercent = toPercent(optimalStartWpm);
  const endPercent = toPercent(optimalEndWpm);
  const startAngle = percentToAngle(startPercent);
  const endAngle = percentToAngle(endPercent);

  const polarToXY = (angleRad: number) => ({
    x: cx + radius * Math.cos(angleRad),
    y: cy - radius * Math.sin(angleRad),
  });

  const startPt = polarToXY(startAngle);
  const endPt = polarToXY(endAngle);

  const optimalArcD = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 0 1 ${endPt.x} ${endPt.y}`;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-500 hover:shadow-lg border-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scoreData.bgGradient} opacity-50`}
      />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${scoreData.gradient} text-white shadow-sm`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Speech Pace</h3>
          </div>
          <Icon
            className={`w-5 h-5 text-${scoreData.status === 'excellent' ? 'emerald' : scoreData.status === 'good' ? 'amber' : 'red'}-600`}
          />
        </div>

        <div className="relative w-40 h-24 mx-auto mb-6">
          <svg viewBox="0 0 140 80" className="w-full h-full">
            {/* Gradient definitions */}
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: scoreData.color, stopOpacity: 0.8 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: scoreData.color, stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: scoreData.color, stopOpacity: 0.8 }}
                />
              </linearGradient>
              <linearGradient
                id="optimalGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#bbf7d0', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#10b981', stopOpacity: 1 }}
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background arc with subtle gradient */}
            <path
              d="M 15 65 A 55 55 0 0 1 125 65"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Optimal range indicator (dynamic: 140-180 WPM) */}
            {/* faint background band to emphasize the area */}
            <path
              d={optimalArcD}
              fill="none"
              stroke="#dffcf1"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d={optimalArcD}
              fill="none"
              stroke="url(#optimalGradient)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* endpoint markers and labels */}
            <circle
              cx={startPt.x}
              cy={startPt.y}
              r={3.5}
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth={1.5}
            />
            <circle
              cx={endPt.x}
              cy={endPt.y}
              r={3.5}
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth={1.5}
            />
            <text
              x={startPt.x}
              y={startPt.y - 8}
              fontSize={9}
              textAnchor="middle"
              fill="#065f46"
            >
              {optimalStartWpm}
            </text>
            <text
              x={endPt.x}
              y={endPt.y - 8}
              fontSize={9}
              textAnchor="middle"
              fill="#065f46"
            >
              {optimalEndWpm}
            </text>

            {/* Animated score arc */}
            <path
              d="M 15 65 A 55 55 0 0 1 125 65"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                transition:
                  'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* Center hub */}
            <circle cx="70" cy="65" r="4" fill="#374151" />
            <circle
              cx="70"
              cy="65"
              r="6"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            {/* Animated needle (rendered last so it's on top) */}
            <g transform={`rotate(${needleRotation} 70 65)`}>
              <line
                x1="70"
                y1="65"
                x2="70"
                y2="14"
                stroke={scoreData.color}
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{
                  transformOrigin: '70px 65px',
                  transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              <circle cx="70" cy="14" r="4" fill={scoreData.color} />
            </g>
          </svg>

          {/* Scale labels */}
          <div className="absolute bottom-2 left-0 text-xs font-medium text-gray-500">
            50
          </div>
          <div className="absolute bottom-2 right-0 text-xs font-medium text-gray-500">
            250
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-emerald-600">
            Optimal
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: scoreData.color }}
            >
              {Math.round(animatedScore)}
            </span>
            <span className="text-sm font-medium text-gray-500 mt-2">WPM</span>
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${scoreData.gradient} text-white shadow-sm`}
          >
            {level}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {score >= 120 && score <= 180
              ? 'Perfect speaking pace'
              : score < 120
                ? 'Try speaking a bit faster'
                : 'Consider slowing down slightly'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaceScoreChart;
