import { NextRequest, NextResponse } from "next/server";
import { aiErrorResponse, requireAiSession } from "@/backend/ai/api";
import { startInterview } from "@/backend/ai/services";

export async function POST(req: NextRequest) {
  const { error } = await requireAiSession();
  if (error) return error;

  try {
    const body = await req.json();
    const result = await startInterview({
      jobTitle: body.jobTitle,
      level: body.level,
    });
    return NextResponse.json(result);
  } catch (err) {
    return aiErrorResponse(err);
  }
}
