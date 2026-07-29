import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const KEY_LEN = 64;

export function hashPassword(password: string, salt?: string): string {
  const s = salt ?? randomBytes(16).toString('hex');
  const hash = scryptSync(password, s, KEY_LEN).toString('hex');
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const test = scryptSync(password, salt, KEY_LEN);
    const expected = Buffer.from(hash, 'hex');
    if (test.length !== expected.length) return false;
    return timingSafeEqual(test, expected);
  } catch {
    return false;
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  if (!/[A-Z]/.test(password)) errors.push('يجب أن تحتوي على حرف كبير');
  if (!/[a-z]/.test(password)) errors.push('يجب أن تحتوي على حرف صغير');
  if (!/[0-9]/.test(password)) errors.push('يجب أن تحتوي على رقم');
  if (!/[!@#$%^&*]/.test(password)) errors.push('يجب أن تحتوي على رمز خاص (!@#$%^&*)');
  return { valid: errors.length === 0, errors };
}
