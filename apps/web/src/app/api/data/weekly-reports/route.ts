import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getWeeklyReports());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().submitWeeklyReport({
      internshipRequestId: String(body.internshipRequestId ?? ''),
      weekNumber: Number(body.weekNumber ?? 1),
      summary: String(body.summary ?? body.title ?? ''),
      tasksCompleted: String(body.tasksCompleted ?? body.tasksDone ?? ''),
      challenges: body.challenges ? String(body.challenges) : undefined,
    });
  });
}
