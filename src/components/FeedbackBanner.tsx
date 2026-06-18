import { useEffect, useState } from 'react';
import { Check, X, ArrowRight, Trophy, Frown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackBannerProps {
  open: boolean;
  correct: boolean;
  grade: string;
  explanation: string;
  bullets: string[];
  onClose: () => void;
  onNext: () => void;
  isLast: boolean;
}

export default function FeedbackBanner({ open, correct, grade, explanation, bullets, onNext, isLast }: FeedbackBannerProps) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number; size: number; rotation: number; shape: 'circle' | 'square' | 'triangle' }[]>([]);

  useEffect(() => {
    if (open && correct) {
      const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ffc800', '#ff4b4b', '#ff6c8c', '#00c2a0'][Math.floor(Math.random() * 8)],
        delay: Math.random() * 0.8,
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
      }));
      setConfetti(pieces);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
          osc.start(audioCtx.currentTime + start);
          osc.stop(audioCtx.currentTime + start + duration);
        };
        playNote(523, 0, 0.15);
        playNote(659, 0.12, 0.15);
        playNote(784, 0.24, 0.15);
        playNote(1047, 0.36, 0.3);
      } catch { /* ignore */ }
    }
    if (open && !correct) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(250, audioCtx.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch { /* ignore */ }
    }
  }, [open, correct]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div
            className="w-full p-6 pb-8 shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: correct ? 'var(--green)' : 'var(--red)',
              color: '#fff',
            }}
          >
            {/* Confetti */}
            {correct && confetti.map((c) => {
              let shapeStyle: React.CSSProperties = {
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
              };
              if (c.shape === 'circle') {
                shapeStyle = { ...shapeStyle, borderRadius: '50%' };
              } else if (c.shape === 'triangle') {
                shapeStyle = { ...shapeStyle, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
              }
              return (
                <div
                  key={c.id}
                  className="absolute"
                  style={{
                    left: `${c.left}%`,
                    top: '20px',
                    ...shapeStyle,
                    transform: `rotate(${c.rotation}deg)`,
                    animation: `confetti 2s ease-out ${c.delay}s forwards`,
                  }}
                />
              );
            })}

            <div className="max-w-2xl mx-auto flex items-start gap-5 relative z-10">
              <div className="flex-shrink-0 mt-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                >
                  {correct ? <Sparkles size={36} fill="#fff" color="#fff" /> : <Frown size={36} />}
                </motion.div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-extrabold">{correct ? 'Excellent!' : 'Not quite right'}</div>
                  <div className="px-3 py-1 rounded-xl text-sm font-bold uppercase bg-white/20">{grade}</div>
                </div>
                <div className="text-base font-bold opacity-95 mb-3">{explanation}</div>
                <ul className="flex flex-col gap-2">
                  {bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-start gap-2 text-sm font-bold opacity-90"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        {correct ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.button
                onClick={onNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2 self-center"
                style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
              >
                {isLast ? (
                  <>
                    <Trophy size={16} fill="#fff" /> Finish
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} /> Continue
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
