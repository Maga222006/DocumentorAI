import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PdfViewer } from '@/components/PdfViewer';
import { ArrowRight, Loader2, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderStepProps {
  pdfUrl: string;
  fileName: string;
  isLoading: boolean;
  error: string | null;
  onProceed: () => void;
  onClearError: () => void;
}

export function ReaderStep({
  pdfUrl,
  fileName,
  isLoading,
  error,
  onProceed,
  onClearError,
}: ReaderStepProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Fullscreen PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <PdfViewer fileUrl={pdfUrl} />
        </div>

        {/* Fullscreen Footer */}
        <div className="border-t p-4">
          <Button
            onClick={onProceed}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                Generate Summary
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
            <PdfViewer fileUrl={pdfUrl} />
          </div>

          {error && <ErrorMessage message={error} onDismiss={onClearError} />}

          <Button
            onClick={onProceed}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                Generate Summary
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
