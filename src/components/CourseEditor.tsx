import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Trash2, Save, Pencil } from 'lucide-react';
import type { LearningModule, Milestone } from '../types';

interface Props {
  module: LearningModule;
  onClose: () => void;
}

export default function CourseEditor({ module, onClose }: Props) {
  const { editModule, deleteMilestone, editMilestone } = useApp();
  const [name, setName] = useState(module.name);
  const [color, setColor] = useState(module.color);
  const [editingMs, setEditingMs] = useState<string | null>(null);
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');

  const colors = [
    '#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B',
    '#FFC800', '#00C2A0', '#FF6C8C', '#3C3C3C', '#8B5CF6',
  ];

  const handleSave = () => {
    editModule(module.id, { name, color });
    onClose();
  };

  const startEditMs = (ms: Milestone) => {
    setEditingMs(ms.id);
    setMsTitle(ms.title);
    setMsDesc(ms.description);
  };

  const saveMs = (msId: string) => {
    editMilestone(module.id, msId, { title: msTitle, description: msDesc });
    setEditingMs(null);
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
          <Pencil size={20} className="inline mr-2" /> Edit Course
        </h2>

        {/* Course Name */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Course Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="duo-input"
          />
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-10 h-10 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? '#fff' : 'transparent',
                  boxShadow: color === c ? `0 0 0 3px ${c}80` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Milestones List */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Topics ({module.milestones.length})</label>
          <div className="flex flex-col gap-2">
            {module.milestones.map((ms) => (
              <div key={ms.id} className="p-3 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                {editingMs === ms.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={msTitle}
                      onChange={e => setMsTitle(e.target.value)}
                      className="duo-input text-sm"
                      placeholder="Topic title"
                    />
                    <input
                      value={msDesc}
                      onChange={e => setMsDesc(e.target.value)}
                      className="duo-input text-sm"
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveMs(ms.id)} className="duo-btn duo-btn-green flex-1 h-10 text-xs font-bold">
                        <Save size={14} className="mr-1" /> Save
                      </button>
                      <button onClick={() => setEditingMs(null)} className="duo-btn duo-btn-gray h-10 px-4 text-xs font-bold">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{ms.title}</div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{ms.description}</div>
                    </div>
                    <button onClick={() => startEditMs(ms)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--blue)' }}>
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this topic?')) deleteMilestone(module.id, ms.id);
                      }}
                      className="p-2 rounded-lg hover:opacity-70"
                      style={{ color: 'var(--red)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="duo-btn duo-btn-green w-full h-14 text-sm font-bold">
          <Save size={18} className="mr-2" /> Save Changes
        </button>
      </motion.div>
    </div>
  );
}
