import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Check, Star, Crown, Sparkles, ChevronDown, Flag, Trophy, Zap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleCompleteModal from './ModuleCompleteModal';
import ContextMenu from './ContextMenu';
import MilestoneEditor from './MilestoneEditor';
import PreTestModal from './PreTestModal';

const unitNames: Record<string, string> = {
  u1: 'Section 1',
  u2: 'Section 2',
  u3: 'Section 3',
  u4: 'Section 4',
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

const floatingDecorations = [
  { icon: Zap, color: '#FFC800', size: 16, offset: { x: -40, y: 20 } },
  { icon: Star, color: '#FF9600', size: 14, offset: { x: 50, y: -10 } },
  { icon: Crown, color: '#CE82FF', size: 18, offset: { x: -30, y: 60 } },
];

export default function LearnTree() {
  const { state, startQuiz, setPreTestResult } = useApp();
  const [showComplete, setShowComplete] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string>('u1');
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number; milestoneId: string } | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [preTestModule, setPreTestModule] = useState<string | null>(null);

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
  const hasPreTest = state.preTestResults[module.id] !== undefined;

  const handleStartQuiz = (milestoneId: string) => {
    if (!hasPreTest) {
      setPreTestModule(module.id);
      return;
    }
    startQuiz(milestoneId);
  };

  const handlePreTestComplete = (score: number) => {
    if (preTestModule) {
      setPreTestResult(preTestModule, score);
      // Unlock appropriate sections based on score
      const mod = state.modules.find(m => m.id === preTestModule);
      if (mod) {
        const totalMs = mod.milestones.length;
        const skipCount = score >= 80 ? Math.floor(totalMs * 0.5) : score >= 60 ? Math.floor(totalMs * 0.25) : 0;
        if (skipCount > 0) {
          // Pre-test unlocks sections based on score - skipCount logic handled by the test result
        }
      }
      setPreTestModule(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, milestoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ open: true, x: e.clientX, y: e.clientY, milestoneId });
  };

  const contextMenuItems = contextMenu ? [
    {
      label: 'Edit Topic',
      icon: <Pencil size={14} />,
      onClick: () => {
        setEditingMilestone(contextMenu.milestoneId);
        setContextMenu(null);
      },
    },
    {
      label: 'Delete Topic',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {
        if (confirm('Delete this topic?')) {
          const { deleteMilestone } = useApp();
          deleteMilestone(module.id, contextMenu.milestoneId);
        }
        setContextMenu(null);
      },
    },
  ] : [];

  return (
    <div className="flex flex-col items-center gap-0 py-6">
      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center w-full max-w-md"
      >
        <div className="relative mb-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold"
            style={{ backgroundColor: module.color, boxShadow: `0 6px 24px ${module.color}40` }}
          >
            <Star size={40} fill="#fff" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold border-2 border-white"
            style={{ backgroundColor: 'var(--yellow)' }}
          >
            {completedCount}
          </motion.div>
        </div>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{module.name}</h1>
        <div className="w-full mt-3 px-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            <span>Progress</span>
            <span>{completedCount}/{module.milestones.length}</span>
          </div>
          <div className="duo-progress">
            <motion.div
              className="duo-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / module.milestones.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ backgroundColor: module.color }}
            />
          </div>
        </div>

        {/* Pre-test prompt */}
        {!hasPreTest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl border-b-2 w-full text-center"
            style={{ backgroundColor: 'var(--blue-light)', borderColor: 'var(--blue)' }}
          >
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--blue)' }}>
              New to this course? Take a quick placement test!
            </div>
            <button
              onClick={() => setPreTestModule(module.id)}
              className="duo-btn duo-btn-blue px-6 h-10 text-xs font-bold"
            >
              Start Placement Test
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Section / Unit Path */}
      {unitIds.map((unitId, unitIndex) => {
        const milestones = unitGroups[unitId];
        const unitCompleted = milestones.every(m => m.completed);
        const unitProgress = milestones.filter(m => m.completed).length;
        const isExpanded = expandedUnit === unitId || unitProgress > 0;
        const unitColor = unitColors[unitId] || module.color;
        const unitBg = unitBgColors[unitId] || '#d7ffb8';
        const isFirstUnit = unitIndex === 0;

        return (
          <div key={unitId} className="w-full max-w-sm mb-6">
            {!isFirstUnit && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center mb-4 py-2">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--gray-200)' }} />
                <div className="mx-3 px-4 py-2 rounded-full text-xs font-extrabold uppercase" style={{ backgroundColor: unitBg, color: unitColor }}>
                  <Flag size={12} className="inline mr-1" /> Section {unitIndex + 1}
                </div>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--gray-200)' }} />
              </motion.div>
            )}

            <button
              onClick={() => setExpandedUnit(isExpanded ? '' : unitId)}
              className="w-full duo-unit-banner mb-4"
              style={{ backgroundColor: unitBg, borderColor: unitColor }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: unitColor }}>
                {unitCompleted ? <Trophy size={22} /> : <Star size={22} />}
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-extrabold" style={{ color: unitColor }}>{unitNames[unitId] || unitId}</div>
                <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{unitProgress}/{milestones.length} completed</div>
              </div>
              <ChevronDown size={20} className="transition-transform duration-300" style={{ color: unitColor, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {isExpanded && (
              <div className="relative flex flex-col items-center px-2 pb-4">
                <div className="absolute top-0 bottom-0 w-1.5 rounded-full" style={{ backgroundColor: 'var(--gray-200)', left: '50%', transform: 'translateX(-50%)' }} />
                <div className="absolute top-0 w-1.5 rounded-full transition-all duration-1000" style={{ backgroundColor: unitColor, left: '50%', transform: 'translateX(-50%)', height: `${(unitProgress / Math.max(milestones.length, 1)) * 100}%`, opacity: 0.6 }} />

                <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                  {milestones.map((milestone, idx) => {
                    const status = milestone.completed ? 'completed' : milestone.locked ? 'locked' : 'available';
                    const isNext = !milestone.completed && !milestone.locked;
                    const globalIdx = module.milestones.findIndex(m => m.id === milestone.id);
                    const isLeft = idx % 2 === 0;
                    const decoration = floatingDecorations[idx % floatingDecorations.length];
                    const DecoIcon = decoration.icon;

                    return (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, scale: 0.5, x: isLeft ? -30 : 30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: globalIdx * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative flex items-center w-full group"
                        style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end', paddingLeft: isLeft ? '20px' : '0', paddingRight: isLeft ? '0' : '20px' }}
                      >
                        <motion.div
                          animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 3 + idx * 0.5, ease: 'easeInOut' }}
                          className="absolute z-0"
                          style={{ left: isLeft ? `${decoration.offset.x + 80}px` : 'auto', right: isLeft ? 'auto' : `${decoration.offset.x + 80}px`, top: decoration.offset.y, color: decoration.color, opacity: 0.4 }}
                        >
                          <DecoIcon size={decoration.size} />
                        </motion.div>

                        <div className={`flex items-center gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className={`text-right ${isLeft ? 'text-right' : 'text-left'}`}>
                            <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{milestone.title}</div>
                            {milestone.completed && <div className="text-xs font-bold mt-0.5" style={{ color: unitColor }}>Completed</div>}
                            {isNext && <div className="text-xs font-bold mt-0.5 animate-pulse" style={{ color: unitColor }}>Start!</div>}
                          </div>

                          <motion.button
                            onClick={() => {
                              if (status !== 'locked') {
                                if (allCompleted && milestone.completed) {
                                  setShowComplete(milestone.id);
                                } else {
                                  handleStartQuiz(milestone.id);
                                }
                              }
                            }}
                            onContextMenu={(e) => handleContextMenu(e, milestone.id)}
                            whileHover={status !== 'locked' ? { scale: 1.12 } : {}}
                            whileTap={status !== 'locked' ? { scale: 0.92 } : {}}
                            className="relative flex items-center justify-center rounded-full transition-all duration-200 shadow-lg"
                            style={{
                              width: '72px',
                              height: '72px',
                              backgroundColor: status === 'completed' ? unitColor : status === 'locked' ? 'var(--gray-300)' : '#fff',
                              cursor: status === 'locked' ? 'not-allowed' : 'pointer',
                              opacity: status === 'locked' ? 0.5 : 1,
                              border: status === 'completed' ? `4px solid ${unitColor}` : status === 'available' ? `4px solid ${unitColor}` : '4px solid var(--gray-300)',
                              boxShadow: isNext ? `0 0 0 8px ${unitColor}20, 0 8px 24px ${unitColor}30` : status === 'completed' ? `0 4px 16px ${unitColor}40` : '0 4px 12px rgba(0,0,0,0.08)',
                            }}
                          >
                            {status === 'completed' && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                <Check size={32} color="#fff" strokeWidth={4} />
                              </motion.div>
                            )}
                            {status === 'locked' && <Lock size={24} color="#fff" />}
                            {status === 'available' && (
                              <div className="flex flex-col items-center">
                                <Star size={28} color={unitColor} fill={unitColor} />
                                {isNext && (
                                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="absolute -top-2 -right-2">
                                    <Sparkles size={18} color="var(--yellow)" fill="var(--yellow)" />
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </motion.button>

                          {/* Right-click menu trigger */}
                          <button
                            onClick={(e) => handleContextMenu(e, milestone.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {unitCompleted && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="mt-6 mb-2 flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm" style={{ backgroundColor: unitBg, color: unitColor, border: `2px solid ${unitColor}` }}>
                    <Trophy size={20} /> Section Complete!
                  </motion.div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Module Complete Banner */}
      {allCompleted && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="mt-8 flex flex-col items-center">
          <div className="text-4xl mb-3">🏆</div>
          <button onClick={() => setShowComplete('module')} className="duo-btn duo-btn-green px-10 h-16 text-base font-extrabold">
            <Crown size={24} className="mr-2" fill="#fff" /> Complete Module & Expand!
          </button>
        </motion.div>
      )}

      {showComplete && (
        <ModuleCompleteModal module={module} onClose={() => setShowComplete(null)} />
      )}

      <ContextMenu
        open={contextMenu?.open || false}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        items={contextMenuItems}
        onClose={() => setContextMenu(null)}
      />

      {editingMilestone && (
        <MilestoneEditor
          moduleId={module.id}
          milestone={module.milestones.find(m => m.id === editingMilestone)!}
          onClose={() => setEditingMilestone(null)}
        />
      )}

      {preTestModule && (
        <PreTestModal
          moduleId={preTestModule}
          onClose={() => setPreTestModule(null)}
          onComplete={handlePreTestComplete}
        />
      )}
    </div>
  );
}
