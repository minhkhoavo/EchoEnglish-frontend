import { useMemo, useState } from 'react';
import { RecordingItem } from './RecordingItem';
import { useGetRecordingsQuery } from '../services/recordingsApi';
import { AlertCircle, FileAudio, Search, SortAsc } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

interface RecordingsListProps {
  onAnalyze: (recordingId: string) => void;
}

export function RecordingsList({ onAnalyze }: RecordingsListProps) {
  const {
    data: recordingsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetRecordingsQuery();
  const recordings = useMemo(
    () => recordingsResponse?.data?.items ?? [],
    [recordingsResponse]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  console.log('Recordings List', recordingsResponse);
  console.log('Recordings Array', recordings);
  const filteredRecordings = useMemo(() => {
    const filtered = recordings.filter((recording) =>
      recording.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'score':
          return (b.overallScore || 0) - (a.overallScore || 0);
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recordings, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileAudio className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-gray-600 mt-4 text-lg font-medium">
          Loading recordings list...
        </p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-800">
              Unable to load recordings list. Please try again.
            </p>
            <p className="text-red-600 text-sm mt-1">
              Check your network connection and try again.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="ml-4 text-red-600 border-red-200 hover:bg-red-100"
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileAudio className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No recordings yet
        </h3>
        <p className="text-gray-600 max-w-md leading-relaxed mb-6">
          You don't have any recordings yet. Start recording and practice your
          pronunciation to see detailed analysis results.
        </p>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
          <FileAudio className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {recordings.length}
              </p>
              <p className="text-sm text-gray-600">Total recordings</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(
                  recordings.reduce(
                    (acc, r) => acc + (r.overallScore || 0),
                    0
                  ) / recordings.length
                )}
                %
              </p>
              <p className="text-sm text-gray-600">Average score</p>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="flex items-center space-x-1"
              >
                <SortAsc className="w-4 h-4" />
                <span>Date</span>
              </Button>
              <Button
                variant={sortBy === 'score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('score')}
                className="flex items-center space-x-1"
              >
                <SortAsc className="w-4 h-4" />
                <span>Score</span>
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('duration')}
                className="flex items-center space-x-1"
              >
                <SortAsc className="w-4 h-4" />
                <span>Duration</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Found{' '}
            <span className="font-semibold text-gray-900">
              {filteredRecordings.length}
            </span>{' '}
            results
            {searchQuery && (
              <span>
                {' '}
                for "
                <span className="font-semibold text-blue-600">
                  {searchQuery}
                </span>
                "
              </span>
            )}
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Recordings List */}
      <div className="space-y-4">
        {filteredRecordings.map((recording, index) => (
          <RecordingItem
            key={recording._id}
            recording={recording}
            onAnalyze={onAnalyze}
            index={index}
          />
        ))}
      </div>

      {/* Empty Search Results */}
      {filteredRecordings.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No results found
          </h3>
          <p className="text-gray-500 mb-4">
            No recordings match the keyword "{searchQuery}"
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            View all recordings
          </Button>
        </div>
      )}
    </div>
  );
}
