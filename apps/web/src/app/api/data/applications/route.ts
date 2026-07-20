import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/lib/data/api';
import { getCurrentUser } from '@/lib/auth/provider';

const ALL_SCOPE_ROLES = new Set(['hr', 'company', 'admin', 'university']);

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await getCurrentUser();
    const scopeParam = req.nextUrl.searchParams.get('scope');
    const scope =
      scopeParam === 'all' && user && ALL_SCOPE_ROLES.has(user.role) ? 'all' : 'mine';
    return getRepo().getApplications({
      userId: user?.userId,
      scope,
    });
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().apply({
      jobId: body.jobId,
      internshipId: body.internshipId,
      coverNote: body.coverNote,
    });
  });
}
