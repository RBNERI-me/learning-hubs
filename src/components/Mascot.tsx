import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface Props {
  emotion?: 'happy' | 'sad' | 'excited' | 'neutral' | 'warning';
  size?: number;
  className?: string;
}

// SVG Owl face inspired by Duolingo's Duo
function OwlFace({ size }: { size: number }) {
  const s = size;
  const eyeR = s * 0.15;
  const pupilR = s * 0.08;
  const eyeY = s * 0.4;
  const leftEyeX = s * 0.35;
  const rightEyeX = s * 0.65;
  const beakW = s * 0.12;
  const beakH = s * 0.08;
  const beakY = s * 0.58;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      {/* Body / head shape */}
      <ellipse cx={s / 2} cy={s / 2} rx={s * 0.42} ry={s * 0.44} fill="white" />
      {/* Eyes */}
      <circle cx={leftEyeX} cy={eyeY} r={eyeR} fill="#131f24" />
      <circle cx={rightEyeX} cy={eyeY} r={eyeR} fill="#131f24" />
      {/* Pupils */}
      <circle cx={leftEyeX} cy={eyeY} r={pupilR} fill="white" />
      <circle cx={rightEyeX} cy={eyeY} r={pupilR} fill="white" />
      {/* Beak */}
      <polygon
        points={`${s / 2},${beakY} ${s / 2 - beakW},${beakY + beakH} ${s / 2 + beakW},${beakY + beakH}`}
        fill="#ff9600"
      />
    </svg>
  );
}

export default function Mascot({ emotion = 'happy', size = 40, className = '' }: Props) {
  const { state } = useApp();
  const mod = state.modules.find(m => m.id === state.activeModule);
  const color = mod?.color || '#58CC02';

  const bounceVariants = {
    happy: { y: [0, -6, 0], transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' as const } },
    excited: { y: [0, -12, 0], scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' as const } },
    sad: { y: [0, 3, 0], rotate: [0, -3, 3, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' as const } },
    neutral: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' as const } },
    warning: { rotate: [0, -8, 8, 0], transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' as const } },
  };

  return (
    <motion.div
      animate={bounceVariants[emotion] || bounceVariants.happy}
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 4px 16px ${color}50`,
      }}
    >
      <OwlFace size={size * 0.72} />
    </motion.div>
  );
}
