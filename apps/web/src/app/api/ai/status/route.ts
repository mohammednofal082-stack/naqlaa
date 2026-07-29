import { NextResponse } from "next/server";
import { getAiStatus } from "@/backend/ai/services";

export async function GET() {
  return NextResponse.json(getAiStatus());
}
