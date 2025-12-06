import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Upload, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ChatMessage } from '@/types/tutor';
import { cn } from '@/lib/utils';

interface FeedbackStepProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<boolean>;
  onNewDocument: () => void;
  onNewQuiz: () => void;
  onClearError: () => void;
}

export function FeedbackStep({
  messages,
  isLoading,
  error,
  onSendMessage,
  onNewDocument,
  onNewQuiz,
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Feedback</h2>
        <p className="text-muted-foreground">
          Chat with your AI tutor for more insights
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={onClearError} />}

      <Card className="shadow-card overflow-hidden">
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user' ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] p-4 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-chat-user text-primary-foreground rounded-tr-sm'
                      : 'bg-chat-assistant text-foreground rounded-tl-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-chat-assistant p-4 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce-gentle" />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce-gentle"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce-gentle"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              disabled={isLoading}
              className="flex-1 h-12"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-12 w-12 gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={onNewQuiz}
          className="flex-1 h-12"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Quiz
        </Button>
        <Button
          variant="outline"
          onClick={onNewDocument}
          className="flex-1 h-12"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New Document
        </Button>
      </div>
    </div>
  );
}
