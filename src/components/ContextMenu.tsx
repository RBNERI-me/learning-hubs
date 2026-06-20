import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ open, x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 44 - 20);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -5 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[70] flex flex-col py-2 rounded-xl shadow-2xl border-2 overflow-hidden"
          style={{
            left: adjustedX,
            top: adjustedY,
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            minWidth: '180px',
          }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className="flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition-colors hover:opacity-80"
              style={{
                color: item.danger ? 'var(--red)' : item.disabled ? 'var(--gray-400)' : 'var(--text-primary)',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.4 : 1,
              }}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
