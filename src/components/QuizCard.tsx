import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { callGroq, buildGradingPrompt } from '../lib/groq';
import { Lightbulb, ArrowRight, Check, X, Send, Loader2, Star } from 'lucide-react';
import FeedbackBanner from './FeedbackBanner';

export default function QuizCard() {
  const { state, answerExercise, submitExercise, nextExercise, finishMilestone, resetQuiz, recordWeakSpot } = useApp();
  const module = state.modules.find(m => m.id === state.activeModule);
  const quiz = state.quiz;
  if (!module || !quiz) return null;

  const milestone = module.milestones.find(m => m.id === quiz.milestoneId);
  if (!milestone) return null;

  const exercise = milestone.exercises[quiz.exerciseIndex];
  const isLast = quiz.exerciseIndex === milestone.exercises.length - 1;
  const isCorrect = quiz.status === 'correct';
  const isIncorrect = quiz.status === 'incorrect';

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean; grade: string; explanation: string; bullets: string[] } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [xpFloat, setXpFloat] = useState<{ show: boolean; amount: number; x: number; y: number }>({ show: false, amount: 0, x: 0, y: 0 });

  const [mcAnswer, setMcAnswer] = useState<string>('');
  const [rearrBlocks, setRearrBlocks] = useState<string[]>([]);
  const [rearrSelected, setRearrSelected] = useState<string[]>([]);
  const [prodAnswer, setProdAnswer] = useState('');

  useEffect(() => {
    if (exercise.type === 'rearrangement') {
      const shuffled = exercise.blocks ? [...exercise.blocks].sort(() => Math.random() - 0.5) : [];
      setRearrBlocks(shuffled);
      setRearrSelected([]);
    }
    if (exercise.type === 'multiple-choice') setMcAnswer('');
    if (exercise.type === 'production') setProdAnswer('');
    setFeedback(null);
    setHint(null);
    setXpFloat({ show: false, amount: 0, x: 0, y: 0 });
  }, [exercise]);

  const handleSubmit = useCallback(async () => {
    let answer: string | string[] = '';
    if (exercise.type === 'multiple-choice') answer = mcAnswer;
    if (exercise.type === 'rearrangement') answer = rearrSelected;
    if (exercise.type === 'production') answer = prodAnswer;

    answerExercise(exercise.id, answer);

    if (exercise.type === 'multiple-choice') {
      const correct = mcAnswer === exercise.correctAnswer;
      submitExercise(correct);
      if (correct) {
        setFeedback({ open: true, correct: true, grade: 'A+', explanation: 'Correct! Well done.', bullets: ['You selected the right option.', 'Your understanding of the concept is solid.'] });
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setFeedback({ open: true, correct: false, grade: 'C', explanation: 'That is not correct.', bullets: [`The correct answer is: ${exercise.correctAnswer}`, 'Review the concept and try again.'] });
      }
      return;
    }

    if (exercise.type === 'rearrangement') {
      const correct = JSON.stringify(rearrSelected) === JSON.stringify(exercise.correctAnswer);
      submitExercise(correct);
      if (correct) {
        setFeedback({ open: true, correct: true, grade: 'A+', explanation: 'Perfect order!', bullets: ['You arranged the sequence correctly.', 'The logic is sound.'] });
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setFeedback({ open: true, correct: false, grade: 'C', explanation: 'The order is not quite right.', bullets: ['Check the sequence carefully.', 'Refer to the context for hints.'] });
      }
      return;
    }

    if (exercise.type === 'production') {
      if (!state.apiKey) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setFeedback({ open: true, correct: false, grade: 'F', explanation: 'No API key configured.', bullets: ['Go to Settings and add your Groq API key.', 'Then come back to retry.'] });
        return;
      }
      setLoading(true);
      const prompt = buildGradingPrompt(exercise.type, exercise.prompt, prodAnswer, exercise.context);
      const result = await callGroq(prompt, state.apiKey);
      setLoading(false);
      if (result.error) {
        setFeedback({ open: true, correct: false, grade: 'F', explanation: 'AI grading failed.', bullets: [result.error, 'Check your API key or network connection.'] });
        return;
      }
      try {
        const cleaned = result.text.replace(/```json?\s*/g, '').replace(/```\s*$/g, '').trim();
        const parsed = JSON.parse(cleaned) as { correct: boolean; grade: string; explanation: string; bullets: string[] };
        submitExercise(parsed.correct);
        setFeedback({ open: true, correct: parsed.correct, grade: parsed.grade, explanation: parsed.explanation, bullets: parsed.bullets || [] });
        if (!parsed.correct) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
      } catch {
        submitExercise(false);
        recordWeakSpot({ exerciseId: exercise.id, milestoneId: milestone.id, moduleId: module.id, prompt: exercise.prompt, count: 1, lastAttempt: new Date().toISOString() });
        setFeedback({ open: true, correct: false, grade: 'F', explanation: 'Failed to parse AI response.', bullets: [result.text.slice(0, 200)] });
      }
    }
  }, [exercise, mcAnswer, rearrSelected, prodAnswer, state.apiKey, answerExercise, submitExercise]);

  const handleNext = useCallback(() => {
    setFeedback(null);
    if (isLast) {
      finishMilestone();
    } else {
      nextExercise();
    }
  }, [isLast, finishMilestone, nextExercise]);

  const handleHint = useCallback(async () => {
    if (!state.apiKey) return;
    setHintLoading(true);
    const prompt = `You are a helpful tutor. The student is stuck on this exercise. Give a concise, one-sentence conceptual hint.

Exercise: ${exercise.prompt}
${exercise.context ? `Context: ${exercise.context}` : ''}

Respond with exactly one sentence. No markdown, no JSON, just plain text.`;
    const result = await callGroq(prompt, state.apiKey);
    setHintLoading(false);
    if (result.error) {
      setHint('Hint unavailable right now.');
    } else {
      setHint(result.text.trim());
    }
  }, [state.apiKey, exercise]);

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
    >
      {/* Top bar: progress + exit */}
      <div className="w-full flex items-center gap-4 mb-4">
        <button
          onClick={resetQuiz}
          className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          Exit
        </button>
        <div className="flex-1 flex items-center gap-1">
          {milestone.exercises.map((_, i) => (
            <div
              key={i}
              className="h-2.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < quiz.exerciseIndex ? 'var(--green)' : i === quiz.exerciseIndex ? 'var(--green)' : 'var(--gray-200)',
                opacity: i === quiz.exerciseIndex ? 1 : i < quiz.exerciseIndex ? 0.7 : 0.3,
              }}
            />
          ))}
        </div>
        <div className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
          {quiz.exerciseIndex + 1}/{milestone.exercises.length}
        </div>
      </div>

      {/* XP Float animation */}
      {xpFloat.show && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -60, scale: 1.5 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="fixed z-50 text-lg font-extrabold pointer-events-none"
          style={{ color: 'var(--green)', left: xpFloat.x, top: xpFloat.y }}
        >
          +{xpFloat.amount} XP!
        </motion.div>
      )}

      {/* Main Card */}
      <div className={`w-full mb-6 ${shake ? 'animate-shake' : ''}`}>
        {/* Question area */}
        <div className="mb-6">
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green)' }}>
                <Star size={16} fill="#fff" color="#fff" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {milestone.title}
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
              {exercise.prompt}
            </h2>
            {exercise.context && (
              <div className="text-sm font-bold rounded-xl p-4 mb-4" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}>
                {exercise.context}
              </div>
            )}
          </motion.div>
        </div>

        {/* Hint */}
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl border-b-4 text-sm font-bold"
            style={{ backgroundColor: 'var(--yellow-light)', borderColor: 'var(--yellow-dark)', color: '#3c3c3c', borderRadius: 'var(--radius-sm)' }}
          >
            <Lightbulb size={16} className="inline mr-2" />
            {hint}
          </motion.div>
        )}

        {/* Multiple choice */}
        {exercise.type === 'multiple-choice' && (
          <div className="flex flex-col gap-3">
            {exercise.options?.map((opt, i) => {
              const selected = mcAnswer === opt;
              const showCorrect = isCorrect && selected;
              const showWrong = isIncorrect && selected;
              return (
                <motion.button
                  key={opt}
                  onClick={() => {
                    if (!quiz.submitted) setMcAnswer(opt);
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
                  className="duo-btn w-full text-left p-5 font-bold text-sm transition-all"
                  style={{
                    backgroundColor: showCorrect ? 'var(--green)' : showWrong ? 'var(--red)' : selected ? 'var(--blue-light)' : '#fff',
                    color: showCorrect || showWrong ? '#fff' : 'var(--text-primary)',
                    boxShadow: showCorrect ? 'var(--shadow-3d)' : showWrong ? 'var(--shadow-3d-red)' : selected ? '0 4px 0 var(--blue)' : 'var(--shadow-3d-gray)',
                    cursor: quiz.submitted ? 'default' : 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    border: showCorrect ? 'none' : showWrong ? 'none' : selected ? '2px solid var(--blue)' : '2px solid var(--gray-200)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {showCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-check-bounce">
                        <Check size={20} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                    {showWrong && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-check-bounce">
                        <X size={20} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                    <span>{opt}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Rearrangement */}
        {exercise.type === 'rearrangement' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {rearrBlocks.map((block, i) => {
                const used = rearrSelected.includes(block) && rearrBlocks.indexOf(block) !== i;
                return (
                  <button
                    key={`${block}-${i}`}
                    onClick={() => {
                      if (quiz.submitted) return;
                      if (rearrSelected.includes(block)) return;
                      setRearrSelected([...rearrSelected, block]);
                    }}
                    className="duo-btn px-5 py-3 font-bold text-sm transition-all"
                    style={{
                      backgroundColor: used ? 'var(--gray-200)' : '#fff',
                      color: used ? 'var(--gray-400)' : 'var(--text-primary)',
                      boxShadow: used ? 'none' : 'var(--shadow-3d-gray)',
                      cursor: used || quiz.submitted ? 'default' : 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      opacity: used ? 0.4 : 1,
                      border: '2px solid var(--gray-200)',
                    }}
                  >
                    {block}
                  </button>
                );
              })}
            </div>
            <div className="p-4 rounded-xl border-b-4 border-dashed min-h-[60px]" style={{ borderColor: 'var(--gray-300)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderWidth: '2px', borderBottomWidth: '4px' }}>
              <div className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Your order</div>
              <div className="flex flex-wrap gap-2">
                {rearrSelected.map((block, i) => (
                  <button
                    key={`sel-${i}`}
                    onClick={() => {
                      if (quiz.submitted) return;
                      setRearrSelected(rearrSelected.filter((_, idx) => idx !== i));
                    }}
                    className="duo-btn px-5 py-3 font-bold text-sm"
                    style={{
                      backgroundColor: 'var(--blue)',
                      color: '#fff',
                      boxShadow: 'var(--shadow-3d-blue)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {block}
                  </button>
                ))}
                {rearrSelected.length === 0 && (
                  <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Tap blocks above to add them here</span>
                )}
              </div>
            </div>
            {!quiz.submitted && (
              <button
                onClick={() => setRearrSelected([])}
                className="text-sm font-bold self-start hover:underline transition-colors"
                style={{ color: 'var(--red)' }}
              >
                Reset order
              </button>
            )}
          </div>
        )}

        {/* Production */}
        {exercise.type === 'production' && (
          <div className="flex flex-col gap-3">
            <textarea
              value={prodAnswer}
              onChange={(e) => setProdAnswer(e.target.value)}
              disabled={quiz.submitted}
              placeholder="Type your answer here..."
              className="duo-input resize-none"
              style={{ minHeight: '140px' }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6">
          {!quiz.submitted ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={loading || (!mcAnswer && rearrSelected.length === 0 && !prodAnswer.trim())}
                className="duo-btn duo-btn-green flex-1 h-14 text-sm font-bold"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} className="mr-2" /> Check</>}
              </button>
              {state.apiKey && (
                <button
                  onClick={handleHint}
                  disabled={hintLoading || hint !== null}
                  className="duo-btn duo-btn-gray h-14 px-5 text-sm font-bold"
                >
                  {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <><Lightbulb size={16} className="mr-1" /> Hint</>}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleNext}
              className="duo-btn duo-btn-blue flex-1 h-14 text-sm font-bold"
            >
              {isLast ? <><Star size={18} className="mr-2" fill="#fff" /> Finish Lesson</> : <><ArrowRight size={18} className="mr-2" /> Continue</>}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <FeedbackBanner
          open={feedback.open}
          correct={feedback.correct}
          grade={feedback.grade}
          explanation={feedback.explanation}
          bullets={feedback.bullets}
          onClose={() => setFeedback(null)}
          onNext={handleNext}
          isLast={isLast}
        />
      )}
    </motion.div>
  );
}
