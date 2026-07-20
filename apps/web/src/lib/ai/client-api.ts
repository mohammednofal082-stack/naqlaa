"use client";

import type {
  CareerPathRequest,
  CareerPathResponse,
  CvAnalyzeRequest,
  CvAnalyzeResponse,
  InterviewEvaluateRequest,
  InterviewEvaluateResponse,
  InterviewStartRequest,
  InterviewStartResponse,
  SkillGapRequest,
  SkillGapResponse,
} from "./types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "فشل الطلب");
  }
  return data as T;
}

export function analyzeCvClient(req: CvAnalyzeRequest) {
  return post<CvAnalyzeResponse>("/api/ai/cv-analyze", req);
}

export function generateCareerPathClient(req: CareerPathRequest) {
  return post<CareerPathResponse>("/api/ai/career-path", req);
}

export function startInterviewClient(req: InterviewStartRequest) {
  return post<InterviewStartResponse>("/api/ai/interview/start", req);
}

export function evaluateInterviewClient(req: InterviewEvaluateRequest) {
  return post<InterviewEvaluateResponse>("/api/ai/interview/evaluate", req);
}

export function analyzeSkillGapClient(req: SkillGapRequest) {
  return post<SkillGapResponse>("/api/ai/skill-gap", req);
}

export async function getAiStatusClient() {
  const res = await fetch("/api/ai/status");
  return res.json() as Promise<{ enabled: boolean; provider: string; model: string | null }>;
}
