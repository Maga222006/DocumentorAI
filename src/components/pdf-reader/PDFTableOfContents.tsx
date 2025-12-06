import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterInfo } from './types';

interface PDFTableOfContentsProps {
  chapters: ChapterInfo[];
  currentPage: number;
  onNavigate: (page: number) => void;
}

export function PDFTableOfContents({ chapters, currentPage, onNavigate }: PDFTableOfContentsProps) {
  const getActiveChapterIndex = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].page <= currentPage) {
        return i;
      }
    }
    return 0;
  };

  const activeIndex = getActiveChapterIndex();

  if (chapters.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No chapters detected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Table of Contents
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chapters.map((chapter, index) => (
            <button
              key={`${chapter.page}-${index}`}
              onClick={() => onNavigate(chapter.page)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-primary/10',
                index === activeIndex
                  ? 'bg-primary/15 text-primary font-medium border-l-2 border-primary'
                  : 'text-foreground/80'
              )}
              style={{ paddingLeft: `${(chapter.level + 1) * 12}px` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate flex-1">{chapter.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  p. {chapter.page}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
