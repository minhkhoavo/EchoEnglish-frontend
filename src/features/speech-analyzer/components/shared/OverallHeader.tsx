import { ChevronLeft, Pencil, Calendar, Clock, Share, Trash2 } from 'lucide-react'; // prettier-ignore
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetRecordingByIdQuery,
  useUpdateRecordingMutation,
} from '../../../recordings/services/recordingsApi';

interface RecordingTitleProps {
  title: string;
  date: string;
  duration: string;
  speakingTime: string;
  onEdit: (newTitle: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const OverallHeader = () => {
  const { id } = useParams<{ id: string }>();
  const { data: recording } = useGetRecordingByIdQuery(id || '');
  const [updateRecording] = useUpdateRecordingMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  const handleEdit = () => {
    if (recording) {
      setEditTitle(recording.name);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (recording && editTitle.trim()) {
      try {
        await updateRecording({
          id: recording._id,
          name: editTitle.trim(),
        }).unwrap();
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update recording name:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ActionButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
        title="Share your performance"
      >
        <Share className="w-5 h-5" />
        <span>Share</span>
      </button>
      <button
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
        title="Delete recording"
      >
        <Trash2 className="w-5 h-5" />
        <span>Delete</span>
      </button>
    </div>
  );

  const RecordingTitle = ({
    title,
    date,
    duration,
    speakingTime,
  }: RecordingTitleProps) => (
    <div>
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="text-xl font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <span className="text-xl font-semibold text-gray-800">{title}</span>
        )}
        <button onClick={handleEdit}>
          <Pencil className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>{date}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>Duration: {duration}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>Speaking Time: {speakingTime}</span>
        </div>
      </div>
    </div>
  );

  if (!recording) {
    return (
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <a
            href="/recordings"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
            <span className="ml-1 font-medium text-base">Back</span>
          </a>
          <div>Loading...</div>
        </div>
        <ActionButtons />
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <a
          href="/recordings"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
          <span className="ml-1 font-medium text-base">Back</span>
        </a>
        <RecordingTitle
          title={recording.name}
          date={formatDate(recording.createdAt)}
          duration={
            recording.analysisStatus === 'processing'
              ? 'Processing...'
              : formatDuration(recording.duration)
          }
          speakingTime={
            recording.analysisStatus === 'processing'
              ? 'Processing...'
              : formatDuration(recording.speakingTime)
          }
          onEdit={() => {}}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
      <ActionButtons />
    </header>
  );
};

export default OverallHeader;
