import { hasPermission } from '@careerlink/shared';
import type { UserRole } from '@careerlink/shared';
import type { SessionPayload } from '@/backend/auth/session';
import { requireAuth } from '@/backend/data/api';

export async function requirePermission(permission: string): Promise<SessionPayload> {
  const user = await requireAuth();
  // Authorize against the active role only — inactive memberships must not grant access.
  if (user.role === 'admin' || hasPermission(user.role as UserRole, permission)) {
    return user;
  }
  throw new Error('FORBIDDEN');
}

export async function requireAnyRole(...roles: UserRole[]): Promise<SessionPayload> {
  const user = await requireAuth();
  if (user.role === 'admin') return user;
  if (roles.includes(user.role as UserRole)) return user;
  throw new Error('FORBIDDEN');
}
