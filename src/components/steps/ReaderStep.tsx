import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PdfViewer } from '@/components/PdfViewer';
import { ArrowRight, FileText } from 'lucide-react';

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
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Review Your Document</CardTitle>
          <CardDescription>
            Take a moment to review your PDF before generating the summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center mb-2">
            {fileName}
          </div>
          
          <div className="w-full h-[60vh] rounded-lg border border-border overflow-hidden">
            <PdfViewer fileUrl={pdfUrl} />
          </div>

          {error && <ErrorMessage message={error} onDismiss={onClearError} />}

          <Button
            onClick={onProceed}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 w-4 h-4" />
                Processing Document...
              </>
            ) : (
              <>
                Generate Summary
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
