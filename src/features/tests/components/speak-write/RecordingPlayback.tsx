import React from 'react';

interface RecordingPlaybackProps {
  recordedBlob: Blob | null;
}

export const RecordingPlayback: React.FC<RecordingPlaybackProps> = ({
  recordedBlob,
}) => {
  if (!recordedBlob) return null;

  return (
    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-green-700">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Your Recording</span>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <audio controls className="flex-1 h-8" style={{ maxHeight: '32px' }}>
            <source src={URL.createObjectURL(recordedBlob)} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
};
