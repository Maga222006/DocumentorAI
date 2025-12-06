import { GraduationCap, Sparkles } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { Step } from '@/types/tutor';

interface HeaderProps {
  currentStep: Step;
}

export function Header({ currentStep }: HeaderProps) {
  return (
    <header className="w-full gradient-header shadow-soft">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-6">
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
          <div className="w-full bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>
      </div>
    </header>
  );
}
