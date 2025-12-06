import { GraduationCap, Sparkles, Upload } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { Step } from '@/types/tutor';
import { Button } from './ui/button';

interface HeaderProps {
  currentStep: Step;
  onNewDocument?: () => void;
}

export function Header({ currentStep, onNewDocument }: HeaderProps) {
  const showNewDocumentButton = currentStep === 'summary' || currentStep === 'feedback';

  return (
    <header className="w-full gradient-header shadow-soft">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
                  AI Tutor
                </h1>
                <Sparkles className="w-5 h-5 text-primary-foreground/80 animate-pulse-soft" />
              </div>
            </div>
            {showNewDocumentButton && onNewDocument && (
              <Button
                onClick={onNewDocument}
                variant="secondary"
                size="sm"
                className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                New Document
              </Button>
            )}
          </div>
          <div className="w-full bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>
      </div>
    </header>
  );
}
