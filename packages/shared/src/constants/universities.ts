export interface PalestinianUniversity {
  id: string;
  /** English display name (no Arabic). */
  name: string;
  city: string;
  /** Email host without `.stu` — university name slug, without the word "university". */
  emailDomain: string;
}

export const OTHER_UNIVERSITY_ID = 'uni-other';

/** All recognized Palestinian universities for student/graduate registration. */
export const PALESTINIAN_UNIVERSITIES: PalestinianUniversity[] = [
  { id: 'uni-birzeit', name: 'Birzeit University', city: 'Birzeit', emailDomain: 'birzeit' },
  { id: 'uni-najah', name: 'An-Najah National University', city: 'Nablus', emailDomain: 'an-najah' },
  { id: 'uni-alquds', name: 'Al-Quds University', city: 'Jerusalem', emailDomain: 'al-quds' },
  { id: 'uni-alquds-open', name: 'Al-Quds Open University', city: 'Ramallah', emailDomain: 'al-quds-open' },
  { id: 'uni-ppu', name: 'Palestine Polytechnic University', city: 'Hebron', emailDomain: 'palestine-polytechnic' },
  { id: 'uni-aaup', name: 'Arab American University', city: 'Jenin', emailDomain: 'arab-american' },
  { id: 'uni-hebron', name: 'Hebron University', city: 'Hebron', emailDomain: 'hebron' },
  { id: 'uni-bethlehem', name: 'Bethlehem University', city: 'Bethlehem', emailDomain: 'bethlehem' },
  { id: 'uni-iug', name: 'Islamic University of Gaza', city: 'Gaza', emailDomain: 'islamic-gaza' },
  { id: 'uni-alazhar-gaza', name: 'Al-Azhar University - Gaza', city: 'Gaza', emailDomain: 'al-azhar-gaza' },
  { id: 'uni-alaqsa', name: 'Al-Aqsa University', city: 'Gaza', emailDomain: 'al-aqsa' },
  { id: 'uni-kadoorie', name: 'Palestine Technical University - Kadoorie', city: 'Tulkarm', emailDomain: 'kadoorie' },
  { id: 'uni-palestine', name: 'University of Palestine', city: 'Gaza', emailDomain: 'palestine' },
  { id: 'uni-istiqlal', name: 'Al-Istiqlal University', city: 'Jericho', emailDomain: 'al-istiqlal' },
  { id: 'uni-ahliya', name: 'Palestine Ahliya University', city: 'Bethlehem', emailDomain: 'palestine-ahliya' },
  { id: 'uni-dar-alkalima', name: 'Dar Al-Kalima University', city: 'Bethlehem', emailDomain: 'dar-al-kalima' },
  { id: 'uni-israa', name: 'Israa University', city: 'Gaza', emailDomain: 'israa' },
  { id: 'uni-gaza', name: 'Gaza University', city: 'Gaza', emailDomain: 'gaza' },
  { id: 'uni-ummah', name: 'University of the Holy Quran and Islamic Sciences', city: 'Gaza', emailDomain: 'ummah' },
  { id: 'uni-palestine-tech-gaza', name: 'University College of Applied Sciences', city: 'Gaza', emailDomain: 'ucas' },
];

/** Strip "university" / "college" words and slugify for `.stu` email hosts. */
export function slugifyUniversityEmailDomain(englishName: string): string {
  const cleaned = englishName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(university|universities|college|of|the|and|national|technical)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned || 'other';
}

export function getUniversityById(id: string): PalestinianUniversity | undefined {
  return PALESTINIAN_UNIVERSITIES.find((u) => u.id === id);
}

export function resolveUniversityEmailDomain(
  universityId: string,
  customName?: string,
): string {
  if (universityId === OTHER_UNIVERSITY_ID) {
    return slugifyUniversityEmailDomain(customName || 'other');
  }
  return getUniversityById(universityId)?.emailDomain ?? slugifyUniversityEmailDomain(customName || universityId);
}

export function buildStuEmail(localPart: string, emailDomain: string): string {
  const local = localPart.trim().toLowerCase().replace(/@.*$/, '');
  const domain = emailDomain.trim().toLowerCase().replace(/\.stu$/i, '');
  return `${local}@${domain}.stu`;
}

export function isValidStuEmailForDomain(email: string, emailDomain: string): boolean {
  const domain = emailDomain.trim().toLowerCase().replace(/\.stu$/i, '');
  const re = new RegExp(`^[^\\s@]+@${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.stu$`, 'i');
  return re.test(email.trim());
}

export const HR_MANAGEABLE_PERMISSIONS = [
  { code: 'job.create', nameAr: 'نشر وظائف', nameEn: 'Post jobs' },
  { code: 'application.review', nameAr: 'مراجعة المتقدمين', nameEn: 'Review applicants' },
  { code: 'reports.view', nameAr: 'عرض التقارير', nameEn: 'View reports' },
  { code: 'profile.manage', nameAr: 'إدارة الملف', nameEn: 'Manage profile' },
] as const;

export type HrManageablePermission = (typeof HR_MANAGEABLE_PERMISSIONS)[number]['code'];
