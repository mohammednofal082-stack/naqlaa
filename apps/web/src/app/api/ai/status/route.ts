import { NextResponse } from "next/server";
import { getAiStatus } from "@/lib/ai/services";

export async function GET() {
  return NextResponse.json(getAiStatus());
}
