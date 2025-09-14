import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface PausingScoreChartProps {
  score: number; // Percentage
  decision?: string; // warning, good, poor etc.
}

const PausingScoreChart: React.FC<PausingScoreChartProps> = ({
  score = 0,
  decision = 'good',
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreData = (percentage: number, decision: string) => {
    // Use decision from API if available, otherwise fall back to percentage-based logic
    if (decision === 'warning' || (percentage > 60 && decision !== 'good')) {
      return {
        level: 'Needs Attention',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgGradient: 'from-amber-50 to-amber-100',
        icon: AlertTriangle,
        ringColor: 'stroke-amber-500',
        description: 'Too many pauses detected',
      };
    }
    if (decision === 'good' || percentage <= 30) {
      return {
        level: 'Excellent',
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgGradient: 'from-emerald-50 to-emerald-100',
        icon: CheckCircle,
        ringColor: 'stroke-emerald-500',
        description: 'Natural pausing pattern',
      };
    }
    if (percentage <= 50) {
      return {
        level: 'Good',
        color: '#3b82f6',
        gradient: 'from-blue-400 to-blue-600',
        bgGradient: 'from-blue-50 to-blue-100',
        icon: CheckCircle,
        ringColor: 'stroke-blue-500',
        description: 'Acceptable pausing',
      };
    }
    return {
      level: 'Poor',
      color: '#ef4444',
      gradient: 'from-red-400 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      icon: XCircle,
      ringColor: 'stroke-red-500',
      description: 'Excessive pausing',
    };
  };

  const scoreData = getScoreData(score, decision);
  const Icon = scoreData.icon;

  // Calculate the arc for the circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(animatedScore / 100) * circumference} ${circumference}`;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-700 hover:shadow-lg border-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
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
              <Pause className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Pausing Analysis
            </h3>
          </div>
          <Icon
            className={`w-5 h-5 ${scoreData.level === 'Excellent' || scoreData.level === 'Good' ? 'text-emerald-600' : scoreData.level === 'Needs Attention' ? 'text-amber-600' : 'text-red-600'}`}
          />
        </div>

        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />

            {/* Animated progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={scoreData.color}
              strokeWidth="6"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.1))',
              }}
            />

            {/* Gradient overlay */}
            <defs>
              <linearGradient
                id="pauseGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: scoreData.color, stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: scoreData.color, stopOpacity: 0.6 }}
                />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: scoreData.color }}
            >
              {Math.round(animatedScore)}%
            </span>
            <span className="text-xs text-gray-500 font-medium">Pauses</span>
          </div>

          {/* Floating indicator */}
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${scoreData.gradient} flex items-center justify-center shadow-lg animate-pulse`}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${scoreData.gradient} text-white shadow-sm`}
          >
            {scoreData.level}
          </div>
          <p className="text-xs text-gray-600">{scoreData.description}</p>

          {/* Mini indicators */}
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < Math.floor(animatedScore / 20)
                    ? `bg-gradient-to-r ${scoreData.gradient}`
                    : 'bg-gray-200'
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PausingScoreChart;
