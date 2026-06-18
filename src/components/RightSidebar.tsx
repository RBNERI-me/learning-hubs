import { useApp } from '../context/AppContext';
import { Zap, Flame, Diamond, Crown, ChevronRight, Target, Trophy, BookOpen, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RightSidebar() {
  const { state, setActiveModule, setView } = useApp();
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

  return (
    <aside
      className="right-sidebar fixed right-0 top-0 bottom-0 z-40 flex flex-col py-6 px-4 border-l overflow-y-auto"
      style={{ width: '300px', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
    >
      {/* User Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          className="duo-stat"
          style={{ borderColor: 'var(--orange)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--orange)' }}>
            <Flame size={16} fill="#fff" className="animate-fire" />
          </div>
          <div>
            <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              {state.streak}
            </div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
              Day streak
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          className="duo-stat"
          style={{ borderColor: 'var(--blue)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--blue)' }}>
            <Zap size={16} fill="#fff" />
          </div>
          <div>
            <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              {state.xp}
            </div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
              Total XP
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          className="duo-stat"
          style={{ borderColor: 'var(--yellow)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--yellow)' }}>
            <Crown size={16} fill="#fff" />
          </div>
          <div>
            <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              {state.crowns}
            </div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
              Crowns
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -2 }}
          className="duo-stat"
          style={{ borderColor: 'var(--purple)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--purple)' }}>
            <Diamond size={16} fill="#fff" />
          </div>
          <div>
            <div className="text-lg font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              {state.gems}
            </div>
            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
              Gems
            </div>
          </div>
        </motion.div>
      </div>

      {/* Level Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Trophy size={12} /> Level Progress
          </span>
          <span>{state.xp % 100}/100</span>
        </div>
        <div className="duo-progress">
          <motion.div
            className="duo-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ backgroundColor: 'var(--green)' }}
          />
        </div>
        <div className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
          {Math.floor(state.xp / 100)} level(s) completed
        </div>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-xl border-b-2"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: done ? 'var(--green)' : quest.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold" style={{ color: done ? 'var(--green)' : 'var(--text-primary)' }}>
                      {quest.label}
                    </div>
                  </div>
                  <div className="text-xs font-extrabold" style={{ color: quest.color }}>
                    {quest.current}/{quest.goal}
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--gray-100)' }}>
                  <motion.div
                    className="h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                    style={{ backgroundColor: done ? 'var(--green)' : quest.color }}
                  />
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
                onClick={() => {
                  setActiveModule(mod.id);
                  setView('learn');
                }}
                className="flex items-center gap-3 p-3 rounded-xl border-b-2 text-left transition-all"
                style={{
                  backgroundColor: active ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  borderColor: active ? mod.color : 'var(--border-color)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: mod.color }}>
                  {mod.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {mod.name}
                  </div>
                  <div className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                    {modCompleted}/{modTotal} milestones
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
