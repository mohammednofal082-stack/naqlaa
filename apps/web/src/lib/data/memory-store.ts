import type {
  Application,
  ApplicationStatus,
  Company,
  Conversation,
  Course,
  Event,
  FeedPost,
  Internship,
  Job,
  MentorshipSession,
  Message,
  Notification,
  StudentProfile,
  User,
  InternshipRequest,
  WeeklyReport,
  AuditLog,
  TalentPool,
  Partnership,
  Assessment,
  MentorProfile,
} from '@careerlink/shared';
import {
  applications as seedApplications,
  companies as seedCompanies,
  conversations as seedConversations,
  currentUser as seedCurrentUser,
  feedPosts as seedFeedPosts,
  getCompanyById as seedGetCompanyById,
  internships as seedInternships,
  jobs as seedJobs,
  messages as seedMessages,
  notifications as seedNotifications,
  skillAnalysis as seedSkillAnalysis,
  studentProfile as seedStudentProfile,
  users as seedUsers,
} from '@careerlink/shared';
import {
  courses as seedCourses,
  events as seedEvents,
  mentorshipSessions as seedMentorshipSessions,
  mentorProfiles as seedMentorProfiles,
  internshipRequests as seedInternshipRequests,
  weeklyReports as seedWeeklyReports,
  auditLogs as seedAuditLogs,
  talentPools as seedTalentPools,
  partnerships as seedPartnerships,
  assessments as seedAssessments,
} from '@careerlink/shared';
import { buildUserSkills, computeMatchScore } from '@careerlink/shared';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let initialized = false;

export const memoryStore = {
  currentUserId: 'user-1',
  users: [] as User[],
  studentProfile: {} as StudentProfile,
  skillLevels: [] as { skill: string; value: number }[],
  jobs: [] as Job[],
  internships: [] as Internship[],
  applications: [] as Application[],
  companies: [] as Company[],
  courses: [] as Course[],
  courseEnrollments: {} as Record<string, boolean>,
  notifications: [] as Notification[],
  feedPosts: [] as FeedPost[],
  conversations: [] as Conversation[],
  messages: [] as Message[],
  events: [] as Event[],
  mentorshipSessions: [] as MentorshipSession[],
  mentorProfiles: [] as MentorProfile[],
  savedJobIds: new Set<string>(),
  savedCompanyIds: new Set<string>(),
  internshipRequests: [] as InternshipRequest[],
  weeklyReports: [] as WeeklyReport[],
  auditLogs: [] as AuditLog[],
  talentPools: [] as TalentPool[],
  partnerships: [] as Partnership[],
  assessments: [] as Assessment[],
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    profilePublic: true,
  },
};

export function initMemoryStore() {
  if (initialized) return;
  memoryStore.users = clone(seedUsers);
  memoryStore.studentProfile = clone(seedStudentProfile);
  memoryStore.skillLevels = clone(seedSkillAnalysis);
  memoryStore.jobs = clone(seedJobs);
  memoryStore.internships = clone(seedInternships);
  memoryStore.applications = clone(seedApplications);
  memoryStore.companies = clone(seedCompanies);
  memoryStore.courses = clone(seedCourses);
  memoryStore.notifications = clone(seedNotifications);
  memoryStore.feedPosts = clone(seedFeedPosts);
  memoryStore.conversations = clone(seedConversations);
  memoryStore.messages = clone(seedMessages);
  memoryStore.events = clone(seedEvents);
  memoryStore.mentorshipSessions = clone(seedMentorshipSessions);
  memoryStore.mentorProfiles = clone(seedMentorProfiles);
  memoryStore.internshipRequests = clone(seedInternshipRequests);
  memoryStore.weeklyReports = clone(seedWeeklyReports);
  memoryStore.auditLogs = clone(seedAuditLogs);
  memoryStore.talentPools = clone(seedTalentPools);
  memoryStore.partnerships = clone(seedPartnerships);
  memoryStore.assessments = clone(seedAssessments);
  memoryStore.savedJobIds = new Set(['job-1', 'job-2', 'job-3']);
  memoryStore.savedCompanyIds = new Set(['comp-1', 'comp-2']);
  memoryStore.courseEnrollments = { 'course-1': true, 'course-2': true };
  initialized = true;
}

export function getMemoryUser(userId?: string): User {
  initMemoryStore();
  const id = userId ?? memoryStore.currentUserId;
  return memoryStore.users.find((u) => u.id === id) ?? seedCurrentUser;
}

export function getUserSkills() {
  initMemoryStore();
  return buildUserSkills(memoryStore.studentProfile.skills, memoryStore.skillLevels);
}

export function attachCompany<T extends { companyId: string }>(
  item: T
): T & { company: Company } {
  initMemoryStore();
  const company =
    memoryStore.companies.find((c) => c.id === item.companyId) ??
    seedGetCompanyById(item.companyId)!;
  return { ...item, company };
}

export function jobsWithMatch() {
  initMemoryStore();
  const skills = getUserSkills();
  return memoryStore.jobs
    .map((job) => ({
      ...attachCompany(job),
      matchPercentage: computeMatchScore(skills, job.skills),
    }))
    .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));
}

export function internshipsWithMatch() {
  initMemoryStore();
  const skills = getUserSkills();
  return memoryStore.internships
    .map((int) => ({
      ...attachCompany(int),
      matchPercentage: computeMatchScore(skills, int.requirements),
    }))
    .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));
}

export function applicationsWithDetails(query?: { userId?: string; scope?: 'mine' | 'all' }) {
  initMemoryStore();
  const scope = query?.scope ?? 'mine';
  let apps = memoryStore.applications;
  if (scope === 'mine') {
    const uid = query?.userId ?? memoryStore.currentUserId;
    apps = apps.filter((a) => a.studentId === uid);
  }
  return apps.map((app) => ({
    ...app,
    job: memoryStore.jobs.find((j) => j.id === app.jobId),
    company: memoryStore.companies.find((c) => c.id === app.companyId),
    student: memoryStore.users.find((u) => u.id === app.studentId),
  }));
}

export function pushNotification(n: Omit<Notification, 'id' | 'timestamp'>) {
  initMemoryStore();
  const note: Notification = {
    ...n,
    id: `notif-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  memoryStore.notifications.unshift(note);
  return note;
}

export function pushAudit(action: string, entityType: string, entityId: string) {
  initMemoryStore();
  memoryStore.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorId: memoryStore.currentUserId,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
  });
}

export function hasAppliedToJob(jobId: string, userId?: string) {
  initMemoryStore();
  const uid = userId ?? memoryStore.currentUserId;
  return memoryStore.applications.some((a) => a.studentId === uid && a.jobId === jobId);
}

export function createApplication(input: {
  jobId?: string;
  internshipId?: string;
  companyId: string;
  matchScore?: number;
  coverNote?: string;
  userId?: string;
}): Application {
  initMemoryStore();
  const uid = input.userId ?? memoryStore.currentUserId;
  if (input.jobId && hasAppliedToJob(input.jobId, uid)) {
    throw new Error('ALREADY_APPLIED');
  }
  const app: Application = {
    id: `app-${Date.now()}`,
    jobId: input.jobId ?? '',
    internshipId: input.internshipId,
    studentId: uid,
    companyId: input.companyId,
    status: 'applied',
    matchScore: input.matchScore,
    appliedAt: new Date().toISOString().split('T')[0],
    coverNote: input.coverNote,
  };
  memoryStore.applications.unshift(app);
  pushNotification({
    userId: uid,
    type: 'application-update',
    title: 'تم إرسال طلبك',
    message: 'طلبك قيد المراجعة — سنوافيك بالتحديثات',
    read: false,
    link: '/applications',
  });
  pushAudit('application_created', 'application', app.id);
  return app;
}

export function updateApplicationStatus(id: string, status: ApplicationStatus) {
  initMemoryStore();
  const app = memoryStore.applications.find((a) => a.id === id);
  if (!app) throw new Error('NOT_FOUND');
  app.status = status;
  pushNotification({
    userId: app.studentId,
    type: 'application-update',
    title: 'تحديث على طلبك',
    message: `حالة الطلب: ${status}`,
    read: false,
    link: '/applications',
  });
  pushAudit('application_status_changed', 'application', id);
  return app;
}
