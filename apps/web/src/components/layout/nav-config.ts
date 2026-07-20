import type { UserRole } from "@careerlink/shared";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  Search,
  Bookmark,
  Settings,
  LogOut,
  GraduationCap,
  Users,
  Compass,
  Route,
  LayoutGrid,
  ClipboardList,
  MoreHorizontal,
  Building2,
  Calendar,
  FolderKanban,
  BookOpen,
  FileText,
  Target,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export type TFn = (ar: string, en: string) => string;

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel?: string;
  action?: "menu";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export function usesFluidShell(role: UserRole): boolean {
  return role === "student" || role === "graduate";
}

export const usesLinkedInShell = usesFluidShell;

function buildRoleNavGroups(t: TFn): Record<UserRole, NavGroup[]> {
  const sharedAccount: NavItem[] = [
    { href: "/messages", label: t("الرسائل", "Messages"), icon: MessageSquare },
    { href: "/notifications", label: t("الإشعارات", "Notifications"), icon: Bell },
    { href: "/settings", label: t("الإعدادات", "Settings"), icon: Settings },
  ];

  return {
    student: [
      {
        label: t("الرئيسية", "Home"),
        items: [
          { href: "/feed", label: t("المنصة", "Feed"), icon: LayoutGrid },
          { href: "/dashboard/student", label: t("لوحة التحكم", "Dashboard"), icon: LayoutDashboard },
        ],
      },
      {
        label: t("الفرص والبحث", "Opportunities & Search"),
        items: [
          { href: "/jobs", label: t("الوظائف", "Jobs"), icon: Briefcase },
          { href: "/internships", label: t("التدريب", "Internships"), icon: GraduationCap },
          { href: "/applications", label: t("طلباتي", "My Applications"), icon: ClipboardList },
          { href: "/saved", label: t("المحفوظات", "Saved"), icon: Bookmark },
          { href: "/search", label: t("بحث متقدم", "Advanced Search"), icon: Search },
          { href: "/companies", label: t("الشركات", "Companies"), icon: Building2 },
          { href: "/market", label: t("تحليل سوق العمل", "Job Market Analysis"), icon: BarChart3 },
        ],
      },
      {
        label: t("التطوير المهني", "Career Development"),
        items: [
          { href: "/journey", label: t("رحلتي المهنية", "My Career Journey"), icon: Route },
          { href: "/ai", label: t("الأدوات المهنية", "Career Tools"), icon: Compass },
          { href: "/ai/skill-gap", label: t("فجوة المهارات", "Skill Gap"), icon: Target },
          { href: "/ai/recommendations", label: t("التوصيات المخصّصة", "Recommendations"), icon: Lightbulb },
          { href: "/ai/cv-analyzer", label: t("تحليل السيرة", "CV Analysis"), icon: FileText },
          { href: "/ai/career-path", label: t("خارطة المسار", "Career Path"), icon: Route },
          { href: "/ai/interview", label: t("محاكاة المقابلة", "Interview Simulation"), icon: MessageSquare },
          { href: "/mentorship", label: t("الإرشاد المهني", "Mentorship"), icon: Users },
          { href: "/courses", label: t("الكورسات", "Courses"), icon: BookOpen },
          { href: "/projects", label: t("المشاريع", "Projects"), icon: FolderKanban },
        ],
      },
      {
        label: t("المجتمع", "Community"),
        items: [
          { href: "/community", label: t("المجتمع", "Community"), icon: Users },
          { href: "/events", label: t("الفعاليات", "Events"), icon: Calendar },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [
          { href: "/profile", label: t("ملفي الشخصي", "My Profile"), icon: User },
          ...sharedAccount,
        ],
      },
    ],
    graduate: [
      {
        label: t("الرئيسية", "Home"),
        items: [
          { href: "/feed", label: t("المنصة", "Feed"), icon: LayoutGrid },
          { href: "/dashboard/graduate", label: t("لوحة التحكم", "Dashboard"), icon: LayoutDashboard },
        ],
      },
      {
        label: t("الفرص والبحث", "Opportunities & Search"),
        items: [
          { href: "/jobs", label: t("الوظائف", "Jobs"), icon: Briefcase },
          { href: "/applications", label: t("طلباتي", "My Applications"), icon: ClipboardList },
          { href: "/saved", label: t("المحفوظات", "Saved"), icon: Bookmark },
          { href: "/search", label: t("بحث متقدم", "Advanced Search"), icon: Search },
          { href: "/companies", label: t("الشركات", "Companies"), icon: Building2 },
          { href: "/market", label: t("تحليل سوق العمل", "Job Market Analysis"), icon: BarChart3 },
        ],
      },
      {
        label: t("التطوير المهني", "Career Development"),
        items: [
          { href: "/journey", label: t("رحلتي المهنية", "My Career Journey"), icon: Route },
          { href: "/ai", label: t("الأدوات المهنية", "Career Tools"), icon: Compass },
          { href: "/ai/skill-gap", label: t("فجوة المهارات", "Skill Gap"), icon: Target },
          { href: "/ai/recommendations", label: t("التوصيات المخصّصة", "Recommendations"), icon: Lightbulb },
          { href: "/ai/cv-analyzer", label: t("تحليل السيرة", "CV Analysis"), icon: FileText },
          { href: "/ai/career-path", label: t("خارطة المسار", "Career Path"), icon: Route },
          { href: "/mentorship", label: t("الإرشاد المهني", "Mentorship"), icon: Users },
          { href: "/courses", label: t("الكورسات", "Courses"), icon: BookOpen },
          { href: "/community", label: t("المجتمع", "Community"), icon: Users },
          { href: "/events", label: t("الفعاليات", "Events"), icon: Calendar },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [
          { href: "/profile", label: t("ملفي الشخصي", "My Profile"), icon: User },
          ...sharedAccount,
        ],
      },
    ],
    company: [
      {
        label: t("الشركة", "Company"),
        items: [
          { href: "/feed", label: t("المنصة", "Feed"), icon: LayoutGrid },
          { href: "/dashboard/company", label: t("نظرة عامة", "Overview"), icon: LayoutDashboard },
          { href: "/dashboard/company/profile", label: t("ملف الشركة", "Company Profile"), icon: Building2 },
        ],
      },
      {
        label: t("التوظيف", "Hiring"),
        items: [
          { href: "/dashboard/company/jobs", label: t("الوظائف", "Jobs"), icon: Briefcase },
          { href: "/dashboard/company/applications", label: t("المتقدمين", "Applicants"), icon: Users },
          { href: "/dashboard/company/interviews", label: t("المقابلات", "Interviews"), icon: Calendar },
          { href: "/dashboard/company/talent-pools", label: t("مجموعات المواهب", "Talent Pools"), icon: FolderKanban },
        ],
      },
      {
        label: t("الشراكات والتقارير", "Partnerships & Reports"),
        items: [
          { href: "/dashboard/company/partnerships", label: t("الشراكات", "Partnerships"), icon: Users },
          { href: "/dashboard/company/reports", label: t("التقارير", "Reports"), icon: ClipboardList },
          { href: "/market", label: t("تحليل سوق العمل", "Job Market Analysis"), icon: BarChart3 },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
    hr: [
      {
        label: t("الموارد البشرية", "Human Resources"),
        items: [
          { href: "/dashboard/hr", label: t("لوحة HR", "HR Dashboard"), icon: LayoutDashboard },
          { href: "/dashboard/hr/pipeline", label: t("قمع التوظيف", "Hiring Pipeline"), icon: Briefcase },
          { href: "/dashboard/hr/candidates", label: t("المرشحين", "Candidates"), icon: Users },
          { href: "/dashboard/hr/interviews", label: t("المقابلات", "Interviews"), icon: Calendar },
          { href: "/dashboard/hr/assessments", label: t("التقييمات", "Assessments"), icon: ClipboardList },
          { href: "/market", label: t("تحليل سوق العمل", "Job Market Analysis"), icon: BarChart3 },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
    university: [
      {
        label: t("الجامعة", "University"),
        items: [
          { href: "/dashboard/university", label: t("لوحة الجامعة", "University Dashboard"), icon: LayoutDashboard },
          { href: "/dashboard/university/students", label: t("الطلاب", "Students"), icon: Users },
          { href: "/dashboard/university/departments", label: t("الأقسام", "Departments"), icon: Building2 },
          { href: "/dashboard/university/internships", label: t("التدريب", "Internships"), icon: GraduationCap },
          { href: "/dashboard/university/events", label: t("الفعاليات", "Events"), icon: Calendar },
          { href: "/dashboard/university/partnerships", label: t("الشراكات", "Partnerships"), icon: Briefcase },
          { href: "/dashboard/university/reports", label: t("التقارير", "Reports"), icon: ClipboardList },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
    trainer: [
      {
        label: t("التدريب", "Training"),
        items: [
          { href: "/dashboard/trainer", label: t("لوحة المدرب", "Trainer Dashboard"), icon: LayoutDashboard },
          { href: "/dashboard/trainer/courses", label: t("الكورسات", "Courses"), icon: BookOpen },
          { href: "/dashboard/trainer/lessons", label: t("الدروس", "Lessons"), icon: FileText },
          { href: "/dashboard/trainer/quizzes", label: t("الاختبارات", "Quizzes"), icon: ClipboardList },
          { href: "/dashboard/trainer/students", label: t("الطلاب", "Students"), icon: Users },
          { href: "/dashboard/trainer/sessions", label: t("الجلسات", "Sessions"), icon: Calendar },
          { href: "/dashboard/trainer/certificates", label: t("الشهادات", "Certificates"), icon: GraduationCap },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
    mentor: [
      {
        label: t("الإرشاد", "Mentorship"),
        items: [
          { href: "/dashboard/mentor", label: t("لوحة المرشد", "Mentor Dashboard"), icon: LayoutDashboard },
          { href: "/dashboard/mentor/requests", label: t("طلبات الإرشاد", "Mentorship Requests"), icon: ClipboardList },
          { href: "/dashboard/mentor/sessions", label: t("الجلسات", "Sessions"), icon: Calendar },
          { href: "/dashboard/mentor/availability", label: t("المواعيد", "Availability"), icon: Bell },
          { href: "/dashboard/mentor/reviews", label: t("التقييمات", "Reviews"), icon: Users },
          { href: "/dashboard/mentor/notes", label: t("الملاحظات", "Notes"), icon: FileText },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
    admin: [
      {
        label: t("الإدارة", "Administration"),
        items: [
          { href: "/dashboard/admin", label: t("لوحة الإدارة", "Admin Dashboard"), icon: LayoutDashboard },
          { href: "/dashboard/admin/users", label: t("المستخدمين", "Users"), icon: Users },
          { href: "/dashboard/admin/companies", label: t("الشركات", "Companies"), icon: Building2 },
          { href: "/dashboard/admin/moderation", label: t("الإشراف", "Moderation"), icon: Settings },
          { href: "/dashboard/admin/verification", label: t("التحقق", "Verification"), icon: ClipboardList },
          { href: "/dashboard/admin/skills", label: t("المهارات", "Skills"), icon: Target },
          { href: "/dashboard/admin/reports", label: t("التقارير", "Reports"), icon: FileText },
          { href: "/market", label: t("تحليل سوق العمل", "Job Market Analysis"), icon: BarChart3 },
          { href: "/dashboard/admin/security", label: t("الأمان", "Security"), icon: Bell },
          { href: "/dashboard/admin/logs", label: t("السجلات", "Logs"), icon: ClipboardList },
        ],
      },
      {
        label: t("حسابي", "My Account"),
        items: [...sharedAccount],
      },
    ],
  };
}

export function getNavForRole(role: UserRole, t: TFn): NavGroup[] {
  const groups = buildRoleNavGroups(t);
  return [...(groups[role] || groups.student)];
}

export function getMobileNavForRole(role: UserRole, t: TFn): NavItem[] {
  if (usesFluidShell(role)) {
    return [
      { href: "/feed", label: t("المنصة", "Feed"), icon: LayoutGrid },
      { href: "/jobs", label: t("الفرص", "Jobs"), icon: Briefcase },
      { href: "/ai", label: t("أدواتي", "Tools"), icon: Compass },
      { href: "/messages", label: t("رسائل", "Chat"), icon: MessageSquare },
      { href: "#menu", label: t("المزيد", "More"), icon: MoreHorizontal, action: "menu" },
    ];
  }
  const dash = `/dashboard/${role}`;
  return [
    { href: dash, label: t("لوحتي", "Dashboard"), icon: LayoutDashboard },
    { href: "/messages", label: t("رسائل", "Chat"), icon: MessageSquare },
    { href: "/notifications", label: t("تنبيهات", "Alerts"), icon: Bell },
    { href: "/profile", label: t("ملفي", "Profile"), icon: User },
    { href: "#menu", label: t("المزيد", "More"), icon: MoreHorizontal, action: "menu" },
  ];
}

export function getTopNavForRole(role: UserRole, t: TFn): NavItem[] {
  const groups = getNavForRole(role, t);
  return groups.flatMap((g) => g.items).slice(0, 6);
}

export { LogOut, MoreHorizontal };
