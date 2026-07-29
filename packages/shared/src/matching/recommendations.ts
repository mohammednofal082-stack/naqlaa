import type { Course, Internship, Job, MentorProfile } from '../types';
import { analyzeSkillGap, buildUserSkills, type SkillGapAnalysis, type UserSkill } from './engine';

export interface RecommendationInputs {
  targetRole?: string;
  userSkills?: UserSkill[];
  jobs?: Array<Job & { company: { name: string }; matchPercentage?: number }>;
  internships?: Array<Internship & { company: { name: string }; matchPercentage?: number }>;
  courses?: Course[];
  mentors?: MentorProfile[];
}

export interface SmartRecommendations {
  gap: SkillGapAnalysis;
  jobs: NonNullable<RecommendationInputs['jobs']>;
  internships: NonNullable<RecommendationInputs['internships']>;
  courses: Course[];
  mentors: MentorProfile[];
}

function courseRelevanceScore(course: Course, gap: SkillGapAnalysis): number {
  const targets = [...gap.missing, ...gap.weak.map((w) => w.split(' ')[0])].map((s) =>
    s.toLowerCase()
  );
  const haystack = `${course.title} ${course.description} ${course.category}`.toLowerCase();
  let score = course.rating * 10;
  for (const t of targets) {
    if (t && haystack.includes(t.toLowerCase())) score += 25;
  }
  if (course.progress && course.progress < 100) score += 8;
  return score;
}

export function getSmartRecommendations(input: RecommendationInputs = {}): SmartRecommendations {
  const role = input.targetRole || 'Full Stack Developer';
  const userSkills = input.userSkills?.length ? input.userSkills : buildUserSkills([], []);
  const gap = analyzeSkillGap(role, userSkills);

  const jobs = (input.jobs ?? [])
    .filter((j) => (j.matchPercentage ?? 0) >= 45)
    .slice(0, 6);

  const internships = (input.internships ?? [])
    .filter((i) => (i.matchPercentage ?? 0) >= 40)
    .slice(0, 4);

  const rankedCourses = [...(input.courses ?? [])]
    .filter((c) => c.status === 'published')
    .map((course) => ({ course, score: courseRelevanceScore(course, gap) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.course);

  const mentors = [...(input.mentors ?? [])]
    .filter((m) => m.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return { gap, jobs, internships, courses: rankedCourses, mentors };
}
