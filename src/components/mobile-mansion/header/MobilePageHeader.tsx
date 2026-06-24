import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CrownIcon, ChevronLeftIcon } from '../icons/NavIcons';
import { panelFade, fadeTransition } from '../animations';

export type MobilePageHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  actionButton?: ReactNode;
};

export function MobilePageHeader({
  title,
  subtitle = 'Frontal Slayer Experience',
  showBack = false,
  backTo,
  onBack,
  actionButton,
}: MobilePageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.header
      className="relative flex flex-col items-center px-5 pt-2 pb-4"
      variants={panelFade}
      initial="initial"
      animate="animate"
      transition={fadeTransition}
    >
      {/* Top row: back + action */}
      <div className="flex items-center justify-between w-full h-8 mb-2">
        <div className="w-8">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 -ml-1 text-[#808080] bg-transparent border-none cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          ) : null}
        </div>
        <div className="w-8 flex justify-end">{actionButton}</div>
      </div>

      {/* Crown + title */}
      <CrownIcon className="mb-2" />
      <h1 className="mansion-title text-[1.375rem] text-center">{title}</h1>
      <p className="mansion-subtitle mt-1.5 text-center">{subtitle}</p>
    </motion.header>
  );
}
