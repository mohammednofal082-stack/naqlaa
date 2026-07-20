import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getTalentPools());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    return getRepo().createTalentPool({
      name: body.name,
      description: body.description ?? '',
      companyId: body.companyId ?? user.organizationId,
    });
  });
}
