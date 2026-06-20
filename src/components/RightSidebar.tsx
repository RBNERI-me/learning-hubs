import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Flame, Diamond, Crown, ChevronRight, Target, Trophy, BookOpen, Dumbbell, Heart, MoreVertical, Pencil, Trash2, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ContextMenu from './ContextMenu';
import CourseEditor from './CourseEditor';
import AvatarCustomizer from './AvatarCustomizer';

export default function RightSidebar() {
  const { state, setActiveModule, setView, deleteModule, editModule } = useApp();
  const [contextMenu, setContextMenu] = useState<{ open: boolean; x: number; y: number; moduleId: string } | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showAvatar, setShowAvatar] = useState(false);

  const module = state.modules.find(m => m.id === state.activeModule);
  const completedCount = module?.milestones.filter(m => m.completed).length || 0;
  const totalCount = module?.milestones.length || 1;
  const progress = (completedCount / totalCount) * 100;

  // Daily quest simulation
  const dailyQuests = [
    { icon: Target, label: 'Complete 3 lessons', current: Math.min(completedCount, 3), goal: 3, color: 'var(--orange)', bgColor: 'var(--orange-light)' },
    { icon: Dumbbell, label: 'Earn 50 XP', current: Math.min(state.xp % 100, 50), goal: 50, color: 'var(--blue)', bgColor: 'var(--blue-light)' },
    { icon: BookOpen, label: 'Practice 1 weak spot', current: 0, goal: 1, color: 'var(--purple)', bgColor: 'var(--purple-light)' },
  ];

  const handleContextMenu = (e: React.MouseEvent, moduleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ open: true, x: e.clientX, y: e.clientY, moduleId });
  };

  const contextMenuItems = contextMenu ? [
    {
      label: 'Edit Course',
      icon: <Pencil size={14} />,
      onClick: () => {
        setEditingModule(contextMenu.moduleId);
        setContextMenu(null);
      },
    },
    {
      label: 'Change Color',
      icon: <Sparkles size={14} />,
      onClick: () => {
        const colors = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B', '#FFC800', '#00C2A0', '#FF6C8C'];
        const mod = state.modules.find(m => m.id === contextMenu.moduleId);
        const currentIdx = colors.indexOf(mod?.color || '#58CC02');
        const nextColor = colors[(currentIdx + 1) % colors.length];
        editModule(contextMenu.moduleId, { color: nextColor });
        setContextMenu(null);
      },
    },
    {
      label: 'Delete Course',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {
        if (confirm('Are you sure you want to delete this course?')) {
          deleteModule(contextMenu.moduleId);
        }
        setContextMenu(null);
      },
    },
  ] : [];

  return (
    <>
      <aside
        className="right-sidebar fixed right-0 top-0 bottom-0 z-40 flex flex-col py-6 px-4 border-l overflow-y-auto"
        style={{ width: '300px', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
      >
        {/* Avatar + User */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 mb-5 p-3 rounded-xl border-b-2 cursor-pointer"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          onClick={() => setShowAvatar(true)}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: state.avatar.color, boxShadow: `0 4px 12px ${state.avatar.color}40` }}
          >
            {state.avatar.base === 'owl' ? '🦉' : state.avatar.base === 'cat' ? '🐱' : state.avatar.base === 'dog' ? '🐶' : state.avatar.base === 'fox' ? '🦊' : '🐧'}
          </motion.div>
          <div className="flex-1">
            <div className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>Your Profile</div>
            <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Tap to customize avatar</div>
          </div>
          <User size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.div>

        {/* User Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <motion.div whileHover={{ scale: 1.04, y: -2 }} className="duo-stat" style={{ borderColor: 'var(--orange)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--orange)' }}>
              <Flame size={16} fill="#fff" className="animate-fire" />
            </div>
            <div>
              <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{state.streak}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Day streak</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} className="duo-stat" style={{ borderColor: 'var(--blue)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--blue)' }}>
              <Zap size={16} fill="#fff" />
            </div>
            <div>
              <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{state.xp}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Total XP</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} className="duo-stat" style={{ borderColor: 'var(--yellow)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--yellow)' }}>
              <Crown size={16} fill="#fff" />
            </div>
            <div>
              <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{state.crowns}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Crowns</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} className="duo-stat" style={{ borderColor: 'var(--purple)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--purple)' }}>
              <Diamond size={16} fill="#fff" />
            </div>
            <div>
              <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{state.gems}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Gems</div>
            </div>
          </motion.div>
        </div>

        {/* Hearts bar */}
        <div className="mb-5 p-3 rounded-xl border-b-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart size={16} fill="var(--red)" color="var(--red)" />
              <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Hearts</span>
            </div>
            <span className="text-sm font-extrabold" style={{ color: 'var(--red)' }}>{state.hearts}/5</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 h-2.5 rounded-full transition-all duration-300" style={{ backgroundColor: i < state.hearts ? 'var(--red)' : 'var(--gray-200)' }} />
            ))}
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Trophy size={12} /> Level Progress</span>
            <span>{state.xp % 100}/100</span>
          </div>
          <div className="duo-progress">
            <motion.div className="duo-progress-fill" initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ backgroundColor: 'var(--green)' }} />
          </div>
          <div className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{Math.floor(state.xp / 100)} level(s) completed</div>
        </div>

        {/* Daily Quests */}
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Target size={14} /> Daily Quests
          </div>
          <div className="flex flex-col gap-2">
            {dailyQuests.map((quest, i) => {
              const Icon = quest.icon;
              const pct = Math.min((quest.current / quest.goal) * 100, 100);
              const done = quest.current >= quest.goal;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-3 rounded-xl border-b-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: done ? 'var(--green)' : quest.color }}><Icon size={14} /></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold" style={{ color: done ? 'var(--green)' : 'var(--text-primary)' }}>{quest.label}</div>
                    </div>
                    <div className="text-xs font-extrabold" style={{ color: quest.color }}>{quest.current}/{quest.goal}</div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-100)' }}>
                    <motion.div className="h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }} style={{ backgroundColor: done ? 'var(--green)' : quest.color }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Course List */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <BookOpen size={14} /> Your Courses
          </div>
          <div className="flex flex-col gap-2">
            {state.modules.map((mod) => {
              const active = mod.id === state.activeModule;
              const modCompleted = mod.milestones.filter(m => m.completed).length;
              const modTotal = mod.milestones.length;
              return (
                <motion.button
                  key={mod.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setActiveModule(mod.id); setView('learn'); }}
                  onContextMenu={(e) => handleContextMenu(e, mod.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border-b-2 text-left transition-all group relative"
                  style={{ backgroundColor: active ? 'var(--bg-secondary)' : 'var(--bg-card)', borderColor: active ? mod.color : 'var(--border-color)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: mod.color }}>
                    {mod.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{mod.name}</div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{modCompleted}/{modTotal} milestones</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <button
                      onClick={(e) => handleContextMenu(e, mod.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </aside>

      <ContextMenu
        open={contextMenu?.open || false}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        items={contextMenuItems}
        onClose={() => setContextMenu(null)}
      />

      {editingModule && (
        <CourseEditor
          module={state.modules.find(m => m.id === editingModule)!}
          onClose={() => setEditingModule(null)}
        />
      )}

      {showAvatar && (
        <AvatarCustomizer open={showAvatar} onClose={() => setShowAvatar(false)} />
      )}
    </>
  );
}
