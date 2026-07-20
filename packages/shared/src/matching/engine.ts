import { resolveRole, type RoleRequirement } from './market-roles';

export interface UserSkill {
  name: string;
  level: number;
}

export interface SkillGapAnalysis {
  targetRole: string;
  roleLabel: string;
  matchScore: number;
  marketReadiness: number;
  strong: string[];
  weak: string[];
  missing: string[];
  recommendedCourses: string[];
  recommendedProjects: string[];
}

const ALIASES: Record<string, string[]> = {
  react: ['react', 'reactjs', 'react.js', 'ريأكت'],
  nextjs: ['nextjs', 'next.js', 'next'],
  nodejs: ['nodejs', 'node.js', 'node'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js'],
  tailwindcss: ['tailwind', 'tailwindcss', 'tailwind css'],
  html: ['html', 'html5'],
  css: ['css', 'css3'],
  git: ['git', 'github', 'gitlab'],
  postgresql: ['postgresql', 'postgres', 'sql'],
  sql: ['sql', 'postgresql', 'mysql'],
  docker: ['docker', 'containers'],
  cicd: ['cicd', 'ci/cd', 'ci', 'cd', 'github actions'],
  testing: ['testing', 'jest', 'cypress', 'unit test'],
  reactnative: ['reactnative', 'react native'],
  restapis: ['rest', 'rest api', 'restapis', 'apis'],
  uiux: ['ui/ux', 'uiux', 'ux', 'ui'],
  aws: ['aws', 'cloud'],
  python: ['python'],
  machinelearning: ['machine learning', 'ml', 'machinelearning'],
};

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[.\s/_-]+/g, '');
}

function canonical(skill: string): string {
  const n = norm(skill);
  for (const [key, variants] of Object.entries(ALIASES)) {
    if (variants.some((v) => norm(v) === n || n.includes(norm(v)) || norm(v).includes(n))) {
      return key;
    }
  }
  return n;
}

function findUserLevel(userSkills: UserSkill[], requiredName: string): number | null {
  const reqCanon = canonical(requiredName);
  for (const us of userSkills) {
    if (canonical(us.name) === reqCanon) return us.level;
    if (norm(us.name).includes(reqCanon) || reqCanon.includes(norm(us.name))) {
      return us.level;
    }
  }
  return null;
}

export function computeMatchScore(userSkills: UserSkill[], requiredSkills: string[]): number {
  if (!requiredSkills.length) return 0;
  let total = 0;
  let earned = 0;
  for (const req of requiredSkills) {
    const weight = 1;
    total += weight;
    const level = findUserLevel(userSkills, req);
    if (level !== null) {
      earned += weight * Math.min(1, level / 100);
    }
  }
  const base = Math.round((earned / total) * 100);
  const bonusSkills = userSkills.filter(
    (us) => us.level >= 70 && requiredSkills.some((r) => canonical(r) === canonical(us.name))
  ).length;
  return Math.min(100, base + Math.min(8, bonusSkills * 2));
}

function analyzeAgainstRole(userSkills: UserSkill[], role: RoleRequirement): SkillGapAnalysis {
  let weightedTotal = 0;
  let weightedEarned = 0;
  const strong: string[] = [];
  const weak: string[] = [];
  const missing: string[] = [];

  for (const req of role.skills) {
    weightedTotal += req.weight;
    const level = findUserLevel(userSkills, req.name);
    if (level === null) {
      missing.push(req.name);
    } else if (level >= req.minLevel) {
      strong.push(`${req.name} (${level}%)`);
      weightedEarned += req.weight;
    } else {
      weak.push(`${req.name} (${level}% — مطلوب ${req.minLevel}%)`);
      weightedEarned += req.weight * (level / req.minLevel);
    }
  }

  const matchScore = Math.round((weightedEarned / weightedTotal) * 100);
  const marketReadiness = Math.round(
    (strong.length / role.skills.length) * 60 + (matchScore / 100) * 40
  );

  const projects = buildProjectSuggestions(missing, role.id);
  const courses = buildCourseSuggestions(missing, role.id);

  return {
    targetRole: role.labelEn,
    roleLabel: role.labelAr,
    matchScore,
    marketReadiness,
    strong,
    weak,
    missing,
    recommendedCourses: courses,
    recommendedProjects: projects,
  };
}

function buildProjectSuggestions(missing: string[], roleId: string): string[] {
  const projects: string[] = [];
  if (missing.some((m) => /docker|ci/i.test(m))) {
    projects.push('نشر تطبيق Full Stack على VPS مع Docker');
  }
  if (missing.some((m) => /test/i.test(m))) {
    projects.push('إضافة اختبارات Jest لمحفظة React');
  }
  if (roleId === 'frontend' || roleId === 'fullstack') {
    projects.push('بناء Portfolio تفاعلي بـ Next.js مع CMS');
  }
  if (roleId === 'mobile') {
    projects.push('تطبيق جوال React Native مع تسجيل دخول وAPI');
  }
  if (!projects.length) {
    projects.push('مساهمة Open Source في مشروع يستخدم مهاراتك');
    projects.push('مشروع تخرج موثّق على GitHub مع README احترافي');
  }
  return projects.slice(0, 4);
}

function buildCourseSuggestions(missing: string[], roleId: string): string[] {
  const map: Record<string, string> = {
    docker: 'Docker & Kubernetes — Udemy',
    'ci/cd': 'GitHub Actions CI/CD',
    testing: 'Jest & React Testing Library',
    'react native': 'React Native — Meta Certificate',
    python: 'Python for Data Science',
    aws: 'AWS Cloud Practitioner',
    'node.js': 'Node.js & APIs — freeCodeCamp',
    'next.js': 'React.js من الصفر للاحتراف — نقلة',
  };
  const courses = missing
    .map((m) => {
      const key = m.toLowerCase();
      return map[key] || map[canonical(m)] || `كورس ${m} — Coursera`;
    })
    .slice(0, 4);
  if (roleId === 'fullstack' && !courses.length) {
    courses.push('Node.js & APIs — freeCodeCamp');
  }
  return courses;
}

export function analyzeSkillGap(targetRole: string, userSkills: UserSkill[]): SkillGapAnalysis {
  const role = resolveRole(targetRole);
  return analyzeAgainstRole(userSkills, role);
}

export function buildUserSkills(
  profileSkills: string[],
  skillLevels?: { skill: string; value: number }[]
): UserSkill[] {
  const levelMap = new Map(skillLevels?.map((s) => [canonical(s.skill), s.value]));
  return profileSkills.map((name) => ({
    name,
    level: levelMap.get(canonical(name)) ?? estimateLevel(name, profileSkills),
  }));
}

function estimateLevel(name: string, all: string[]): number {
  const idx = all.indexOf(name);
  if (idx < 0) return 50;
  return Math.max(55, 88 - idx * 4);
}

export function analyzeCvLocally(
  cvText: string,
  targetRole: string,
  userSkills?: UserSkill[]
): {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
} {
  const text = cvText.toLowerCase();
  const role = resolveRole(targetRole);
  const skills = userSkills ?? [];
  const gap = skills.length ? analyzeAgainstRole(skills, role) : analyzeSkillGap(targetRole, []);

  let score = 45;
  if (text.length > 300) score += 10;
  if (text.length > 800) score += 8;
  if (/@[\w.-]+\.\w+/.test(text)) score += 5;
  if (/\+?\d{7,}/.test(text)) score += 3;
  for (const req of role.skills.slice(0, 6)) {
    if (text.includes(req.name.toLowerCase()) || text.includes(canonical(req.name))) score += 4;
  }
  if (/مشروع|project|github/i.test(text)) score += 6;
  if (/خبرة|experience/i.test(text)) score += 5;
  score = Math.min(96, score);

  const strengths: string[] = [];
  if (text.includes('react')) strengths.push('ذكر React — مطابق لسوق العمل');
  if (text.includes('typescript')) strengths.push('TypeScript يعزز فرصك في الشركات التقنية');
  if (/\d+%|\d+\s*شهر/.test(text)) strengths.push('استخدام أرقام ونتائج قابلة للقياس');
  if (!strengths.length) strengths.push('السيرة تحتوي معلومات أساسية قابلة للتطوير');

  const weaknesses: string[] = [];
  if (!/ملخص|summary|نبذة/i.test(text)) weaknesses.push('أضف ملخصاً مهنياً في الأعلى (3 أسطر)');
  if (text.length < 400) weaknesses.push('المحتوى قصير — وسّع قسم الخبرة والمشاريع');
  if (!/github|portfolio|مشروع/i.test(text)) weaknesses.push('أضف روابط مشاريع أو GitHub');

  return {
    atsScore: score,
    strengths,
    weaknesses,
    missingSkills: gap.missing,
    suggestions: [
      `خصّص السيرة لدور: ${role.labelAr}`,
      ...gap.missing.slice(0, 2).map((s) => `أضف مهارة ${s} أو مشروعاً يثبتها`),
      'استخدم كلمات مفتاحية من إعلان الوظيفة المستهدفة',
    ],
  };
}
