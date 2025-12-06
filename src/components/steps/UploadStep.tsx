import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { cn } from '@/lib/utils';

interface UploadStepProps {
  isLoading: boolean;
  error: string | null;
  onUpload: (file: File) => Promise<boolean>;
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
      <Card className="p-12 shadow-card animate-fade-in">
        <LoadingSpinner message="Analyzing your document..." />
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Document</h2>
        <p className="text-muted-foreground">
          Upload a PDF document to get started with your personalized learning experience
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      <Card
        className={cn(
          'relative border-2 border-dashed transition-all duration-300 cursor-pointer group',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          file && 'border-primary/30 bg-primary/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block p-12 cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          {!file ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-1">
                  Drag and drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-foreground truncate max-w-xs">
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
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </label>
      </Card>

      <Button
        onClick={handleUpload}
        disabled={!file}
        size="lg"
        className="w-full gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload & Summarize
      </Button>
    </div>
  );
}
