import { Transform } from 'class-transformer';

/**
 * Converts empty strings or whitespace-only strings to undefined.
 * Checks the raw object to bypass enableImplicitConversion transforming "" into Invalid Date.
 */
export const SanitizeEmpty = () => Transform(({ value, key, obj }) => {
  const rawValue = obj[key];

  if (rawValue === '' || rawValue === null || (typeof rawValue === 'string' && rawValue.trim() === '')) {
    return undefined;
  }

  return value;
});