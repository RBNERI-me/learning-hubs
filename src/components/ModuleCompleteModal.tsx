import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { callGroq, buildModuleEditPrompt, parseGeneratedModule } from '../lib/groq';
import { Crown, X, Loader2, ArrowRight, Plus, Pencil } from 'lucide-react';
import type { LearningModule } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  module: LearningModule;
  onClose: () => void;
}

export default function ModuleCompleteModal({ module, onClose }: Props) {
  const { state, addModuleAfterCompletion, updateModule } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<LearningModule | null>(null);
  const [mode, setMode] = useState<'choose' | 'edit' | 'new'>('choose');

  const handleGenerate = useCallback(async (editMode: 'edit' | 'new') => {
    if (!state.apiKey) {
      setError('Add your Groq API key in Settings first.');
      return;
    }
    setLoading(true);
    setError(null);
    setMode(editMode);

    const prompt = buildModuleEditPrompt(module, state.completedAnswers);
    const result = await callGroq(prompt, state.apiKey);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    const parsed = parseGeneratedModule(result.text);
    if (!parsed) {
      setError('Failed to parse AI-generated content. Try again.');
      return;
    }

    const newMilestones = parsed.milestones.map((m, i) => ({
      id: `${module.id}-advanced-${Date.now()}-${i}`,
      title: m.title,
      description: m.description,
      unitId: `u${Math.floor(module.milestones.length / 4) + 1}`,
      locked: i !== 0,
      completed: false,
      exercises: m.exercises.map((e, j) => ({
        id: `${module.id}-adv-ex-${Date.now()}-${i}-${j}`,
        type: e.type,
        prompt: e.prompt,
        options: e.options,
        correctAnswer: e.correctAnswer,
        blocks: e.blocks,
        context: e.context,
      })),
    }));

    const newModule: LearningModule = {
      id: editMode === 'edit' ? module.id : `advanced-${module.id}-${Date.now()}`,
      name: editMode === 'edit' ? module.name : parsed.name,
      icon: editMode === 'edit' ? module.icon : (parsed.icon || 'Crown'),
      color: editMode === 'edit' ? module.color : (parsed.color || '#FFD700'),
      milestones: editMode === 'edit'
        ? [...module.milestones, ...newMilestones]
        : newMilestones,
    };

    setGenerated(newModule);
  }, [module, state.apiKey, state.completedAnswers]);

  const handleAdd = useCallback(() => {
    if (!generated) return;
    if (mode === 'edit') {
      updateModule(module.id, generated.milestones);
    } else {
      addModuleAfterCompletion(generated);
    }
    onClose();
  }, [generated, mode, module.id, updateModule, addModuleAfterCompletion, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="duo-card w-full max-w-md p-6 relative overflow-hidden"
        style={{ borderColor: 'var(--accent-yellow)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: 'var(--accent-yellow)', boxShadow: '0 8px 24px rgba(255,200,0,0.3)' }}
          >
            <Crown size={40} color="#fff" fill="#fff" />
          </motion.div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {module.name} Complete!
          </h2>
          <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-secondary)' }}>
            You earned {module.milestones.length} crowns!
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'choose' && !loading && !generated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="text-sm font-bold mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                What would you like to do next?
              </div>

              <button
                onClick={() => handleGenerate('edit')}
                disabled={!state.apiKey}
                className="duo-btn duo-btn-green w-full h-14 text-sm"
              >
                <Pencil size={18} className="mr-2" />
                Expand This Module
              </button>

              <button
                onClick={() => handleGenerate('new')}
                disabled={!state.apiKey}
                className="duo-btn duo-btn-blue w-full h-14 text-sm"
              >
                <Plus size={18} className="mr-2" />
                Create Advanced Track
              </button>

              {!state.apiKey && (
                <p className="text-xs text-center font-bold" style={{ color: 'var(--text-muted)' }}>
                  Add your Groq API key in Settings to unlock AI features.
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full h-12 rounded-xl font-bold text-sm transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Maybe Later
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-6 gap-3"
            >
              <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-green)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                {mode === 'edit'
                  ? 'GroqCloud is expanding your module...'
                  : 'GroqCloud is designing your advanced track...'}
              </p>
            </motion.div>
          )}

          {generated && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl border-b-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: generated.color }}>
                    <Crown size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      {mode === 'edit' ? `${generated.name} — Expanded` : generated.name}
                    </div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                      {mode === 'edit'
                        ? `${generated.milestones.length - module.milestones.length} new milestones`
                        : `${generated.milestones.length} advanced milestones`}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="duo-btn duo-btn-green w-full h-14 text-sm"
              >
                <ArrowRight size={18} className="mr-2" />
                {mode === 'edit' ? 'Start New Milestones' : 'Start Advanced Track'}
              </button>

              <button
                onClick={() => { setGenerated(null); setMode('choose'); }}
                className="w-full h-12 rounded-xl font-bold text-sm transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-3 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--accent-red-light)', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
