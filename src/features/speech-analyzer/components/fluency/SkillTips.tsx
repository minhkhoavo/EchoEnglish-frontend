import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlayCircle, ExternalLink } from 'lucide-react';

export interface SkillTipsProps {
  title?: string;
  description?: string;
  tips?: string[];
  videoUrl?: string;
  videoTitle?: string;
}

const SkillTips: React.FC<SkillTipsProps> = ({
  title = 'Tips for improvements',
  description = '',
  tips = [],
  videoUrl,
  videoTitle,
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleVideoClick = () => {
    if (videoUrl) setIsVideoOpen(true);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getYouTubeThumbnail = (url?: string) => {
    if (!url) return '/api/placeholder/300/200';
    try {
      const regex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#/]+)/;
      const match = url.match(regex);
      if (match && match[1])
        return `https://img.youtube.com/vi/${match[1]}/1.jpg`;
      const u = new URL(url);
      const id = u.searchParams.get('v');
      if (id) return `https://img.youtube.com/vi/${id}/1.jpg`;
    } catch (_e) {
      console.error('Invalid video URL', _e);
    }
    return '/api/placeholder/300/200';
  };

  return (
    <>
      <Card className="p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

          <div
            className={`relative group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-6 ${videoUrl ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''}`}
            onClick={handleVideoClick}
          >
            <div className="flex items-center gap-4">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={getYouTubeThumbnail(videoUrl)}
                  alt="Video tutorial thumbnail"
                  className="w-20 h-14 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    Video Tutorial
                  </span>
                  {videoUrl && (
                    <ExternalLink className="w-3 h-3 text-blue-500" />
                  )}
                </div>
                <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {videoTitle || videoUrl
                    ? videoTitle || 'Watch the tutorial'
                    : 'No tutorial available'}
                </p>
                {videoUrl ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Click to watch tutorial
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    No video provided
                  </p>
                )}
              </div>
            </div>

            <div className="absolute inset-0 rounded-xl border-2 border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {description && <p className="text-gray-600 mb-4">{description}</p>}

          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {videoTitle || 'Video Tutorial'}
            </DialogTitle>
          </DialogHeader>

          {videoUrl && (
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                title={videoTitle || 'Video Tutorial'}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SkillTips;
