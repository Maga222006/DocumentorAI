import { useState, useCallback, useRef } from 'react';
import { TutorState, Step, QuizQuestion, ChatMessage } from '@/types/tutor';

const API_BASE_URL = 'https://maga222006-tutoragent.hf.space';

const initialState: TutorState = {
  currentStep: 'upload',
  sessionId: null,
  pdfFile: null,
  pdfUrl: null,
  summary: null,
  quiz: null,
  userAnswers: [],
  chatMessages: [],
  lastQuizFeedback: null,
  isLoading: false,
  error: null,
};

export function useTutor() {
  const [state, setState] = useState<TutorState>(initialState);
  
  // Use ref to always have access to latest state without re-creating callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStep = useCallback((step: Step) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const uploadPDF = useCallback(async (file: File) => {
    const pdfUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      pdfFile: file,
      pdfUrl,
      currentStep: 'reader',
      isLoading: true,
      error: null,
    }));

    // Auto-start processing
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/summarizer`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        sessionId: data.session_id,
        summary: data.summary,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process document';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, []);

  const processPDF = useCallback(async () => {
    const { pdfFile, summary } = stateRef.current;
    
    // If summary already exists, just navigate to it
    if (summary) {
      setState(prev => ({ ...prev, currentStep: 'summary', error: null }));
      return true;
    }
    
    if (!pdfFile) {
      setError('No PDF file found. Please upload a document first.');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch(`${API_BASE_URL}/summarizer`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        sessionId: data.session_id,
        summary: data.summary,
        currentStep: 'summary',
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process document';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, [setError]);

  const generateQuiz = useCallback(async (numQuestions: number, comment?: string) => {
    const { sessionId } = stateRef.current;
    
    if (!sessionId) {
      setError('No session found. Please upload a document first.');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestBody: { session_id: string; num_questions: number; comment?: string } = {
        session_id: sessionId,
        num_questions: numQuestions,
      };
      
      if (comment) {
        requestBody.comment = comment;
      }

      const response = await fetch(`${API_BASE_URL}/examiner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Quiz generation failed with status ${response.status}`);
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        quiz: data.quiz,
        userAnswers: new Array(data.quiz.length).fill(''),
        currentStep: 'quiz',
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate quiz';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, [setError]);

  const setAnswer = useCallback((questionIndex: number, answer: string) => {
    setState(prev => {
      const newAnswers = [...prev.userAnswers];
      newAnswers[questionIndex] = answer;
      return { ...prev, userAnswers: newAnswers };
    });
  }, []);

  const submitQuiz = useCallback(async () => {
    const { sessionId, quiz, userAnswers } = stateRef.current;
    
    if (!sessionId || !quiz) {
      setError('No quiz found. Please generate a quiz first.');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/supervisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: 'Please review my quiz answers and provide feedback.',
          user_answers: userAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Submission failed with status ${response.status}`);
      }

      const data = await response.json();

      const newMessages: ChatMessage[] = [
        { role: 'user', content: 'Please review my quiz answers and provide feedback.' },
        { role: 'assistant', content: data.response },
      ];

      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, ...newMessages],
        lastQuizFeedback: data.response,
        currentStep: 'feedback',
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit quiz';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, [setError]);

  const sendMessage = useCallback(async (message: string) => {
    const { sessionId } = stateRef.current;
    
    if (!sessionId) {
      setError('No session found. Please upload a document first.');
      return false;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    setState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Escape curly braces to prevent LangChain template variable conflicts
      const sanitizedMessage = message.replace(/\{/g, '{{').replace(/\}/g, '}}');
      
      const response = await fetch(`${API_BASE_URL}/supervisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: sanitizedMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Message failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };

      setState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, assistantMessage],
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, [setError]);

  const resetSession = useCallback(() => {
    // Clean up PDF URL to prevent memory leaks
    if (stateRef.current.pdfUrl) {
      URL.revokeObjectURL(stateRef.current.pdfUrl);
    }
    setState(initialState);
  }, []);

  const goToSummary = useCallback(() => {
    if (stateRef.current.summary) {
      setState(prev => ({ ...prev, currentStep: 'summary', error: null }));
    }
  }, []);

  const goToReader = useCallback(() => {
    if (stateRef.current.pdfUrl) {
      setState(prev => ({ ...prev, currentStep: 'reader', error: null }));
    }
  }, []);

  return {
    ...state,
    setStep,
    setError,
    setLoading,
    uploadPDF,
    processPDF,
    generateQuiz,
    setAnswer,
    submitQuiz,
    sendMessage,
    resetSession,
    goToSummary,
    goToReader,
  };
}