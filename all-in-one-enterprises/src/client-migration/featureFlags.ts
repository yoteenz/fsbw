function readEnvFlag(key: string, defaultOn: boolean): boolean {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === '') return defaultOn;
  if (raw === '0' || raw === 'false') return false;
  return true;
}

/** Staff migration intake + extraction review (pilot). */
export function isClientMigrationV1Enabled(): boolean {
  return readEnvFlag('VITE_AIO_CLIENT_MIGRATION_V1', true);
}

/** Existing-client activation invite + review flow (pilot). */
export function isExistingClientActivationV1Enabled(): boolean {
  return readEnvFlag('VITE_AIO_EXISTING_CLIENT_ACTIVATION_V1', true);
}
