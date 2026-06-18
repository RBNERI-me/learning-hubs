import { useApp } from '../context/AppContext';
import { BookOpen, FlaskConical, Plus, Settings } from 'lucide-react';
import Mascot from './Mascot';
import { motion } from 'framer-motion';

export default function LeftSidebar() {
  const { state, setView } = useApp();
  const navItems = [
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'sandbox', icon: FlaskConical, label: 'Sandbox' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <aside
      className="left-sidebar fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center border-r"
      style={{ width: '72px', backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
    >
      {/* Logo */}
      <div className="logo-area py-4">
        <motion.div
          whileHover={{ scale: 1.15, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
          onClick={() => setView('learn')}
        >
          <Mascot emotion="excited" size={48} className="animate-levitate" />
        </motion.div>
      </div>

      <nav className="flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = state.activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`duo-nav-item ${active ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
