import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const id = req.nextUrl.searchParams.get('id');
    const all = await getRepo().getAssessments();
    if (!id) return all;
    return all.find((a) => a.id === id) ?? null;
  });
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
      description: body.description ? String(body.description) : undefined,
      questions: Array.isArray(body.questions) ? body.questions : undefined,
    });
  });
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('hr', 'company', 'admin');
    await requireAuth();
    const body = await req.json();
    if (!body.id) throw new Error('INVALID_INPUT');
    return getRepo().updateAssessment(String(body.id), {
      title: body.title !== undefined ? String(body.title) : undefined,
      deadline: body.deadline !== undefined ? String(body.deadline) : undefined,
      status: body.status !== undefined ? String(body.status) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
      questions: Array.isArray(body.questions) ? body.questions : undefined,
    });
  });
}
