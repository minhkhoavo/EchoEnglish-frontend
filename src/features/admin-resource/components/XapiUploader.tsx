import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, GraduationCap } from 'lucide-react';
import { useUploadXapiPackageMutation } from '../services/adminResourceApi';

interface XapiUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const XapiUploader = ({
  open,
  onOpenChange,
  onSuccess,
}: XapiUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadXapi, { isLoading }] = useUploadXapiPackageMutation();

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.zip')) {
      toast.error('Please select a .zip file (iSpring Suite export)');
      return;
    }
    setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a zip file first');
      return;
    }
    try {
      const result = await uploadXapi({ file }).unwrap();
      toast.success(result.message || 'xAPI package uploaded');
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Failed to upload xAPI package';
      toast.error(message);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) setFile(null);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Upload xAPI Package
          </DialogTitle>
          <DialogDescription>
            Upload a ZIP exported from iSpring Suite (Tin Can / xAPI). The
            server will extract files, host them on S3, and create a resource.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="xapi-zip">Package ZIP</Label>
          <label
            className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors ${
              isLoading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground mt-2">
                  Uploading & extracting...
                </span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-2">
                  {file ? file.name : 'Click to choose .zip file'}
                </span>
                {file && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </>
            )}
            <input
              id="xapi-zip"
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={handleSelect}
              disabled={isLoading}
            />
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
