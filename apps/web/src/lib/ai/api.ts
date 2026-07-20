import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function requireAiSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 }) };
  }
  return { session, error: null };
}

export function aiErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "UNKNOWN";
  const map: Record<string, { status: number; error: string }> = {
    CV_TEXT_REQUIRED: { status: 400, error: "نص السيرة مطلوب" },
    GOAL_REQUIRED: { status: 400, error: "الهدف المهني مطلوب" },
    JOB_TITLE_REQUIRED: { status: 400, error: "المسمى الوظيفي مطلوب" },
    ANSWER_REQUIRED: { status: 400, error: "الإجابة مطلوبة" },
    TARGET_ROLE_REQUIRED: { status: 400, error: "الدور المستهدف مطلوب" },
  };
  const mapped = map[message];
  if (mapped) {
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
  return NextResponse.json({ error: "حدث خطأ في معالجة الطلب" }, { status: 500 });
}
