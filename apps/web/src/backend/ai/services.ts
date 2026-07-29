import type { CVAnalysis, CareerRoadmap, InterviewQuestion } from "@careerlink/shared";
import { chatJson, getAiModel, getAiProvider, isAiEnabled } from "./client";
import {
  fallbackCareerPath,
  fallbackCvAnalyze,
  fallbackInterviewEvaluate,
  fallbackInterviewStart,
  fallbackSkillGap,
} from "./fallback";
import {
  CAREER_PATH_SYSTEM,
  CV_ANALYZE_SYSTEM,
  INTERVIEW_EVALUATE_SYSTEM,
  INTERVIEW_START_SYSTEM,
  SKILL_GAP_SYSTEM,
} from "./prompts";
import type {
  AiMeta,
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

function meta(model?: string): AiMeta {
  const provider = getAiProvider();
  return { provider, model: provider === "openai" ? model : undefined };
}

function parseCvAnalysis(raw: unknown): CVAnalysis {
  const o = raw as Record<string, unknown>;
  return {
    atsScore: Number(o.atsScore) || 70,
    strengths: Array.isArray(o.strengths) ? o.strengths.map(String) : [],
    weaknesses: Array.isArray(o.weaknesses) ? o.weaknesses.map(String) : [],
    missingSkills: Array.isArray(o.missingSkills) ? o.missingSkills.map(String) : [],
    suggestions: Array.isArray(o.suggestions) ? o.suggestions.map(String) : [],
  };
}

function parseCareerRoadmap(raw: unknown): CareerRoadmap {
  const o = raw as Record<string, unknown>;
  const steps = Array.isArray(o.steps) ? o.steps : [];
  return {
    goal: String(o.goal || ""),
    estimatedDuration: String(o.estimatedDuration || "6-12 شهر"),
    progress: Number(o.progress) || 0,
    steps: steps.map((s, i) => {
      const step = s as Record<string, unknown>;
      return {
        id: String(step.id || `step-${i + 1}`),
        title: String(step.title || ""),
        description: String(step.description || ""),
        status: (["completed", "in-progress", "upcoming"].includes(String(step.status))
          ? step.status
          : "upcoming") as CareerRoadmap["steps"][0]["status"],
        duration: String(step.duration || ""),
        resources: Array.isArray(step.resources) ? step.resources.map(String) : [],
      };
    }),
  };
}

function parseQuestions(raw: unknown): InterviewQuestion[] {
  const o = raw as Record<string, unknown>;
  const list = Array.isArray(o.questions) ? o.questions : [];
  return list.map((q, i) => {
    const item = q as Record<string, unknown>;
    return {
      id: String(item.id || `q-${i + 1}`),
      question: String(item.question || ""),
      type: (["technical", "hr", "behavioral"].includes(String(item.type))
        ? item.type
        : "technical") as InterviewQuestion["type"],
    };
  });
}

export async function analyzeCv(req: CvAnalyzeRequest): Promise<CvAnalyzeResponse> {
  if (!req.cvText?.trim()) {
    throw new Error("CV_TEXT_REQUIRED");
  }

  if (!isAiEnabled()) {
    return { analysis: fallbackCvAnalyze(req), meta: meta() };
  }

  try {
    const user = `الدور المستهدف: ${req.targetRole || "غير محدد"}\n\nنص السيرة:\n${req.cvText.slice(0, 12000)}`;
    const { data, model } = await chatJson(CV_ANALYZE_SYSTEM, user, parseCvAnalysis);
    return { analysis: data, meta: meta(model) };
  } catch {
    return { analysis: fallbackCvAnalyze(req), meta: { provider: "fallback" } };
  }
}

export async function generateCareerPath(req: CareerPathRequest): Promise<CareerPathResponse> {
  if (!req.goal?.trim()) {
    throw new Error("GOAL_REQUIRED");
  }

  if (!isAiEnabled()) {
    return { roadmap: fallbackCareerPath(req), meta: meta() };
  }

  try {
    const user = `الهدف: ${req.goal}\nالمستوى: ${req.experienceLevel || "مبتدئ"}\nالمهارات الحالية: ${(req.currentSkills || []).join("، ") || "غير محددة"}`;
    const { data, model } = await chatJson(CAREER_PATH_SYSTEM, user, parseCareerRoadmap);
    return { roadmap: data, meta: meta(model) };
  } catch {
    return { roadmap: fallbackCareerPath(req), meta: { provider: "fallback" } };
  }
}

export async function startInterview(req: InterviewStartRequest): Promise<InterviewStartResponse> {
  if (!req.jobTitle?.trim()) {
    throw new Error("JOB_TITLE_REQUIRED");
  }

  if (!isAiEnabled()) {
    return { questions: fallbackInterviewStart(req), meta: meta() };
  }

  try {
    const user = `المسمى الوظيفي: ${req.jobTitle}\nالمستوى: ${req.level || "mid"}`;
    const { data, model } = await chatJson(INTERVIEW_START_SYSTEM, user, parseQuestions);
    const questions = data.length >= 3 ? data : fallbackInterviewStart(req);
    return { questions, meta: meta(model) };
  } catch {
    return { questions: fallbackInterviewStart(req), meta: { provider: "fallback" } };
  }
}

export async function evaluateInterviewAnswer(
  req: InterviewEvaluateRequest
): Promise<InterviewEvaluateResponse> {
  if (!req.answer?.trim()) {
    throw new Error("ANSWER_REQUIRED");
  }

  if (!isAiEnabled()) {
    const result = fallbackInterviewEvaluate(req);
    return { ...result, meta: meta() };
  }

  try {
    const user = `الوظيفة: ${req.jobTitle}\nنوع السؤال: ${req.type}\nالسؤال: ${req.question}\nالإجابة: ${req.answer}`;
    const { data, model } = await chatJson(INTERVIEW_EVALUATE_SYSTEM, user, (raw) => {
      const o = raw as Record<string, unknown>;
      return {
        score: Math.min(100, Math.max(0, Number(o.score) || 70)),
        feedback: String(o.feedback || ""),
        tips: Array.isArray(o.tips) ? o.tips.map(String) : [],
      };
    });
    return { ...data, meta: meta(model) };
  } catch {
    const result = fallbackInterviewEvaluate(req);
    return { ...result, meta: { provider: "fallback" } };
  }
}

export async function analyzeSkillGap(req: SkillGapRequest): Promise<SkillGapResponse> {
  if (!req.targetRole?.trim()) {
    throw new Error("TARGET_ROLE_REQUIRED");
  }

  if (!isAiEnabled()) {
    const result = fallbackSkillGap(req);
    return { ...result, meta: meta() };
  }

  try {
    const user = `الدور: ${req.targetRole}\nالمهارات: ${JSON.stringify(req.skills)}`;
    const { data, model } = await chatJson(SKILL_GAP_SYSTEM, user, (raw) => {
      const o = raw as Record<string, unknown>;
      return {
        matchScore: Number(o.matchScore) || 60,
        strong: Array.isArray(o.strong) ? o.strong.map(String) : [],
        weak: Array.isArray(o.weak) ? o.weak.map(String) : [],
        missing: Array.isArray(o.missing) ? o.missing.map(String) : [],
        courses: Array.isArray(o.courses) ? o.courses.map(String) : [],
        projects: Array.isArray(o.projects) ? o.projects.map(String) : [],
      };
    });
    return { ...data, meta: meta(model) };
  } catch {
    const result = fallbackSkillGap(req);
    return { ...result, meta: { provider: "fallback" } };
  }
}

export function getAiStatus() {
  return {
    enabled: isAiEnabled(),
    provider: getAiProvider(),
    model: isAiEnabled() ? getAiModel() : null,
  };
}
