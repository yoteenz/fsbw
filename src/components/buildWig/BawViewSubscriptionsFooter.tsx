import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import { isBawClientTestOnlyMode } from '../../utils/bawClientTestMode';
import { getBuildAWigCustomizePathFromHub, resolveBuildAWigTryPathToHubPath } from '../../utils/buildAWigRoutes';
import { useBawSubscriptionView } from './BawSubscriptionViewContext';

const defaultButtonStyle: CSSProperties = {
  borderWidth: '1.3px',
  color: '#EB1C24',
  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
};

type BawViewSubscriptionsFooterProps = {
  buttonWidth?: string;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
};

export function BawViewSubscriptionsFooter({
  buttonWidth = '100%',
  className = 'border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50',
  style,
  fullWidth = true,
}: BawViewSubscriptionsFooterProps) {
  const premium = useBawSubscriptionView();

  return (
    <>
      <div className="px-0 md:px-0 flex justify-center flex-col items-center gap-2" style={style}>
        <button
          type="button"
          onClick={premium.handleUpgradeAction}
          className={className}
          style={{
            ...defaultButtonStyle,
            width: buttonWidth,
            maxWidth: fullWidth ? '100%' : undefined,
          }}
        >
          {premium.showPremiumChart ? 'CONFIRM SUBSCRIPTION' : 'VIEW SUBSCRIPTIONS'}
        </button>
      </div>
      <ConfirmationModal
        isOpen={premium.showValidationModal}
        onClose={() => premium.setShowValidationModal(false)}
        onConfirm={() => premium.setShowValidationModal(false)}
        title="FORGETTING SOMETHING?"
        message="PLEASE SELECT A SUBSCRIPTION TIER TO CONTINUE."
        confirmText="OK"
        cancelText=""
        dataAttribute="baw-subscription-validation"
      />
    </>
  );
}

type BawCustomizeInBuildWigFooterProps = {
  customizePath: string;
  buttonWidth?: string;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
};

export function BawCustomizeInBuildWigFooter({
  customizePath,
  buttonWidth = '100%',
  className = 'border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50',
  style,
  fullWidth = true,
}: BawCustomizeInBuildWigFooterProps) {
  const navigate = useNavigate();

  return (
    <div className="px-0 md:px-0 flex justify-center flex-col items-center gap-2" style={style}>
      <button
        type="button"
        onClick={() => navigate(customizePath)}
        className={className}
        style={{
          ...defaultButtonStyle,
          width: buttonWidth,
          maxWidth: fullWidth ? '100%' : undefined,
        }}
      >
        CUSTOMIZE IN BUILD-A-WIG
      </button>
    </div>
  );
}

/** Hub landing footer for signed-in standard members. */
export function BawHubStandardMemberFooter({
  buttonWidth = '100%',
  style,
}: {
  buttonWidth?: string;
  style?: CSSProperties;
}) {
  const { pathname } = useLocation();
  const hubPath = resolveBuildAWigTryPathToHubPath(pathname);
  return (
    <BawCustomizeInBuildWigFooter
      customizePath={getBuildAWigCustomizePathFromHub(hubPath)}
      buttonWidth={buttonWidth}
      style={style}
    />
  );
}

type BawSubpageFooterActionProps = {
  onConfirm: () => void;
  hidden?: boolean;
  buttonWidth?: string;
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
  buttonClassName?: string;
};

/** Sub-page footer: CONFIRM SELECTION for premium; VIEW SUBSCRIPTIONS for client test mode. */
export function BawSubpageFooterAction({
  onConfirm,
  hidden = false,
  buttonWidth = '358px',
  wrapperStyle = { marginTop: '2px', transform: 'translateY(8px)' },
  wrapperClassName = 'px-0 md:px-0 flex justify-center',
  buttonClassName = '',
}: BawSubpageFooterActionProps) {
  const { pathname } = useLocation();
  const testMode = isBawClientTestOnlyMode(pathname);

  if (hidden) return null;

  if (testMode) {
    return (
      <BawViewSubscriptionsFooter
        buttonWidth={buttonWidth}
        className={`border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50 ${buttonClassName}`}
        style={wrapperStyle}
        fullWidth={buttonWidth === '100%'}
      />
    );
  }

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <button
        type="button"
        onClick={onConfirm}
        className={`border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50 ${buttonClassName}`}
        style={{
          ...defaultButtonStyle,
          width: buttonWidth,
        }}
      >
        CONFIRM SELECTION
      </button>
    </div>
  );
}
