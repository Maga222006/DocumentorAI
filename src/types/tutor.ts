export interface QuizQuestion {
  task_id: number;
  task: string;
  task_type: 'multiple_choice' | 'short_answer' | 'true_false' | 'fill_in_the_blank' | 'fill_gap' | 'fill_blank' | string;
  answer_options: string[] | null;
  correct_answer: string;
}

export interface QuizResponse {
  quiz: QuizQuestion[];
}

export interface SummaryResponse {
  session_id: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SupervisorResponse {
  response: string;
  messages: ChatMessage[];
}

export type Step = 'upload' | 'summary' | 'quiz' | 'feedback';

export interface TutorState {
  currentStep: Step;
  sessionId: string | null;
  summary: string | null;
  quiz: QuizQuestion[] | null;
  userAnswers: string[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
