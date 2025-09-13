import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface HesitationsIndicatorProps {
  status: string; // 'Natural', 'Frequent', 'Minimal', etc.
  count?: number; // Number of hesitations detected
}

const HesitationsIndicator: React.FC<HesitationsIndicatorProps> = ({
  status,
  count = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedCount(count);
    }, 600);
    return () => clearTimeout(timer);
  }, [count]);

  const getStatusData = (status: string, count: number) => {
    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus === 'natural' ||
      normalizedStatus === 'minimal' ||
      count <= 2
    ) {
      return {
        color: '#10b981',
        gradient: 'from-emerald-400 to-emerald-600',
        bgGradient: 'from-emerald-50 to-emerald-100',
        icon: Volume1,
        level: 'Natural',
        description: 'Smooth speech flow',
        animation: 'animate-pulse',
        waveType: 'smooth',
        intensity: 1,
      };
    }

    if (normalizedStatus === 'moderate' || (count > 2 && count <= 5)) {
      return {
        color: '#f59e0b',
        gradient: 'from-amber-400 to-amber-600',
        bgGradient: 'from-amber-50 to-amber-100',
        icon: Volume2,
        level: 'Moderate',
        description: 'Some hesitations detected',
        animation: 'animate-bounce',
        waveType: 'moderate',
        intensity: 2,
      };
    }

    return {
      color: '#ef4444',
      gradient: 'from-red-400 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      icon: VolumeX,
      level: 'Frequent',
      description: 'Many hesitations found',
      animation: 'animate-ping',
      waveType: 'choppy',
      intensity: 3,
    };
  };

  const statusData = getStatusData(status, count);
  const Icon = statusData.icon;

  const renderWavePattern = () => {
    const waves = [];
    const baseHeight = 20;

    for (let i = 0; i < 5; i++) {
      const height =
        statusData.waveType === 'smooth'
          ? baseHeight - Math.abs(i - 2) * 3
          : statusData.waveType === 'moderate'
            ? baseHeight - Math.abs(i - 2) * 5 + (i % 2) * 8
            : baseHeight - Math.abs(i - 2) * 8 + (i % 3) * 12;

      waves.push(
        <rect
          key={i}
          x={i * 8}
          y={30 - height / 2}
          width="4"
          height={height}
          fill={statusData.color}
          rx="2"
          className={`${statusData.animation}`}
          style={{
            animationDelay: `${i * 100}ms`,
            opacity: 0.7 + (i === 2 ? 0.3 : 0),
          }}
        />
      );
    }

    return waves;
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-500 hover:shadow-lg border-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${statusData.bgGradient} opacity-50`}
      />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${statusData.gradient} text-white shadow-sm`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Speech Flow</h3>
          </div>
          {count > 0 && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusData.gradient} text-white`}
            >
              {animatedCount}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Main visualization circle */}
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center relative overflow-hidden transition-all duration-500`}
              style={{
                borderColor: statusData.color,
                backgroundColor: `${statusData.color}10`,
                boxShadow: `0 0 20px ${statusData.color}30`,
              }}
            >
              {/* Animated wave pattern */}
              <svg viewBox="0 0 40 30" className="w-10 h-8">
                {renderWavePattern()}
              </svg>

              {/* Ripple effect for frequent hesitations */}
              {statusData.intensity >= 3 && (
                <div
                  className="absolute inset-0 rounded-full border-2 animate-ping"
                  style={{ borderColor: statusData.color, opacity: 0.3 }}
                />
              )}
            </div>

            {/* Floating particles for natural speech */}
            {statusData.intensity === 1 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full bg-current opacity-70 animate-pulse`}
                    style={{
                      color: statusData.color,
                      top: `${20 + i * 20}%`,
                      left: `${20 + i * 20}%`,
                      animationDelay: `${i * 500}ms`,
                      animationDuration: '3s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${statusData.gradient} text-white shadow-lg`}
          >
            {statusData.level}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {statusData.description}
          </p>

          {/* Progress indicator based on hesitation count */}
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-1 rounded-full transition-all duration-500 ${
                  i < statusData.intensity
                    ? `bg-gradient-to-r ${statusData.gradient}`
                    : 'bg-gray-200'
                }`}
                style={{
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HesitationsIndicator;
