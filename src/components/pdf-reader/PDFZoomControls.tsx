import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface PDFZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function PDFZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: PDFZoomControlsProps) {
  const percentage = Math.round(scale * 100);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        disabled={scale <= 0.5}
        className="h-8 w-8"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onZoomReset}
        className="h-8 px-2 min-w-[60px] text-sm"
        title="Reset zoom"
      >
        {percentage}%
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        disabled={scale >= 3}
        className="h-8 w-8"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
    </div>
  );
}
