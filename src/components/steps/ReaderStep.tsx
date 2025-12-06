import { PDFReader } from '@/components/pdf-reader';
import { ErrorMessage } from '@/components/ErrorMessage';

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
    <div className="space-y-4 animate-fade-in">
      {error && <ErrorMessage message={error} onDismiss={onClearError} />}
      
      <PDFReader
        pdfUrl={pdfUrl}
        fileName={fileName}
        onProceed={onProceed}
        isLoading={isLoading}
      />
    </div>
  );
}
