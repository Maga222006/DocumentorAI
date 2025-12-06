import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Upload, Bot, User, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ChatMessage } from '@/types/tutor';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface FeedbackStepProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<boolean>;
  onNewDocument: () => void;
  onNewQuiz: () => void;
  onGoToReader: () => void;
  onClearError: () => void;
}

export function FeedbackStep({
  messages,
  isLoading,
  error,
  onSendMessage,
  onNewDocument,
  onNewQuiz,
  onGoToReader,
  onClearError,
}: FeedbackStepProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await onSendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card>
        <CardHeader className="text-center pb-3">
          <CardTitle>Your Feedback</CardTitle>
          <CardDescription>
            Chat with your AI tutor for more insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="px-4">
              <ErrorMessage message={error} onDismiss={onClearError} />
            </div>
          )}

          <ScrollArea className="h-[350px] px-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                      message.role === 'user' ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question..."
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={onGoToReader}
          className="flex-1"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          View Document
        </Button>
        <Button
          variant="outline"
          onClick={onNewQuiz}
          className="flex-1"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Quiz
        </Button>
        <Button
          variant="outline"
          onClick={onNewDocument}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>
    </div>
  );
}
