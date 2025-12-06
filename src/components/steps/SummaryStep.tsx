import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Label } from '@/components/ui/label';

interface SummaryStepProps {
  summary: string;
  isLoading: boolean;
  error: string | null;
  supervisorFeedback?: string;
  onGenerateQuiz: (numQuestions: number, comment?: string) => Promise<boolean>;
  onGoToReader: () => void;
  onClearError: () => void;
}

export function SummaryStep({ summary, isLoading, error, supervisorFeedback, onGenerateQuiz, onGoToReader, onClearError }: SummaryStepProps) {
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerateQuiz = async () => {
    await onGenerateQuiz(numQuestions, supervisorFeedback);
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-12">
          <LoadingSpinner message="Creating your personalized quiz..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Document Summary</CardTitle>
          <CardDescription>
            Here's what we learned from your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <ErrorMessage message={error} onDismiss={onClearError} />}

          <div className="rounded-md border">
            <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/50">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Summary</span>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed text-sm">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">{children}</blockquote>,
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate Quiz</CardTitle>
          <CardDescription>
            Test your understanding with a personalized quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Number of Questions</Label>
              <span className="text-2xl font-semibold tabular-nums">{numQuestions}</span>
            </div>
            <Slider
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
              min={1}
              max={25}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>25</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onGoToReader}
              className="flex-1"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View Document
            </Button>
            <Button
              onClick={handleGenerateQuiz}
              className="flex-1"
            >
              Generate Quiz
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
