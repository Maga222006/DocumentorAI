import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin-slow"></div>
      </div>
      {message && (
        <p className="text-muted-foreground text-sm font-medium animate-pulse-soft">
          {message}
        </p>
      )}
    </div>
  );
}
