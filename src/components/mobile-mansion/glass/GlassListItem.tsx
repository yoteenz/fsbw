import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ChevronRightIcon } from '../icons/NavIcons';

type GlassListItemProps = {
  label: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  showChevron?: boolean;
  icon?: ReactNode;
};

export function GlassListItem({
  label,
  subtitle,
  onClick,
  href,
  showChevron = true,
  icon,
}: GlassListItemProps) {
  const content = (
    <>
      {icon ? <span className="flex-shrink-0 mr-3">{icon}</span> : null}
      <div className="flex-1 min-w-0">
        <p className="font-futura text-[0.6875rem] uppercase tracking-[0.12em] text-[#1a1a1a]">
          {label}
        </p>
        {subtitle ? (
          <p className="mansion-body mt-0.5 text-[0.5625rem]">{subtitle}</p>
        ) : null}
      </div>
      {showChevron ? (
        <ChevronRightIcon className="flex-shrink-0 w-3.5 h-3.5 text-[#c8c8c8] ml-2" />
      ) : null}
    </>
  );

  const className =
    'flex items-center w-full px-4 py-3.5 border-b border-white/60 last:border-b-0 text-left bg-transparent';

  if (href) {
    return (
      <motion.a
        href={href}
        className={className}
        whileTap={{ scale: 0.99, backgroundColor: 'rgba(255,255,255,0.3)' }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.99, backgroundColor: 'rgba(255,255,255,0.3)' }}
    >
      {content}
    </motion.button>
  );
}
