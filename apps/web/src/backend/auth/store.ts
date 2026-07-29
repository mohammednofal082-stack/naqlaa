import {
  authUsers,
  findAuthUserByEmail,
  findAuthUserById,
  DEMO_PASSWORD,
  type AuthUser,
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

export function getAllUsers(): Omit<AuthUser, 'passwordHash'>[] {
  initStore();
  return Array.from(userStore.values()).map(({ passwordHash: _, ...u }) => u);
}

export function authenticateUser(
  email: string,
  password: string
): (Omit<AuthUser, 'passwordHash'> & { role: AuthUser['roles'][0] }) | null {
  initStore();
  const user = findAuthUserByEmail(email);
  if (!user) return null;
  const stored = userStore.get(user.id);
  if (!stored) return null;
  if (stored.status !== 'active') return null;
  if (!verifyPassword(password, stored.passwordHash)) return null;
  const { passwordHash: _, ...safe } = stored;
  return { ...safe, role: stored.roles[0] };
}

export function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  role: AuthUser['roles'][0];
  organizationId?: string;
}): { user?: Omit<AuthUser, 'passwordHash'>; error?: string } {
  initStore();
  if (findAuthUserByEmail(data.email)) {
    return { error: 'البريد الإلكتروني مستخدم مسبقاً' };
  }
  const id = `auth-${data.role}-${Date.now()}`;
  const newUser: AuthUser & { passwordHash: string } = {
    id,
    email: data.email.toLowerCase(),
    passwordHash: hashPassword(data.password),
    fullName: data.fullName,
    roles: [data.role],
    status: data.role === 'student' ? 'active' : 'pending',
    emailVerified: false,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
    organizationId: data.organizationId,
    createdAt: new Date().toISOString().split('T')[0],
  };
  userStore.set(id, newUser);
  authUsers.push(newUser);
  const { passwordHash: _, ...user } = newUser;
  return { user };
}

export function getUserById(id: string): Omit<AuthUser, 'passwordHash'> | null {
  initStore();
  const user = userStore.get(id) || findAuthUserById(id);
  if (!user) return null;
  const stored = userStore.get(user.id);
  if (!stored) return user;
  const { passwordHash: _, ...safe } = stored;
  return safe;
}
