export type UserRole =
  | 'student'
  | 'graduate'
  | 'company'
  | 'hr'
  | 'university'
  | 'trainer'
  | 'mentor'
  | 'admin';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'needs_info';

export type WorkType = 'remote' | 'hybrid' | 'on-site';

export type JobType = 'internship' | 'job' | 'part-time' | 'volunteer';

export type ExperienceLevel =
  | 'student'
  | 'fresh-graduate'
  | 'junior'
  | 'mid-level'
  | 'senior';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'assessment_required'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type InternshipStatus =
  | 'requested'
  | 'university_approved'
  | 'company_accepted'
  | 'in_progress'
  | 'reports_pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type SessionStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type CourseStatus = 'draft' | 'pending_approval' | 'published' | 'closed' | 'archived';

export type EventStatus = 'draft' | 'published' | 'registration_closed' | 'completed' | 'cancelled';

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roles: UserRole[];
  status: UserStatus;
  emailVerified: boolean;
  phone?: string;
  avatar: string;
  organizationId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  avatar: string;
  createdAt: string;
  status?: UserStatus;
}

export interface Permission {
  code: string;
  module: string;
  name: string;
}

export interface Education {
  university: string;
  major: string;
  degree: string;
  gpa?: number;
  startYear: number;
  endYear: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
}

export interface StudentProfile {
  userId: string;
  headline: string;
  location: string;
  about: string;
  coverPhoto: string;
  university: string;
  universityId: string;
  department: string;
  departmentId: string;
  major: string;
  graduationYear: number;
  studyYear: number;
  studentNumber: string;
  education: Education[];
  skills: string[];
  experience: Experience[];
  certifications: Certification[];
  projects: Project[];
  resumeUrl?: string;
  profileCompletion: number;
  connections: number;
  followers: number;
  employmentStatus?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  logo: string;
  coverImage: string;
  industry: string;
  location: string;
  website: string;
  about: string;
  employees: number;
  followers: number;
  activeJobs: number;
  verified: boolean;
  verificationStatus: VerificationStatus;
  founded: number;
}

export interface University {
  id: string;
  name: string;
  city: string;
  logo: string;
  website: string;
  contactEmail: string;
  studentsCount: number;
  graduatesCount: number;
  partnershipsCount: number;
}

export interface Department {
  id: string;
  universityId: string;
  collegeId: string;
  name: string;
  code: string;
  degreeType: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  workType: WorkType;
  jobType?: JobType;
  experienceLevel: ExperienceLevel;
  skills: string[];
  seats?: number;
  deadline?: string;
  postedAt: string;
  applicants: number;
  status?: 'draft' | 'published' | 'closed' | 'archived';
  matchPercentage?: number;
  saved?: boolean;
}

export interface Internship {
  id: string;
  companyId: string;
  title: string;
  description: string;
  duration: string;
  paid: boolean;
  salary?: number;
  requirements: string[];
  location: string;
  workType: WorkType;
  trainToHire: boolean;
  postedAt: string;
  applicants: number;
  matchPercentage?: number;
}

export interface Application {
  id: string;
  jobId: string;
  internshipId?: string;
  studentId: string;
  companyId: string;
  status: ApplicationStatus;
  matchScore?: number;
  appliedAt: string;
  interviewDate?: string;
  notes?: string;
  coverNote?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedBy: string;
  note?: string;
  changedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachment?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: Message;
  unreadCount: number;
  subject?: string;
}

export type FeedPostType = 'update' | 'job' | 'achievement' | 'event' | 'article';

export interface FeedPost {
  id: string;
  authorId: string;
  authorType: 'user' | 'company' | 'university';
  content: string;
  type: FeedPostType;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  jobId?: string;
  eventId?: string;
}

export type NotificationType =
  | 'job-recommendation'
  | 'message'
  | 'interview'
  | 'application-update'
  | 'company-update'
  | 'course'
  | 'mentorship'
  | 'internship'
  | 'event'
  | 'system'
  | 'verification';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface CVAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface SkillAnalysis {
  skill: string;
  value: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CareerRoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  duration: string;
  resources: string[];
}

export interface CareerRoadmap {
  goal: string;
  steps: CareerRoadmapStep[];
  estimatedDuration: string;
  progress: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'hr' | 'behavioral';
  answer?: string;
  score?: number;
  feedback?: string;
}

export interface InterviewSession {
  id: string;
  jobTitle: string;
  questions: InterviewQuestion[];
  overallScore: number;
  completedAt?: string;
}

export interface Course {
  id: string;
  trainerId: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  modulesCount: number;
  enrolledCount: number;
  rating: number;
  status: CourseStatus;
  certificateEnabled: boolean;
  progress?: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  lessonsCount: number;
  orderIndex: number;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  meetingLink?: string;
  feedback?: string;
  rating?: number;
}

export interface MentorProfile {
  userId: string;
  expertiseArea: string;
  currentTitle: string;
  experienceYears: number;
  bio: string;
  verified: boolean;
  rating: number;
  sessionsCount: number;
}

export interface TrainerProfile {
  userId: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  verified: boolean;
  rating: number;
  coursesCount: number;
}

export interface InternshipRequest {
  id: string;
  studentId: string;
  universityId: string;
  companyId: string;
  jobId: string;
  supervisorId?: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
}

export interface WeeklyReport {
  id: string;
  internshipId: string;
  weekNumber: number;
  title: string;
  tasksDone: string;
  skillsUsed: string[];
  challenges: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Event {
  id: string;
  organizerType: 'university' | 'company';
  organizerId: string;
  title: string;
  type: 'career_day' | 'workshop' | 'hackathon' | 'webinar';
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  status: EventStatus;
  registrationsCount: number;
  qrCode?: string;
}

export interface TalentPool {
  id: string;
  companyId: string;
  name: string;
  description: string;
  membersCount: number;
  memberIds?: string[];
  createdAt?: string;
}

export interface Partnership {
  id: string;
  universityId: string;
  companyId: string;
  status: 'pending' | 'active' | 'expired';
  startDate: string;
  endDate?: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  type: 'mcq' | 'coding' | 'upload' | 'video';
  deadline: string;
  status: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  revenue: number;
  monthlyGrowth: number;
}

export interface DashboardStats {
  recommendedJobs: number;
  applications: number;
  upcomingInterviews: number;
  newMessages: number;
  profileCompletion: number;
}

export interface CompanyDashboardStats {
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  hired: number;
  views: number;
}

export interface UniversityDashboardStats {
  totalStudents: number;
  totalGraduates: number;
  activeInternships: number;
  employmentRate: number;
  partnerships: number;
  skillGaps: number;
}

export interface PlatformStats {
  students: number;
  companies: number;
  jobs: number;
  internships: number;
  universities: number;
  courses: number;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'طالب',
  graduate: 'خريج',
  company: 'شركة',
  hr: 'موارد بشرية',
  university: 'جامعة',
  trainer: 'مدرب',
  mentor: 'مرشد مهني',
  admin: 'مدير النظام',
};

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  student: '/dashboard/student',
  graduate: '/dashboard/graduate',
  company: '/dashboard/company',
  hr: '/dashboard/hr',
  university: '/dashboard/university',
  trainer: '/dashboard/trainer',
  mentor: '/dashboard/mentor',
  admin: '/dashboard/admin',
};
