/**
 * Cross-device identity validator — companion outputs must preserve room identity.
 */

export type ConsistencyVerdict = 'PASS' | 'WARN' | 'FAIL';

export type ConsistencyValidationInput = {
  canonicalMasterUrl: string | null;
  companionUrl: string | null;
  outputType: string;
  promptHash: string;
  seed: string;
  theme: string;
};

export type ConsistencyValidationResult = {
  verdict: ConsistencyVerdict;
  consistencyScore: number;
  failureCode: string | null;
  failureMessage: string | null;
};

export const PACKAGE_OUTPUT_IDENTITY_DRIFT = 'PACKAGE_OUTPUT_IDENTITY_DRIFT';

export function validateEnvironmentPackageOutputConsistency(
  input: ConsistencyValidationInput
): ConsistencyValidationResult {
  if (!input.canonicalMasterUrl || !input.companionUrl) {
    return {
      verdict: 'FAIL',
      consistencyScore: 0,
      failureCode: 'PACKAGE_REQUIRED_OUTPUT_MISSING',
      failureMessage: 'Canonical master or companion output missing for consistency check.',
    };
  }

  if (input.canonicalMasterUrl === input.companionUrl) {
    return {
      verdict: 'PASS',
      consistencyScore: 1,
      failureCode: null,
      failureMessage: null,
    };
  }

  try {
    const master = new URL(input.canonicalMasterUrl);
    const companion = new URL(input.companionUrl);
    const sameOrigin = master.origin === companion.origin;
    const samePath = master.pathname === companion.pathname;
    if (sameOrigin && samePath) {
      return { verdict: 'PASS', consistencyScore: 0.95, failureCode: null, failureMessage: null };
    }
    if (!sameOrigin || !samePath) {
      return {
        verdict: 'FAIL',
        consistencyScore: 0.4,
        failureCode: PACKAGE_OUTPUT_IDENTITY_DRIFT,
        failureMessage: `Companion ${input.outputType} drifted from canonical master identity.`,
      };
    }
  } catch {
    return {
      verdict: 'FAIL',
      consistencyScore: 0,
      failureCode: PACKAGE_OUTPUT_IDENTITY_DRIFT,
      failureMessage: `Invalid URL for ${input.outputType} consistency check.`,
    };
  }

  const masterKey = `${input.promptHash}:${input.seed}:${input.theme}`;
  const companionKey = `${input.promptHash}:${input.seed}:${input.theme}:${input.outputType}`;
  const score = masterKey.length > 0 && companionKey.startsWith(masterKey) ? 0.92 : 0.75;

  if (score < 0.8) {
    return {
      verdict: 'FAIL',
      consistencyScore: score,
      failureCode: PACKAGE_OUTPUT_IDENTITY_DRIFT,
      failureMessage: `Companion ${input.outputType} drifted from canonical master identity.`,
    };
  }

  return {
    verdict: score >= 0.9 ? 'PASS' : 'WARN',
    consistencyScore: score,
    failureCode: score >= 0.9 ? null : PACKAGE_OUTPUT_IDENTITY_DRIFT,
    failureMessage: score >= 0.9 ? null : `Companion ${input.outputType} has minor identity variance.`,
  };
}
