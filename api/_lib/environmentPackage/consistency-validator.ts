import {
  PACKAGE_OUTPUT_IDENTITY_DRIFT,
  validateEnvironmentPackageOutputConsistency,
  type ConsistencyValidationResult,
} from '../../../src/studio-os-core/environment-asset-package/EnvironmentPackageConsistencyValidator.js';

export { PACKAGE_OUTPUT_IDENTITY_DRIFT };

export function validatePackageOutputConsistency(input: {
  canonicalMasterUrl: string | null;
  companionUrl: string | null;
  outputType: string;
  promptHash: string;
  seed: string;
  theme: string;
}): ConsistencyValidationResult {
  return validateEnvironmentPackageOutputConsistency(input);
}
