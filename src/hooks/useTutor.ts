import { useState, useCallback, useRef } from 'react';
import { TutorState, Step, QuizQuestion, ChatMessage } from '@/types/tutor';

const API_BASE_URL = 'https://maga222006-tutoragent.hf.space';

const initialState: TutorState = {
  currentStep: 'upload',
  sessionId: null,
  summary: null,
  quiz: null,
  userAnswers: [],
  chatMessages: [],
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
    setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        currentStep: 'summary',
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, []);

  const generateQuiz = useCallback(async (numQuestions: number) => {
    const { sessionId } = stateRef.current;
    
    if (!sessionId) {
      setError('No session found. Please upload a document first.');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/examiner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          num_questions: numQuestions,
        }),
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

      const initialMessages: ChatMessage[] = [
        { role: 'user', content: 'Please review my quiz answers and provide feedback.' },
        { role: 'assistant', content: data.response },
      ];

      setState(prev => ({
        ...prev,
        chatMessages: initialMessages,
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
      const response = await fetch(`${API_BASE_URL}/supervisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
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
    setState(initialState);
  }, []);

  const goToSummary = useCallback(() => {
    if (stateRef.current.summary) {
      setState(prev => ({ ...prev, currentStep: 'summary', error: null }));
    }
  }, []);

  return {
    ...state,
    setStep,
    setError,
    setLoading,
    uploadPDF,
    generateQuiz,
    setAnswer,
    submitQuiz,
    sendMessage,
    resetSession,
    goToSummary,
  };
}