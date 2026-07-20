export interface Industry {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  bg: string;
}

export const INDUSTRIES: Industry[] = [
  { id: 'tech', label: 'تقنية وبرمجيات', labelEn: 'Technology', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'telecom', label: 'اتصالات', labelEn: 'Telecom', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'finance', label: 'مالية ومصرفية', labelEn: 'Finance', color: '#059669', bg: '#ECFDF5' },
  { id: 'healthcare', label: 'صحة وتمريض', labelEn: 'Healthcare', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'education', label: 'تعليم وتدريس', labelEn: 'Education', color: '#D97706', bg: '#FFFBEB' },
  { id: 'engineering', label: 'هندسة وبناء', labelEn: 'Engineering', color: '#475569', bg: '#F8FAFC' },
  { id: 'marketing', label: 'تسويق وإعلام', labelEn: 'Marketing', color: '#DB2777', bg: '#FDF2F8' },
  { id: 'retail', label: 'تجارة وتجزئة', labelEn: 'Retail', color: '#0891B2', bg: '#ECFEFF' },
  { id: 'ngo', label: 'منظمات ومجتمع مدني', labelEn: 'NGO', color: '#16A34A', bg: '#F0FDF4' },
  { id: 'government', label: 'قطاع حكومي', labelEn: 'Government', color: '#0F2444', bg: '#F1F5F9' },
];

export const INDUSTRY_MAP = Object.fromEntries(INDUSTRIES.map((i) => [i.id, i])) as Record<string, Industry>;

export function getIndustryByLabel(label: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.label === label || label.includes(i.label.split(' ')[0]!));
}

export function getIndustryColor(industryLabel: string): { color: string; bg: string } {
  const found = getIndustryByLabel(industryLabel);
  return found ? { color: found.color, bg: found.bg } : { color: '#475569', bg: '#F8FAFC' };
}

export function matchIndustryFilter(companyIndustry: string, filterId: string): boolean {
  if (filterId === 'all') return true;
  const ind = INDUSTRY_MAP[filterId];
  if (!ind) return true;
  const keywords = ind.label.split(/\s+|و/).filter((k) => k.length > 1);
  return keywords.some((k) => companyIndustry.includes(k)) || companyIndustry.includes(ind.label);
}
