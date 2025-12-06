import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFTableOfContents } from './PDFTableOfContents';
import { PDFControls } from './PDFControls';
import { PDFZoomControls } from './PDFZoomControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterInfo } from './types';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width - 48); // Subtract padding
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Chapter detection patterns
  const chapterPatterns = [
    /^chapter\s+(\d+|[ivxlc]+)/i,
    /^part\s+(\d+|[ivxlc]+)/i,
    /^section\s+(\d+)/i,
    /^(\d+)\.\s+[A-Z]/,
    /^(introduction|preface|foreword|epilogue|conclusion|appendix)/i,
  ];

  const detectChaptersFromText = useCallback(async (pdf: any) => {
    const detectedChapters: ChapterInfo[] = [];
    
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        // Check first 500 characters for chapter patterns
        const firstText = text.substring(0, 500);
        
        for (const pattern of chapterPatterns) {
          const match = firstText.match(pattern);
          if (match) {
            const title = firstText.substring(0, 60).split('\n')[0].trim();
            detectedChapters.push({
              title: title || `Chapter ${detectedChapters.length + 1}`,
              page: i,
              level: 0,
            });
            break;
          }
        }
      } catch (error) {
        console.warn(`Failed to extract text from page ${i}`);
      }
    }
    
    return detectedChapters;
  }, [chapterPatterns]);

  const onDocumentLoadSuccess = useCallback(async (pdf: any) => {
    setNumPages(pdf.numPages);
    
    // Try to get outline/bookmarks first
    try {
      const outline = await pdf.getOutline();
      if (outline && outline.length > 0) {
        const bookmarks = await Promise.all(
          outline.map(async (item: any, index: number) => {
            let pageNum = 1;
            if (item.dest) {
              try {
                const dest = typeof item.dest === 'string' 
                  ? await pdf.getDestination(item.dest)
                  : item.dest;
                if (dest) {
                  const pageRef = dest[0];
                  const pageIndex = await pdf.getPageIndex(pageRef);
                  pageNum = pageIndex + 1;
                }
              } catch {
                pageNum = index + 1;
              }
            }
            return {
              title: item.title || `Section ${index + 1}`,
              page: pageNum,
              level: 0,
            };
          })
        );
        setChapters(bookmarks);
        return;
      }
    } catch (error) {
      console.warn('Failed to get PDF outline, falling back to text detection');
    }
    
    // Fallback to text-based chapter detection
    const detected = await detectChaptersFromText(pdf);
    if (detected.length > 0) {
      setChapters(detected);
    } else {
      // Create default chapters every 10 pages
      const defaultChapters: ChapterInfo[] = [];
      for (let i = 1; i <= pdf.numPages; i += 10) {
        defaultChapters.push({
          title: `Section ${Math.ceil(i / 10)}`,
          page: i,
          level: 0,
        });
      }
      setChapters(defaultChapters);
    }
  }, [detectChaptersFromText]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, numPages));
    setCurrentPage(validPage);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [numPages]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

  const getCurrentChapter = useCallback(() => {
    if (chapters.length === 0) return null;
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].page <= currentPage) {
        return chapters[i];
      }
    }
    return chapters[0];
  }, [chapters, currentPage]);

  return (
    <div className="flex flex-col h-[80vh] rounded-xl border border-border bg-background overflow-hidden">
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
          <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
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
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={(props) => {
                  setPdfDocument(props);
                  onDocumentLoadSuccess(props);
                }}
                loading={
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-[600px] h-[800px]" />
                    <span className="text-sm text-muted-foreground">Loading PDF...</span>
                  </div>
                }
                error={
                  <div className="text-destructive text-center p-8">
                    Failed to load PDF. Please try a different file.
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  width={Math.min(containerWidth, 800)}
                  loading={<Skeleton className="w-[600px] h-[800px]" />}
                  className="shadow-lg rounded-lg overflow-hidden"
                />
              </Document>
            </div>
          </ScrollArea>

          {/* Navigation footer */}
          <div className="border-t border-border p-3 bg-muted/30">
            <PDFControls
              currentPage={currentPage}
              numPages={numPages}
              onPageChange={goToPage}
              onPrevious={() => goToPage(currentPage - 1)}
              onNext={() => goToPage(currentPage + 1)}
            />
          </div>
        </div>
      </div>

      {/* Page navigation arrows */}
      {numPages > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}
    </div>
  );
}
