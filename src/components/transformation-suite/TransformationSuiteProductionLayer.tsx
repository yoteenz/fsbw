import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransformationSuiteBookingEngine } from './TransformationSuiteBookingEngine';
import { TransformationSuiteConsultPanel } from './TransformationSuiteConsultPanel';
import { TransformationSuiteFeaturedPanel } from './TransformationSuiteFeaturedPanel';
import { TransformationSuitePanelAnchor } from './TransformationSuitePanelAnchor';
import { TransformationSuiteServicePanel } from './TransformationSuiteServicePanel';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

const CONSULT_PANELS = [
  {
    regionId: 'DEBUG_CONSULT_1' as const,
    title: 'Virtual Consultation',
    bullets: ['1-on-1 Expert Guidance', 'Personalized Recommendations', 'Video or Phone Consultation'],
  },
  {
    regionId: 'DEBUG_CONSULT_2' as const,
    title: 'Hair Analysis Review',
    bullets: ['Review Analysis Results', 'Texture Recommendations', 'Density Recommendations', 'Length Recommendations'],
  },
  {
    regionId: 'DEBUG_CONSULT_3' as const,
    title: 'Color Consultation',
    bullets: ['Find Your Perfect Shade', 'Custom Color Planning', 'Blonde Specialist Guidance'],
  },
  {
    regionId: 'DEBUG_CONSULT_4' as const,
    title: 'Unit Consultation',
    bullets: ['Choose The Right Unit', 'Lace Guidance', 'Density Guidance', 'Styling Recommendations'],
  },
];

const SERVICE_PANELS = [
  {
    regionId: 'DEBUG_SERVICE_1' as const,
    title: 'Wig Install',
    subtitle: 'Professional Install Service',
  },
  {
    regionId: 'DEBUG_SERVICE_2' as const,
    title: 'Frontal Install',
    subtitle: 'Flawless Hairline Installation',
  },
  {
    regionId: 'DEBUG_SERVICE_3' as const,
    title: 'Closure Install',
    subtitle: 'Natural. Secure. Beautiful.',
  },
  {
    regionId: 'DEBUG_SERVICE_4' as const,
    title: 'Maintenance & Refresh',
    bullets: ['Shampoo', 'Styling', 'Curl Refresh', 'Unit Maintenance'],
  },
];

export function TransformationSuiteProductionLayer({ measureRef }: Props) {
  const navigate = useNavigate();

  return (
    <>
      {CONSULT_PANELS.map((panel) => (
        <TransformationSuitePanelAnchor key={panel.regionId} measureRef={measureRef} regionId={panel.regionId}>
          <TransformationSuiteConsultPanel
            title={panel.title}
            bullets={panel.bullets}
            onBook={() => navigate('/booking/consultation')}
          />
        </TransformationSuitePanelAnchor>
      ))}

      <TransformationSuitePanelAnchor measureRef={measureRef} regionId="DEBUG_FEATURED_EXPERIENCE" zIndex={9}>
        <TransformationSuiteFeaturedPanel />
      </TransformationSuitePanelAnchor>

      <TransformationSuiteBookingEngine measureRef={measureRef} />

      {SERVICE_PANELS.map((panel) => (
        <TransformationSuitePanelAnchor key={panel.regionId} measureRef={measureRef} regionId={panel.regionId}>
          <TransformationSuiteServicePanel
            title={panel.title}
            subtitle={panel.subtitle}
            bullets={panel.bullets}
            onBook={() => navigate('/booking/appointment')}
          />
        </TransformationSuitePanelAnchor>
      ))}
    </>
  );
}
