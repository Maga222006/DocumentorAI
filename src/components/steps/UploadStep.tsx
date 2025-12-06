import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { cn } from '@/lib/utils';

interface UploadStepProps {
  isLoading: boolean;
  error: string | null;
  onUpload: (file: File) => boolean | Promise<boolean>;
  onClearError: () => void;
}

export function UploadStep({ isLoading, error, onUpload, onClearError }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      onClearError();
    }
  }, [onClearError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onClearError();
    }
  }, [onClearError]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (file) {
      await onUpload(file);
    }
  }, [file, onUpload]);

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-12">
          <LoadingSpinner message="Analyzing your document..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Upload Your Document</CardTitle>
          <CardDescription>
            Upload a PDF document to get started with your personalized learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <ErrorMessage message={error} onDismiss={onClearError} />}

          <div
            className={cn(
              'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-muted'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              file && 'border-primary/50 bg-muted/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="block p-8 cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {!file ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
