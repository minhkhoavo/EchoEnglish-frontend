import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordingsList } from '../features/recordings/components/RecordingsList';
import { FileUploadDialog } from '../features/recordings/components/FileUploadDialog';
import { Button } from '../components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';

export default function RecordingsPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalyze = (recordingId: string) => {
    // Navigate to speech analyze page (recording detail) with the recording ID
    navigate(`/speech/recordings/${recordingId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    // Force re-render of RecordingsList component
    setRefreshKey((prev) => prev + 1);
  };

  const handleUploadComplete = (fileName: string) => {
    console.log('File uploaded successfully:', fileName);
    // Refresh the recordings list
    handleRefresh();
    // Also do a soft/hard reload to ensure any background processing is visible.
    // Soft: refetch is triggered by changing key; but some systems may require
    // a full reload to pick up newly processed items — do a gentle approach:
    // wait a short moment so backend can start processing, then refetch again.
    setTimeout(() => {
      handleRefresh();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Clean Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="h-6 w-px bg-slate-300"></div>

              <h1 className="text-xl font-semibold text-slate-900">
                Voice Recordings
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <FileUploadDialog onUploadComplete={handleUploadComplete}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio
                </Button>
              </FileUploadDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecordingsList key={refreshKey} onAnalyze={handleAnalyze} />
      </div>
    </div>
  );
}
