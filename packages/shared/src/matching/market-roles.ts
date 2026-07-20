export interface RoleRequirement {
  id: string;
  labelAr: string;
  labelEn: string;
  skills: { name: string; minLevel: number; weight: number }[];
}

export const MARKET_ROLES: RoleRequirement[] = [
  {
    id: 'frontend',
    labelAr: 'مطور واجهات أمامية',
    labelEn: 'Frontend Developer',
    skills: [
      { name: 'React', minLevel: 70, weight: 1.2 },
      { name: 'TypeScript', minLevel: 65, weight: 1.1 },
      { name: 'JavaScript', minLevel: 70, weight: 1 },
      { name: 'HTML', minLevel: 75, weight: 0.8 },
      { name: 'CSS', minLevel: 75, weight: 0.8 },
      { name: 'Next.js', minLevel: 55, weight: 0.9 },
      { name: 'Tailwind CSS', minLevel: 50, weight: 0.7 },
      { name: 'Git', minLevel: 60, weight: 0.8 },
      { name: 'UI/UX', minLevel: 45, weight: 0.6 },
      { name: 'Testing', minLevel: 40, weight: 0.7 },
    ],
  },
  {
    id: 'fullstack',
    labelAr: 'مطور Full Stack',
    labelEn: 'Full Stack Developer',
    skills: [
      { name: 'React', minLevel: 65, weight: 1 },
      { name: 'Node.js', minLevel: 65, weight: 1.1 },
      { name: 'TypeScript', minLevel: 60, weight: 1 },
      { name: 'PostgreSQL', minLevel: 55, weight: 0.9 },
      { name: 'REST APIs', minLevel: 55, weight: 0.9 },
      { name: 'Git', minLevel: 60, weight: 0.8 },
      { name: 'Docker', minLevel: 40, weight: 0.8 },
      { name: 'CI/CD', minLevel: 35, weight: 0.7 },
      { name: 'Testing', minLevel: 45, weight: 0.7 },
    ],
  },
  {
    id: 'mobile',
    labelAr: 'مطور تطبيقات جوال',
    labelEn: 'Mobile Developer',
    skills: [
      { name: 'React Native', minLevel: 65, weight: 1.2 },
      { name: 'TypeScript', minLevel: 60, weight: 1 },
      { name: 'JavaScript', minLevel: 65, weight: 0.9 },
      { name: 'Firebase', minLevel: 45, weight: 0.7 },
      { name: 'REST APIs', minLevel: 50, weight: 0.8 },
      { name: 'Git', minLevel: 55, weight: 0.7 },
    ],
  },
  {
    id: 'devops',
    labelAr: 'مهندس DevOps',
    labelEn: 'DevOps Engineer',
    skills: [
      { name: 'Docker', minLevel: 70, weight: 1.2 },
      { name: 'CI/CD', minLevel: 65, weight: 1.1 },
      { name: 'Linux', minLevel: 60, weight: 1 },
      { name: 'AWS', minLevel: 50, weight: 0.9 },
      { name: 'Git', minLevel: 65, weight: 0.8 },
      { name: 'Node.js', minLevel: 45, weight: 0.6 },
    ],
  },
  {
    id: 'data',
    labelAr: 'عالم بيانات',
    labelEn: 'Data Scientist',
    skills: [
      { name: 'Python', minLevel: 70, weight: 1.2 },
      { name: 'SQL', minLevel: 65, weight: 1 },
      { name: 'Machine Learning', minLevel: 55, weight: 1.1 },
      { name: 'Statistics', minLevel: 50, weight: 0.9 },
      { name: 'Pandas', minLevel: 50, weight: 0.8 },
    ],
  },
];

export function resolveRole(targetRole: string): RoleRequirement {
  const q = targetRole.trim().toLowerCase();
  const found = MARKET_ROLES.find(
    (r) =>
      r.labelEn.toLowerCase().includes(q) ||
      r.labelAr.includes(targetRole) ||
      r.id === q ||
      q.includes(r.id)
  );
  return found ?? MARKET_ROLES[1];
}

export const ROLE_OPTIONS = MARKET_ROLES.map((r) => ({
  id: r.id,
  label: r.labelAr,
  labelEn: r.labelEn,
}));
