export type ModuleId = 'english-impromptu' | 'dancesport' | string;

export interface Unit {
  id: string;
  name: string;
  description: string;
  color: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  unitId?: string;
  locked: boolean;
  completed: boolean;
  exercises: Exercise[];
  crown?: boolean;
}

export type ExerciseType = 'multiple-choice' | 'rearrangement' | 'production';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  options?: string[];
  correctAnswer?: string | string[];
  blocks?: string[];
  context?: string;
}

export interface QuizState {
  milestoneId: string;
  exerciseIndex: number;
  answers: Record<string, string | string[]>;
  status: 'idle' | 'correct' | 'incorrect';
  submitted: boolean;
}

export interface LearningModule {
  id: string;
  name: string;
  icon: string;
  color: string;
  milestones: Milestone[];
}

export interface WeakSpot {
  exerciseId: string;
  milestoneId: string;
  moduleId: string;
  prompt: string;
  count: number;
  lastAttempt: string;
}

export interface AppState {
  activeModule: string;
  activeView: 'learn' | 'sandbox' | 'create' | 'settings';
  quiz: QuizState | null;
  xp: number;
  streak: number;
  lastActiveDate: string;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  apiKey: string;
  modules: LearningModule[];
  gems: number;
  crowns: number;
  hearts: number;
  completedAnswers: string[];
  weakSpots: WeakSpot[];
  hasSeenOnboarding: boolean;
  userId: string | null;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

export interface GroqResponse {
  text: string;
  error?: string;
}

export interface ModuleGenerationRequest {
  topic: string;
  description: string;
}

export interface GeneratedModule {
  name: string;
  icon: string;
  color: string;
  milestones: {
    title: string;
    description: string;
    exercises: {
      type: ExerciseType;
      prompt: string;
      options?: string[];
      correctAnswer?: string | string[];
      blocks?: string[];
      context?: string;
    }[];
  }[];
}
