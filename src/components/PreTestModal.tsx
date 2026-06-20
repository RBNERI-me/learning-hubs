import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, ArrowRight, Star, Zap } from 'lucide-react';
import type { Exercise } from '../types';

interface Props {
  moduleId: string;
  onClose: () => void;
  onComplete: (score: number) => void;
}

export default function PreTestModal({ moduleId, onClose, onComplete }: Props) {
  const { state } = useApp();
  const module = state.modules.find(m => m.id === moduleId);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  if (!module) return null;

  // Pick 5 random exercises from the module for pre-test
  const allExercises: { ms: string; ex: Exercise }[] = [];
  module.milestones.forEach(ms => {
    ms.exercises.forEach(ex => {
      if (ex.type === 'multiple-choice') {
        allExercises.push({ ms: ms.id, ex });
      }
    });
  });
  const shuffled = [...allExercises].sort(() => Math.random() - 0.5).slice(0, 5);

  const handleAnswer = (answer: string) => {
    const q = shuffled[currentQ];
    setAnswers({ ...answers, [q.ex.id]: answer });
    if (currentQ < shuffled.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = shuffled.reduce((acc, q) => {
    return acc + (answers[q.ex.id] === q.ex.correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / shuffled.length) * 100);

  const handleFinish = useCallback(() => {
    onComplete(percentage);
    onClose();
  }, [percentage, onComplete, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="duo-card w-full max-w-lg p-6 relative"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        {!showResult ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--blue)' }}>
                <Zap size={20} fill="#fff" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>Placement Test</h2>
                <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{module.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-4">
              {shuffled.map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    backgroundColor: i < currentQ ? 'var(--green)' : i === currentQ ? 'var(--blue)' : 'var(--gray-200)',
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Question {currentQ + 1} of {shuffled.length}
                </div>
                <h3 className="text-xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
                  {shuffled[currentQ]?.ex.prompt}
                </h3>

                <div className="flex flex-col gap-3">
                  {shuffled[currentQ]?.ex.options?.map((opt, i) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleAnswer(opt)}
                      className="duo-btn w-full text-left p-5 font-bold text-sm"
                      style={{
                        backgroundColor: '#fff',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-3d-gray)',
                        border: '2px solid var(--gray-200)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: percentage >= 60 ? 'var(--green)' : percentage >= 40 ? 'var(--orange)' : 'var(--red)',
                boxShadow: `0 8px 24px ${percentage >= 60 ? 'var(--green)' : percentage >= 40 ? 'var(--orange)' : 'var(--red)'}40`,
              }}
            >
              <Star size={40} fill="#fff" color="#fff" />
            </motion.div>

            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : percentage >= 40 ? 'Keep Practicing!' : 'Let\'s Start from the Beginning!'}
            </h2>
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
              You scored {score}/{shuffled.length} ({percentage}%)
            </p>

            <div className="p-4 rounded-xl mb-6 w-full" style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Recommendation</div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {percentage >= 80
                  ? 'You can skip ahead to advanced sections!'
                  : percentage >= 60
                  ? 'Start from Section 2 — you have a solid foundation!'
                  : percentage >= 40
                  ? 'Start from Section 1 — review the basics first.'
                  : 'Start from the very beginning — no worries, we\'ll get you there!'}
              </div>
            </div>

            <button onClick={handleFinish} className="duo-btn duo-btn-green w-full h-14 text-sm font-bold">
              <ArrowRight size={18} className="mr-2" /> Start Learning
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
