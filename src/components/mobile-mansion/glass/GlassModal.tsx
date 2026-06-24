import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { mansionRadii } from '../../../constants/mobileMansionTokens';
import { fadeTransition } from '../animations';

type GlassModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function GlassModal({ open, onClose, children, title }: GlassModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-white/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-[61] -translate-y-1/2 mansion-glass mansion-glass-heavy mansion-glass-chrome p-6"
            style={{ borderRadius: mansionRadii.modal, maxWidth: '24rem', margin: '0 auto' }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {title ? (
              <h2 className="mansion-title text-center text-base mb-4">{title}</h2>
            ) : null}
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
