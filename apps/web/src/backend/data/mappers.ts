import type {
  Application,
  Company,
  Course,
  FeedPost,
  Internship,
  Job,
  Notification,
  StudentProfile,
  WorkType,
  ExperienceLevel,
  ApplicationStatus,
} from '@careerlink/shared';


export function mapCompany(row: Record<string, unknown>): Company {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email ?? ''),
    industry: String(row.industry),
    about: String(row.description ?? ''),
    logo: String(row.logo_url ?? ''),
    coverImage: String(row.cover_url ?? ''),
    website: String(row.website ?? ''),
    location: String(row.location ?? ''),
    employees: Number(row.employees_count ?? 0),
    followers: Number(row.followers_count ?? 0),
    activeJobs: Number(row.jobs_count ?? 0),
    verified: Boolean(row.verified),
    verificationStatus: (row.verification_status as Company['verificationStatus']) ?? 'approved',
    founded: Number(row.founded_year ?? 0),
  };
}

export function mapJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    title: String(row.title),
    description: String(row.description),
    requirements: (row.requirements as string[]) ?? [],
    salaryMin: Number(row.salary_min ?? 0),
    salaryMax: Number(row.salary_max ?? 0),
    currency: String(row.currency ?? 'USD'),
    location: String(row.location ?? ''),
    workType: (row.work_type as WorkType) ?? 'on-site',
    jobType: row.job_type as Job['jobType'],
    experienceLevel: (row.experience_level as ExperienceLevel) ?? 'junior',
    skills: (row.skills as string[]) ?? [],
    postedAt: String(row.posted_at ?? new Date().toISOString()),
    applicants: Number(row.applicants_count ?? 0),
    status: row.status as Job['status'],
  };
}

export function mapInternship(row: Record<string, unknown>): Internship {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    title: String(row.title),
    description: String(row.description),
    duration: String(row.duration ?? ''),
    paid: Boolean(row.paid),
    salary: row.salary != null ? Number(row.salary) : undefined,
    requirements: (row.requirements as string[]) ?? [],
    location: String(row.location ?? ''),
    workType: (row.work_type as WorkType) ?? 'on-site',
    trainToHire: Boolean(row.train_to_hire),
    postedAt: String(row.posted_at ?? new Date().toISOString()),
    applicants: Number(row.applicants_count ?? 0),
  };
}

export function mapApplication(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    jobId: String(row.job_id ?? ''),
    internshipId: row.internship_id ? String(row.internship_id) : undefined,
    studentId: String(row.student_id),
    companyId: String(row.company_id),
    status: row.status as ApplicationStatus,
    matchScore: row.match_score != null ? Number(row.match_score) : undefined,
    appliedAt: String(row.applied_at),
    interviewDate: row.interview_date ? String(row.interview_date) : undefined,
    coverNote: row.cover_letter ? String(row.cover_letter) : undefined,
  };
}

export function mapStudentProfile(row: Record<string, unknown>): StudentProfile {
  return {
    userId: String(row.user_id),
    headline: String(row.headline ?? ''),
    location: String(row.location ?? ''),
    about: String(row.about ?? ''),
    coverPhoto: String(row.cover_photo_url ?? ''),
    university: String(row.university_id ?? ''),
    universityId: String(row.university_id ?? ''),
    department: String(row.department_id ?? ''),
    departmentId: String(row.department_id ?? ''),
    major: String(row.major ?? ''),
    graduationYear: Number(row.graduation_year ?? 0),
    studyYear: Number(row.study_year ?? 0),
    studentNumber: String(row.student_number ?? ''),
    education: (row.education as StudentProfile['education']) ?? [],
    skills: (row.skills as string[]) ?? [],
    experience: (row.experience as StudentProfile['experience']) ?? [],
    certifications: (row.certifications as StudentProfile['certifications']) ?? [],
    projects: (row.projects as StudentProfile['projects']) ?? [],
    profileCompletion: Number(row.profile_completion ?? 0),
    connections: Number(row.connections ?? 0),
    followers: Number(row.followers ?? 0),
  };
}

export function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    message: String(row.body ?? ''),
    type: row.type as Notification['type'],
    read: Boolean(row.read),
    timestamp: String(row.created_at),
    link: row.link ? String(row.link) : undefined,
  };
}

export function mapCourse(row: Record<string, unknown>): Course {
  return {
    id: String(row.id),
    trainerId: String(row.trainer_id ?? ''),
    title: String(row.title),
    description: String(row.description ?? ''),
    category: String(row.category ?? ''),
    level: String(row.level ?? ''),
    duration: String(row.duration ?? ''),
    modulesCount: Number(row.modules_count ?? 0),
    enrolledCount: Number(row.enrolled_count ?? 0),
    rating: Number(row.rating ?? 0),
    status: row.status as Course['status'],
    certificateEnabled: Boolean(row.certificate_enabled),
    progress: row.progress != null ? Number(row.progress) : undefined,
  };
}

export function mapFeedPost(row: Record<string, unknown>): FeedPost {
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    authorType: 'user',
    content: String(row.content),
    type: 'update',
    tags: [],
    likes: Number(row.likes_count ?? 0),
    comments: Number(row.comments_count ?? 0),
    createdAt: String(row.created_at),
  };
}
