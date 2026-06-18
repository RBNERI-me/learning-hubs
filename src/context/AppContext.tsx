import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, LearningModule, WeakSpot, Milestone } from '../types';
import { defaultModules } from '../data/defaultModules';
import { getClient, SupabaseClient } from '../lib/supabase';

const STORAGE_KEY = 'learning-hub-state';
const today = new Date().toISOString().split('T')[0];

let supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = getClient();
  }
  return supabaseClient;
}

async function loadFromSupabase(userId: string): Promise<Partial<AppState> | null> {
  try {
    const sb = getSupabase();
    const { data, error } = await (sb as any).from('user_progress').select('*').eq('user_id', userId).single();
    if (error || !data) return null;
    return {
      xp: data.xp ?? 0,
      streak: data.streak ?? 1,
      lastActiveDate: data.last_active_date ?? today,
      gems: data.gems ?? 0,
      crowns: data.crowns ?? 0,
      activeModule: data.active_module ?? 'english-impromptu',
      modules: data.modules ? JSON.parse(data.modules) : undefined,
      completedAnswers: data.completed_answers ? JSON.parse(data.completed_answers) : [],
      weakSpots: data.weak_spots ? JSON.parse(data.weak_spots) : [],
      hasSeenOnboarding: data.has_seen_onboarding ?? false,
    };
  } catch {
    return null;
  }
}

async function saveToSupabase(userId: string, state: AppState) {
  try {
    const sb = getSupabase();
    await (sb as any).from('user_progress').upsert({
      user_id: userId,
      xp: state.xp,
      streak: state.streak,
      last_active_date: state.lastActiveDate,
      gems: state.gems,
      crowns: state.crowns,
      active_module: state.activeModule,
      modules: JSON.stringify(state.modules),
      completed_answers: JSON.stringify(state.completedAnswers),
      weak_spots: JSON.stringify(state.weakSpots),
      has_seen_onboarding: state.hasSeenOnboarding,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch { /* ignore */ }
}

const getInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      const merged = defaultModules.map(dm => {
        const existing = parsed.modules.find(m => m.id === dm.id);
        if (!existing) return dm;
        return { ...dm, ...existing, id: dm.id };
      });
      const custom = parsed.modules.filter(m => !defaultModules.find(dm => dm.id === m.id));
      return {
        ...parsed,
        modules: [...merged, ...custom],
        gems: parsed.gems ?? 0,
        crowns: parsed.crowns ?? 0,
        completedAnswers: parsed.completedAnswers ?? [],
        weakSpots: parsed.weakSpots ?? [],
        hasSeenOnboarding: parsed.hasSeenOnboarding ?? false,
        userId: parsed.userId ?? null,
      };
    }
  } catch { /* ignore */ }
  return {
    activeModule: 'english-impromptu',
    activeView: 'learn',
    quiz: null,
    xp: 0,
    streak: 1,
    lastActiveDate: today,
    theme: 'light',
    fontSize: 'medium',
    apiKey: '',
    modules: [...defaultModules],
    gems: 0,
    crowns: 0,
    completedAnswers: [],
    weakSpots: [],
    hasSeenOnboarding: false,
    userId: null,
  };
};

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'START_QUIZ'; payload: { milestoneId: string } }
  | { type: 'ANSWER_EXERCISE'; payload: { exerciseId: string; answer: string | string[] } }
  | { type: 'SUBMIT_EXERCISE'; payload: { correct: boolean } }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'FINISH_MILESTONE' }
  | { type: 'ADD_MODULE'; payload: LearningModule }
  | { type: 'UPDATE_MODULE'; payload: { moduleId: string; milestones: Milestone[] } }
  | { type: 'RECORD_WEAK_SPOT'; payload: WeakSpot }
  | { type: 'RESET_QUIZ' }
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE': {
      return { ...state, ...action.payload };
    }
    case 'START_QUIZ': {
      const mod = state.modules.find(m => m.id === state.activeModule);
      const milestone = mod?.milestones.find(m => m.id === action.payload.milestoneId);
      if (!milestone) return state;
      return {
        ...state,
        quiz: {
          milestoneId: action.payload.milestoneId,
          exerciseIndex: 0,
          answers: {},
          status: 'idle',
          submitted: false,
        },
      };
    }
    case 'ANSWER_EXERCISE': {
      if (!state.quiz) return state;
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answers: { ...state.quiz.answers, [action.payload.exerciseId]: action.payload.answer },
        },
      };
    }
    case 'SUBMIT_EXERCISE': {
      if (!state.quiz) return state;
      const correct = action.payload.correct;
      const newXp = correct ? state.xp + 10 : state.xp;
      const newGems = correct ? state.gems + 1 : state.gems;
      return {
        ...state,
        xp: newXp,
        gems: newGems,
        quiz: {
          ...state.quiz,
          status: correct ? 'correct' : 'incorrect',
          submitted: true,
        },
      };
    }
    case 'NEXT_EXERCISE': {
      if (!state.quiz) return state;
      const q = state.quiz;
      const mod = state.modules.find(m => m.id === state.activeModule);
      const milestone = mod?.milestones.find(m => m.id === q.milestoneId);
      if (!milestone) return state;
      const nextIndex = q.exerciseIndex + 1;
      if (nextIndex >= milestone.exercises.length) {
        return { ...state, quiz: { ...q, status: 'correct', submitted: true } };
      }
      return {
        ...state,
        quiz: {
          ...q,
          exerciseIndex: nextIndex,
          status: 'idle',
          submitted: false,
        },
      };
    }
    case 'FINISH_MILESTONE': {
      if (!state.quiz) return state;
      const qm = state.quiz;
      const modules = state.modules.map(m => {
        if (m.id !== state.activeModule) return m;
        const milestones = m.milestones.map((ms, idx) => {
          if (ms.id === qm.milestoneId) {
            return { ...ms, completed: true, crown: true };
          }
          if (idx === m.milestones.findIndex(x => x.id === qm.milestoneId) + 1) {
            return { ...ms, locked: false };
          }
          return ms;
        });
        return { ...m, milestones };
      });
      const allAnswers = milestoneAllAnswers(modules, state.activeModule, qm.milestoneId);
      return {
        ...state,
        modules,
        quiz: null,
        xp: state.xp + 20,
        gems: state.gems + 5,
        crowns: state.crowns + 1,
        completedAnswers: [...state.completedAnswers, ...allAnswers],
      };
    }
    case 'ADD_MODULE': {
      return { ...state, modules: [...state.modules, action.payload], activeModule: action.payload.id };
    }
    case 'UPDATE_MODULE': {
      return {
        ...state,
        modules: state.modules.map(m => m.id === action.payload.moduleId ? { ...m, milestones: action.payload.milestones } : m),
      };
    }
    case 'RECORD_WEAK_SPOT': {
      const existing = state.weakSpots.find(w => w.exerciseId === action.payload.exerciseId);
      const weakSpots = existing
        ? state.weakSpots.map(w => w.exerciseId === action.payload.exerciseId ? { ...w, count: w.count + 1, lastAttempt: action.payload.lastAttempt } : w)
        : [...state.weakSpots, action.payload];
      return { ...state, weakSpots };
    }
    case 'RESET_QUIZ': {
      return { ...state, quiz: null };
    }
    case 'SET_USER_ID': {
      return { ...state, userId: action.payload };
    }
    case 'COMPLETE_ONBOARDING': {
      return { ...state, hasSeenOnboarding: true };
    }
    default:
      return state;
  }
}

function milestoneAllAnswers(modules: LearningModule[], activeModuleId: string, milestoneId: string): string[] {
  const mod = modules.find(m => m.id === activeModuleId);
  const ms = mod?.milestones.find(m => m.id === milestoneId);
  if (!ms) return [];
  return ms.exercises.map(e => e.prompt);
}

interface ContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startQuiz: (milestoneId: string) => void;
  answerExercise: (exerciseId: string, answer: string | string[]) => void;
  submitExercise: (correct: boolean) => void;
  nextExercise: () => void;
  finishMilestone: () => void;
  addModule: (module: LearningModule) => void;
  updateModule: (moduleId: string, milestones: Milestone[]) => void;
  resetQuiz: () => void;
  setView: (view: AppState['activeView']) => void;
  setActiveModule: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setApiKey: (key: string) => void;
  setUserId: (id: string) => void;
  addModuleAfterCompletion: (module: LearningModule) => void;
  recordWeakSpot: (spot: WeakSpot) => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.userId) {
      saveToSupabase(state.userId, state);
    }
  }, [state.userId, state.xp, state.streak, state.gems, state.crowns, state.activeModule, state.modules, state.completedAnswers, state.weakSpots, state.hasSeenOnboarding]);

  useEffect(() => {
    if (state.lastActiveDate !== today) {
      const last = new Date(state.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      const newStreak = diffDays === 1 ? state.streak + 1 : 1;
      dispatch({ type: 'SET_STATE', payload: { streak: newStreak, lastActiveDate: today } });
    }
  }, []);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      const { data } = await sb.auth.getSession();
      if (data.session?.user?.id) {
        const uid = data.session.user.id;
        dispatch({ type: 'SET_USER_ID', payload: uid });
        const remote = await loadFromSupabase(uid);
        if (remote) {
          dispatch({ type: 'SET_STATE', payload: remote });
        }
      }
    }
    init();
  }, []);

  const startQuiz = useCallback((milestoneId: string) => {
    dispatch({ type: 'START_QUIZ', payload: { milestoneId } });
  }, []);

  const answerExercise = useCallback((exerciseId: string, answer: string | string[]) => {
    dispatch({ type: 'ANSWER_EXERCISE', payload: { exerciseId, answer } });
  }, []);

  const submitExercise = useCallback((correct: boolean) => {
    dispatch({ type: 'SUBMIT_EXERCISE', payload: { correct } });
  }, []);

  const nextExercise = useCallback(() => {
    dispatch({ type: 'NEXT_EXERCISE' });
  }, []);

  const finishMilestone = useCallback(() => {
    dispatch({ type: 'FINISH_MILESTONE' });
  }, []);

  const addModule = useCallback((module: LearningModule) => {
    dispatch({ type: 'ADD_MODULE', payload: module });
  }, []);

  const updateModule = useCallback((moduleId: string, milestones: Milestone[]) => {
    dispatch({ type: 'UPDATE_MODULE', payload: { moduleId, milestones } });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  const setView = useCallback((view: AppState['activeView']) => {
    dispatch({ type: 'SET_STATE', payload: { activeView: view } });
  }, []);

  const setActiveModule = useCallback((id: string) => {
    dispatch({ type: 'SET_STATE', payload: { activeModule: id } });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_STATE', payload: { theme } });
  }, []);

  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    dispatch({ type: 'SET_STATE', payload: { fontSize: size } });
  }, []);

  const setApiKey = useCallback((key: string) => {
    dispatch({ type: 'SET_STATE', payload: { apiKey: key } });
  }, []);

  const setUserId = useCallback((id: string) => {
    dispatch({ type: 'SET_USER_ID', payload: id });
  }, []);

  const addModuleAfterCompletion = useCallback((module: LearningModule) => {
    dispatch({ type: 'ADD_MODULE', payload: module });
  }, []);

  const recordWeakSpot = useCallback((spot: WeakSpot) => {
    dispatch({ type: 'RECORD_WEAK_SPOT', payload: spot });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        startQuiz,
        answerExercise,
        submitExercise,
        nextExercise,
        finishMilestone,
        addModule,
        updateModule,
        resetQuiz,
        setView,
        setActiveModule,
        setTheme,
        setFontSize,
        setApiKey,
        setUserId,
        addModuleAfterCompletion,
        recordWeakSpot,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
