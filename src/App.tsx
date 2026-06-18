import { useApp } from './context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import LearnTree from './components/LearnTree';
import QuizCard from './components/QuizCard';
import SettingsView from './components/SettingsView';
import SandboxView from './components/SandboxView';
import CreateModuleView from './components/CreateModuleView';
import OnboardingModal from './components/OnboardingModal';

export default function App() {
  const { state } = useApp();

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark' : ''} font-${state.fontSize}`}>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <LeftSidebar />
        <main className="flex-1" style={{ marginLeft: 'var(--sidebar-width)', marginRight: 'var(--right-sidebar-width)' }}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              {state.quiz && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', duration: 0.4 }}
                >
                  <QuizCard />
                </motion.div>
              )}
              {!state.quiz && state.activeView === 'learn' && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LearnTree />
                </motion.div>
              )}
              {!state.quiz && state.activeView === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsView />
                </motion.div>
              )}
              {!state.quiz && state.activeView === 'sandbox' && (
                <motion.div
                  key="sandbox"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SandboxView />
                </motion.div>
              )}
              {!state.quiz && state.activeView === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CreateModuleView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        <RightSidebar />
      </div>

      {!state.hasSeenOnboarding && <OnboardingModal />}
    </div>
  );
}
