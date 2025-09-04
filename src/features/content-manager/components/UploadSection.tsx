import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link2, Plus, FileText, CheckCircle2, X, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner"
import { useUploadFileMutation } from '../services/contentApi';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

interface UploadSectionProps {
  onFilesUpload: (files: File[]) => void;
  onUrlAdd: (url: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onFilesUpload, onUrlAdd }) => {
  const [urlInput, setUrlInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadFile] = useUploadFileMutation();

  const handleUploadFile = useCallback(async (file: File, id: string) => {
    setUploadedFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'uploading' } : f))
    );
    try {
      await uploadFile({ file, id }).unwrap();
      setUploadedFiles(prev =>
        prev.map(f => (f.id === id ? { ...f, status: 'success', progress: 100 } : f))
      );
      toast.success(`File ${file.name} uploaded.`, {
        description: "Upload successful!",
      });
      onFilesUpload([file]);
    } catch (error: unknown) {
      setUploadedFiles(prev =>
        prev.map(f => (f.id === id ? { ...f, status: 'error' } : f))
      );
      const errorMessage = error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data 
        ? String((error.data as {message: string}).message) 
        : "An unknown error occurred.";
      toast.error(`File ${file.name}: ${errorMessage}`, {
        description: "Upload failed",
      });
    }
  }, [uploadFile, onFilesUpload]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: file.name + file.size + file.lastModified, // Simple unique ID
      file,
      status: 'pending',
      progress: 0,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUploadAll = () => {
    const filesToUpload = uploadedFiles.filter(f => f.status === 'pending');
    if (filesToUpload.length > 0) {
      filesToUpload.forEach(file => {
        handleUploadFile(file.file, file.id);
      });
    }
  };

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onUrlAdd(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlAdd();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isAnyFileUploading = uploadedFiles.some(f => f.status === 'uploading');
  const hasPendingFiles = uploadedFiles.some(f => f.status === 'pending');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* File Upload */}
      <Card className="glass-card shadow-medium hover:shadow-strong transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> File Upload
          </CardTitle>
          <CardDescription>
            Drag and drop files here, or click to browse. Supports PDF, DOC, DOCX, and TXT files (max 10MB).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop files here</p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary">click to browse</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB • Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Files to Upload ({uploadedFiles.length})</span>
                <Button
                  onClick={handleUploadAll}
                  disabled={isAnyFileUploading || !hasPendingFiles}
                  className="bg-gradient-primary"
                >
                  {isAnyFileUploading ? 'Uploading...' : `Upload ${uploadedFiles.filter(f => f.status === 'pending').length} File(s)`}
                </Button>
              </div>
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === 'pending' && (
                      <Badge variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
                      </Badge>
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="w-24 h-2" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <Badge variant="outline" className="text-success border-success/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Success
                      </Badge>
                    )}
                    {uploadedFile.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" /> Error
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Input */}
      <Card className="glass-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-6 w-6 text-primary" />
            <span>Add from URL</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="glass-input"
            />
            <Button
              onClick={handleUrlAdd}
              disabled={!urlInput.trim()}
              className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-pink"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add URL
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Add articles, blogs, or any web content for analysis
            </p>
            <div className="p-4 bg-gradient-hero rounded-lg border border-primary/20">
              <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 animate-pulse" />
                  <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">AI Content Analysis</p>
                  <p className="text-muted-foreground">
                      Our AI will automatically extract key concepts, vocabulary, and create study materials from any web content.
                  </p>
                  </div>
              </div>
            </div>    
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
