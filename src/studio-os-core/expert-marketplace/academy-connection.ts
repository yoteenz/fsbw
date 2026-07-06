import type { AcademyMarketplaceOffering, ExpertProfile } from './types';

export function generateAcademyOfferings(profile: ExpertProfile): AcademyMarketplaceOffering[] {
  return [
    {
      id: `academy-course-${profile.id}`,
      expertProfileId: profile.id,
      type: 'course',
      title: `${profile.expertName} · Foundations`,
      summary: 'Course generated from Profession Brain — same source of truth as concierges and employees.',
    },
    {
      id: `academy-playbook-${profile.id}`,
      expertProfileId: profile.id,
      type: 'playbook',
      title: `${profile.specialties[0] ?? 'Expert'} Playbook`,
      summary: 'Operational playbook from preserved organizational expertise.',
    },
    {
      id: `academy-checklist-${profile.id}`,
      expertProfileId: profile.id,
      type: 'checklist',
      title: 'Professional Preparation Checklist',
      summary: 'Checklist before consultation or licensed service.',
    },
    {
      id: `academy-cert-${profile.id}`,
      expertProfileId: profile.id,
      type: 'certification',
      title: `${profile.organizationName} Knowledge Certification`,
      summary: 'Certification path connected to Studio Institute™.',
    },
  ];
}
