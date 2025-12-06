import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { QuizQuestion } from '@/types/tutor';
import { cn } from '@/lib/utils';

interface QuizStepProps {
  quiz: QuizQuestion[];
  userAnswers: string[];
  isLoading: boolean;
  error: string | null;
  onSetAnswer: (questionIndex: number, answer: string) => void;
  onSubmit: () => Promise<boolean>;
  onClearError: () => void;
}

export function QuizStep({
  quiz,
  userAnswers,
  isLoading,
  error,
  onSetAnswer,
  onSubmit,
  onClearError,
}: QuizStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const answeredCount = userAnswers.filter((a) => a.trim() !== '').length;
  const progress = (answeredCount / quiz.length) * 100;
  const allAnswered = answeredCount === quiz.length;
  const question = quiz[currentQuestion];

  // Helper to determine question type display
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True or False';
      case 'short_answer':
        return 'Short Answer';
      case 'fill_in_the_blank':
      case 'fill_gap':
      case 'fill_blank':
        return 'Fill in the Blank';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // Check if a question type should show options (if available) or text input
  const isFillBlankType = (type: string) => {
    return ['fill_in_the_blank', 'fill_gap', 'fill_blank'].includes(type);
  };

  if (isLoading) {
    return (
      <Card className="p-12 shadow-card animate-fade-in">
        <LoadingSpinner message="Submitting your answers..." />
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Ready for Your Quiz?</h2>
          <p className="text-muted-foreground">
            You have {quiz.length} questions to answer. Take your time!
          </p>
        </div>

        <Card className="p-8 shadow-card text-center">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
            <HelpCircle className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-4 mb-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary">{quiz.length}</div>
              <div className="text-muted-foreground">Total Questions</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {quiz.filter((q) => q.task_type === 'multiple_choice').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Multiple Choice</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-accent">
                  {quiz.filter((q) => 
                    q.task_type === 'fill_in_the_blank' || 
                    q.task_type === 'fill_gap' || 
                    q.task_type === 'fill_blank'
                  ).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Fill in the Gap</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {quiz.filter((q) => q.task_type === 'short_answer').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Type In</div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setHasStarted(true)}
            size="lg"
            className="gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-all duration-300"
          >
            Start Quiz
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  // Render answer input based on question type
  const renderAnswerInput = () => {
    const type = question.task_type;
    const hasOptions = question.answer_options && question.answer_options.length > 0;

    // Multiple choice - always show radio buttons
    if (type === 'multiple_choice' && hasOptions) {
      return (
        <RadioGroup
          value={userAnswers[currentQuestion]}
          onValueChange={(value) => onSetAnswer(currentQuestion, value)}
          className="space-y-3"
        >
          {question.answer_options!.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer',
                userAnswers[currentQuestion] === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    // True/False
    if (type === 'true_false') {
      return (
        <div className="flex gap-4">
          {['True', 'False'].map((option) => (
            <Button
              key={option}
              variant={userAnswers[currentQuestion] === option ? 'default' : 'outline'}
              className={cn(
                'flex-1 h-14 text-lg transition-all duration-200',
                userAnswers[currentQuestion] === option &&
                  'gradient-primary text-primary-foreground shadow-soft'
              )}
              onClick={() => onSetAnswer(currentQuestion, option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    }

    // Fill in the blank - show 4 answer options only (no text input)
    if (isFillBlankType(type) && hasOptions) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select the correct answer:</p>
          <div className="grid grid-cols-2 gap-3">
            {question.answer_options!.slice(0, 4).map((option, index) => (
              <Button
                key={index}
                variant={userAnswers[currentQuestion] === option ? 'default' : 'outline'}
                className={cn(
                  'h-12 transition-all duration-200',
                  userAnswers[currentQuestion] === option &&
                    'gradient-primary text-primary-foreground shadow-soft'
                )}
                onClick={() => onSetAnswer(currentQuestion, option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Short answer or fill blank without options - show text input
    return (
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">
          Type your answer below:
        </Label>
        <Textarea
          value={userAnswers[currentQuestion]}
          onChange={(e) => onSetAnswer(currentQuestion, e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[120px] text-base resize-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Question {currentQuestion + 1} of {quiz.length}
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" />
          <span>{answeredCount} answered</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      <Card className="shadow-card overflow-hidden animate-scale-in" key={currentQuestion}>
        <div className="p-4 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {getQuestionTypeLabel(question.task_type)}
          </span>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-lg font-medium text-foreground">{question.task}</p>
          {renderAnswerInput()}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentQuestion < quiz.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="flex-1 gradient-primary text-primary-foreground"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!allAnswered}
            className="flex-1 gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-all duration-300 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Quiz
          </Button>
        )}
      </div>

      {/* Question navigator */}
      <div className="flex justify-center gap-2 flex-wrap">
        {quiz.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={cn(
              'w-8 h-8 rounded-full text-sm font-medium transition-all duration-200',
              currentQuestion === index
                ? 'gradient-primary text-primary-foreground shadow-soft'
                : userAnswers[index]?.trim()
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
