import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Save, Trash2, Pencil, GripVertical } from 'lucide-react';
import type { Milestone, Exercise } from '../types';

interface Props {
  moduleId: string;
  milestone: Milestone;
  onClose: () => void;
}

export default function MilestoneEditor({ moduleId, milestone, onClose }: Props) {
  const { editMilestone, deleteMilestone } = useApp();
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description);
  const [exercises, setExercises] = useState<Exercise[]>([...milestone.exercises]);
  const [editingEx, setEditingEx] = useState<string | null>(null);

  const handleSave = () => {
    editMilestone(moduleId, milestone.id, { title, description, exercises });
    onClose();
  };

  const updateExercise = (exId: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(e => e.id === exId ? { ...e, ...updates } : e));
  };

  const deleteExercise = (exId: string) => {
    setExercises(exercises.filter(e => e.id !== exId));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="duo-card w-full max-w-lg p-6 relative max-h-[85vh] overflow-y-auto"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <h2 className="text-xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
          <Pencil size={20} className="inline mr-2" /> Edit Topic
        </h2>

        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="duo-input" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="duo-input" />
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Exercises ({exercises.length})</label>
          <div className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <div key={ex.id} className="p-3 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                {editingEx === ex.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={ex.prompt}
                      onChange={e => updateExercise(ex.id, { prompt: e.target.value })}
                      className="duo-input text-sm"
                      placeholder="Question prompt"
                    />
                    {ex.type === 'multiple-choice' && (
                      <input
                        value={ex.options?.join(', ') || ''}
                        onChange={e => updateExercise(ex.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                        className="duo-input text-sm"
                        placeholder="Options (comma separated)"
                      />
                    )}
                    <input
                      value={ex.correctAnswer as string || ''}
                      onChange={e => updateExercise(ex.id, { correctAnswer: e.target.value })}
                      className="duo-input text-sm"
                      placeholder="Correct answer"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingEx(null)} className="duo-btn duo-btn-green flex-1 h-10 text-xs font-bold">
                        <Save size={14} className="mr-1" /> Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                    <div className="flex-1">
                      <div className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>{ex.prompt}</div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{ex.type}</div>
                    </div>
                    <button onClick={() => setEditingEx(ex.id)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--blue)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteExercise(ex.id)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} className="duo-btn duo-btn-green flex-1 h-14 text-sm font-bold">
            <Save size={18} className="mr-2" /> Save Topic
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this entire topic?')) {
                deleteMilestone(moduleId, milestone.id);
                onClose();
              }
            }}
            className="duo-btn duo-btn-red h-14 px-6 text-sm font-bold"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
