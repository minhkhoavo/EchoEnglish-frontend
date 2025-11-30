import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  X,
  ZoomIn,
} from 'lucide-react';
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

interface AudioPreviewProps {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export const AudioPreview = ({
  url,
  onChange,
  label = 'Audio URL',
  className,
}: AudioPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="https://example.com/image1.png, https://example.com/image2.png"
      />

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
