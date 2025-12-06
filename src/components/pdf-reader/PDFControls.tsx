import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFControlsProps {
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function PDFControls({
  currentPage,
  numPages,
  onPageChange,
  onPrevious,
  onNext,
}: PDFControlsProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      onPageChange(page);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleSliderChange = (value: number[]) => {
    onPageChange(value[0]);
  };

  const progress = numPages > 0 ? ((currentPage - 1) / (numPages - 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={currentPage <= 1}
        className="shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page input */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-muted-foreground">Page</span>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-14 h-8 text-center text-sm"
        />
        <span className="text-sm text-muted-foreground">of {numPages}</span>
      </div>

      {/* Progress slider */}
      <div className="flex-1 px-2">
        <Slider
          value={[currentPage]}
          min={1}
          max={numPages || 1}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>

      {/* Progress percentage */}
      <span className="text-sm text-muted-foreground shrink-0 w-12 text-right">
        {Math.round(progress)}%
      </span>

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={currentPage >= numPages}
        className="shrink-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
