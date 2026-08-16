import type { IntegrationAdapter } from './integrationAdapter';
import { demoAccountingAdapter } from './adapters/demoAccountingAdapter';
import { demoEmailAdapter } from './adapters/demoEmailAdapter';
import { demoFactoringAdapter } from './adapters/demoFactoringAdapter';
import { demoInsuranceAdapter } from './adapters/demoInsuranceAdapter';
import { demoLoadBoardAdapter } from './adapters/demoLoadBoardAdapter';
import { demoMapsAdapter } from './adapters/demoMapsAdapter';
import { demoPaymentAdapter } from './adapters/demoPaymentAdapter';
import { demoRegulatoryAdapter } from './adapters/demoRegulatoryAdapter';
import { demoSmsAdapter } from './adapters/demoSmsAdapter';
import { getProviderById } from './integrationRegistry';

const ADAPTERS_BY_SLUG: Record<string, IntegrationAdapter> = {
  'demo-regulatory': demoRegulatoryAdapter,
  'demo-payment': demoPaymentAdapter,
  'demo-email': demoEmailAdapter,
  'demo-sms': demoSmsAdapter,
  'demo-maps': demoMapsAdapter,
  'demo-loadboard': demoLoadBoardAdapter,
  'demo-factoring': demoFactoringAdapter,
  'demo-insurance': demoInsuranceAdapter,
  'demo-accounting': demoAccountingAdapter,
};

export function resolveAdapterForProvider(providerId: string): IntegrationAdapter | undefined {
  const provider = getProviderById(providerId);
  if (!provider) return undefined;
  return ADAPTERS_BY_SLUG[provider.slug];
}

export function resolveAdapterBySlug(slug: string): IntegrationAdapter | undefined {
  return ADAPTERS_BY_SLUG[slug];
}

export function listRegisteredAdapterSlugs(): string[] {
  return Object.keys(ADAPTERS_BY_SLUG);
}
