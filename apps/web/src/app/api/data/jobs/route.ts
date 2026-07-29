import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(() => getRepo().getJobs());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requirePermission('job.create');
    const body = await req.json();
    return getRepo().createJob({
      ...body,
      companyId: body.companyId || user.organizationId,
    });
  });
}
