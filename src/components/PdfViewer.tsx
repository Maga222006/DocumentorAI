import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileUrl: string;
}

export function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handleSliderChange = (value: number[]) => {
    setPageNumber(value[0]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* PDF Display */}
      <div className="flex-1 overflow-auto flex items-start justify-center bg-muted/30 rounded-lg p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner className="w-8 h-8" />
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64 text-destructive">
              Failed to load PDF. Please try again.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
            loading={
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner className="w-6 h-6" />
              </div>
            }
          />
        </Document>
      </div>

      {/* Navigation Controls */}
      {!isLoading && numPages > 0 && (
        <div className="mt-4 space-y-3">
          {/* Arrow Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Slider Navigation */}
          {numPages > 1 && (
            <div className="px-4">
              <Slider
                value={[pageNumber]}
                min={1}
                max={numPages}
                step={1}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
