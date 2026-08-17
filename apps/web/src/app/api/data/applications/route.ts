import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';

const ALL_SCOPE_ROLES = new Set(['hr', 'company', 'admin', 'university']);

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const scopeParam = req.nextUrl.searchParams.get('scope');
    const scope =
      scopeParam === 'all' && ALL_SCOPE_ROLES.has(user.role) ? 'all' : 'mine';

    const companyId =
      scope === 'all' && (user.role === 'hr' || user.role === 'company')
        ? user.organizationId
        : undefined;

    return getRepo().getApplications({
      userId: user.userId,
      scope,
      companyId,
    });
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('job.apply');
    const body = await req.json();
    return getRepo().apply({
      jobId: body.jobId,
      internshipId: body.internshipId,
      coverNote: body.coverNote,
    });
  });
}
