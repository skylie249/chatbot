const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}

export function isNonEmptyString(value, maxLength = 2000) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isOptionalString(value, maxLength = 2000) {
  return value === undefined || value === null || (typeof value === 'string' && value.length <= maxLength);
}
