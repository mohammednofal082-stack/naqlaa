import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(() => getRepo().getAssessments());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('hr', 'company', 'admin');
    await requireAuth();
    const body = await req.json();
    if (!body.jobId || !body.title || !body.type) throw new Error('INVALID_INPUT');
    return getRepo().createAssessment({
      jobId: String(body.jobId),
      title: String(body.title),
      type: body.type,
      deadline: body.deadline ? String(body.deadline) : undefined,
      status: body.status ? String(body.status) : 'active',
    });
  });
}
