import type { AuthUser, UserRole } from '../types';

export const DEMO_PASSWORD = 'Naqlah@2025';

export const authUsers: AuthUser[] = [
  {
    id: 'auth-student-1',
    email: 'student@naqlah.ps',
    passwordHash: '',
    fullName: 'محمد نوفل',
    roles: ['student'],
    status: 'active',
    emailVerified: true,
    phone: '+970599123456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MohammadNofal',
    organizationId: 'uni-birzeit',
    createdAt: '2024-09-01',
  },
  {
    id: 'auth-graduate-1',
    email: 'graduate@naqlah.ps',
    passwordHash: '',
    fullName: 'سارة خليل حمدان',
    roles: ['graduate'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    organizationId: 'uni-birzeit',
    createdAt: '2023-06-15',
  },
  {
    id: 'auth-company-1',
    email: 'company@jawwal.ps',
    passwordHash: '',
    fullName: 'Jawwal - بوابة الشركات',
    roles: ['company'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JW&backgroundColor=2563EB',
    organizationId: 'comp-jawwal',
    createdAt: '2024-01-15',
  },
  {
    id: 'auth-hr-1',
    email: 'hr@jawwal.ps',
    passwordHash: '',
    fullName: 'محمد عبدالله - HR',
    roles: ['hr'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
    organizationId: 'comp-jawwal',
    createdAt: '2024-02-01',
  },
  {
    id: 'auth-university-1',
    email: 'career@birzeit.edu',
    passwordHash: '',
    fullName: 'جامعة بيرزيت - مركز التوظيف',
    roles: ['university'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BZ&backgroundColor=10B981',
    organizationId: 'uni-birzeit',
    createdAt: '2024-01-01',
  },
  {
    id: 'auth-trainer-1',
    email: 'trainer@naqlah.ps',
    passwordHash: '',
    fullName: 'د. كريم ناصر',
    roles: ['trainer'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
    createdAt: '2024-03-01',
  },
  {
    id: 'auth-mentor-1',
    email: 'mentor@naqlah.ps',
    passwordHash: '',
    fullName: 'لينا أبو غزالة',
    roles: ['mentor'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lina',
    createdAt: '2024-04-01',
  },
  {
    id: 'auth-admin-1',
    email: 'admin@naqlah.ps',
    passwordHash: '',
    fullName: 'مدير النظام',
    roles: ['admin'],
    status: 'active',
    emailVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
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
