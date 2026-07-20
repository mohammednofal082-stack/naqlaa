import { NextRequest, NextResponse } from "next/server";
import { aiErrorResponse, requireAiSession } from "@/lib/ai/api";
import { analyzeSkillGap } from "@/lib/ai/services";

export async function POST(req: NextRequest) {
  const { error } = await requireAiSession();
  if (error) return error;

  try {
    const body = await req.json();
    const result = await analyzeSkillGap({
      targetRole: body.targetRole,
      skills: body.skills || [],
    });
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
