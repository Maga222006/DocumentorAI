import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

  const isFillBlankType = (type: string) => {
    return ['fill_in_the_blank', 'fill_gap', 'fill_blank'].includes(type);
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-12">
          <LoadingSpinner message="Submitting your answers..." />
        </CardContent>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Ready for Your Quiz?</CardTitle>
            <CardDescription>
              You have {quiz.length} questions to answer. Take your time!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-center justify-center gap-8 text-sm flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-semibold text-foreground">{quiz.length}</div>
                <div className="text-muted-foreground">Questions</div>
              </div>
              <div className="h-12 w-px bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-semibold text-foreground">
                  {quiz.filter((q) => q.task_type === 'multiple_choice' || q.task_type === 'true_false').length}
                </div>
                <div className="text-muted-foreground">Multiple Choice</div>
              </div>
              <div className="h-12 w-px bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-3xl font-semibold text-foreground">
                  {quiz.filter((q) => q.task_type !== 'multiple_choice' && q.task_type !== 'true_false').length}
                </div>
                <div className="text-muted-foreground">Type In</div>
              </div>
            </div>
            <Button onClick={() => setHasStarted(true)}>
              Start Quiz
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderAnswerInput = () => {
    const type = question.task_type;
    const hasOptions = question.answer_options && question.answer_options.length > 0;

    if (type === 'multiple_choice' && hasOptions) {
      return (
        <RadioGroup
          value={userAnswers[currentQuestion]}
          onValueChange={(value) => onSetAnswer(currentQuestion, value)}
          className="space-y-2"
        >
          {question.answer_options!.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-3 rounded-md border p-3 transition-colors cursor-pointer',
                userAnswers[currentQuestion] === option
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal text-sm">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (type === 'true_false') {
      return (
        <div className="flex gap-3">
          {['True', 'False'].map((option) => (
            <Button
              key={option}
              variant={userAnswers[currentQuestion] === option ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onSetAnswer(currentQuestion, option)}
            >
              {option}
            </Button>
          ))}
        </div>
      );
    }

    if (isFillBlankType(type) && hasOptions) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Select the correct answer:</p>
          <div className="grid grid-cols-2 gap-2">
            {question.answer_options!.slice(0, 4).map((option, index) => (
              <Button
                key={index}
                variant={userAnswers[currentQuestion] === option ? 'default' : 'outline'}
                className="h-auto py-2 px-3 text-sm"
                onClick={() => onSetAnswer(currentQuestion, option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Type your answer below:
        </Label>
        <Textarea
          value={userAnswers[currentQuestion]}
          onChange={(e) => onSetAnswer(currentQuestion, e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[100px] resize-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Question {currentQuestion + 1} of {quiz.length}
        </span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          <span>{answeredCount} answered</span>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      <Card className="animate-fade-in" key={currentQuestion}>
        <CardHeader className="pb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {getQuestionTypeLabel(question.task_type)}
          </p>
          <CardTitle className="text-base font-medium leading-relaxed">
            {question.task}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderAnswerInput()}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className="flex-1"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentQuestion < quiz.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!allAnswered}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Quiz
          </Button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 flex-wrap">
        {quiz.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={cn(
              'h-7 w-7 rounded-full text-xs font-medium transition-colors',
              currentQuestion === index
                ? 'bg-primary text-primary-foreground'
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
