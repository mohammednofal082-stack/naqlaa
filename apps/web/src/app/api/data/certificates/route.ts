import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requirePermission } from '@/backend/auth/rbac';

function code() {
  return `NQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const supabase = await createSupabaseServerClient();
    const courseId = req.nextUrl.searchParams.get('courseId');
    let q = supabase.from('certificates_issued').select('*, courses(title)').order('issued_at', { ascending: false });
    if (courseId) q = q.eq('course_id', courseId);
    else q = q.eq('student_id', user.userId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const issuer = await requirePermission('course.create');
    const body = await req.json();
    const supabase = await createSupabaseServerClient();
    const certCode = code();
    const qrPayload = `NAQLAH-CERT:${certCode}`;
    const { data, error } = await supabase.from('certificates_issued').upsert({
      course_id: body.courseId,
      student_id: body.studentId,
      certificate_code: certCode,
      issued_by: issuer.userId,
      qr_payload: qrPayload,
      pdf_url: null,
    }, { onConflict: 'course_id,student_id' }).select().single();
    if (error) throw error;

    const { data: badge } = await supabase.from('badges').select('id').eq('code', 'course_done').maybeSingle();
    if (badge?.id) {
      await supabase.from('user_badges').upsert({ user_id: body.studentId, badge_id: badge.id });
    }

    return data;
  });
}
