/** Financial data provider adapter architecture — Refinement 04A */

import type { FinancialAccount, FinancialConnection, BookkeepingTransaction } from './autopilotTypes';

export type FinancialProviderEnvironment = 'NOT_CONFIGURED' | 'SANDBOX' | 'PRODUCTION_PENDING' | 'CONNECTED' | 'DEGRADED' | 'DISABLED';

export interface FinancialDataProvider {
  id: string;
  label: string;
  environment: FinancialProviderEnvironment;
  syncTransactions(connectionId: string, cursor?: string): Promise<{ added: BookkeepingTransaction[]; modified: BookkeepingTransaction[]; removed: string[]; cursor?: string }>;
  getConnectionHealth(connectionId: string): Promise<{ status: FinancialConnection['status']; lastSync?: string; errorCode?: string }>;
}

export interface AccountingPlatformProvider {
  id: string;
  label: string;
  environment: FinancialProviderEnvironment;
  /** Supported API sync only — no browser automation */
  pushJournalEntry?(): Promise<{ ok: boolean; reason?: string }>;
}

export function getFinancialProviderEnvironment(): FinancialProviderEnvironment {
  if (import.meta.env.VITE_PLAID_ENABLED === 'true') return 'SANDBOX';
  return 'NOT_CONFIGURED';
}

/** Demo provider — deterministic fictional feeds, no network calls */
export class DemoFinancialDataProvider implements FinancialDataProvider {
  id = 'demo';
  label = 'Demo Financial Feed';
  environment: FinancialProviderEnvironment = 'CONNECTED';

  async syncTransactions(_connectionId: string): Promise<{ added: BookkeepingTransaction[]; modified: BookkeepingTransaction[]; removed: string[] }> {
    return { added: [], modified: [], removed: [] };
  }

  async getConnectionHealth(_connectionId: string) {
    return { status: 'CONNECTED' as const, lastSync: new Date().toISOString() };
  }
}

/** Plaid stub — no silent external calls without credentials */
export class PlaidFinancialDataProvider implements FinancialDataProvider {
  id = 'plaid';
  label = 'Plaid Transactions';
  environment: FinancialProviderEnvironment;

  constructor() {
    this.environment = getFinancialProviderEnvironment();
  }

  async syncTransactions(): Promise<{ added: BookkeepingTransaction[]; modified: BookkeepingTransaction[]; removed: string[] }> {
    if (this.environment === 'NOT_CONFIGURED') {
      throw new Error('INTEGRATION NOT CONFIGURED — use DemoFinancialDataProvider');
    }
    return { added: [], modified: [], removed: [] };
  }

  async getConnectionHealth() {
    return { status: 'DISCONNECTED' as const, errorCode: 'NOT_CONFIGURED' };
  }
}

export class DemoAccountingPlatformProvider implements AccountingPlatformProvider {
  id = 'demo-accounting';
  label = 'Demo Accounting Platform';
  environment: FinancialProviderEnvironment = 'CONNECTED';
}

export function resolveFinancialDataProvider(preferred: 'demo' | 'plaid' = 'demo'): FinancialDataProvider {
  if (preferred === 'plaid' && getFinancialProviderEnvironment() !== 'NOT_CONFIGURED') {
    return new PlaidFinancialDataProvider();
  }
  return new DemoFinancialDataProvider();
}

export type { FinancialConnection, FinancialAccount };
