import { Check, Upload, BookOpen, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import { Step } from '@/types/tutor';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: Step;
  onNavigate?: (step: Step) => void;
  canNavigateTo?: (step: Step) => boolean;
}

const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: 'Upload', icon: <Upload className="h-3.5 w-3.5" /> },
  { key: 'reader', label: 'Read', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: 'summary', label: 'Summary', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'quiz', label: 'Quiz', icon: <HelpCircle className="h-3.5 w-3.5" /> },
  { key: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-3.5 w-3.5" /> },
];

const stepOrder: Step[] = ['upload', 'reader', 'summary', 'quiz', 'feedback'];

export function StepIndicator({ currentStep, onNavigate, canNavigateTo }: StepIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  const handleClick = (step: Step) => {
    if (onNavigate && canNavigateTo?.(step)) {
      onNavigate(step);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;
        const isClickable = canNavigateTo?.(step.key) ?? false;

        return (
          <div key={step.key} className="flex items-center">
            <button
              type="button"
              onClick={() => handleClick(step.key)}
              disabled={!isClickable}
              className={cn(
                'step-indicator',
                isActive && 'step-indicator-active',
                isCompleted && 'step-indicator-completed',
                isPending && 'step-indicator-pending',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
              title={step.label}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.icon}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'step-connector w-8',
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
