import { hasPermission } from '@careerlink/shared';
import type { UserRole } from '@careerlink/shared';
import type { SessionPayload } from '@/backend/auth/session';
import { requireAuth } from '@/backend/data/api';

export async function requirePermission(permission: string): Promise<SessionPayload> {
  const user = await requireAuth();
  if (user.role === 'admin' || hasPermission(user.role as UserRole, permission)) {
    return user;
  }
  const ok = user.roles?.some((r) => hasPermission(r as UserRole, permission));
  if (!ok) throw new Error('FORBIDDEN');
  return user;
}

export async function requireAnyRole(...roles: UserRole[]): Promise<SessionPayload> {
  const user = await requireAuth();
  if (user.role === 'admin') return user;
  if (roles.includes(user.role as UserRole)) return user;
  if (user.roles?.some((r) => roles.includes(r as UserRole))) return user;
  throw new Error('FORBIDDEN');
}
