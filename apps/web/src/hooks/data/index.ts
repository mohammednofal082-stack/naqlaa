"use client";

import { useCallback, useEffect, useState } from "react";
import { dataClient } from "@/lib/data/client";
import type {
  JobWithCompany,
  InternshipWithCompany,
  ApplicationWithDetails,
  UserProfileBundle,
  UserSettings,
} from "@/lib/data";
import type {
  Company,
  Course,
  Event,
  FeedPost,
  Notification,
  MentorshipSession,
  MentorProfile,
  AuditLog,
  ApplicationStatus,
  User,
  TalentPool,
  Partnership,
  Assessment,
  InternshipRequest,
  Conversation,
  Message,
} from "@careerlink/shared";
import type { SmartRecommendations, JobMarketAnalysis, TalentPool as TalentPoolType } from "@careerlink/shared";

interface ApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  provider: string | null;
  refetch: () => Promise<void>;
}

export function useDataApi<T>(endpoint: string): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/${endpoint}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل جلب البيانات");
      setData(json.data as T);
      setProvider(json.provider ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, provider, refetch: fetchData };
}

export const useJobs = () => useDataApi<JobWithCompany[]>("jobs");
export const useJob = (id: string) => useDataApi<JobWithCompany | null>(`jobs/${id}`);
export const useInternships = () => useDataApi<InternshipWithCompany[]>("internships");
export const useInternship = (id: string) => useDataApi<InternshipWithCompany | null>(`internships/${id}`);
export const useApplications = (scope: 'mine' | 'all' = 'mine') =>
  useDataApi<ApplicationWithDetails[]>(scope === 'all' ? 'applications?scope=all' : 'applications');
export const useAllApplications = () => useApplications('all');
export const useProfile = () => useDataApi<UserProfileBundle | null>("profile");
export const useCompanies = () => useDataApi<Company[]>("companies");
export const useCompany = (id: string) => useDataApi<Company | null>(`companies/${id}`);
export const useNotifications = () => useDataApi<Notification[]>("notifications");
export const useCourses = () => useDataApi<Course[]>("courses");
export const useFeedPosts = () => useDataApi<FeedPost[]>("feed");
export const useEvents = () => useDataApi<Event[]>("events");
export const useMentors = () => useDataApi<MentorProfile[]>("mentors");
export const useMentorshipSessions = () => useDataApi<MentorshipSession[]>("mentorship");
export const useSaved = () => useDataApi<{ jobs: JobWithCompany[]; companies: Company[] }>("saved");
export const useSettings = () => useDataApi<UserSettings>("settings");
export const useAuditLogs = () => useDataApi<AuditLog[]>("audit-logs");
export const useUsers = () => useDataApi<User[]>("users");
export const useTalentPools = () => useDataApi<TalentPool[]>("talent-pools");
export const usePartnerships = () => useDataApi<Partnership[]>("partnerships");
export const useAssessments = () => useDataApi<Assessment[]>("assessments");
export const useInternshipRequests = () => useDataApi<InternshipRequest[]>("internship-requests");
export const useConversations = () => useDataApi<Conversation[]>("conversations");
export const useMarketAnalysis = () => useDataApi<JobMarketAnalysis>("market-analysis");

export function useRecommendations(role?: string) {
  const endpoint = role ? `recommendations?role=${encodeURIComponent(role)}` : "recommendations";
  return useDataApi<SmartRecommendations>(endpoint);
}

export function useSearch(query: string) {
  const endpoint = query ? `search?q=${encodeURIComponent(query)}` : "search?q=";
  return useDataApi<{ jobs: JobWithCompany[]; companies: Company[] }>(endpoint);
}

export async function applyToJob(jobId: string, coverNote?: string) {
  return dataClient.post("applications", { jobId, coverNote });
}

export async function applyToInternship(internshipId: string, coverNote?: string) {
  return dataClient.post("applications", { internshipId, coverNote });
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return dataClient.patch(`applications/${id}`, { status });
}

export async function enrollInCourse(courseId: string) {
  return dataClient.post("courses/enroll", { courseId });
}

export async function bookMentorship(input: {
  mentorId: string;
  topic: string;
  scheduledAt: string;
  durationMinutes?: number;
}) {
  return dataClient.post("mentorship/book", input);
}

export async function registerForEvent(eventId: string) {
  return dataClient.post("events/register", { eventId });
}

export async function updateProfile(input: Record<string, unknown>) {
  return fetch("/api/data/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(async (r) => {
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    return j.data;
  });
}

export async function saveSettings(input: Partial<UserSettings>) {
  return fetch("/api/data/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(async (r) => {
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    return j.data;
  });
}

export async function verifyEntity(input: {
  entityType: "company" | "mentor" | "trainer";
  entityId: string;
  status: "approved" | "rejected";
}) {
  return dataClient.post("admin/verify", input);
}

export async function createJob(input: Record<string, unknown>) {
  return dataClient.post("jobs", input);
}

export async function createTalentPool(input: { name: string; description: string }) {
  return dataClient.post("talent-pools", input) as Promise<TalentPoolType>;
}

export async function addPoolMember(poolId: string, userId: string) {
  return dataClient.post(`talent-pools/${poolId}/members`, { userId }) as Promise<TalentPoolType>;
}

export async function removePoolMember(poolId: string, userId: string) {
  return fetch(`/api/data/talent-pools/${poolId}/members`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).then(async (r) => {
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    return j.data as TalentPoolType;
  });
}

export async function sendMessage(conversationId: string, content: string) {
  return dataClient.post("messages", { conversationId, content });
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/data/messages?conversationId=${encodeURIComponent(conversationId)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "فشل جلب الرسائل");
  return json.data as Message[];
}
