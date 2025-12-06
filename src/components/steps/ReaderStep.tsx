import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PdfViewer } from '@/components/PdfViewer';
import { ArrowRight, Loader2, Maximize2, X } from 'lucide-react';

interface ReaderStepProps {
  pdfUrl: string;
  fileName: string;
  isLoading: boolean;
  isSummaryReady: boolean;
  error: string | null;
  onProceed: () => void;
  onClearError: () => void;
}

export function ReaderStep({
  pdfUrl,
  fileName,
  isLoading,
  isSummaryReady,
  error,
  onProceed,
  onClearError,
}: ReaderStepProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Press Esc to exit</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Fullscreen PDF Viewer - larger scale */}
        <div className="flex-1 overflow-hidden">
          <PdfViewer fileUrl={pdfUrl} scale={1.5} />
        </div>

        {/* Fullscreen Footer */}
        <div className="border-t p-4">
          <Button
            onClick={onProceed}
            disabled={!isSummaryReady}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                Summary
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Review Your Document</CardTitle>
          <CardDescription>
            Take a moment to review your PDF before generating the summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground truncate">
              {fileName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="text-muted-foreground"
            >
              <Maximize2 className="h-4 w-4 mr-1.5" />
              Fullscreen
            </Button>
          </div>
          
          <div className="w-full h-[60vh] rounded-md border overflow-hidden">
            <PdfViewer fileUrl={pdfUrl} scale={1} />
          </div>

          {error && <ErrorMessage message={error} onDismiss={onClearError} />}

          <Button
            onClick={onProceed}
            disabled={!isSummaryReady}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                Summary
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
