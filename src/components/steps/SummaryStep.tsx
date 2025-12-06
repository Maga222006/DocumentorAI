import { useState } from 'react';
import { FileText, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface SummaryStepProps {
  summary: string;
  isLoading: boolean;
  error: string | null;
  onGenerateQuiz: (numQuestions: number) => Promise<boolean>;
  onClearError: () => void;
}

export function SummaryStep({ summary, isLoading, error, onGenerateQuiz, onClearError }: SummaryStepProps) {
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerateQuiz = async () => {
    await onGenerateQuiz(numQuestions);
  };

  if (isLoading) {
    return (
      <Card className="p-12 shadow-card animate-fade-in">
        <LoadingSpinner message="Creating your personalized quiz..." />
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Document Summary</h2>
        <p className="text-muted-foreground">
          Here's what we learned from your document
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Summary</span>
        </div>
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Generate Quiz</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-foreground">
                Number of Questions
              </label>
              <span className="text-2xl font-bold text-primary">{numQuestions}</span>
            </div>
            <Slider
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuiz}
            size="lg"
            className="w-full gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-all duration-300"
          >
            Generate Quiz
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
