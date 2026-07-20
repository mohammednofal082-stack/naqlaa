import type { Job, Internship, Company } from '../types';

export interface SkillDemand {
  skill: string;
  count: number;
  percentage: number;
  avgSalary: number;
}

export interface MarketDistribution {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SalaryInsight {
  level: string;
  label: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface HiringCompany {
  companyId: string;
  name: string;
  logo?: string;
  openings: number;
  avgSalary: number;
}

export interface JobMarketAnalysis {
  totalJobs: number;
  totalInternships: number;
  avgSalary: number;
  topSkills: SkillDemand[];
  workTypes: MarketDistribution[];
  experienceLevels: MarketDistribution[];
  locations: MarketDistribution[];
  salaryByExperience: SalaryInsight[];
  topCompanies: HiringCompany[];
  risingSkills: SkillDemand[];
}

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'عن بُعد',
  hybrid: 'هجين',
  'on-site': 'من المقر',
  onsite: 'من المقر',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: 'مبتدئ',
  junior: 'مبتدئ',
  mid: 'متوسط',
  senior: 'خبير',
  internship: 'تدريب',
};

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function distribution(
  items: string[],
  labels: Record<string, string> = {}
): MarketDistribution[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item) continue;
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  const total = items.length || 1;
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: labels[key] ?? key,
      count,
      percentage: round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function analyzeJobMarket(
  jobs: (Job & { company?: Company })[],
  internships: Internship[] = []
): JobMarketAnalysis {
  const totalJobs = jobs.length;

  const skillMap = new Map<string, { count: number; salarySum: number; salaryCount: number }>();
  for (const job of jobs) {
    const mid = (job.salaryMin + job.salaryMax) / 2;
    for (const raw of job.skills ?? []) {
      const skill = raw.trim();
      if (!skill) continue;
      const entry = skillMap.get(skill) ?? { count: 0, salarySum: 0, salaryCount: 0 };
      entry.count += 1;
      if (mid > 0) {
        entry.salarySum += mid;
        entry.salaryCount += 1;
      }
      skillMap.set(skill, entry);
    }
  }
  const topSkills: SkillDemand[] = [...skillMap.entries()]
    .map(([skill, e]) => ({
      skill,
      count: e.count,
      percentage: round((e.count / (totalJobs || 1)) * 100),
      avgSalary: e.salaryCount ? Math.round(e.salarySum / e.salaryCount) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const salaryGroups = new Map<string, { min: number; max: number; sum: number; count: number }>();
  for (const job of jobs) {
    if (!job.salaryMin && !job.salaryMax) continue;
    const level = job.experienceLevel ?? 'mid';
    const g = salaryGroups.get(level) ?? { min: Infinity, max: 0, sum: 0, count: 0 };
    g.min = Math.min(g.min, job.salaryMin);
    g.max = Math.max(g.max, job.salaryMax);
    g.sum += (job.salaryMin + job.salaryMax) / 2;
    g.count += 1;
    salaryGroups.set(level, g);
  }
  const levelOrder = ['entry', 'junior', 'mid', 'senior'];
  const salaryByExperience: SalaryInsight[] = [...salaryGroups.entries()]
    .map(([level, g]) => ({
      level,
      label: EXPERIENCE_LABELS[level] ?? level,
      min: g.min === Infinity ? 0 : g.min,
      max: g.max,
      avg: Math.round(g.sum / g.count),
      count: g.count,
    }))
    .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));

  const salaried = jobs.filter((j) => j.salaryMin || j.salaryMax);
  const avgSalary = salaried.length
    ? Math.round(
        salaried.reduce((s, j) => s + (j.salaryMin + j.salaryMax) / 2, 0) / salaried.length
      )
    : 0;

  const companyMap = new Map<
    string,
    { name: string; logo?: string; openings: number; salarySum: number; salaryCount: number }
  >();
  for (const job of jobs) {
    const id = job.companyId;
    const entry =
      companyMap.get(id) ??
      {
        name: job.company?.name ?? id,
        logo: job.company?.logo,
        openings: 0,
        salarySum: 0,
        salaryCount: 0,
      };
    entry.openings += 1;
    const mid = (job.salaryMin + job.salaryMax) / 2;
    if (mid > 0) {
      entry.salarySum += mid;
      entry.salaryCount += 1;
    }
    companyMap.set(id, entry);
  }
  const topCompanies: HiringCompany[] = [...companyMap.entries()]
    .map(([companyId, e]) => ({
      companyId,
      name: e.name,
      logo: e.logo,
      openings: e.openings,
      avgSalary: e.salaryCount ? Math.round(e.salarySum / e.salaryCount) : 0,
    }))
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 6);

  const sorted = [...jobs].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
  const half = Math.ceil(sorted.length / 2);
  const recent = sorted.slice(0, half);
  const older = sorted.slice(half);
  const countSkills = (list: Job[]) => {
    const m = new Map<string, number>();
    for (const j of list) for (const s of j.skills ?? []) m.set(s, (m.get(s) ?? 0) + 1);
    return m;
  };
  const recentCounts = countSkills(recent);
  const olderCounts = countSkills(older);
  const risingSkills: SkillDemand[] = [...recentCounts.entries()]
    .map(([skill, count]) => {
      const before = olderCounts.get(skill) ?? 0;
      return { skill, count, growth: count - before };
    })
    .filter((s) => s.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 6)
    .map((s) => ({
      skill: s.skill,
      count: s.count,
      percentage: round((s.count / (recent.length || 1)) * 100),
      avgSalary: skillMap.get(s.skill)?.salaryCount
        ? Math.round(skillMap.get(s.skill)!.salarySum / skillMap.get(s.skill)!.salaryCount)
        : 0,
    }));

  return {
    totalJobs,
    totalInternships: internships.length,
    avgSalary,
    topSkills,
    workTypes: distribution(jobs.map((j) => j.workType ?? ''), WORK_TYPE_LABELS),
    experienceLevels: distribution(
      jobs.map((j) => j.experienceLevel ?? ''),
      EXPERIENCE_LABELS
    ),
    locations: distribution(jobs.map((j) => j.location ?? '')).slice(0, 6),
    salaryByExperience,
    topCompanies,
    risingSkills,
  };
}
