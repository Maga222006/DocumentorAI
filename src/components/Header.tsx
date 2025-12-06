import { GraduationCap, Upload } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { Step } from '@/types/tutor';
import { Button } from './ui/button';

interface HeaderProps {
  currentStep: Step;
  onNewDocument?: () => void;
  onNavigate?: (step: Step) => void;
  canNavigateTo?: (step: Step) => boolean;
}

export function Header({ currentStep, onNewDocument, onNavigate, canNavigateTo }: HeaderProps) {
  const showNewDocumentButton = currentStep === 'summary' || currentStep === 'feedback';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">AI Tutor</span>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <StepIndicator 
            currentStep={currentStep} 
            onNavigate={onNavigate}
            canNavigateTo={canNavigateTo}
          />
        </div>

        <div className="flex items-center gap-2">
          {showNewDocumentButton && onNewDocument && (
            <Button
              onClick={onNewDocument}
              variant="outline"
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              New Document
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
