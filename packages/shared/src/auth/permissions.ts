import type { UserRole, Permission } from '../types';

export const PERMISSIONS: Permission[] = [
  { code: 'profile.manage', module: 'profiles', name: 'إدارة الملف الشخصي' },
  { code: 'job.create', module: 'jobs', name: 'نشر وظائف' },
  { code: 'job.apply', module: 'jobs', name: 'التقديم على وظائف' },
  { code: 'application.review', module: 'applications', name: 'مراجعة المتقدمين' },
  { code: 'course.create', module: 'courses', name: 'إنشاء كورسات' },
  { code: 'course.enroll', module: 'courses', name: 'التسجيل بالكورسات' },
  { code: 'mentorship.manage', module: 'mentorship', name: 'إدارة جلسات الإرشاد' },
  { code: 'internship.approve', module: 'internships', name: 'اعتماد التدريب' },
  { code: 'event.manage', module: 'events', name: 'إدارة الفعاليات' },
  { code: 'admin.verify', module: 'admin', name: 'الموافقة على الحسابات' },
  { code: 'admin.users', module: 'admin', name: 'إدارة المستخدمين' },
  { code: 'reports.view', module: 'reports', name: 'عرض التقارير' },
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: ['profile.manage', 'job.apply', 'course.enroll'],
  graduate: ['profile.manage', 'job.apply', 'course.enroll'],
  company: ['profile.manage', 'job.create', 'reports.view'],
  hr: ['profile.manage', 'job.create', 'application.review', 'reports.view'],
  university: ['profile.manage', 'internship.approve', 'event.manage', 'reports.view'],
  trainer: ['profile.manage', 'course.create', 'reports.view'],
  mentor: ['profile.manage', 'mentorship.manage'],
  admin: PERMISSIONS.map((p) => p.code),
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (role === 'admin') return true;
  const rolePrefix = `/dashboard/${role}`;
  if (path.startsWith('/dashboard/admin')) return false;
  if (path.startsWith('/dashboard/') && !path.startsWith(rolePrefix)) {
    const shared = ['/jobs', '/internships', '/courses', '/events', '/messages', '/notifications', '/profile', '/settings', '/search', '/ai'];
    return shared.some((p) => path.startsWith(p));
  }
  return true;
}
