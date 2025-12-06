import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export interface QuestionCounts {
  multipleChoice: number;
  fillGap: number;
  typeIn: number;
}

interface SummaryStepProps {
  summary: string;
  isLoading: boolean;
  error: string | null;
  onGenerateQuiz: (counts: QuestionCounts) => Promise<boolean>;
  onClearError: () => void;
}

export function SummaryStep({ summary, isLoading, error, onGenerateQuiz, onClearError }: SummaryStepProps) {
  const [multipleChoice, setMultipleChoice] = useState(2);
  const [fillGap, setFillGap] = useState(2);
  const [typeIn, setTypeIn] = useState(1);

  const totalQuestions = multipleChoice + fillGap + typeIn;

  const handleGenerateQuiz = async () => {
    await onGenerateQuiz({ multipleChoice, fillGap, typeIn });
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
        <div className="p-6 max-h-[400px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-a:text-primary">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">{children}</h3>,
              p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-foreground">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-foreground">{children}</ol>,
              li: ({ children }) => <li className="text-foreground">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">{children}</blockquote>,
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">Generate Quiz</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-foreground">
                  Multiple Choice
                </label>
                <span className="text-xl font-bold text-primary">{multipleChoice}</span>
              </div>
              <Slider
                value={[multipleChoice]}
                onValueChange={(value) => setMultipleChoice(value[0])}
                min={0}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-foreground">
                  Fill in the Gap
                </label>
                <span className="text-xl font-bold text-accent">{fillGap}</span>
              </div>
              <Slider
                value={[fillGap]}
                onValueChange={(value) => setFillGap(value[0])}
                min={0}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-foreground">
                  Type In (Short Answer)
                </label>
                <span className="text-xl font-bold text-primary">{typeIn}</span>
              </div>
              <Slider
                value={[typeIn]}
                onValueChange={(value) => setTypeIn(value[0])}
                min={0}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <span className="text-sm text-muted-foreground">Total Questions: </span>
            <span className="text-xl font-bold text-primary">{totalQuestions}</span>
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
