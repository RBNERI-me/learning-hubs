import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Check, Star, Crown, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleCompleteModal from './ModuleCompleteModal';

const unitNames: Record<string, string> = {
  u1: 'Unit 1',
  u2: 'Unit 2',
  u3: 'Unit 3',
  u4: 'Unit 4',
};

const unitColors: Record<string, string> = {
  u1: '#58CC02',
  u2: '#1CB0F6',
  u3: '#FF9600',
  u4: '#CE82FF',
};

const unitBgColors: Record<string, string> = {
  u1: '#d7ffb8',
  u2: '#ddf4ff',
  u3: '#fff0d4',
  u4: '#eec3ff',
};

export default function LearnTree() {
  const { state, startQuiz } = useApp();
  const [showComplete, setShowComplete] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string>('u1');
  const module = state.modules.find(m => m.id === state.activeModule);
  if (!module) return null;

  const unitGroups: Record<string, typeof module.milestones> = {};
  module.milestones.forEach(m => {
    const uid = m.unitId || 'u1';
    if (!unitGroups[uid]) unitGroups[uid] = [];
    unitGroups[uid].push(m);
  });

  const unitIds = Object.keys(unitGroups).sort();
  const allCompleted = module.milestones.every(m => m.completed);
  const completedCount = module.milestones.filter(m => m.completed).length;

  return (
    <div className="flex flex-col items-center gap-0 py-6">
      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col items-center w-full max-w-sm"
      >
        <div className="relative mb-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-extrabold"
            style={{ backgroundColor: module.color, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            <Star size={32} fill="#fff" />
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: 'var(--accent-yellow)' }}
          >
            {completedCount}
          </div>
        </div>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {module.name}
        </h1>
        <div className="w-full mt-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Progress</span>
            <span>{completedCount}/{module.milestones.length}</span>
          </div>
          <div className="h-3 rounded-full w-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
            <motion.div
              className="h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / module.milestones.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ backgroundColor: module.color }}
            />
          </div>
        </div>
      </motion.div>

      {/* Unit Sections */}
      {unitIds.map((unitId) => {
        const milestones = unitGroups[unitId];
        const unitCompleted = milestones.every(m => m.completed);
        const unitProgress = milestones.filter(m => m.completed).length;
        const isExpanded = expandedUnit === unitId || unitProgress > 0;
        const unitColor = unitColors[unitId] || module.color;
        const unitBg = unitBgColors[unitId] || '#d7ffb8';

        return (
          <div key={unitId} className="w-full max-w-sm mb-4">
            {/* Unit Header */}
            <button
              onClick={() => setExpandedUnit(isExpanded ? '' : unitId)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border-b-4 transition-all mb-3"
              style={{
                backgroundColor: unitBg,
                borderColor: unitColor,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: unitColor }}
              >
                {unitCompleted ? <Crown size={18} /> : <Star size={18} />}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold" style={{ color: unitColor }}>
                  {unitNames[unitId] || unitId}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {unitProgress}/{milestones.length} completed
                </div>
              </div>
              <ChevronDown
                size={16}
                style={{ color: unitColor, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              />
            </button>

            {/* Duolingo Winding Path */}
            {isExpanded && (
              <div className="relative flex flex-col items-center gap-1 px-2">
                {/* SVG path connecting milestones */}
                <svg
                  className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
                  style={{ overflow: 'visible' }}
                >
                  {milestones.map((_, idx) => {
                    if (idx === 0) return null;
                    const prevCompleted = milestones[idx - 1].completed;
                    // Row and column positions
                    const row = Math.floor((idx - 1) / 3);
                    const prevRow = Math.floor((idx - 2) / 3);
                    const col = (idx - 1) % 3;
                    const prevCol = (idx - 2) % 3;
                    // Adjust for zigzag
                    const effectiveCol = row % 2 === 0 ? col : 2 - col;
                    const prevEffectiveCol = prevRow % 2 === 0 ? prevCol : 2 - prevCol;
                    
                    const x1 = (prevEffectiveCol + 0.5) * (100 / 3);
                    const y1 = (prevRow + 1) * 80;
                    const x2 = (effectiveCol + 0.5) * (100 / 3);
                    const y2 = (row + 1) * 80;
                    
                    return (
                      <line
                        key={`path-${idx}`}
                        x1={`${x1}%`}
                        y1={y1}
                        x2={`${x2}%`}
                        y2={y2}
                        stroke={prevCompleted ? unitColor : 'var(--border-color)'}
                        strokeWidth="3"
                        strokeDasharray={prevCompleted ? "0" : "6,4"}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* Milestones arranged in grid rows */}
                {(() => {
                  const rows: typeof milestones[] = [];
                  for (let i = 0; i < milestones.length; i += 3) {
                    rows.push(milestones.slice(i, i + 3));
                  }
                  return rows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-3 gap-0 w-full z-10"
                      style={{ direction: rowIdx % 2 === 0 ? 'ltr' : 'rtl' }}
                    >
                      {row.map((milestone) => {
                        const status = milestone.completed ? 'completed' : milestone.locked ? 'locked' : 'available';
                        const isNext = !milestone.completed && !milestone.locked;
                        const globalIdx = module.milestones.findIndex(m => m.id === milestone.id);
                        return (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: globalIdx * 0.05, type: 'spring', stiffness: 300 }}
                            className="flex flex-col items-center py-3"
                            style={{ direction: 'ltr' }}
                          >
                            <button
                              onClick={() => {
                                if (status !== 'locked') {
                                  if (allCompleted && milestone.completed) {
                                    setShowComplete(milestone.id);
                                  } else {
                                    startQuiz(milestone.id);
                                  }
                                }
                              }}
                              className="relative flex items-center justify-center rounded-full transition-all duration-200"
                              style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: status === 'completed' ? unitColor : status === 'locked' ? 'var(--border-color)' : '#fff',
                                cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                                opacity: status === 'locked' ? 0.5 : 1,
                                border: status === 'completed' ? 'none' : status === 'available' ? `3px solid ${unitColor}` : '3px solid var(--border-color)',
                                boxShadow: isNext ? `0 0 0 6px ${unitColor}25` : 'none',
                              }}
                            >
                              {status === 'completed' && (
                                <Check size={28} color="#fff" strokeWidth={3} />
                              )}
                              {status === 'locked' && <Lock size={22} color="#fff" />}
                              {status === 'available' && (
                                <div className="flex flex-col items-center">
                                  <Star size={28} color={unitColor} fill={unitColor} />
                                  {isNext && (
                                    <motion.div
                                      animate={{ scale: [1, 1.3, 1] }}
                                      transition={{ repeat: Infinity, duration: 1.5 }}
                                      className="absolute -top-1 -right-1"
                                    >
                                      <Sparkles size={14} color="var(--accent-yellow)" fill="var(--accent-yellow)" />
                                    </motion.div>
                                  )}
                                </div>
                              )}
                            </button>
                            <div className="text-center mt-2 max-w-[80px]">
                              <div className="text-[11px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                {milestone.title}
                              </div>
                              {milestone.completed && (
                                <div className="text-[10px] font-bold mt-0.5" style={{ color: unitColor }}>
                                  Completed
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })}

      {/* Module Complete Banner */}
      {allCompleted && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={() => setShowComplete('module')}
          className="mt-6 duo-btn duo-btn-green px-8 h-14 text-sm"
        >
          <Crown size={20} className="mr-2" fill="#fff" />
          Complete Module & Expand!
        </motion.button>
      )}

      {showComplete && (
        <ModuleCompleteModal
          module={module}
          onClose={() => setShowComplete(null)}
        />
      )}
    </div>
  );
}
