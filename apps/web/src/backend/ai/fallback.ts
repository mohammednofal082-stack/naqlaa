import {
  cvAnalysis,
  careerRoadmap,
  analyzeSkillGap,
  analyzeCvLocally,
  startInterviewQuestions,
  evaluateInterviewAnswer,
} from "@careerlink/shared";
import type {
  CVAnalysis,
  CareerRoadmap,
  InterviewQuestion,
} from "@careerlink/shared";
import type {
  CareerPathRequest,
  CvAnalyzeRequest,
  InterviewEvaluateRequest,
  InterviewStartRequest,
  SkillGapRequest,
  SkillGapResponse,
} from "./types";

export function fallbackCvAnalyze(req: CvAnalyzeRequest): CVAnalysis {
  const local = analyzeCvLocally(req.cvText, req.targetRole || "Full Stack Developer");
  return {
    ...cvAnalysis,
    atsScore: local.atsScore,
    strengths: local.strengths,
    weaknesses: local.weaknesses,
    missingSkills: local.missingSkills,
    suggestions: local.suggestions,
  };
}

export function fallbackCareerPath(req: CareerPathRequest): CareerRoadmap {
  return {
    ...careerRoadmap,
    goal: req.goal || careerRoadmap.goal,
    progress: 0,
    steps: careerRoadmap.steps.map((s, i) => ({
      ...s,
      status: i === 0 ? "in-progress" : "upcoming",
    })),
  };
}

export function fallbackInterviewStart(req: InterviewStartRequest): InterviewQuestion[] {
  return startInterviewQuestions(req.jobTitle, req.level || "mid");
}

export function fallbackInterviewEvaluate(req: InterviewEvaluateRequest) {
  return evaluateInterviewAnswer(req);
}

export function fallbackSkillGap(req: SkillGapRequest): Omit<SkillGapResponse, "meta"> {
  const userSkills = req.skills.map((s) => ({ name: s.name, level: s.level }));
  const gap = analyzeSkillGap(req.targetRole, userSkills);

  return {
    matchScore: gap.matchScore,
    strong: gap.strong,
    weak: gap.weak,
    missing: gap.missing,
    courses: gap.recommendedCourses,
    projects: gap.recommendedProjects,
  };
}
