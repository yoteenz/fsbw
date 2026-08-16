/** Production environment template — placeholders only, no secrets */

export const INTEGRATION_ENV_TEMPLATE = {
  AIO_INTEGRATION_ENV: 'DEMO | SANDBOX | PRODUCTION',
  AIO_PAYMENT_PROVIDER: '(unset — demo only in debug)',
  AIO_PAYMENT_WEBHOOK_SECRET: '(server-side only)',
  AIO_EMAIL_PROVIDER: '(unset — demo only in debug)',
  AIO_SMS_PROVIDER: '(unset — demo only in debug)',
  AIO_REGULATORY_PROVIDER: '(unset — demo adapter only until FMCSA verified)',
  AIO_MAPS_PROVIDER: '(unset)',
  AIO_LOADBOARD_PROVIDER: '(unset)',
  AIO_FACTORING_PROVIDER: '(unset)',
  AIO_INSURANCE_PARTNER: '(unset)',
  AIO_ACCOUNTING_PROVIDER: '(unset)',
  AIO_SECRET_PROVIDER: 'env | platform_vault',
} as const;

export interface IntegrationConfigValidation {
  ok: boolean;
  warnings: string[];
  errors: string[];
}

export function validateIntegrationConfig(env: Record<string, string | undefined>): IntegrationConfigValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  const integrationEnv = env.AIO_INTEGRATION_ENV ?? 'DEMO';
  if (integrationEnv === 'PRODUCTION') {
    if (!env.AIO_PAYMENT_PROVIDER) warnings.push('Production payment provider not configured — payments disabled');
    if (!env.AIO_EMAIL_PROVIDER) warnings.push('Production email provider not configured — email disabled');
  }

  if (env.AIO_INTEGRATION_ENV === 'PRODUCTION' && env.AIO_REGULATORY_PROVIDER === 'fmcsa-public') {
    errors.push('FMCSA live provider selected but API access not verified for this environment');
  }

  return { ok: errors.length === 0, warnings, errors };
}

export function isSandboxIsolationOk(connectionEnv: string, configEnv: string): boolean {
  if (connectionEnv === 'PRODUCTION' && configEnv !== 'PRODUCTION') return false;
  if (connectionEnv === 'SANDBOX' && configEnv === 'PRODUCTION') return false;
  return true;
}
