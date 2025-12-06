import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PdfViewer } from '@/components/PdfViewer';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';

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
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Review Your Document</CardTitle>
          <CardDescription>
            Take a moment to review your PDF before generating the summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {fileName}
          </p>
          
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
