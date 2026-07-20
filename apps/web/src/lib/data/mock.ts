import { getSmartRecommendations, analyzeJobMarket } from '@careerlink/shared';
import type {
  DataRepositories,
  ApplyInput,
  CreateJobInput,
  BookMentorshipInput,
  UpdateProfileInput,
  SendMessageInput,
  WeeklyReportInput,
  VerifyEntityInput,
} from './types';
import {
  initMemoryStore,
  memoryStore,
  getMemoryUser,
  jobsWithMatch,
  internshipsWithMatch,
  applicationsWithDetails,
  attachCompany,
  createApplication,
  updateApplicationStatus as storeUpdateStatus,
  pushAudit,
  pushNotification,
} from './memory-store';

function ensureInit() {
  initMemoryStore();
}

export const mockRepositories: DataRepositories = {
  async getJobs() {
    ensureInit();
    return jobsWithMatch();
  },

  async getJobById(id) {
    ensureInit();
    const job = memoryStore.jobs.find((j) => j.id === id);
    if (!job) return null;
    const skills = memoryStore.studentProfile.skills;
    const { buildUserSkills, computeMatchScore } = await import('@careerlink/shared');
    const userSkills = buildUserSkills(memoryStore.studentProfile.skills, memoryStore.skillLevels);
    return {
      ...attachCompany(job),
      matchPercentage: computeMatchScore(userSkills, job.skills),
    };
  },

  async getInternships() {
    ensureInit();
    return internshipsWithMatch();
  },

  async getInternshipById(id) {
    ensureInit();
    const int = memoryStore.internships.find((i) => i.id === id);
    if (!int) return null;
    const { buildUserSkills, computeMatchScore } = await import('@careerlink/shared');
    const userSkills = buildUserSkills(memoryStore.studentProfile.skills, memoryStore.skillLevels);
    return {
      ...attachCompany(int),
      matchPercentage: computeMatchScore(userSkills, int.requirements),
    };
  },

  async getApplications(query) {
    ensureInit();
    return applicationsWithDetails(query);
  },

  async getUsers() {
    ensureInit();
    return memoryStore.users;
  },

  async getCompanies() {
    ensureInit();
    return memoryStore.companies;
  },

  async getCompanyById(id) {
    ensureInit();
    return memoryStore.companies.find((c) => c.id === id) ?? null;
  },

  async getProfile(userId) {
    ensureInit();
    const user = getMemoryUser(userId);
    return {
      user,
      profile: memoryStore.studentProfile,
      skillLevels: memoryStore.skillLevels,
    };
  },

  async updateProfile(input: UpdateProfileInput) {
    ensureInit();
    if (input.headline != null) memoryStore.studentProfile.headline = input.headline;
    if (input.about != null) memoryStore.studentProfile.about = input.about;
    if (input.location != null) memoryStore.studentProfile.location = input.location;
    if (input.skills != null) memoryStore.studentProfile.skills = input.skills;
    pushAudit('profile_updated', 'profile', memoryStore.currentUserId);
    return this.getProfile() as Promise<import('./types').UserProfileBundle>;
  },

  async getNotifications(userId) {
    ensureInit();
    const uid = userId ?? memoryStore.currentUserId;
    return memoryStore.notifications.filter((n) => n.userId === uid);
  },

  async getCourses() {
    ensureInit();
    return memoryStore.courses.map((c) => ({
      ...c,
      progress: memoryStore.courseEnrollments[c.id] ? (c.progress ?? 35) : undefined,
    }));
  },

  async getFeedPosts() {
    ensureInit();
    return memoryStore.feedPosts;
  },

  async getRecommendations(targetRole) {
    ensureInit();
    const base = getSmartRecommendations(targetRole);
    const jobs = (await this.getJobs()).slice(0, 6).map((j) => ({
      ...j,
      matchPercentage: j.matchPercentage ?? 0,
    }));
    const internships = (await this.getInternships()).slice(0, 4).map((i) => ({
      ...i,
      matchPercentage: i.matchPercentage ?? 0,
    }));
    return { ...base, jobs, internships };
  },

  async getEvents() {
    ensureInit();
    return memoryStore.events;
  },

  async getMentors() {
    ensureInit();
    return memoryStore.mentorProfiles;
  },

  async getMentorshipSessions(userId) {
    ensureInit();
    const uid = userId ?? memoryStore.currentUserId;
    return memoryStore.mentorshipSessions.filter(
      (s) => s.menteeId === uid || s.mentorId === uid
    );
  },

  async getConversations(userId) {
    ensureInit();
    const uid = userId ?? memoryStore.currentUserId;
    return memoryStore.conversations.filter((c) => c.participantIds.includes(uid));
  },

  async getMessages(conversationId) {
    ensureInit();
    return memoryStore.messages.filter((m) => {
      const conv = memoryStore.conversations.find((c) => c.id === conversationId);
      if (!conv) return false;
      return conv.participantIds.includes(m.senderId) || conv.participantIds.includes(m.receiverId);
    });
  },

  async getSavedJobs(userId) {
    ensureInit();
    const jobs = await this.getJobs();
    return jobs.filter((j) => memoryStore.savedJobIds.has(j.id));
  },

  async getSavedCompanies(userId) {
    ensureInit();
    return memoryStore.companies.filter((c) => memoryStore.savedCompanyIds.has(c.id));
  },

  async getSettings() {
    ensureInit();
    return { ...memoryStore.settings };
  },

  async getInternshipRequests() {
    ensureInit();
    return memoryStore.internshipRequests;
  },

  async getWeeklyReports() {
    ensureInit();
    return memoryStore.weeklyReports;
  },

  async getAuditLogs() {
    ensureInit();
    return memoryStore.auditLogs;
  },

  async getTalentPools() {
    ensureInit();
    return memoryStore.talentPools;
  },

  async getMarketAnalysis() {
    ensureInit();
    const jobs = await this.getJobs();
    return analyzeJobMarket(jobs, memoryStore.internships);
  },

  async getPartnerships() {
    ensureInit();
    return memoryStore.partnerships;
  },

  async getAssessments() {
    ensureInit();
    return memoryStore.assessments;
  },

  async search(query) {
    ensureInit();
    const q = query.trim().toLowerCase();
    if (!q) return { jobs: [], companies: [] };
    const jobs = (await this.getJobs()).filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.name.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
    const companies = memoryStore.companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
    return { jobs, companies };
  },

  async apply(input: ApplyInput) {
    ensureInit();
    if (input.jobId) {
      const job = memoryStore.jobs.find((j) => j.id === input.jobId);
      if (!job) throw new Error('NOT_FOUND');
      const { buildUserSkills, computeMatchScore } = await import('@careerlink/shared');
      const userSkills = buildUserSkills(memoryStore.studentProfile.skills, memoryStore.skillLevels);
      return createApplication({
        jobId: input.jobId,
        companyId: job.companyId,
        matchScore: computeMatchScore(userSkills, job.skills),
        coverNote: input.coverNote,
      });
    }
    if (input.internshipId) {
      const int = memoryStore.internships.find((i) => i.id === input.internshipId);
      if (!int) throw new Error('NOT_FOUND');
      const { buildUserSkills, computeMatchScore } = await import('@careerlink/shared');
      const userSkills = buildUserSkills(memoryStore.studentProfile.skills, memoryStore.skillLevels);
      return createApplication({
        internshipId: input.internshipId,
        jobId: '',
        companyId: int.companyId,
        matchScore: computeMatchScore(userSkills, int.requirements),
        coverNote: input.coverNote,
      });
    }
    throw new Error('JOB_OR_INTERNSHIP_REQUIRED');
  },

  async updateApplicationStatus(id, status) {
    ensureInit();
    return storeUpdateStatus(id, status);
  },

  async createJob(input: CreateJobInput) {
    ensureInit();
    const job = {
      id: `job-${Date.now()}`,
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      currency: 'USD',
      location: input.location,
      workType: input.workType,
      experienceLevel: input.experienceLevel,
      skills: input.skills,
      postedAt: new Date().toISOString().split('T')[0],
      applicants: 0,
      status: 'published' as const,
    };
    memoryStore.jobs.unshift(job);
    pushAudit('job_created', 'job', job.id);
    return job;
  },

  async enrollCourse(courseId) {
    ensureInit();
    const course = memoryStore.courses.find((c) => c.id === courseId);
    if (!course) throw new Error('NOT_FOUND');
    memoryStore.courseEnrollments[courseId] = true;
    course.enrolledCount += 1;
    pushNotification({
      userId: memoryStore.currentUserId,
      type: 'course',
      title: 'تم التسجيل في الكورس',
      message: course.title,
      read: false,
      link: '/courses',
    });
    return { enrolled: true };
  },

  async bookMentorship(input: BookMentorshipInput) {
    ensureInit();
    const session = {
      id: `session-${Date.now()}`,
      mentorId: input.mentorId,
      menteeId: memoryStore.currentUserId,
      topic: input.topic,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes ?? 45,
      status: 'requested' as const,
    };
    memoryStore.mentorshipSessions.unshift(session);
    pushNotification({
      userId: memoryStore.currentUserId,
      type: 'mentorship',
      title: 'طلب جلسة إرشاد',
      message: input.topic,
      read: false,
      link: '/mentorship',
    });
    return session;
  },

  async sendMessage(input: SendMessageInput) {
    ensureInit();
    const conv = memoryStore.conversations.find((c) => c.id === input.conversationId);
    if (!conv) throw new Error('NOT_FOUND');
    const receiverId = conv.participantIds.find((id) => id !== memoryStore.currentUserId)!;
    const msg = {
      id: `msg-${Date.now()}`,
      senderId: memoryStore.currentUserId,
      receiverId,
      content: input.content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    memoryStore.messages.push(msg);
    conv.lastMessage = msg;
    conv.unreadCount = (conv.unreadCount ?? 0) + 1;
    return msg;
  },

  async markNotificationRead(id) {
    ensureInit();
    const n = memoryStore.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  },

  async saveJob(jobId) {
    ensureInit();
    memoryStore.savedJobIds.add(jobId);
  },

  async unsaveJob(jobId) {
    ensureInit();
    memoryStore.savedJobIds.delete(jobId);
  },

  async saveCompany(companyId) {
    ensureInit();
    memoryStore.savedCompanyIds.add(companyId);
  },

  async updateSettings(settings) {
    ensureInit();
    Object.assign(memoryStore.settings, settings);
    pushAudit('settings_updated', 'settings', memoryStore.currentUserId);
    return { ...memoryStore.settings };
  },

  async registerForEvent(eventId) {
    ensureInit();
    const event = memoryStore.events.find((e) => e.id === eventId);
    if (!event) throw new Error('NOT_FOUND');
    event.registrationsCount = (event.registrationsCount ?? 0) + 1;
    pushNotification({
      userId: memoryStore.currentUserId,
      type: 'event',
      title: 'تم تأكيد التسجيل',
      message: event.title,
      read: false,
      link: '/events',
    });
    return event;
  },

  async submitWeeklyReport(input: WeeklyReportInput) {
    ensureInit();
    const report: import('@careerlink/shared').WeeklyReport = {
      id: `report-${Date.now()}`,
      internshipId: input.internshipRequestId,
      weekNumber: input.weekNumber,
      title: `تقرير أسبوع ${input.weekNumber}`,
      tasksDone: input.tasksCompleted,
      skillsUsed: [],
      challenges: input.challenges ?? '',
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    memoryStore.weeklyReports.unshift(report);
    pushAudit('weekly_report_submitted', 'weekly_report', report.id);
    return report;
  },

  async verifyEntity(input: VerifyEntityInput) {
    ensureInit();
    if (input.entityType === 'company') {
      const c = memoryStore.companies.find((x) => x.id === input.entityId);
      if (c) {
        c.verified = input.status === 'approved';
        c.verificationStatus = input.status === 'approved' ? 'approved' : 'rejected';
      }
    }
    pushAudit(`verify_${input.status}`, input.entityType, input.entityId);
    return { success: true };
  },

  async markConversationRead(conversationId) {
    ensureInit();
    const conv = memoryStore.conversations.find((c) => c.id === conversationId);
    if (conv) conv.unreadCount = 0;
  },

  async createTalentPool(input) {
    ensureInit();
    const pool = {
      id: `pool-${Date.now()}`,
      companyId: input.companyId ?? 'comp-1',
      name: input.name,
      description: input.description,
      membersCount: 0,
      memberIds: [] as string[],
      createdAt: new Date().toISOString().split('T')[0],
    };
    memoryStore.talentPools.unshift(pool);
    pushAudit('talent_pool_created', 'talent_pool', pool.id);
    return pool;
  },

  async addToTalentPool(poolId, userId) {
    ensureInit();
    const pool = memoryStore.talentPools.find((p) => p.id === poolId);
    if (!pool) throw new Error('NOT_FOUND');
    pool.memberIds = pool.memberIds ?? [];
    if (!pool.memberIds.includes(userId)) {
      pool.memberIds.push(userId);
      pool.membersCount = pool.memberIds.length;
      pushAudit('talent_pool_member_added', 'talent_pool', poolId);
    }
    return pool;
  },

  async removeFromTalentPool(poolId, userId) {
    ensureInit();
    const pool = memoryStore.talentPools.find((p) => p.id === poolId);
    if (!pool) throw new Error('NOT_FOUND');
    pool.memberIds = (pool.memberIds ?? []).filter((id) => id !== userId);
    pool.membersCount = pool.memberIds.length;
    pushAudit('talent_pool_member_removed', 'talent_pool', poolId);
    return pool;
  },
};
