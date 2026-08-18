import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(async () => {
    await requireAnyRole('company', 'hr', 'admin');
    return getRepo().getTalentPools();
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAnyRole('company', 'hr', 'admin');
    const body = await req.json();
    return getRepo().createTalentPool({
      name: body.name,
      description: body.description ?? '',
      companyId: body.companyId ?? user.organizationId,
    });
  });
}
