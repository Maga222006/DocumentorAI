import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { PDFTableOfContents } from './PDFTableOfContents';
import { PDFControls } from './PDFControls';
import { PDFZoomControls } from './PDFZoomControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterInfo } from './types';

interface PDFReaderProps {
  pdfUrl: string;
  fileName: string;
  onProceed: () => void;
  isLoading: boolean;
}

export function PDFReader({ pdfUrl, fileName, onProceed, isLoading }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);
  const [useIframe, setUseIframe] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // For now, use iframe-based PDF viewing for reliability
  // The PDF viewer will be shown in an iframe with browser's native PDF support
  
  const goToPage = useCallback((page: number) => {
    if (numPages === 0) return;
    const validPage = Math.max(1, Math.min(page, numPages));
    setCurrentPage(validPage);
    // Navigate within iframe if possible
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage({ type: 'goToPage', page: validPage }, '*');
      } catch (e) {
        // Cross-origin restriction - can't control iframe
      }
    }
  }, [numPages]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (numPages === 0) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPage(currentPage - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToPage(currentPage + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToPage(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToPage(numPages);
    }
  }, [currentPage, numPages, goToPage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setScale(1.0);

  const handleIframeLoad = () => {
    setPdfLoaded(true);
    // Try to detect page count - this is limited with iframe approach
    // For full features, we'd use react-pdf but that has compatibility issues
  };

  return (
    <div className="flex flex-col h-[80vh] rounded-xl border border-border bg-background overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
          </div>
        </div>
        
        <PDFZoomControls
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
        />
        
        <Button onClick={onProceed} disabled={isLoading} size="sm">
          {isLoading ? 'Processing...' : 'Generate Summary'}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'border-r border-border bg-muted/20 transition-all duration-300 overflow-hidden',
            sidebarOpen ? 'w-64' : 'w-0'
          )}
        >
          {sidebarOpen && (
            <PDFTableOfContents
              chapters={chapters}
              currentPage={currentPage}
              onNavigate={goToPage}
            />
          )}
        </div>

        {/* Main viewer */}
        <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            {!pdfLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/30">
                <Skeleton className="w-[80%] max-w-[600px] h-[70%]" />
                <span className="text-sm text-muted-foreground">Loading PDF...</span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${Math.round(scale * 100)}`}
              className="w-full h-full border-0"
              title="PDF Preview"
              onLoad={handleIframeLoad}
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${100 / scale}%`,
                height: `${100 / scale}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
