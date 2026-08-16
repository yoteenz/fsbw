import { AIOButton } from '../AIOButton';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';
import { aioPaths } from '../../utils/paths';

type Props = {
  variant?: 'gold' | 'outline-gold' | 'outline-dark';
  className?: string;
  showArrow?: boolean;
};

/** Homepage / marketing CTA that routes to continue journey when progress exists. */
export function StartBusinessCtaButton({ variant = 'gold', className, showArrow }: Props) {
  const view = useStartBusinessJourney();
  const hasProgress = view.progress.completedCount > 0 || view.nextAction?.status === 'in_progress';
  const label = hasProgress ? 'Continue My Business Setup' : 'Start My Business';
  const href = view.nextAction?.ctaRoute ?? `${aioPaths.startYourBusiness}/build`;

  return (
    <AIOButton to={href} variant={variant} className={className} showArrow={showArrow}>
      {label}
    </AIOButton>
  );
}
