import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Check, Palette, Smile, Glasses, Crown, Sparkles } from 'lucide-react';
import type { AvatarConfig } from '../types';

const bases = [
  { id: 'owl' as const, label: 'Owl', emoji: '🦉' },
  { id: 'cat' as const, label: 'Cat', emoji: '🐱' },
  { id: 'dog' as const, label: 'Dog', emoji: '🐶' },
  { id: 'fox' as const, label: 'Fox', emoji: '🦊' },
  { id: 'penguin' as const, label: 'Penguin', emoji: '🐧' },
];

const colors = [
  '#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B',
  '#FFC800', '#00C2A0', '#FF6C8C', '#3C3C3C', '#8B5CF6',
];

const accessories = [
  { id: 'none' as const, label: 'None', icon: null },
  { id: 'glasses' as const, label: 'Glasses', icon: Glasses },
  { id: 'hat' as const, label: 'Hat', icon: Crown },
  { id: 'bow' as const, label: 'Bow', icon: Sparkles },
  { id: 'crown' as const, label: 'Crown', icon: Crown },
];

const expressions = [
  { id: 'happy' as const, label: 'Happy', emoji: '😊' },
  { id: 'excited' as const, label: 'Excited', emoji: '🤩' },
  { id: 'neutral' as const, label: 'Neutral', emoji: '😐' },
  { id: 'determined' as const, label: 'Determined', emoji: '💪' },
];

function AvatarPreview({ config, size = 80 }: { config: AvatarConfig; size?: number }) {
  const baseEmojis: Record<string, string> = {
    owl: '🦉', cat: '🐱', dog: '🐶', fox: '🦊', penguin: '🐧',
  };
  const exprEmojis: Record<string, string> = {
    happy: '😊', excited: '🤩', neutral: '😐', determined: '💪',
  };

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: config.color,
        boxShadow: `0 4px 16px ${config.color}50`,
        fontSize: size * 0.55,
        position: 'relative',
      }}
    >
      {baseEmojis[config.base]}
      <div className="absolute -bottom-1 -right-1 text-lg">
        {exprEmojis[config.expression]}
      </div>
    </motion.div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AvatarCustomizer({ open, onClose }: Props) {
  const { state, setAvatar } = useApp();
  const [config, setConfig] = useState<AvatarConfig>(state.avatar);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="duo-card w-full max-w-md p-6 relative"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <AvatarPreview config={config} size={100} />
          <h2 className="text-xl font-extrabold mt-3" style={{ color: 'var(--text-primary)' }}>Your Avatar</h2>
        </div>

        {/* Base */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Character</div>
          <div className="flex gap-2 flex-wrap">
            {bases.map(b => (
              <button
                key={b.id}
                onClick={() => setConfig({ ...config, base: b.id })}
                className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                style={{
                  backgroundColor: config.base === b.id ? config.color : 'var(--bg-secondary)',
                  color: config.base === b.id ? '#fff' : 'var(--text-primary)',
                  borderColor: config.base === b.id ? config.color : 'var(--border-color)',
                }}
              >
                {b.emoji} {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Palette size={12} /> Color
          </div>
          <div className="flex gap-2 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setConfig({ ...config, color: c })}
                className="w-10 h-10 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: config.color === c ? '#fff' : 'transparent',
                  boxShadow: config.color === c ? `0 0 0 3px ${c}80` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Accessory</div>
          <div className="flex gap-2 flex-wrap">
            {accessories.map(a => (
              <button
                key={a.id}
                onClick={() => setConfig({ ...config, accessory: a.id })}
                className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-1"
                style={{
                  backgroundColor: config.accessory === a.id ? config.color : 'var(--bg-secondary)',
                  color: config.accessory === a.id ? '#fff' : 'var(--text-primary)',
                  borderColor: config.accessory === a.id ? config.color : 'var(--border-color)',
                }}
              >
                {a.icon && <a.icon size={14} />}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expression */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Smile size={12} /> Mood
          </div>
          <div className="flex gap-2 flex-wrap">
            {expressions.map(e => (
              <button
                key={e.id}
                onClick={() => setConfig({ ...config, expression: e.id })}
                className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                style={{
                  backgroundColor: config.expression === e.id ? config.color : 'var(--bg-secondary)',
                  color: config.expression === e.id ? '#fff' : 'var(--text-primary)',
                  borderColor: config.expression === e.id ? config.color : 'var(--border-color)',
                }}
              >
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setAvatar(config); onClose(); }}
          className="duo-btn duo-btn-green w-full h-14 text-sm font-bold"
        >
          <Check size={18} className="mr-2" /> Save Avatar
        </button>
      </motion.div>
    </div>
  );
}
