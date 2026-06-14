import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  X,
  ZoomIn,
  Upload,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useUploadTestAudioMutation,
  useUploadTestImageMutation,
} from '../services/adminTestUploadApi';
import {
  GenerateAudioDialog,
  type GenerateAudioContext,
} from './voice/GenerateAudioDialog';

interface AudioPreviewProps {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  generateContext?: GenerateAudioContext;
}

export const AudioPreview = ({
  url,
  onChange,
  label = 'Audio URL',
  className,
  generateContext,
}: AudioPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadAudio, { isLoading: isUploading }] =
    useUploadTestAudioMutation();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    try {
      const res = await uploadAudio({ file }).unwrap();
      onChange(res.url);
      setError(false);
      toast.success('Audio uploaded.');
    } catch (err) {
      console.error('[AudioPreview] upload failed', err);
      toast.error('Failed to upload audio.');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => setIsPlaying(false);
  const handleError = () => setError(true);
  const handleCanPlay = () => setError(false);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          value={url || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setError(false);
          }}
          placeholder="https://example.com/audio.mp3"
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload audio to S3"
          className="flex-shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        {generateContext && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setGenOpen(true)}
            title="Generate audio with AI"
            className="flex-shrink-0 text-violet-600 hover:text-violet-700"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
        {url && (
          <Button
            type="button"
            variant={error ? 'destructive' : 'outline'}
            size="icon"
            onClick={togglePlay}
            disabled={error}
            className="flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onEnded={handleEnded}
          onError={handleError}
          onCanPlay={handleCanPlay}
          className="hidden"
        />
      )}
      {error && url && (
        <p className="text-xs text-red-500">
          Failed to load audio. Please check the URL.
        </p>
      )}
      {generateContext && (
        <GenerateAudioDialog
          open={genOpen}
          onOpenChange={setGenOpen}
          context={generateContext}
          onAccepted={(generatedUrl) => {
            onChange(generatedUrl);
            setError(false);
          }}
        />
      )}
    </div>
  );
};

interface ImagePreviewProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  className?: string;
}

export const ImagePreview = ({
  urls,
  onChange,
  label = 'Image URLs',
  className,
}: ImagePreviewProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(urls?.join(', ') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, { isLoading: isUploading }] =
    useUploadTestImageMutation();

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const newUrls = value
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    onChange(newUrls);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file
    if (files.length === 0) return;
    try {
      const uploaded = await Promise.all(
        files.map((file) => uploadImage({ file }).unwrap())
      );
      const newUrls = [...(urls || []), ...uploaded.map((u) => u.url)];
      setInputValue(newUrls.join(', '));
      onChange(newUrls);
      toast.success(
        uploaded.length > 1
          ? `${uploaded.length} images uploaded.`
          : 'Image uploaded.'
      );
    } catch (err) {
      console.error('[ImagePreview] upload failed', err);
      toast.error('Failed to upload image.');
    }
  };

  const removeImage = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setInputValue(newUrls.join(', '));
    onChange(newUrls);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="https://example.com/image1.png, https://example.com/image2.png"
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload image(s) to S3"
          className="flex-shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Image Thumbnails */}
      {urls && urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {urls.map((url, index) => (
            <div
              key={index}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border bg-slate-100"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => setSelectedImage(url)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-red-500/50"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex items-center justify-center p-4">
              <img
                src={selectedImage}
                alt="Full preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
