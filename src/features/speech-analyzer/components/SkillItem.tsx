// components/SkillItem.tsx
import { useState } from 'react';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';

interface Video {
  imgUrl: string;
  title: string;
}

interface VideoThumbnailProps {
  imgUrl: string;
  title: string;
}

interface SkillItemProps {
  title: string;
  level: string;
  videos: Video[];
}

const VideoThumbnail = ({ imgUrl, title }: VideoThumbnailProps) => (
  <div className="group cursor-pointer">
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center space-x-3">
        {/* Compact Thumbnail */}
        <div className="relative flex-shrink-0">
          <img
            src={imgUrl}
            alt={title}
            className="w-16 h-10 object-cover rounded border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded">
            <div className="bg-white bg-opacity-90 rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 text-gray-700 fill-current" />
            </div>
          </div>
        </div>

        {/* Compact Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate leading-tight">
            {title}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const SkillItem = ({ title, level, videos }: SkillItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const levelConfig = {
    'Needs Improvement': {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    Good: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    Correct: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  };

  const config = levelConfig[level as keyof typeof levelConfig];
  const hasMultipleVideos = videos.length > 1;

  return (
    <div className="border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      {/* Compact Skill Header */}
      <div
        className={`p-4 cursor-pointer ${hasMultipleVideos ? 'hover:bg-gray-50' : ''}`}
        onClick={() => hasMultipleVideos && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {title}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.color} text-white`}
            >
              {level}
            </span>
          </div>

          {hasMultipleVideos && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{videos.length} tutorials</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {/* Show first video when collapsed or single video */}
        {(!hasMultipleVideos || !isExpanded) && (
          <div className="mt-3">
            <VideoThumbnail {...videos[0]} />
          </div>
        )}
      </div>

      {/* Expandable Video List */}
      {hasMultipleVideos && isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="space-y-2">
            {videos.map((video, index) => (
              <VideoThumbnail key={index} {...video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillItem;
