import type { CVAnalysis, CareerRoadmap, InterviewQuestion } from "@careerlink/shared";

export type AiProvider = "openai" | "fallback";

export interface AiMeta {
  provider: AiProvider;
  model?: string;
}

export interface CvAnalyzeRequest {
  cvText: string;
  targetRole?: string;
}

export interface CvAnalyzeResponse {
  analysis: CVAnalysis;
  meta: AiMeta;
}

export interface CareerPathRequest {
  goal: string;
  currentSkills?: string[];
  experienceLevel?: string;
}

export interface CareerPathResponse {
  roadmap: CareerRoadmap;
  meta: AiMeta;
}

export interface InterviewStartRequest {
  jobTitle: string;
  level?: "junior" | "mid" | "senior";
}

export interface InterviewStartResponse {
  questions: InterviewQuestion[];
  meta: AiMeta;
}

export interface InterviewEvaluateRequest {
  question: string;
  answer: string;
  type: "technical" | "hr" | "behavioral";
  jobTitle: string;
}

export interface InterviewEvaluateResponse {
  score: number;
  feedback: string;
  tips: string[];
  meta: AiMeta;
}

export interface SkillGapRequest {
  targetRole: string;
  skills: { name: string; level: number }[];
}

export interface SkillGapResponse {
  matchScore: number;
  strong: string[];
  weak: string[];
  missing: string[];
  courses: string[];
  projects: string[];
  meta: AiMeta;
}
