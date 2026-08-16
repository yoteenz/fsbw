import type { IntakeAnswers } from './intakeTypes';

/** Get nested value from answers by dot path */
export function getFieldValue(answers: IntakeAnswers, field: string): unknown {
  const parts = field.split('.');
  let current: unknown = answers;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Set nested value on answers (immutable) */
export function setFieldValue(answers: IntakeAnswers, field: string, value: unknown): IntakeAnswers {
  const parts = field.split('.');
  const clone = structuredClone(answers);
  let current: Record<string, unknown> = clone as unknown as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
  return clone;
}

export function validateField(field: string, value: unknown): string | null {
  if (field.includes('trucks') || field.includes('trailers') || field.includes('drivers') || field.includes('powerUnits')) {
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return 'Enter a valid number (0 or greater).';
  }
  if (field === 'contact.email' && typeof value === 'string' && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  }
  if (field.endsWith('.pickupDate') || field.endsWith('.deliveryDate')) {
    // optional date validation handled at section level
  }
  return null;
}

export function validateSectionRequired(
  fields: { field: string; required?: boolean; question: string }[],
  answers: IntakeAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of fields) {
    if (!q.required) continue;
    const val = getFieldValue(answers, q.field);
    const empty =
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0);
    if (empty) {
      errors[q.field] = `Please answer: ${q.question}`;
    }
  }
  return errors;
}

export function parseBoolField(val: unknown): boolean | undefined {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined;
}
