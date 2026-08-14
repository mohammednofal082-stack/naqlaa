import type { AuthUser, UserRole } from '../types';

export const DEMO_PASSWORD = 'Naqlah@2025';

/** Auth IDs aligned with mock platform data (user-1, comp-1, …). Supabase uses real UUIDs from seed-demo-users. */
export const authUsers: AuthUser[] = [
  {
    id: 'user-1',
    email: 'student@naqlah.ps',
    passwordHash: '',
    fullName: 'محمد نوفل',
    roles: ['student'],
    status: 'active',
    emailVerified: true,
    phone: '+970599123456',
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%231e3a5f%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EM%3C%2Ftext%3E%3C%2Fsvg%3E',
    organizationId: 'uni-1',
    createdAt: '2024-09-01',
  },
  {
    id: 'user-2',
    email: 'graduate@naqlah.ps',
    passwordHash: '',
    fullName: 'أمير أبو شمس',
    roles: ['graduate'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%230e7490%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EA%3C%2Ftext%3E%3C%2Fsvg%3E',
    organizationId: 'uni-1',
    createdAt: '2023-06-15',
  },
  {
    id: 'user-company-1',
    email: 'company@jawwal.ps',
    passwordHash: '',
    fullName: 'Jawwal - بوابة الشركات',
    roles: ['company'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%232563EB%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EJ%3C%2Ftext%3E%3C%2Fsvg%3E',
    organizationId: 'comp-1',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-3',
    email: 'hr@jawwal.ps',
    passwordHash: '',
    fullName: 'محمد عبدالله - HR',
    roles: ['hr'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%230e7490%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EH%3C%2Ftext%3E%3C%2Fsvg%3E',
    organizationId: 'comp-1',
    createdAt: '2024-02-01',
  },
  {
    id: 'user-university-1',
    email: 'career@birzeit.edu',
    passwordHash: '',
    fullName: 'جامعة النجاح - مركز التوظيف',
    roles: ['university'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%2310B981%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EN%3C%2Ftext%3E%3C%2Fsvg%3E',
    organizationId: 'uni-1',
    createdAt: '2024-01-01',
  },
  {
    id: 'user-trainer-1',
    email: 'trainer@naqlah.ps',
    passwordHash: '',
    fullName: 'د. كريم ناصر',
    roles: ['trainer'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%231e3a5f%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EK%3C%2Ftext%3E%3C%2Fsvg%3E',
    createdAt: '2024-03-01',
  },
  {
    id: 'user-mentor-1',
    email: 'mentor@naqlah.ps',
    passwordHash: '',
    fullName: 'لينا أبو غزالة',
    roles: ['mentor'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%230e7490%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EL%3C%2Ftext%3E%3C%2Fsvg%3E',
    createdAt: '2024-04-01',
  },
  {
    id: 'user-4',
    email: 'admin@naqlah.ps',
    passwordHash: '',
    fullName: 'مدير النظام',
    roles: ['admin'],
    status: 'active',
    emailVerified: true,
    avatar: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22128%22%20height%3D%22128%22%20viewBox%3D%220%200%20128%20128%22%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20rx%3D%2224%22%20fill%3D%22%23334155%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2268%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22Segoe%20UI%2CTahoma%2CArial%2Csans-serif%22%20font-size%3D%2248%22%20font-weight%3D%22700%22%3EA%3C%2Ftext%3E%3C%2Fsvg%3E',
    createdAt: '2024-01-01',
  },
];

export function findAuthUserByEmail(email: string): AuthUser | undefined {
  return authUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findAuthUserById(id: string): AuthUser | undefined {
  return authUsers.find((u) => u.id === id);
}

export function getDemoCredentials(): { role: UserRole; email: string; name: string }[] {
  return authUsers.map((u) => ({
    role: u.roles[0],
    email: u.email,
    name: u.fullName,
  }));
}
