import { useApp } from '../context/AppContext';
import { Sun, Moon, Type, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const { state, setTheme, setFontSize, setApiKey } = useApp();

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-extrabold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="duo-card p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-orange)' }}>
            <Key size={20} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Groq API Key
          </div>
        </div>
        <input
          type="password"
          value={state.apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your Groq API key here"
          className="w-full p-4 rounded-xl border-2 text-sm font-bold outline-none transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderBottomWidth: '4px', borderRadius: 'var(--radius-sm)' }}
        />
        <div className="text-xs mt-2 font-bold" style={{ color: 'var(--text-muted)' }}>
          Your key is stored locally in your browser. Never shared with any server.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="duo-card p-6 mb-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-yellow)' }}>
            <Sun size={20} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Theme
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`duo-btn flex-1 h-12 text-sm font-bold ${state.theme === 'light' ? 'duo-btn-blue' : 'duo-btn-gray'}`}
          >
            <Sun size={16} className="mr-2" /> Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`duo-btn flex-1 h-12 text-sm font-bold ${state.theme === 'dark' ? 'duo-btn-blue' : 'duo-btn-gray'}`}
          >
            <Moon size={16} className="mr-2" /> Dark
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="duo-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-blue)' }}>
            <Type size={20} />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Text Size
          </div>
        </div>
        <div className="flex gap-3">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`duo-btn flex-1 h-12 text-sm font-bold capitalize ${state.fontSize === size ? 'duo-btn-blue' : 'duo-btn-gray'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
