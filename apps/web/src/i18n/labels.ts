import type { UserRole } from "@careerlink/shared";

type TFn = (ar: string, en: string) => string;

function pick(
  map: Record<string, [string, string]>,
  key: string | undefined | null,
  t: TFn
): string {
  if (key == null) return "";
  const pair = map[key];
  return pair ? t(pair[0], pair[1]) : String(key);
}

const APPLICATION_STATUS: Record<string, [string, string]> = {
  applied: ["تم التقديم", "Applied"],
  under_review: ["قيد المراجعة", "Under Review"],
  shortlisted: ["قائمة مختصرة", "Shortlisted"],
  interview_scheduled: ["مقابلة مجدولة", "Interview Scheduled"],
  assessment_required: ["اختبار مطلوب", "Assessment Required"],
  accepted: ["مقبول", "Accepted"],
  rejected: ["مرفوض", "Rejected"],
  withdrawn: ["منسحب", "Withdrawn"],
};

const INTERNSHIP_STATUS: Record<string, [string, string]> = {
  requested: ["مطلوب", "Requested"],
  university_approved: ["موافقة الجامعة", "University Approved"],
  company_accepted: ["قبول الشركة", "Company Accepted"],
  in_progress: ["قيد التنفيذ", "In Progress"],
  reports_pending: ["تقارير معلقة", "Reports Pending"],
  completed: ["مكتمل", "Completed"],
  failed: ["فاشل", "Failed"],
  cancelled: ["ملغي", "Cancelled"],
};

const SESSION_STATUS: Record<string, [string, string]> = {
  requested: ["مطلوب", "Requested"],
  accepted: ["مقبول", "Accepted"],
  rejected: ["مرفوض", "Rejected"],
  completed: ["مكتمل", "Completed"],
  cancelled: ["ملغي", "Cancelled"],
  no_show: ["لم يحضر", "No Show"],
};

const WORK_TYPE: Record<string, [string, string]> = {
  remote: ["عن بُعد", "Remote"],
  hybrid: ["هجين", "Hybrid"],
  "on-site": ["في المكتب", "On-site"],
};

const EXPERIENCE_LEVEL: Record<string, [string, string]> = {
  student: ["طالب", "Student"],
  "fresh-graduate": ["خريج جديد", "Fresh Graduate"],
  junior: ["مبتدئ", "Junior"],
  "mid-level": ["متوسط", "Mid-level"],
  senior: ["خبير", "Senior"],
};

export function applicationStatusLabel(status: string | undefined | null, t: TFn): string {
  return pick(APPLICATION_STATUS, status, t);
}

export function internshipStatusLabel(status: string | undefined | null, t: TFn): string {
  return pick(INTERNSHIP_STATUS, status, t);
}

export function sessionStatusLabel(status: string | undefined | null, t: TFn): string {
  return pick(SESSION_STATUS, status, t);
}

export function workTypeLabel(value: string | undefined | null, t: TFn): string {
  return pick(WORK_TYPE, value, t);
}

export function experienceLabel(value: string | undefined | null, t: TFn): string {
  return pick(EXPERIENCE_LEVEL, value, t);
}

export function roleLabel(role: UserRole, t: TFn): string {
  switch (role) {
    case "student":
      return t("طالب", "Student");
    case "graduate":
      return t("خريج", "Graduate");
    case "company":
      return t("شركة", "Company");
    case "hr":
      return t("موارد بشرية", "HR");
    case "university":
      return t("جامعة", "University");
    case "trainer":
      return t("مدرب", "Trainer");
    case "mentor":
      return t("مرشد مهني", "Mentor");
    case "admin":
      return t("مدير النظام", "Admin");
    default:
      return String(role);
  }
}
