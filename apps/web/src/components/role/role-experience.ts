import type { UserRole } from "@careerlink/shared";
import { ROLE_EXPERIENCE_BASE, type RoleScenario } from "@careerlink/shared";

type TFn = (ar: string, en: string) => string;

const identity: TFn = (ar) => ar;

export interface RoleExperience {
  id: UserRole;
  label: string;
  tagline: string;
  mantra: string;
  gradient: string;
  accent: string;
  glow: string;
  icon: string;
  primaryFocus: string[];
  scenarios: { title: string; description: string; href: string; cta: string }[];
  emptyStates: Record<string, { title: string; description: string }>;
}

interface RoleExperienceEn {
  label: string;
  tagline: string;
  mantra: string;
  primaryFocus: string[];
  scenarios: { title: string; description: string; cta: string }[];
  emptyStates: Record<string, { title: string; description: string }>;
}

const ROLE_EXPERIENCE_EN: Record<UserRole, RoleExperienceEn> = {
  student: {
    label: "Student",
    tagline: "From university to your first opportunity",
    mantra: "Every step builds your professional identity",
    primaryFocus: ["Profile completion", "Matching opportunities", "Missing skills", "Suggested courses"],
    scenarios: [
      {
        title: "First application",
        description: "Apply to an internship that fits your major and skills",
        cta: "Explore internships",
      },
      {
        title: "Close the gap",
        description: "Discover your missing skills and learning plan",
        cta: "Analyze your path",
      },
      {
        title: "Mentoring session",
        description: "Book with a career mentor before your first interview",
        cta: "Book a session",
      },
    ],
    emptyStates: {
      applications: { title: "You haven't applied yet", description: "Start with your first opportunity — an internship or project opens the door" },
      jobs: { title: "No saved opportunities", description: "Save relevant opportunities and review them later" },
    },
  },
  graduate: {
    label: "Graduate",
    tagline: "From graduation to your first job",
    mantra: "Your experience deserves to be told professionally",
    primaryFocus: ["Employment status", "Active applications", "Interviews", "Alumni network"],
    scenarios: [
      {
        title: "Update status",
        description: "Let your university know if you've been hired — it matters to future graduates",
        cta: "Update your status",
      },
      {
        title: "CV review",
        description: "Analyze your resume before every important application",
        cta: "Analyze resume",
      },
      {
        title: "Alumni community",
        description: "Connect with graduates in your field",
        cta: "Join the community",
      },
    ],
    emptyStates: {
      applications: { title: "Start your job search", description: "A successful graduate applies smartly — not randomly" },
    },
  },
  company: {
    label: "Company",
    tagline: "Build your team from Palestinian talent",
    mantra: "The right candidate is closer than you think",
    primaryFocus: ["Published openings", "New applicants", "Interviews", "Acceptance rate"],
    scenarios: [
      {
        title: "Post an opening",
        description: "A job or internship — the system recommends candidates automatically",
        cta: "Post now",
      },
      {
        title: "Quick review",
        description: "Review applicants and rank them by match",
        cta: "Applicants",
      },
      {
        title: "University partnership",
        description: "Connect your company with a university to reach qualified students",
        cta: "Request partnership",
      },
    ],
    emptyStates: {
      applicants: { title: "No applicants yet", description: "Post your first opening or refine the required skills description" },
    },
  },
  hr: {
    label: "HR",
    tagline: "Your hiring funnel at a glance",
    mantra: "A fast decision — the right candidate",
    primaryFocus: ["Pending review", "Today's interviews", "Assessments", "Decisions"],
    scenarios: [
      {
        title: "Morning review",
        description: "15 minutes to organize new applicants",
        cta: "Start reviewing",
      },
      {
        title: "Schedule interview",
        description: "Send an invite in one click with the meeting link",
        cta: "Schedule interview",
      },
      {
        title: "Technical assessment",
        description: "Send a task to shortlisted candidates",
        cta: "Create assessment",
      },
    ],
    emptyStates: {
      pipeline: { title: "The funnel is empty", description: "Cards will appear here when the first applicant arrives" },
    },
  },
  university: {
    label: "University",
    tagline: "A complete view of your students and graduates",
    mantra: "Accurate data — smart academic decisions",
    primaryFocus: ["Active students", "Internships", "Skill gaps", "Employment rate"],
    scenarios: [
      {
        title: "Approve internship",
        description: "Approve a student's internship request at a partner company",
        cta: "Pending requests",
      },
      {
        title: "Career day",
        description: "Organize an event and connect students with companies",
        cta: "Create event",
      },
      {
        title: "Major report",
        description: "See where graduates of each major work",
        cta: "Reports",
      },
    ],
    emptyStates: {
      internships: { title: "No internship requests", description: "Encourage students to apply through active partnerships" },
    },
  },
  trainer: {
    label: "Trainer",
    tagline: "Teach what the market needs today",
    mantra: "Your course could be a turning point in a student's life",
    primaryFocus: ["Active courses", "Enrolled students", "Pending assignments", "Rating"],
    scenarios: [
      {
        title: "New course",
        description: "Build a path of lessons, quizzes, and a certificate",
        cta: "Create a course",
      },
      {
        title: "Quick grading",
        description: "Review pending assignments from your phone",
        cta: "Assignments",
      },
      {
        title: "Live session",
        description: "Schedule a live session with your students",
        cta: "Schedule",
      },
    ],
    emptyStates: {
      courses: { title: "No courses yet", description: "Your first course can be linked to internship opportunities at companies" },
    },
  },
  mentor: {
    label: "Mentor",
    tagline: "Guide the next generation with your experience",
    mantra: "A single session can change an entire path",
    primaryFocus: ["New requests", "Upcoming sessions", "Rating", "Notes"],
    scenarios: [
      {
        title: "Session request",
        description: "Accept or decline — the student is waiting for your reply",
        cta: "Requests",
      },
      {
        title: "After the session",
        description: "Write clear feedback and action items",
        cta: "Notes",
      },
      {
        title: "Your availability",
        description: "Update your availability so students can book",
        cta: "Calendar",
      },
    ],
    emptyStates: {
      sessions: { title: "No scheduled sessions", description: "Update your availability to receive new requests" },
    },
  },
  admin: {
    label: "System Administration",
    tagline: "The entire ecosystem in your hands",
    mantra: "Platform quality starts here",
    primaryFocus: ["Pending approvals", "Reports", "Platform growth", "System health"],
    scenarios: [
      {
        title: "Approve company",
        description: "Verify documents before enabling job posting",
        cta: "Waiting list",
      },
      {
        title: "Content moderation",
        description: "Review reports and take action",
        cta: "Reports",
      },
      {
        title: "Growth analysis",
        description: "See user and job trends",
        cta: "Reports",
      },
    ],
    emptyStates: {
      verification: { title: "No pending approvals", description: "All new accounts have been reviewed" },
    },
  },
};

const ACCENT_MAP: Record<string, { gradient: string; accent: string; glow: string }> = {
  blue: { gradient: "from-blue-600/20 via-cyan-500/10 to-transparent", accent: "text-blue", glow: "bg-blue/15" },
  emerald: { gradient: "from-emerald-600/20 via-blue-500/10 to-transparent", accent: "text-emerald", glow: "bg-emerald/15" },
  purple: { gradient: "from-purple-600/20 via-blue-500/10 to-transparent", accent: "text-purple", glow: "bg-purple/15" },
  amber: { gradient: "from-amber-600/20 via-orange-500/10 to-transparent", accent: "text-amber", glow: "bg-amber/15" },
  cyan: { gradient: "from-cyan-600/20 via-blue-500/10 to-transparent", accent: "text-cyan", glow: "bg-cyan/15" },
  violet: { gradient: "from-violet-600/20 via-purple-500/10 to-transparent", accent: "text-purple", glow: "bg-violet/15" },
  pink: { gradient: "from-pink-600/20 via-purple-500/10 to-transparent", accent: "text-purple", glow: "bg-pink/15" },
  red: { gradient: "from-red-600/15 via-purple-500/10 to-transparent", accent: "text-red-400", glow: "bg-red-500/10" },
};

function toWebExperience(role: UserRole, t: TFn): RoleExperience {
  const base = ROLE_EXPERIENCE_BASE[role] ?? ROLE_EXPERIENCE_BASE.student;
  const en = ROLE_EXPERIENCE_EN[role] ?? ROLE_EXPERIENCE_EN.student;
  const styles = ACCENT_MAP[base.accentKey] ?? ACCENT_MAP.blue;
  return {
    id: base.id,
    label: t(base.label, en.label),
    tagline: t(base.tagline, en.tagline),
    mantra: t(base.mantra, en.mantra),
    gradient: styles.gradient,
    accent: styles.accent,
    glow: styles.glow,
    icon: base.icon,
    primaryFocus: base.primaryFocus.map((focus, i) => t(focus, en.primaryFocus[i] ?? focus)),
    scenarios: base.scenarios.map((s: RoleScenario, i) => ({
      title: t(s.title, en.scenarios[i]?.title ?? s.title),
      description: t(s.description, en.scenarios[i]?.description ?? s.description),
      href: s.webHref,
      cta: t(s.cta, en.scenarios[i]?.cta ?? s.cta),
    })),
    emptyStates: Object.fromEntries(
      Object.entries(base.emptyStates).map(([key, value]) => {
        const enState = en.emptyStates[key];
        return [
          key,
          {
            title: t(value.title, enState?.title ?? value.title),
            description: t(value.description, enState?.description ?? value.description),
          },
        ];
      })
    ),
  };
}

export function getRoleExperience(role: UserRole, t: TFn = identity): RoleExperience {
  return toWebExperience(role, t);
}
