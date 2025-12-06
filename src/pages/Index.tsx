import { Header } from '@/components/Header';
import { UploadStep } from '@/components/steps/UploadStep';
import { ReaderStep } from '@/components/steps/ReaderStep';
import { SummaryStep } from '@/components/steps/SummaryStep';
import { QuizStep } from '@/components/steps/QuizStep';
import { FeedbackStep } from '@/components/steps/FeedbackStep';
import { ChatPanel } from '@/components/ChatPanel';
import { useTutor } from '@/hooks/useTutor';
import { Step } from '@/types/tutor';
import { useCallback } from 'react';

const Index = () => {
  const {
    currentStep,
    sessionId,
    pdfFile,
    pdfUrl,
    summary,
    quiz,
    userAnswers,
    chatMessages,
    lastQuizFeedback,
    isLoading,
    error,
    setError,
    uploadPDF,
    processPDF,
    generateQuiz,
    setAnswer,
    submitQuiz,
    sendMessage,
    resetSession,
    goToSummary,
    goToReader,
    setStep,
  } = useTutor();

  const clearError = () => setError(null);

  const handleNewQuizFromFeedback = useCallback(() => {
    goToSummary();
  }, [goToSummary]);

  // Determine which steps can be navigated to
  const canNavigateTo = useCallback((step: Step): boolean => {
    // Can't navigate while loading
    if (isLoading) return false;
    
    // Can't navigate to current step
    if (step === currentStep) return false;

    switch (step) {
      case 'upload':
        // Can always go back to upload (will reset session)
        return currentStep !== 'upload';
      case 'reader':
        // Can go to reader if we have a PDF
        return !!pdfUrl;
      case 'summary':
        // Can go to summary if we have a summary
        return !!summary;
      case 'quiz':
        // Can only go to quiz if there's an active quiz (don't allow jumping to quiz from other steps)
        return !!quiz && currentStep === 'feedback';
      case 'feedback':
        // Can go to feedback if we have a summary (after processing PDF)
        return !!summary;
      default:
        return false;
    }
  }, [currentStep, isLoading, pdfUrl, summary, quiz, chatMessages.length]);

  // Handle navigation
  const handleNavigate = useCallback((step: Step) => {
    if (!canNavigateTo(step)) return;

    switch (step) {
      case 'upload':
        resetSession();
        break;
      case 'reader':
        goToReader();
        break;
      case 'summary':
        goToSummary();
        break;
      case 'quiz':
        setStep('quiz');
        break;
      case 'feedback':
        setStep('feedback');
        break;
    }
  }, [canNavigateTo, resetSession, goToReader, goToSummary, setStep]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentStep={currentStep} 
        onNewDocument={resetSession}
        onNavigate={handleNavigate}
        canNavigateTo={canNavigateTo}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {currentStep === 'upload' && (
          <UploadStep
            isLoading={isLoading}
            error={error}
            onUpload={uploadPDF}
            onClearError={clearError}
          />
        )}

        {currentStep === 'reader' && pdfUrl && pdfFile && (
          <>
            <ReaderStep
              pdfUrl={pdfUrl}
              fileName={pdfFile.name}
              isLoading={isLoading}
              isSummaryReady={!!summary}
              error={error}
              onProceed={goToSummary}
              onClearError={clearError}
            />
            {summary && (
              <ChatPanel
                messages={chatMessages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
              />
            )}
          </>
        )}

        {currentStep === 'summary' && summary && (
          <>
            <SummaryStep
              summary={summary}
              isLoading={isLoading}
              error={error}
              supervisorFeedback={lastQuizFeedback ?? undefined}
              onGenerateQuiz={generateQuiz}
              onGoToReader={goToReader}
              onClearError={clearError}
            />
            <ChatPanel
              messages={chatMessages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
            />
          </>
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
            onNewQuiz={handleNewQuizFromFeedback}
            onGoToReader={goToReader}
            onClearError={clearError}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
