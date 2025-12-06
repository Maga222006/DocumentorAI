import { Check, Upload, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import { Step } from '@/types/tutor';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
  { key: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
  { key: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
];

const stepOrder: Step[] = ['upload', 'summary', 'quiz', 'feedback'];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto px-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'step-indicator',
                  isActive && 'step-indicator-active',
                  isCompleted && 'step-indicator-completed',
                  isPending && 'step-indicator-pending'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors duration-300 hidden sm:block',
                  isActive && 'text-primary',
                  isCompleted && 'text-primary',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'step-connector',
                  index < currentIndex ? 'step-connector-active' : 'step-connector-pending'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
