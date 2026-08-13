import { createSupabaseServerClient } from '@/backend/supabase/server';
import { isSupabaseConfigured } from '@/backend/config/env';
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

function mapAssessmentRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    title: String(row.title),
    type: row.type as 'mcq' | 'coding' | 'upload' | 'video',
    deadline: String(row.deadline ?? ''),
    status: String(row.status ?? 'active'),
    description: row.description ? String(row.description) : undefined,
    questions: Array.isArray(row.questions) ? (row.questions as { prompt: string; answer?: string; options?: string[] }[]) : [],
  };
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

    const { data: { user } } = await supabase.auth.getUser();
    const { data: skills } = user
      ? await supabase.from('user_skills').select('*').eq('user_id', user.id)
      : { data: [] as Record<string, unknown>[] };
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
    if (query?.scope === 'all' && query?.companyId) {
      q = q.eq('company_id', query.companyId);
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
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, profiles:author_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    let likedIds = new Set<string>();
    if (user?.id) {
      const { data: likes } = await supabase
        .from('feed_post_likes')
        .select('post_id')
        .eq('user_id', user.id);
      likedIds = new Set((likes ?? []).map((l) => String(l.post_id)));
    }

    return (data ?? []).map((row) =>
      mapFeedPost({
        ...row,
        liked_by_me: likedIds.has(String(row.id)),
      })
    );
  },

  async createFeedPost(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const content = String(input.content ?? '').trim();
    if (!content) throw new Error('INVALID_INPUT');

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        author_id: user.id,
        content,
        post_type: input.type ?? 'update',
        tags: input.tags ?? [],
        job_id: input.jobId ?? null,
        image_url: input.imageUrl ?? null,
        likes_count: 0,
        comments_count: 0,
      })
      .select('*, profiles:author_id(full_name, avatar_url)')
      .single();
    if (error) throw error;
    return mapFeedPost({ ...data, liked_by_me: false });
  },

  async toggleFeedLike(postId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');

    const { data: existing } = await supabase
      .from('feed_post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('feed_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('feed_post_likes').insert({
        post_id: postId,
        user_id: user.id,
      });
      if (error) throw error;
    }

    const { data: post } = await supabase
      .from('feed_posts')
      .select('likes_count')
      .eq('id', postId)
      .maybeSingle();

    return {
      liked: !existing,
      likes: Number(post?.likes_count ?? 0),
    };
  },

  async getRecommendations(targetRole) {
    const [jobs, internships, courses, mentors, profile] = await Promise.all([
      this.getJobs(),
      this.getInternships(),
      this.getCourses(),
      this.getMentors(),
      this.getProfile().catch(() => null),
    ]);
    const userSkills = profile
      ? profile.profile.skills.map((name, i) => ({
          name,
          level: profile.skillLevels[i]?.value ?? 50,
        }))
      : [];
    return getSmartRecommendations({
      targetRole: targetRole || profile?.profile.headline,
      userSkills,
      jobs,
      internships,
      courses,
      mentors,
    });
  },

  async updateProfile(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');

    const { data: current } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const headline = input.headline ?? current?.headline ?? '';
    const about = input.about ?? current?.about ?? '';
    const location = input.location ?? current?.location ?? '';
    const skills = (input.skills ?? current?.skills ?? []) as string[];
    const education = (input.education ?? current?.education ?? []) as unknown[];
    const projects = (input.projects ?? current?.projects ?? []) as unknown[];

    let completion = 0;
    if (headline) completion += 20;
    if (about && String(about).length > 20) completion += 20;
    if (location) completion += 10;
    if (skills.length >= 3) completion += 20;
    else if (skills.length > 0) completion += 10;
    if (education.length > 0) completion += 15;
    if (projects.length > 0) completion += 15;

    const patch: Record<string, unknown> = {
      profile_completion: completion,
      updated_at: new Date().toISOString(),
    };
    if (input.headline !== undefined) patch.headline = input.headline;
    if (input.about !== undefined) patch.about = input.about;
    if (input.location !== undefined) patch.location = input.location;
    if (input.skills !== undefined) patch.skills = input.skills;
    if (input.education !== undefined) patch.education = input.education;
    if (input.projects !== undefined) patch.projects = input.projects;
    if (input.experience !== undefined) patch.experience = input.experience;

    await supabase.from('student_profiles').update(patch).eq('user_id', user.id);

    if (completion >= 80) {
      const { data: badge } = await supabase.from('badges').select('id').eq('code', 'profile_80').maybeSingle();
      if (badge?.id) {
        await supabase.from('user_badges').upsert({ user_id: user.id, badge_id: badge.id });
      }
    }

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
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [uid])
      .order('last_message_at', { ascending: false });
    if (error) throw error;

    const convs = data ?? [];
    const result: import('@careerlink/shared').Conversation[] = [];
    for (const row of convs) {
      const id = String(row.id);
      const participantIds = (row.participant_ids as string[] | null)?.map(String) ?? [];
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: false })
        .limit(1);
      const last = msgs?.[0];
      const lastMessage = last
        ? {
            id: String(last.id),
            senderId: String(last.sender_id),
            receiverId: '',
            content: String(last.content),
            timestamp: String(last.created_at),
            read: Boolean(last.read),
          }
        : {
            id: `empty-${id}`,
            senderId: uid,
            receiverId: '',
            content: '',
            timestamp: String(row.created_at ?? new Date().toISOString()),
            read: true,
          };
      result.push({
        id,
        participantIds,
        lastMessage,
        unreadCount: 0,
      });
    }
    return result;
  },

  async createConversation(otherUserId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    if (!otherUserId || otherUserId === user.id) throw new Error('INVALID_INPUT');

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id]);
    const found = (existing ?? []).find((c) => {
      const ids = (c.participant_ids as string[] | null)?.map(String) ?? [];
      return ids.includes(otherUserId) && ids.includes(user.id);
    });
    if (found) {
      const mapped = await this.getConversations(user.id);
      return mapped.find((c) => c.id === String(found.id))!;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_ids: [user.id, otherUserId],
        last_message_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;

    const welcome = 'مرحباً، أود التواصل معك عبر منصة نقلة.';
    const { data: msg, error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.id,
        sender_id: user.id,
        content: welcome,
        read: true,
      })
      .select('*')
      .single();
    if (msgErr) throw msgErr;

    return {
      id: String(data.id),
      participantIds: [user.id, otherUserId],
      lastMessage: {
        id: String(msg.id),
        senderId: String(msg.sender_id),
        receiverId: otherUserId,
        content: String(msg.content),
        timestamp: String(msg.created_at),
        read: true,
      },
      unreadCount: 0,
    };
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
      content: String(row.content ?? ''),
      timestamp: String(row.created_at),
      read: Boolean(row.read),
      attachment: row.attachment_url ? String(row.attachment_url) : undefined,
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
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { emailNotifications: true, pushNotifications: true, profilePublic: true };
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
    if (!data) {
      return { emailNotifications: true, pushNotifications: true, profilePublic: true };
    }
    return {
      emailNotifications: Boolean(data.email_notifications),
      pushNotifications: Boolean(data.push_notifications),
      profilePublic: Boolean(data.profile_public),
    };
  },

  async getInternshipRequests() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('internship_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      universityId: String(row.university_id),
      companyId: String(row.company_id),
      jobId: String(row.job_id ?? row.internship_id ?? ''),
      supervisorId: row.supervisor_id ? String(row.supervisor_id) : undefined,
      status: row.status as import('@careerlink/shared').InternshipStatus,
      startDate: String(row.start_date ?? ''),
      endDate: String(row.end_date ?? ''),
    }));
  },

  async getWeeklyReports() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      internshipId: String(row.internship_request_id),
      weekNumber: Number(row.week_number),
      title: String(row.title ?? ''),
      tasksDone: String(row.tasks_done ?? ''),
      skillsUsed: (row.skills_used as string[]) ?? [],
      challenges: String(row.challenges ?? ''),
      status: row.status as 'pending' | 'approved' | 'rejected',
      submittedAt: String(row.submitted_at),
    }));
  },

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
  async getPartnerships() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      universityId: String(row.university_id),
      companyId: String(row.company_id),
      status: row.status as 'pending' | 'active' | 'expired',
      startDate: String(row.start_date),
      endDate: row.end_date ? String(row.end_date) : undefined,
    }));
  },

  async getAssessments() {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapAssessmentRow(row));
  },

  async createAssessment(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        job_id: input.jobId,
        title: input.title,
        type: input.type,
        deadline: input.deadline ?? null,
        status: input.status ?? 'active',
        description: input.description ?? null,
        questions: input.questions ?? [],
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapAssessmentRow(data);
  },

  async updateAssessment(id, input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.deadline !== undefined) patch.deadline = input.deadline;
    if (input.status !== undefined) patch.status = input.status;
    if (input.description !== undefined) patch.description = input.description;
    if (input.questions !== undefined) patch.questions = input.questions;
    const { data, error } = await supabase
      .from('assessments')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('NOT_FOUND');
    return mapAssessmentRow(data);
  },

  async getMarketAnalysis() {
    const jobs = await this.getJobs();
    const internships = await this.getInternships();
    return analyzeJobMarket(jobs, internships);
  },

  async search(query) {
    const q = query.trim().toLowerCase();
    const jobs = (await this.getJobs()).filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.name.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
    const companies = (await this.getCompanies()).filter(
      (c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    );
    const people = (await this.getUsers()).filter((u) => {
      const hay = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
    const posts = (await this.getFeedPosts()).filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (p.authorName ?? '').toLowerCase().includes(q)
    );
    return { jobs, companies, people, posts };
  },

  async apply(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');

    if (input.jobId) {
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', user.id)
        .eq('job_id', input.jobId)
        .maybeSingle();
      if (existing) throw new Error('ALREADY_APPLIED');
    }
    if (input.internshipId) {
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', user.id)
        .eq('internship_id', input.internshipId)
        .maybeSingle();
      if (existing) throw new Error('ALREADY_APPLIED');
    }

    const companyId = input.jobId
      ? (await this.getJobById(input.jobId))?.companyId
      : (await this.getInternshipById(input.internshipId!))?.companyId;
    if (!companyId) throw new Error('NOT_FOUND');

    const { data, error } = await supabase.from('applications').insert({
      student_id: user.id,
      job_id: input.jobId ?? null,
      internship_id: input.internshipId ?? null,
      company_id: companyId,
      cover_letter: input.coverNote,
      status: 'applied',
    }).select().single();
    if (error) {
      if (String(error.message).includes('duplicate') || error.code === '23505') {
        throw new Error('ALREADY_APPLIED');
      }
      throw error;
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'application-update',
      title: 'تم استلام طلبك',
      message: 'تم تقديم طلبك بنجاح',
      link: '/applications',
      read: false,
    });

    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id);
    if ((count ?? 0) <= 1) {
      const { data: badge } = await supabase.from('badges').select('id').eq('code', 'first_apply').maybeSingle();
      if (badge?.id) {
        await supabase.from('user_badges').upsert({ user_id: user.id, badge_id: badge.id });
      }
    }

    await supabase.from('application_status_history').insert({
      application_id: data.id,
      from_status: null,
      to_status: 'applied',
      changed_by: user.id,
      note: 'Application created',
    });

    return mapApplication(data);
  },

  async updateApplicationStatus(id, status, extras?: { interviewDate?: string; meetingUrl?: string }) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: prev } = await supabase.from('applications').select('*').eq('id', id).maybeSingle();
    if (!prev) throw new Error('NOT_FOUND');

    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (extras?.interviewDate) patch.interview_date = extras.interviewDate;
    else if (status === 'interview_scheduled') {
      patch.interview_date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (extras?.meetingUrl !== undefined) {
      patch.meeting_url = extras.meetingUrl || null;
    }
    const { data, error } = await supabase.from('applications').update(patch).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('application_status_history').insert({
      application_id: id,
      from_status: prev.status,
      to_status: status,
      changed_by: user?.id ?? null,
    });
    {
      const { data: student } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', prev.student_id)
        .maybeSingle();
      const { notifyUser } = await import('@/backend/notify/email');
      await notifyUser({
        userId: String(prev.student_id),
        type: 'application-update',
        title: 'تحديث على طلبك',
        message: `حالة الطلب أصبحت: ${status}`,
        link: '/applications',
        email: student?.email ? String(student.email) : undefined,
      });
    }
    await supabase.from('audit_logs').insert({
      action: 'application_status_changed',
      entity_type: 'application',
      entity_id: id,
      actor_id: user?.id ?? null,
    });

    return mapApplication(data);
  },

  async createJob(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const company = await this.getCompanyById(input.companyId);
    if (!company) throw new Error('COMPANY_NOT_FOUND');
    if (!company.verified) throw new Error('COMPANY_NOT_VERIFIED');

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

  async updateJob(id, input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.status != null) patch.status = input.status;
    if (input.title != null) patch.title = input.title;
    if (input.description != null) patch.description = input.description;
    if (input.requirements != null) patch.requirements = input.requirements;
    if (input.skills != null) patch.skills = input.skills;
    if (input.salaryMin != null) patch.salary_min = input.salaryMin;
    if (input.salaryMax != null) patch.salary_max = input.salaryMax;
    if (input.location != null) patch.location = input.location;
    if (input.workType != null) patch.work_type = input.workType;
    if (input.experienceLevel != null) patch.experience_level = input.experienceLevel;
    const { data, error } = await supabase.from('jobs').update(patch).eq('id', id).select().single();
    if (error) throw error;
    if (!data) throw new Error('NOT_FOUND');
    return mapJob(data);
  },

  async updateMentorshipStatus(id, status, extras) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = { status };
    if (extras?.scheduledAt) patch.scheduled_at = extras.scheduledAt;
    if (extras?.meetingLink) patch.meeting_link = extras.meetingLink;
    if (status === 'accepted' && !extras?.meetingLink) {
      patch.meeting_link = `https://meet.naqlah.ps/session/${id}`;
    }
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      mentorId: String(data.mentor_id),
      menteeId: String(data.mentee_id),
      topic: String(data.topic),
      scheduledAt: String(data.scheduled_at),
      durationMinutes: Number(data.duration_minutes ?? 45),
      status: data.status as import('@careerlink/shared').SessionStatus,
      meetingLink: data.meeting_link ? String(data.meeting_link) : undefined,
      feedback: data.feedback ? String(data.feedback) : undefined,
      rating: data.rating != null ? Number(data.rating) : undefined,
    };
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
      content: input.content || (input.attachment ? '📎' : ''),
      attachment_url: input.attachment ?? null,
    }).select().single();
    if (error) throw error;
    await supabase
      .from('conversations')
      .update({ last_message_at: data.created_at })
      .eq('id', input.conversationId);
    return {
      id: String(data.id),
      senderId: String(data.sender_id),
      receiverId: '',
      content: String(data.content ?? ''),
      timestamp: String(data.created_at),
      read: false,
      attachment: data.attachment_url ? String(data.attachment_url) : undefined,
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
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    const row = {
      user_id: user.id,
      email_notifications: settings.emailNotifications ?? true,
      push_notifications: settings.pushNotifications ?? true,
      profile_public: settings.profilePublic ?? true,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('user_settings').upsert(row);
    return {
      emailNotifications: row.email_notifications,
      pushNotifications: row.push_notifications,
      profilePublic: row.profile_public,
    };
  },

  async registerForEvent(eventId) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (error || !data) throw new Error('NOT_FOUND');
    let qrCode: string | undefined;
    if (user) {
      const { data: reg, error: regError } = await supabase.from('event_registrations').upsert({
        event_id: eventId,
        user_id: user.id,
      }, { onConflict: 'event_id,user_id' }).select('qr_code').single();
      if (regError) throw regError;
      qrCode = String(reg.qr_code);
    }
    await supabase.from('events').update({ registered_count: Number(data.registered_count ?? 0) + 1 }).eq('id', eventId);
    const event = (await this.getEvents()).find((e) => e.id === eventId)!;
    return { ...event, qrCode: qrCode ?? event.qrCode };
  },

  async createEvent(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('events').insert({
      organizer_id: input.organizerId || user?.id || null,
      title: input.title,
      description: input.description ?? '',
      location: input.location ?? '',
      event_date: input.startAt,
      capacity: 100,
      registered_count: 0,
      status: input.status ?? 'published',
    }).select('*').single();
    if (error) throw error;
    return {
      id: String(data.id),
      organizerType: input.organizerType ?? ('university' as const),
      organizerId: String(data.organizer_id ?? ''),
      title: String(data.title),
      type: input.type ?? ('workshop' as const),
      description: String(data.description ?? ''),
      startAt: String(data.event_date),
      endAt: input.endAt ?? String(data.event_date),
      location: String(data.location ?? ''),
      status: data.status as import('@careerlink/shared').EventStatus,
      registrationsCount: Number(data.registered_count ?? 0),
      qrCode: `NAQLAH-${String(data.id).slice(0, 8).toUpperCase()}`,
    };
  },

  async updateEvent(id, input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.location !== undefined) patch.location = input.location;
    if (input.description !== undefined) patch.description = input.description;
    const { data, error } = await supabase
      .from('events')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new Error('NOT_FOUND');
    return {
      id: String(data.id),
      organizerType: 'university' as const,
      organizerId: String(data.organizer_id ?? ''),
      title: String(data.title),
      type: 'workshop' as const,
      description: String(data.description ?? ''),
      startAt: String(data.event_date),
      endAt: String(data.event_date),
      location: String(data.location ?? ''),
      status: data.status as import('@careerlink/shared').EventStatus,
      registrationsCount: Number(data.registered_count ?? 0),
      qrCode: `NAQLAH-${String(data.id).slice(0, 8).toUpperCase()}`,
    };
  },

  async createPartnership(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('partnerships').insert({
      university_id: input.universityId,
      company_id: input.companyId,
      status: input.status ?? 'pending',
      start_date: input.startDate ?? new Date().toISOString().split('T')[0],
      end_date: input.endDate ?? null,
    }).select('*').single();
    if (error) throw error;
    return {
      id: String(data.id),
      universityId: String(data.university_id),
      companyId: String(data.company_id),
      status: data.status as 'pending' | 'active' | 'expired',
      startDate: String(data.start_date),
      endDate: data.end_date ? String(data.end_date) : undefined,
    };
  },

  async submitWeeklyReport(input) {
    assertSupabase();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('weekly_reports').insert({
      internship_request_id: input.internshipRequestId,
      week_number: input.weekNumber,
      title: input.summary || `Week ${input.weekNumber}`,
      tasks_done: input.tasksCompleted,
      challenges: input.challenges ?? '',
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      internshipId: String(data.internship_request_id),
      weekNumber: Number(data.week_number),
      title: String(data.title ?? ''),
      tasksDone: String(data.tasks_done ?? ''),
      skillsUsed: (data.skills_used as string[]) ?? [],
      challenges: String(data.challenges ?? ''),
      status: data.status as 'pending' | 'approved' | 'rejected',
      submittedAt: String(data.submitted_at),
    };
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
