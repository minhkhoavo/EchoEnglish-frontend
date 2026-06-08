import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  PlayCircle,
  Clock,
  Mic,
  Calendar,
  TrendingUp,
  Download,
  AudioLines,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { Recording } from '../types/recordings.types';

interface RecordingItemProps {
  recording: Recording;
  onAnalyze: (recordingId: string) => void;
  index: number;
}

export function RecordingItem({
  recording,
  onAnalyze,
  index,
}: RecordingItemProps) {
  // Helper functions for formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90)
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'mp3':
        return { icon: AudioLines, color: 'text-blue-600 bg-blue-100' };
      case 'wav':
        return { icon: AudioLines, color: 'text-green-600 bg-green-100' };
      case 'ogg':
        return { icon: AudioLines, color: 'text-purple-600 bg-purple-100' };
      default:
        return { icon: AudioLines, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getSpeakingTimePercentage = () => {
    if (
      recording.duration === 0 ||
      isNaN(recording.duration) ||
      isNaN(recording.speakingTime)
    ) {
      return 0;
    }
    return Math.round((recording.speakingTime / recording.duration) * 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const getStatusBadge = () => {
    switch (recording.analysisStatus) {
      case 'done':
        return (
          <Badge className={`${getScoreColor(100)} border font-bold px-3 py-1`}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {/* {recording.overallScore || 0}% */}
            Done
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 border font-bold px-3 py-1">
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 border font-bold px-3 py-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 border font-bold px-3 py-1">
            Unknown
          </Badge>
        );
    }
  };

  const getActionButton = () => {
    switch (recording.analysisStatus) {
      case 'done':
        return (
          <Button
            onClick={() => onAnalyze(recording._id)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            View Analysis
          </Button>
        );
      case 'processing':
        return (
          <Button
            disabled
            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium"
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </Button>
        );
      case 'failed':
        return (
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 font-medium"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Retry
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => onAnalyze(recording._id)}
            variant="outline"
            className="font-medium"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        );
    }
  };
  const fileType = getFileTypeIcon(recording.name);
  const FileIcon = fileType.icon;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!recording.url) {
      alert('Download URL not available');
      return;
    }

    try {
      setIsDownloading(true);
      const res = await fetch(recording.url, { method: 'GET' });
      if (!res.ok) throw new Error('Network response was not ok');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = recording.name || 'recording';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn(
        'Blob download failed, falling back to open in new tab',
        err
      );
      window.open(recording.url, '_blank', 'noopener');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left Section: File Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* File Icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileType.color}`}
          >
            <FileIcon className="w-5 h-5" />
          </div>

          {/* File Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                #{index + 1}
              </span>
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {recording.name}
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(recording.createdAt)}</span>
              </div>
              <span>{formatFileSize(recording.size)}</span>
            </div>
          </div>
        </div>

        {/* Center Section: Stats */}
        <div className="hidden md:flex items-center space-x-6 mx-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="font-bold text-gray-900">
              {formatDuration(recording.duration)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Speaking</span>
            </div>
            <p className="font-bold text-gray-900">
              {formatDuration(recording.speakingTime)}
              <span className="text-sm text-gray-500 ml-1">
                ({getSpeakingTimePercentage()}%)
              </span>
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-2 bg-gray-200 rounded-full mb-1">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getSpeakingTimePercentage()}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {getSpeakingTimePercentage()}% speaking
            </span>
          </div>
        </div>

        {/* Right Section: Score & Actions */}
        <div className="flex items-center space-x-4">
          {getStatusBadge()}

          <div className="flex items-center space-x-2">
            {getActionButton()}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="text-gray-500 hover:text-blue-600"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : ''}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Stats - Show on small screens */}
      <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1 text-blue-600">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(recording.duration)}</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <Mic className="w-3 h-3" />
            <span>
              {formatDuration(recording.speakingTime)} (
              {getSpeakingTimePercentage()}%)
            </span>
          </div>
          <div className="flex-1 mx-3">
            <div className="w-full h-1.5 bg-gray-200 rounded-full">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full"
                style={{ width: `${getSpeakingTimePercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
