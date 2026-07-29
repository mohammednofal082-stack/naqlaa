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
  WorkType,
  ExperienceLevel,
} from '@careerlink/shared';
import type { SmartRecommendations, JobMarketAnalysis } from '@careerlink/shared';

export type JobWithCompany = Job & { company: Company; matchPercentage?: number };
export type InternshipWithCompany = Internship & { company: Company; matchPercentage?: number };
export type ApplicationWithDetails = Application & {
  job?: Job;
  company?: Company;
  student?: User;
};

export interface ApplicationsQuery {
  userId?: string;
  scope?: 'mine' | 'all';
}

export interface UserProfileBundle {
  user: User;
  profile: StudentProfile;
  skillLevels: { skill: string; value: number }[];
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  profilePublic: boolean;
}

export interface ApplyInput {
  jobId?: string;
  internshipId?: string;
  coverNote?: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  companyId: string;
  skills: string[];
  requirements: string[];
  location: string;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
}

export interface BookMentorshipInput {
  mentorId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface UpdateProfileInput {
  headline?: string;
  about?: string;
  location?: string;
  skills?: string[];
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface WeeklyReportInput {
  internshipRequestId: string;
  weekNumber: number;
  summary: string;
  tasksCompleted: string;
  challenges?: string;
}

export interface CreateTalentPoolInput {
  name: string;
  description: string;
  companyId?: string;
}

export interface VerifyEntityInput {
  entityType: 'company' | 'mentor' | 'trainer';
  entityId: string;
  status: 'approved' | 'rejected';
}

export interface DataRepositories {
  getJobs(): Promise<JobWithCompany[]>;
  getJobById(id: string): Promise<JobWithCompany | null>;
  getInternships(): Promise<InternshipWithCompany[]>;
  getInternshipById(id: string): Promise<InternshipWithCompany | null>;
  getApplications(query?: ApplicationsQuery): Promise<ApplicationWithDetails[]>;
  getUsers(): Promise<User[]>;
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: string): Promise<Company | null>;
  getProfile(userId?: string): Promise<UserProfileBundle | null>;
  updateProfile(input: UpdateProfileInput): Promise<UserProfileBundle>;
  getNotifications(userId?: string): Promise<Notification[]>;
  getCourses(): Promise<Course[]>;
  getFeedPosts(): Promise<FeedPost[]>;
  getRecommendations(targetRole?: string): Promise<SmartRecommendations>;
  getEvents(): Promise<Event[]>;
  getMentors(): Promise<MentorProfile[]>;
  getMentorshipSessions(userId?: string): Promise<MentorshipSession[]>;
  getConversations(userId?: string): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  getSavedJobs(userId?: string): Promise<JobWithCompany[]>;
  getSavedCompanies(userId?: string): Promise<Company[]>;
  getSettings(): Promise<UserSettings>;
  getInternshipRequests(): Promise<InternshipRequest[]>;
  getWeeklyReports(): Promise<WeeklyReport[]>;
  getAuditLogs(): Promise<AuditLog[]>;
  getTalentPools(): Promise<TalentPool[]>;
  getMarketAnalysis(): Promise<JobMarketAnalysis>;
  getPartnerships(): Promise<Partnership[]>;
  getAssessments(): Promise<Assessment[]>;
  search(query: string): Promise<{ jobs: JobWithCompany[]; companies: Company[] }>;

  apply(input: ApplyInput): Promise<Application>;
  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application>;
  createJob(input: CreateJobInput): Promise<Job>;
  enrollCourse(courseId: string): Promise<{ enrolled: boolean }>;
  bookMentorship(input: BookMentorshipInput): Promise<MentorshipSession>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  markNotificationRead(id: string): Promise<void>;
  saveJob(jobId: string): Promise<void>;
  unsaveJob(jobId: string): Promise<void>;
  saveCompany(companyId: string): Promise<void>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
  registerForEvent(eventId: string): Promise<Event>;
  submitWeeklyReport(input: WeeklyReportInput): Promise<WeeklyReport>;
  verifyEntity(input: VerifyEntityInput): Promise<{ success: boolean }>;
  markConversationRead(conversationId: string): Promise<void>;
  createTalentPool(input: CreateTalentPoolInput): Promise<TalentPool>;
  addToTalentPool(poolId: string, userId: string): Promise<TalentPool>;
  removeFromTalentPool(poolId: string, userId: string): Promise<TalentPool>;
}
