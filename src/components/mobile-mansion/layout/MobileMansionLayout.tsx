import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { mansionSpacing } from '../../../constants/mobileMansionTokens';
import { MansionBackground } from '../background/MansionBackground';
import { MobilePageHeader, type MobilePageHeaderProps } from '../header/MobilePageHeader';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { pageEnter, fadeTransition } from '../animations';
import '../MobileMansion.css';

export type MobileMansionLayoutProps = {
  children: ReactNode;
  /** Page header configuration */
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  actionButton?: ReactNode;
  /** Background system */
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity?: number;
  blurAmount?: number;
  /** Layout options */
  showBottomNav?: boolean;
  showHeader?: boolean;
  /** Skip page transition animation (for nested layouts) */
  noAnimation?: boolean;
};

export function MobileMansionLayout({
  children,
  title,
  subtitle,
  showBack = false,
  backTo,
  onBack,
  actionButton,
  backgroundImage,
  backgroundVideo,
  overlayOpacity,
  blurAmount,
  showBottomNav = true,
  showHeader = true,
  noAnimation = false,
}: MobileMansionLayoutProps) {
  const location = useLocation();

  const headerProps: MobilePageHeaderProps = {
    title,
    subtitle,
    showBack,
    backTo,
    onBack,
    actionButton,
  };

  return (
    <div className="mobile-mansion-root">
      <MansionBackground
        backgroundImage={backgroundImage}
        backgroundVideo={backgroundVideo}
        overlayOpacity={overlayOpacity}
        blurAmount={blurAmount}
      />

      <div className="mobile-mansion-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={noAnimation ? undefined : location.pathname}
            className="mobile-mansion-content"
            style={{
              paddingTop: `calc(${mansionSpacing.pagePaddingTop} + ${mansionSpacing.safeAreaTop})`,
              paddingBottom: showBottomNav
                ? `calc(${mansionSpacing.pagePaddingBottom} + ${mansionSpacing.safeAreaBottom})`
                : `calc(1.5rem + ${mansionSpacing.safeAreaBottom})`,
              paddingLeft: mansionSpacing.pagePaddingX,
              paddingRight: mansionSpacing.pagePaddingX,
            }}
            variants={noAnimation ? undefined : pageEnter}
            initial={noAnimation ? undefined : 'initial'}
            animate={noAnimation ? undefined : 'animate'}
            exit={noAnimation ? undefined : 'exit'}
            transition={fadeTransition}
          >
            {showHeader ? <MobilePageHeader {...headerProps} /> : null}
            <main className="flex flex-col gap-4 flex-1">{children}</main>
          </motion.div>
        </AnimatePresence>
      </div>

      {showBottomNav ? <MobileBottomNav /> : null}
    </div>
  );
}
