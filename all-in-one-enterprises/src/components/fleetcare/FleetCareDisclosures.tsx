import { FLEETCARE_LEGAL_DISCLOSURES } from '../../fleetcare/fleetcareConfig';

export function IndependentProviderDisclosure({ className = '' }: { className?: string }) {
  return (
    <p className={`aio-fc-disclosure ${className}`.trim()} role="note">
      {FLEETCARE_LEGAL_DISCLOSURES.independentProvider}
    </p>
  );
}

export function ReferralEconomicDisclosure({ className = '' }: { className?: string }) {
  return (
    <p className={`aio-fc-disclosure aio-fc-disclosure--muted ${className}`.trim()} role="note">
      {FLEETCARE_LEGAL_DISCLOSURES.referralEconomic}
    </p>
  );
}

export function AioVerifiedBadgeNote({ className = '' }: { className?: string }) {
  return (
    <p className={`aio-fc-disclosure aio-fc-disclosure--muted ${className}`.trim()}>
      {FLEETCARE_LEGAL_DISCLOSURES.verifiedBadge}
    </p>
  );
}
