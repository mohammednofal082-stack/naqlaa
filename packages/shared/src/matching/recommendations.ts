import type { Course } from '../types';
import { courses, mentorProfiles } from '../mock/modules';
import { studentProfile, skillAnalysis, getJobsWithCompany, getInternshipsWithCompany } from '../mock/data';
import { analyzeSkillGap, buildUserSkills, type SkillGapAnalysis } from './engine';

export interface SmartRecommendations {
  gap: SkillGapAnalysis;
  jobs: ReturnType<typeof getJobsWithCompany>;
  internships: ReturnType<typeof getInternshipsWithCompany>;
  courses: Course[];
  mentors: typeof mentorProfiles;
}

const COURSE_KEYWORDS: Record<string, string[]> = {
  'course-1': ['react', 'typescript', 'frontend', 'next'],
  'course-2': ['ui', 'ux', 'design', 'figma'],
  'course-3': ['node', 'api', 'postgresql', 'backend', 'docker'],
  'course-4': ['accounting', 'finance', 'excel'],
  'course-5': ['marketing', 'seo', 'digital'],
  'course-6': ['nursing', 'health', 'clinical'],
  'course-7': ['cad', 'engineering', 'civil'],
};

function courseRelevanceScore(course: Course, gap: SkillGapAnalysis): number {
  const keywords = COURSE_KEYWORDS[course.id] ?? [];
  const targets = [...gap.missing, ...gap.weak.map((w) => w.split(' ')[0])].map((s) =>
    s.toLowerCase()
  );
  let score = course.rating * 10;
  for (const kw of keywords) {
    if (targets.some((t) => t.includes(kw) || kw.includes(t))) score += 25;
  }
  if (course.progress && course.progress < 100) score += 8;
  return score;
}

export function getSmartRecommendations(targetRole?: string): SmartRecommendations {
  const role = targetRole || studentProfile.headline || 'Full Stack Developer';
  const userSkills = buildUserSkills(studentProfile.skills, skillAnalysis);
  const gap = analyzeSkillGap(role, userSkills);

  const jobs = getJobsWithCompany()
    .filter((j) => (j.matchPercentage ?? 0) >= 45)
    .slice(0, 6);

  const internships = getInternshipsWithCompany()
    .filter((i) => (i.matchPercentage ?? 0) >= 40)
    .slice(0, 4);

  const rankedCourses = [...courses]
    .filter((c) => c.status === 'published')
    .map((course) => ({ course, score: courseRelevanceScore(course, gap) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.course);

  const mentors = [...mentorProfiles]
    .filter((m) => m.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return { gap, jobs, internships, courses: rankedCourses, mentors };
}
