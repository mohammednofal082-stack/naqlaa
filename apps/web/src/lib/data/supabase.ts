import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/config/env';
import { computeMatchScore, getSmartRecommendations, analyzeJobMarket } from '@careerlink/shared';
import type { DataRepositories } from './types';
import {
  mapApplication,
  mapCompany,
  mapCourse,
  mapFeedPost,
  mapInternship,
  mapJob,
  mapNotification,
  mapStudentProfile,
} from './mappers';

function assertSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
}

export const supabaseRepositories: DataRepositories = {
  async getJobs() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from('jobs')
      .select('*, companies(*)')
      .eq('status', 'published')
      .order('posted_at', { ascending: false });

    if (error) throw error;

    const { data: skills } = await supabase.from('user_skills').select('*');
    const userSkills = (skills ?? []).map((s) => ({
      name: String(s.skill_name),
      level: Number(s.level),
    }));

    return (rows ?? []).map((row) => {
      const company = mapCompany(row.companies as Record<string, unknown>);
      const job = mapJob(row);
      return {
        ...job,
        company,
        matchPercentage: userSkills.length
          ? computeMatchScore(userSkills, job.skills)
          : undefined,
      };
    });
  },

  async getJobById(id) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('jobs')
      .select('*, companies(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    const company = mapCompany(data.companies as Record<string, unknown>);
    return { ...mapJob(data), company };
  },

  async getInternships() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('internships')
      .select('*, companies(*)')
      .eq('status', 'published')
      .order('posted_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      ...mapInternship(row),
      company: mapCompany(row.companies as Record<string, unknown>),
    }));
  },

  async getInternshipById(id) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('internships')
      .select('*, companies(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      ...mapInternship(data),
      company: mapCompany(data.companies as Record<string, unknown>),
    };
  },

  async getApplications(query) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    let q = supabase
      .from('applications')
      .select('*, jobs(*), companies(*), profiles:student_id(*)')
      .order('applied_at', { ascending: false });

    if (query?.scope !== 'all' && query?.userId) {
      q = q.eq('student_id', query.userId);
    }

    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []).map((row) => {
      const profile = row.profiles as Record<string, unknown> | null;
      const fullName = profile ? String(profile.full_name ?? '') : '';
      const [firstName, ...rest] = fullName.split(' ');
      return {
        ...mapApplication(row),
        job: row.jobs ? mapJob(row.jobs as Record<string, unknown>) : undefined,
        company: row.companies
          ? mapCompany(row.companies as Record<string, unknown>)
          : undefined,
        student: profile
          ? {
              id: String(profile.id),
              firstName: firstName || fullName,
              lastName: rest.join(' ') || '',
              email: String(profile.email ?? ''),
              role: profile.active_role as import('@careerlink/shared').UserRole,
              avatar: String(profile.avatar_url ?? ''),
              createdAt: String(profile.created_at ?? ''),
            }
          : undefined,
      };
    });
  },

  async getUsers() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (error) throw error;
    return (data ?? []).map((row) => {
      const fullName = String(row.full_name ?? '');
      const [firstName, ...rest] = fullName.split(' ');
      return {
        id: String(row.id),
        firstName: firstName || fullName,
        lastName: rest.join(' ') || '',
        email: String(row.email ?? ''),
        role: row.active_role as import('@careerlink/shared').UserRole,
        avatar: String(row.avatar_url ?? ''),
        createdAt: String(row.created_at ?? ''),
      };
    });
  },

  async getCompanies() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('companies').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map(mapCompany);
  },

  async getCompanyById(id) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapCompany(data);
  },

  async getProfile(userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const targetId = userId ?? authUser?.id;
    if (!targetId) return null;

    const { data: profileRow } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    const { data: studentRow } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', targetId)
      .single();

    const { data: skillRows } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', targetId);

    if (!profileRow) return null;

    const fullName = String(profileRow.full_name);
    const [firstName, ...rest] = fullName.split(' ');

    return {
      user: {
        id: String(profileRow.id),
        firstName: firstName || fullName,
        lastName: rest.join(' ') || '',
        email: String(profileRow.email),
        role: profileRow.active_role as import('@careerlink/shared').UserRole,
        avatar: String(profileRow.avatar_url ?? ''),
        createdAt: String(profileRow.created_at),
      },
      profile: studentRow
        ? mapStudentProfile(studentRow)
        : {
            userId: targetId,
            headline: '',
            location: '',
            about: '',
            coverPhoto: '',
            university: '',
            universityId: '',
            department: '',
            departmentId: '',
            major: '',
            graduationYear: 0,
            studyYear: 0,
            studentNumber: '',
            education: [],
            skills: [],
            experience: [],
            certifications: [],
            projects: [],
            profileCompletion: 0,
            connections: 0,
            followers: 0,
          },
      skillLevels: (skillRows ?? []).map((s) => ({
        skill: String(s.skill_name),
        value: Number(s.level),
      })),
    };
  },

  async getNotifications(userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetId = userId ?? user?.id;
    if (!targetId) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapNotification);
  },

  async getCourses() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapCourse);
  },

  async getFeedPosts() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []).map(mapFeedPost);
  },

  async getRecommendations(targetRole) {
    return getSmartRecommendations(targetRole);
  },

  async updateProfile(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    await supabase.from('student_profiles').update({
      headline: input.headline,
      about: input.about,
      location: input.location,
      skills: input.skills,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    return (await this.getProfile(user.id))!;
  },

  async getEvents() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('events').select('*').eq('status', 'published');
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      organizerType: 'university' as const,
      organizerId: String(row.organizer_id ?? ''),
      title: String(row.title),
      type: 'career_day' as const,
      description: String(row.description ?? ''),
      startAt: String(row.event_date),
      endAt: String(row.event_date),
      location: String(row.location ?? ''),
      status: row.status as import('@careerlink/shared').EventStatus,
      registrationsCount: Number(row.registered_count ?? 0),
      qrCode: `NAQLAH-${String(row.id).slice(0, 8).toUpperCase()}`,
    }));
  },

  async getMentors() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('mentor_profiles').select('*');
    if (error) throw error;
    return (data ?? []).map((row) => ({
      userId: String(row.user_id),
      expertiseArea: String(row.expertise_area ?? ''),
      currentTitle: String(row.current_title ?? ''),
      experienceYears: Number(row.experience_years ?? 0),
      bio: String(row.bio ?? ''),
      verified: Boolean(row.verified),
      rating: Number(row.rating ?? 0),
      sessionsCount: Number(row.sessions_count ?? 0),
    }));
  },

  async getMentorshipSessions(userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId ?? user?.id;
    if (!uid) return [];
    const { data, error } = await supabase.from('mentorship_sessions').select('*').or(`mentee_id.eq.${uid},mentor_id.eq.${uid}`);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      mentorId: String(row.mentor_id),
      menteeId: String(row.mentee_id),
      topic: String(row.topic),
      scheduledAt: String(row.scheduled_at),
      durationMinutes: Number(row.duration_minutes ?? 45),
      status: row.status as import('@careerlink/shared').SessionStatus,
      meetingLink: row.meeting_link ? String(row.meeting_link) : undefined,
      feedback: row.feedback ? String(row.feedback) : undefined,
      rating: row.rating != null ? Number(row.rating) : undefined,
    }));
  },

  async getConversations(userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId ?? user?.id;
    if (!uid) return [];
    const { data, error } = await supabase.from('conversations').select('*').contains('participant_ids', [uid]);
    if (error) throw error;
    return (data ?? []) as unknown as import('@careerlink/shared').Conversation[];
  },

  async getMessages(conversationId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      senderId: String(row.sender_id),
      receiverId: '',
      content: String(row.content),
      timestamp: String(row.created_at),
      read: Boolean(row.read),
    }));
  },

  async getSavedJobs() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
    const ids = (data ?? []).map((r) => String(r.job_id));
    const jobs = await this.getJobs();
    return jobs.filter((j) => ids.includes(j.id));
  },

  async getSavedCompanies() {
    return [];
  },

  async getSettings() {
    return { emailNotifications: true, pushNotifications: true, profilePublic: true };
  },

  async getInternshipRequests() { return []; },
  async getWeeklyReports() { return []; },
  async getAuditLogs() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      actorId: String(row.actor_id ?? ''),
      action: String(row.action),
      entityType: String(row.entity_type ?? ''),
      entityId: String(row.entity_id ?? ''),
      createdAt: String(row.created_at),
    }));
  },
  async getTalentPools() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('talent_pools')
      .select('*, talent_pool_members(user_id)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const members = (row.talent_pool_members as { user_id: string }[] | null) ?? [];
      return {
        id: String(row.id),
        companyId: String(row.company_id),
        name: String(row.name),
        description: String(row.description ?? ''),
        membersCount: members.length,
        memberIds: members.map((m) => String(m.user_id)),
        createdAt: String(row.created_at),
      };
    });
  },
  async getPartnerships() { return []; },
  async getAssessments() { return []; },

  async getMarketAnalysis() {
    const jobs = await this.getJobs();
    const internships = await this.getInternships();
    return analyzeJobMarket(jobs, internships);
  },

  async search(query) {
    const jobs = (await this.getJobs()).filter((j) => j.title.includes(query) || j.company.name.includes(query));
    const companies = (await this.getCompanies()).filter((c) => c.name.includes(query));
    return { jobs, companies };
  },

  async apply(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { data, error } = await supabase.from('applications').insert({
      student_id: user.id,
      job_id: input.jobId ?? null,
      internship_id: input.internshipId ?? null,
      company_id: input.jobId ? (await this.getJobById(input.jobId))?.companyId : (await this.getInternshipById(input.internshipId!))?.companyId,
      cover_letter: input.coverNote,
      status: 'applied',
    }).select().single();
    if (error) throw error;
    return mapApplication(data);
  },

  async updateApplicationStatus(id, status) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return mapApplication(data);
  },

  async createJob(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('jobs').insert({
      company_id: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      skills: input.skills,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      location: input.location,
      work_type: input.workType,
      experience_level: input.experienceLevel,
      status: 'published',
    }).select().single();
    if (error) throw error;
    return mapJob(data);
  },

  async enrollCourse(courseId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { error } = await supabase.from('course_enrollments').insert({ course_id: courseId, student_id: user.id });
    if (error) throw error;
    return { enrolled: true };
  },

  async bookMentorship(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { data, error } = await supabase.from('mentorship_sessions').insert({
      mentor_id: input.mentorId,
      mentee_id: user.id,
      topic: input.topic,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes ?? 45,
      status: 'requested',
    }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      mentorId: String(data.mentor_id),
      menteeId: String(data.mentee_id),
      topic: String(data.topic),
      scheduledAt: String(data.scheduled_at),
      durationMinutes: Number(data.duration_minutes),
      status: data.status as import('@careerlink/shared').SessionStatus,
    };
  },

  async sendMessage(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: input.conversationId,
      sender_id: user.id,
      content: input.content,
    }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      senderId: String(data.sender_id),
      receiverId: '',
      content: String(data.content),
      timestamp: String(data.created_at),
      read: false,
    };
  },

  async markNotificationRead(id) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },

  async saveJob(jobId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    await supabase.from('saved_jobs').upsert({ user_id: user.id, job_id: jobId });
  },

  async unsaveJob(jobId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
  },

  async saveCompany(_companyId) { return; },

  async updateSettings(settings) {
    return { emailNotifications: settings.emailNotifications ?? true, pushNotifications: settings.pushNotifications ?? true, profilePublic: settings.profilePublic ?? true };
  },

  async registerForEvent(eventId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (error || !data) throw new Error('NOT_FOUND');
    await supabase.from('events').update({ registered_count: Number(data.registered_count ?? 0) + 1 }).eq('id', eventId);
    return (await this.getEvents()).find((e) => e.id === eventId)!;
  },

  async submitWeeklyReport(input) {
    throw new Error('WEEKLY_REPORTS_TABLE_PENDING');
  },

  async verifyEntity(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    if (input.entityType === 'company') {
      await supabase.from('companies').update({
        verified: input.status === 'approved',
      }).eq('id', input.entityId);
    }
    await supabase.from('audit_logs').insert({
      action: `verify_${input.status}`,
      entity_type: input.entityType,
      entity_id: input.entityId,
    });
    return { success: true };
  },

  async markConversationRead(_conversationId) { return; },

  async createTalentPool(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const { data, error } = await supabase.from('talent_pools').insert({
      company_id: input.companyId,
      owner_id: user.id,
      name: input.name,
      description: input.description,
    }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      companyId: String(data.company_id),
      name: String(data.name),
      description: String(data.description ?? ''),
      membersCount: 0,
      memberIds: [],
      createdAt: String(data.created_at),
    };
  },

  async addToTalentPool(poolId, userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('talent_pool_members')
      .upsert({ pool_id: poolId, user_id: userId });
    if (error) throw error;
    const pools = await this.getTalentPools();
    return pools.find((p) => p.id === poolId)!;
  },

  async removeFromTalentPool(poolId, userId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('talent_pool_members')
      .delete()
      .eq('pool_id', poolId)
      .eq('user_id', userId);
    if (error) throw error;
    const pools = await this.getTalentPools();
    return pools.find((p) => p.id === poolId)!;
  },
};
