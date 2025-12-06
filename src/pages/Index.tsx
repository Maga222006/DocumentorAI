import { Header } from '@/components/Header';
import { UploadStep } from '@/components/steps/UploadStep';
import { SummaryStep } from '@/components/steps/SummaryStep';
import { QuizStep } from '@/components/steps/QuizStep';
import { FeedbackStep } from '@/components/steps/FeedbackStep';
import { useTutor } from '@/hooks/useTutor';

const Index = () => {
  const {
    currentStep,
    sessionId,
    summary,
    quiz,
    userAnswers,
    chatMessages,
    isLoading,
    error,
    setError,
    uploadPDF,
    generateQuiz,
    setAnswer,
    submitQuiz,
    sendMessage,
    resetSession,
    goToSummary,
  } = useTutor();

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-background">
      <Header currentStep={currentStep} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {currentStep === 'upload' && (
          <UploadStep
            isLoading={isLoading}
            error={error}
            onUpload={uploadPDF}
            onClearError={clearError}
          />
        )}

        {currentStep === 'summary' && summary && (
          <SummaryStep
            summary={summary}
            isLoading={isLoading}
            error={error}
            onGenerateQuiz={generateQuiz}
            onClearError={clearError}
          />
        )}

        {currentStep === 'quiz' && quiz && (
          <QuizStep
            quiz={quiz}
            userAnswers={userAnswers}
            isLoading={isLoading}
            error={error}
            onSetAnswer={setAnswer}
            onSubmit={submitQuiz}
            onClearError={clearError}
          />
        )}

        {currentStep === 'feedback' && (
          <FeedbackStep
            messages={chatMessages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            onNewDocument={resetSession}
            onNewQuiz={goToSummary}
            onClearError={clearError}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
