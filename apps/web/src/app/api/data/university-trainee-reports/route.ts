import { dataResponse } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { PALESTINIAN_UNIVERSITIES } from '@careerlink/shared';

type LinkedProfile = { full_name?: string | null; email?: string | null } | null;
type LinkedCompany = { name?: string | null } | null;

/**
 * Returns a university-scoped trainee overview. A university account only sees
 * requests belonging to its own institution; admins may inspect all records.
 */
export async function GET() {
  return dataResponse(async () => {
    const user = await requireAnyRole('university', 'admin');
    const supabase = await createSupabaseServerClient();

    let universityIds: string[] | undefined;
    let universityName = '';

    if (user.role === 'university') {
      if (!user.organizationId) throw new Error('FORBIDDEN');
      const { data: university, error } = await supabase
        .from('universities')
        .select('id, name_en')
        .eq('id', user.organizationId)
        .single();
      if (error || !university) throw new Error('FORBIDDEN');

      universityName = String(university.name_en ?? '');
      const catalog = PALESTINIAN_UNIVERSITIES.find(
        (item) => item.name.trim().toLowerCase() === universityName.trim().toLowerCase(),
      );
      // Existing data may use the catalog id while newer data can use the
      // universities table UUID; support both during the transition.
      universityIds = [String(university.id), ...(catalog ? [catalog.id] : [])];
    }

    let requestsQuery = supabase
      .from('internship_requests')
      .select('id, student_id, university_id, company_id, status, start_date, end_date, created_at, profiles:student_id(full_name, email), companies:company_id(name)')
      .order('created_at', { ascending: false });

    if (universityIds) requestsQuery = requestsQuery.in('university_id', universityIds);
    const { data: requestRows, error: requestsError } = await requestsQuery;
    if (requestsError) throw requestsError;

    const requestIds = (requestRows ?? []).map((row) => String(row.id));
    const [reportsResult, evaluationsResult] = requestIds.length
      ? await Promise.all([
          supabase
            .from('weekly_reports')
            .select('id, internship_request_id, week_number, title, tasks_done, skills_used, challenges, status, submitted_at')
            .in('internship_request_id', requestIds)
            .order('submitted_at', { ascending: false }),
          supabase
            .from('internship_evaluations')
            .select('id, internship_request_id, evaluator_role, score, comments, approved, created_at')
            .in('internship_request_id', requestIds)
            .order('created_at', { ascending: false }),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

    if (reportsResult.error) throw reportsResult.error;
    if (evaluationsResult.error) throw evaluationsResult.error;

    const reportsByRequest = new Map<string, typeof reportsResult.data>();
    for (const report of reportsResult.data ?? []) {
      const key = String(report.internship_request_id);
      reportsByRequest.set(key, [...(reportsByRequest.get(key) ?? []), report]);
    }
    const evaluationsByRequest = new Map<string, typeof evaluationsResult.data>();
    for (const evaluation of evaluationsResult.data ?? []) {
      const key = String(evaluation.internship_request_id);
      evaluationsByRequest.set(key, [...(evaluationsByRequest.get(key) ?? []), evaluation]);
    }

    return {
      universityName,
      trainees: (requestRows ?? []).map((request) => {
        const profile = request.profiles as LinkedProfile;
        const company = request.companies as LinkedCompany;
        const reports = reportsByRequest.get(String(request.id)) ?? [];
        const evaluations = evaluationsByRequest.get(String(request.id)) ?? [];
        const latestReport = reports[0] ?? null;
        const averageScore = evaluations.length
          ? Math.round(evaluations.reduce((sum, evaluation) => sum + Number(evaluation.score ?? 0), 0) / evaluations.length)
          : null;
        return {
          internshipId: String(request.id),
          studentId: String(request.student_id),
          studentName: String(profile?.full_name ?? '—'),
          studentEmail: String(profile?.email ?? ''),
          companyName: String(company?.name ?? '—'),
          status: String(request.status),
          startDate: request.start_date ? String(request.start_date) : '',
          endDate: request.end_date ? String(request.end_date) : '',
          reportsCount: reports.length,
          latestReport: latestReport
            ? {
                weekNumber: Number(latestReport.week_number),
                title: String(latestReport.title ?? ''),
                tasksDone: String(latestReport.tasks_done ?? ''),
                skillsUsed: (latestReport.skills_used as string[]) ?? [],
                challenges: String(latestReport.challenges ?? ''),
                status: String(latestReport.status),
                submittedAt: String(latestReport.submitted_at),
              }
            : null,
          averageScore,
          evaluations: evaluations.map((evaluation) => ({
            role: String(evaluation.evaluator_role),
            score: evaluation.score == null ? null : Number(evaluation.score),
            comments: String(evaluation.comments ?? ''),
            approved: evaluation.approved ?? null,
            createdAt: String(evaluation.created_at),
          })),
        };
      }),
    };
  });
}
