import { useState, useMemo } from 'react';
import type { ContentItem, GenerationType } from './types/content.types';
import { 
  Search, Grid, List, BookOpen, Brain, Sparkles, 
  Clock, MoreVertical,
  FileText, AudioLines,
  Play, Calendar,
  CheckCircle2, Zap,
  AlertCircle, Upload,
  RefreshCw, BookMarked,
  Loader2, ExternalLink
} from 'lucide-react';

// Mock API data based on your backend response
const mockApiData = [
  {
    "file_name": "TOEIC Listening Practice - Business Meetings.pdf",
    "file_type": "application/pdf",
    "language": "English",
    "file_size_kb": 245,
    "tags_part": ["business", "meetings", "listening"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/toeic-listening.pdf",
    "user_id": 88,
    "id": 1,
    "upload_timestamp": "2025-08-22T09:15:30"
  },
  {
    "file_name": "Advanced Grammar Rules and Exceptions.docx",
    "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "language": "English",
    "file_size_kb": 180,
    "tags_part": ["grammar", "advanced", "rules"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/grammar-rules.docx",
    "user_id": 88,
    "id": 2,
    "upload_timestamp": "2025-08-22T08:45:15"
  },
  {
    "file_name": "TOEIC Reading Comprehension Strategies.pdf",
    "file_type": "application/pdf",
    "language": "English",
    "file_size_kb": 320,
    "tags_part": ["reading", "comprehension", "strategies"],
    "status": "Processing",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/reading-strategies.pdf",
    "user_id": 88,
    "id": 3,
    "upload_timestamp": "2025-08-22T11:30:45"
  },
  {
    "file_name": "Business Vocabulary List.txt",
    "file_type": "text/plain",
    "language": "English",
    "file_size_kb": 45,
    "tags_part": ["vocabulary", "business"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/business-vocab.txt",
    "user_id": 88,
    "id": 4,
    "upload_timestamp": "2025-08-22T07:20:10"
  },
  {
    "file_name": "Speaking Practice Dialogues.pdf",
    "file_type": "application/pdf",
    "language": "English",
    "file_size_kb": 156,
    "tags_part": ["speaking", "dialogues", "practice"],
    "status": "Failed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/speaking-dialogues.pdf",
    "user_id": 88,
    "id": 5,
    "upload_timestamp": "2025-08-22T10:15:22"
  },
  {
    "file_name": "TOEIC Test Format Overview.docx",
    "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "language": "English",
    "file_size_kb": 89,
    "tags_part": ["test", "format", "overview"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/test-format.docx",
    "user_id": 88,
    "id": 6,
    "upload_timestamp": "2025-08-22T12:05:33"
  },
  {
    "file_name": "Listening Exercise Audio Transcripts.txt",
    "file_type": "text/plain",
    "language": "English",
    "file_size_kb": 78,
    "tags_part": ["listening", "transcripts", "audio"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/transcripts.txt",
    "user_id": 88,
    "id": 7,
    "upload_timestamp": "2025-08-22T13:40:18"
  },
  {
    "file_name": "Common Mistakes in TOEIC.pdf",
    "file_type": "application/pdf",
    "language": "English",
    "file_size_kb": 203,
    "tags_part": ["mistakes", "common", "tips"],
    "status": "Processing",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/common-mistakes.pdf",
    "user_id": 88,
    "id": 8,
    "upload_timestamp": "2025-08-22T14:25:07"
  },
  {
    "file_name": "Writing Task Templates.docx",
    "file_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "language": "English",
    "file_size_kb": 112,
    "tags_part": ["writing", "templates", "tasks"],
    "status": "Failed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/writing-templates.docx",
    "user_id": 88,
    "id": 9,
    "upload_timestamp": "2025-08-22T15:10:41"
  },
  {
    "file_name": "Phrasal Verbs for Business English.txt",
    "file_type": "text/plain",
    "language": "English",
    "file_size_kb": 67,
    "tags_part": ["phrasal", "verbs", "business"],
    "status": "Indexed",
    "s3_url": "https://my1-test2-bucket.s3.us-east-1.amazonaws.com/phrasal-verbs.txt",
    "user_id": 88,
    "id": 10,
    "upload_timestamp": "2025-08-22T16:30:55"
  }
];

// Helper functions - moved outside component
const getFileCategory = (fileType: string) => {
  if (fileType?.includes('pdf')) return 'Document';
  if (fileType?.includes('text')) return 'Text';
  if (fileType?.includes('word')) return 'Document';
  if (fileType?.includes('audio')) return 'Audio';
  if (fileType?.includes('video')) return 'Video';
  return 'Other';
};

const estimateReadingTime = (sizeKb: number) => {
  const minutes = Math.ceil(sizeKb / 10);
  return `${minutes} min`;
};

const estimateVocabulary = (sizeKb: number) => {
  return Math.ceil(sizeKb * 8);
};

interface ContentLibraryProps {
  readyItems?: typeof mockApiData;
  onGenerateContent?: (item: ContentItem, type: GenerationType) => Promise<void>;
  isGenerating?: boolean;
}

const ContentLibrary = ({ 
  readyItems = mockApiData,
  onGenerateContent,
  isGenerating = false 
}: ContentLibraryProps) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedItems, setSelectedItems] = useState([]);

  // Process backend data for display
  const processedItems = useMemo(() => {
    return readyItems.map(item => ({
      ...item,
      id: String(item.id),
      name: item.file_name,
      type: 'file' as const,
      status: (
        item.status === 'Indexed' ? 'ready' :
        item.status === 'Failed' ? 'error' :
        item.status === 'Processing' ? 'processing' :
        'uploaded'
      ) as 'ready' | 'error' | 'processing' | 'uploaded',
      displayName: item.file_name,
      category: getFileCategory(item.file_type),
      readingTime: estimateReadingTime(item.file_size_kb),
      vocabulary: estimateVocabulary(item.file_size_kb),
      suggestedQuizzes: Math.ceil(item.file_size_kb / 10),
      suggestedFlashcards: Math.ceil(item.file_size_kb / 3),
      uploadDate: new Date(item.upload_timestamp).toLocaleDateString(),
      lastAccessed: new Date(item.upload_timestamp).toLocaleDateString()
    }));
  }, [readyItems]);

  // Filter and sort logic
  const filteredItems = useMemo(() => {
  const items = processedItems.filter(item => {
      const matchesSearch = item.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesFileType = selectedFileType === 'all' || item.category === selectedFileType;
      
      return matchesSearch && matchesStatus && matchesFileType;
    });

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.upload_timestamp).getTime() - new Date(a.upload_timestamp).getTime();
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'size':
          return b.file_size_kb - a.file_size_kb;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return items;
  }, [processedItems, searchQuery, selectedStatus, selectedFileType, sortBy]);

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType?.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType?.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
    if (fileType?.includes('audio')) return <AudioLines className="h-5 w-5 text-purple-500" />;
    if (fileType?.includes('video')) return <Play className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getStatusIndicator = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'indexed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'indexed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleItemGenerate = async (item: ContentItem, type: GenerationType) => {
    if (onGenerateContent) {
      try {
        await onGenerateContent(item, type);
      } catch (error) {
        console.error('Generation failed:', error);
      }
    }
  };

  const formatFileSize = (sizeKb: number) => {
    if (sizeKb < 1024) return `${sizeKb} KB`;
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  };

  // Statistics
  const stats = {
    total: processedItems.length,
  indexed: processedItems.filter(item => item.status === 'ready').length,
  failed: processedItems.filter(item => item.status === 'error').length,
    totalQuizzes: processedItems.reduce((acc, item) => acc + item.suggestedQuizzes, 0),
    totalFlashcards: processedItems.reduce((acc, item) => acc + item.suggestedFlashcards, 0)
  };

  if (processedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content uploaded yet</h3>
            <p className="text-gray-600 mb-6">Upload your first document to start creating AI-powered study materials.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
              <Upload className="h-4 w-4" />
              Upload First Content
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-blue-600" />
              Content Library
            </h1>
            <p className="text-gray-600 mt-2">
              {stats.total} materials • {stats.indexed} ready • {stats.totalQuizzes} possible quizzes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="h-4 w-4" />
              Upload Content
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Zap className="h-4 w-4" />
              Bulk Generate
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready Content</p>
                <p className="text-xl font-bold text-green-600">{stats.indexed}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Possible Quizzes</p>
                <p className="text-xl font-bold text-purple-600">{stats.totalQuizzes}</p>
              </div>
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flashcards</p>
                <p className="text-xl font-bold text-pink-600">{stats.totalFlashcards}</p>
              </div>
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files by name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Indexed">Indexed</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Document">Documents</option>
                <option value="Text">Text Files</option>
                <option value="Audio">Audio</option>
                <option value="Video">Video</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recent First</option>
                <option value="name">Name A-Z</option>
                <option value="size">File Size</option>
                <option value="status">Status</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
            >
              {viewMode === 'grid' ? (
                // Grid View
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(item.file_type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={item.displayName}>
                          {item.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.category} • {formatFileSize(item.file_size_kb)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIndicator(item.status)}
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Status & Upload Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {item.uploadDate}
                    </span>
                  </div>

                  {/* Estimated Learning Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Est. Time</p>
                        <p className="text-sm font-semibold text-gray-900">{item.readingTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Vocabulary</p>
                        <p className="text-sm font-semibold text-gray-900">{item.vocabulary}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Language</p>
                        <p className="text-sm font-semibold text-gray-900">{item.language || 'Auto'}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Generation Potential - Only for indexed files */}
                  {item.status === 'ready' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Brain className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Quizzes</p>
                        <p className="font-semibold text-blue-600">{item.suggestedQuizzes}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <Sparkles className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Cards</p>
                        <p className="font-semibold text-purple-600">{item.suggestedFlashcards}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {item.status === 'ready' ? (
                      <>
                        <button 
                          onClick={() => handleItemGenerate(item, 'quiz')}
                          disabled={isGenerating}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 inline mr-1" />
                          )}
                          Generate
                        </button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </button>
                      </>
                    ) : item.status === 'error' ? (
                      <button className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium cursor-not-allowed">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Processing Failed
                      </button>
                    ) : (
                      <button className="flex-1 bg-yellow-100 text-yellow-700 py-2 px-3 rounded-lg text-sm font-medium cursor-not-allowed">
                        <RefreshCw className="h-4 w-4 inline mr-1 animate-spin" />
                        Processing...
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // List View
                <div className="p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(item.file_type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate" title={item.displayName}>
                        {item.displayName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{item.category}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500">{formatFileSize(item.file_size_kb)}</span>
                        <span className="text-xs text-gray-500">{item.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {item.status === 'ready' && (
                      <>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-blue-600">{item.suggestedQuizzes}</p>
                          <p className="text-xs text-gray-500">Quizzes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-purple-600">{item.suggestedFlashcards}</p>
                          <p className="text-xs text-gray-500">Cards</p>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2">
                      {getStatusIndicator(item.status)}
                      {item.status === 'ready' && (
                        <button 
                          onClick={() => handleItemGenerate(item, 'quiz')}
                          disabled={isGenerating}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State for Filtered Results */}
        {filteredItems.length === 0 && processedItems.length > 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No files match your filters</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search query or filter settings.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedFileType('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;