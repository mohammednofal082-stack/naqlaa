import {
  authUsers,
  findAuthUserByEmail,
  findAuthUserById,
  DEMO_PASSWORD,
  initialsAvatar,
  type AuthUser,
  type UserRole,
  type UserStatus,
} from '@careerlink/shared';
import { hashPassword, verifyPassword } from './password';

const userStore: Map<string, AuthUser & { passwordHash: string }> = new Map();

function initStore() {
  if (userStore.size > 0) return;
  for (const user of authUsers) {
    const passwordHash = user.passwordHash || hashPassword(DEMO_PASSWORD, user.id);
    userStore.set(user.id, { ...user, passwordHash });
  }
}

function toSafe(user: AuthUser & { passwordHash: string }): Omit<AuthUser, 'passwordHash'> {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function getAllUsers(): Omit<AuthUser, 'passwordHash'>[] {
  initStore();
  return Array.from(userStore.values()).map(toSafe);
}

export type AuthAttempt =
  | { ok: true; user: Omit<AuthUser, 'passwordHash'> & { role: UserRole } }
  | { ok: false; reason: 'invalid' | 'pending' | 'suspended' };

export function authenticateUser(email: string, password: string): AuthAttempt {
  initStore();
  const normalized = email.toLowerCase();
  const fromShared = findAuthUserByEmail(normalized);
  const fromStore = Array.from(userStore.values()).find((u) => u.email.toLowerCase() === normalized);
  const stored = fromStore || (fromShared ? userStore.get(fromShared.id) : undefined);
  if (!stored) return { ok: false, reason: 'invalid' };
  if (!verifyPassword(password, stored.passwordHash)) return { ok: false, reason: 'invalid' };
  if (stored.status === 'pending') return { ok: false, reason: 'pending' };
  if (stored.status !== 'active') return { ok: false, reason: 'suspended' };
  return { ok: true, user: { ...toSafe(stored), role: stored.roles[0] } };
}

export function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organizationId?: string;
  universityName?: string;
  companyName?: string;
  status?: UserStatus;
  permissions?: string[];
}): { user?: Omit<AuthUser, 'passwordHash'>; error?: string } {
  initStore();
  if (
    findAuthUserByEmail(data.email) ||
    Array.from(userStore.values()).some((u) => u.email.toLowerCase() === data.email.toLowerCase())
  ) {
    return { error: 'البريد الإلكتروني مستخدم مسبقاً' };
  }
  const needsApproval = data.role === 'company' || data.role === 'university';
  const id = `auth-${data.role}-${Date.now()}`;
  const organizationId =
    data.organizationId || (data.role === 'company' ? `comp-${Date.now()}` : undefined);

  const newUser: AuthUser & { passwordHash: string } = {
    id,
    email: data.email.toLowerCase(),
    passwordHash: hashPassword(data.password),
    fullName: data.fullName,
    roles: [data.role],
    status: data.status ?? (needsApproval ? 'pending' : 'active'),
    emailVerified: true,
    avatar: initialsAvatar(data.fullName),
    organizationId,
    universityName: data.universityName,
    companyName: data.companyName,
    permissions: data.permissions,
    createdAt: new Date().toISOString().split('T')[0],
  };
  userStore.set(id, newUser);
  authUsers.push(newUser);
  return { user: toSafe(newUser) };
}

export function getUserById(id: string): Omit<AuthUser, 'passwordHash'> | null {
  initStore();
  const user = userStore.get(id) || findAuthUserById(id);
  if (!user) return null;
  const stored = userStore.get(user.id);
  if (!stored) return user;
  return toSafe(stored);
}

export function getPendingPartnerships(): Omit<AuthUser, 'passwordHash'>[] {
  initStore();
  return Array.from(userStore.values())
    .filter((u) => u.status === 'pending' && (u.roles.includes('company') || u.roles.includes('university')))
    .map(toSafe)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function setUserStatus(
  userId: string,
  status: UserStatus,
): Omit<AuthUser, 'passwordHash'> | null {
  initStore();
  const stored = userStore.get(userId);
  if (!stored) return null;
  stored.status = status;
  const shared = authUsers.find((u) => u.id === userId);
  if (shared) shared.status = status;
  return toSafe(stored);
}

export function getHrAccountsForCompany(organizationId: string): Omit<AuthUser, 'passwordHash'>[] {
  initStore();
  return Array.from(userStore.values())
    .filter((u) => u.roles.includes('hr') && u.organizationId === organizationId)
    .map(toSafe);
}

export function updateHrPermissions(
  userId: string,
  permissions: string[],
): Omit<AuthUser, 'passwordHash'> | null {
  initStore();
  const stored = userStore.get(userId);
  if (!stored || !stored.roles.includes('hr')) return null;
  stored.permissions = permissions;
  const shared = authUsers.find((u) => u.id === userId);
  if (shared) shared.permissions = permissions;
  return toSafe(stored);
}

export function suspendUser(userId: string): Omit<AuthUser, 'passwordHash'> | null {
  return setUserStatus(userId, 'suspended');
}
