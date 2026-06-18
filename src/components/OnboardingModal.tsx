import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ArrowRight, BookOpen, Target, Brain, Zap, Star } from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    icon: Star,
    title: 'Welcome to Learning Hub!',
    subtitle: 'Your AI-powered learning companion.',
    color: '#58CC02',
    bgColor: '#d7ffb8',
    description: 'Master any subject with AI-generated lessons, quizzes, and personalized feedback. Let\'s get you set up!',
  },
  {
    id: 'goal',
    icon: Target,
    title: 'What do you want to learn?',
    subtitle: 'Pick your starting point.',
    color: '#FF9600',
    bgColor: '#fff0d4',
    description: 'Start with English Impromptu Speaking or Dancesport Technical. Create your own custom modules using AI.',
  },
  {
    id: 'how',
    icon: Brain,
    title: 'How it works',
    subtitle: 'Learn through practice.',
    color: '#CE82FF',
    bgColor: '#eec3ff',
    description: 'Follow the learning path, answer interactive exercises, and get AI feedback instantly. Earn XP and crowns!',
  },
  {
    id: 'api',
    icon: Zap,
    title: 'Add your Groq API Key',
    subtitle: 'Unlock AI-powered grading.',
    color: '#1CB0F6',
    bgColor: '#ddf4ff',
    description: 'Your key is stored only in your browser. Go to Settings to add your Groq API key for AI grading and hints.',
  },
  {
    id: 'ready',
    icon: BookOpen,
    title: 'You\'re all set!',
    subtitle: 'Start learning now.',
    color: '#FFD700',
    bgColor: '#fff3b6',
    description: 'Click the nodes on the learning path to begin your first lesson. Earn XP, crowns, and build your streak!',
  },
];

export default function OnboardingModal() {
  const { completeOnboarding, setView } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      setView('learn');
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: '#235390' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md p-6 relative overflow-hidden"
        style={{ backgroundColor: step.bgColor, borderRadius: '24px', borderBottom: '5px solid', borderColor: step.color }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === stepIndex ? '24px' : '8px',
                backgroundColor: i <= stepIndex ? step.color : '#d0d0d0',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: step.color, boxShadow: `0 6px 20px ${step.color}50` }}
            >
              <Icon size={40} color="#fff" />
            </motion.div>

            <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#3c3c3c' }}>
              {step.title}
            </h2>
            <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: step.color }}>
              {step.subtitle}
            </p>
            <p className="text-sm font-bold leading-relaxed mb-6" style={{ color: '#52656d' }}>
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          className="duo-btn w-full h-14 text-sm font-bold"
          style={{
            backgroundColor: step.color,
            color: '#fff',
            boxShadow: `0 5px 0 ${step.color}99`,
            borderRadius: '16px',
          }}
        >
          {isLast ? (
            <>
              <BookOpen size={20} className="mr-2" /> Start Learning!
            </>
          ) : (
            <>
              <ArrowRight size={20} className="mr-2" /> Continue
            </>
          )}
        </button>

        {!isLast && (
          <button
            onClick={completeOnboarding}
            className="w-full mt-3 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{ color: '#a0a0a0' }}
          >
            Skip
          </button>
        )}
      </motion.div>
    </div>
  );
}
