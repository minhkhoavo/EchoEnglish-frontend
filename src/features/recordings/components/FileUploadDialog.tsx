import { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  Upload,
  File as FileIcon,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import axiosInstance from '../../../core/api/axios';
import type { AxiosProgressEvent } from 'axios';

interface FileUploadDialogProps {
  onUploadComplete?: (fileName: string) => void;
  children: React.ReactNode;
}

export function FileUploadDialog({
  onUploadComplete,
  children,
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only accept mp3 and wav as requested
  const acceptedFileTypes = '.mp3,.wav';
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type - only mp3 and wav allowed
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['mp3', 'wav'];

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert('Please select a valid audio file (.mp3, .wav)');
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      alert('File too large. Please select a file smaller than 50MB.');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    const form = new FormData();
    // server expects field name 'file' (assumption). If different, adjust accordingly.
    form.append('file', selectedFile);

    try {
      const res = await axiosInstance.post('/speech/assess', form, {
        headers: {
          // override default application/json header on instance
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent?: AxiosProgressEvent) => {
          const loaded = progressEvent?.loaded ?? 0;
          const total = progressEvent?.total ?? 0;
          if (total) {
            const percent = Math.round((loaded / total) * 100);
            setUploadProgress(percent);
          } else if (loaded) {
            // approximate progress when total is not available
            setUploadProgress((p) =>
              Math.min(99, p + Math.round((loaded / (1024 * 1024)) * 5))
            );
          } else {
            setUploadProgress((p) => Math.min(99, p + 5));
          }
        },
      });

      setUploadProgress(100);
      setUploadStatus('success');

      // Pass a string filename to callback. Prefer server-provided fileName when available.
      const serverFileName = res?.data?.fileName;
      const fileNameToSend =
        typeof serverFileName === 'string' ? serverFileName : selectedFile.name;
      onUploadComplete?.(fileNameToSend);

      // Close dialog after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Audio File
          </DialogTitle>
          <DialogDescription>
            Select an audio file for pronunciation analysis. Supports MP3 and
            WAV (max 50MB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          {!selectedFile && (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Choose file or drag and drop here
                </p>
                <p className="text-sm text-gray-500">
                  Supports common audio formats
                </p>
              </div>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileIcon className="w-8 h-8 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!isUploading && uploadStatus !== 'success' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="font-medium">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <div className="mt-4 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Upload successful!</span>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Upload failed. Please try again.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile || isUploading || uploadStatus === 'success'
            }
            className="min-w-[100px]"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
