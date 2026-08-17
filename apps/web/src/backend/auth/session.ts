import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserRole } from '@careerlink/shared';

const COOKIE_NAME = 'naqlah_session';
const WEAK_SECRETS = new Set([
  'naqlah-dev-secret-change-in-production-2025',
  'change-me',
  'secret',
]);

function resolveJwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim() || '';
  if (process.env.NODE_ENV === 'production') {
    if (!raw || WEAK_SECRETS.has(raw) || raw.length < 32) {
      throw new Error('JWT_SECRET must be a strong random value (min 32 chars) in production');
    }
  }
  return new TextEncoder().encode(raw || 'naqlah-dev-secret-change-in-production-2025');
}

const SECRET = resolveJwtSecret();

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  roles: UserRole[];
  avatar: string;
  organizationId?: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: '/' });
}

export { COOKIE_NAME };
