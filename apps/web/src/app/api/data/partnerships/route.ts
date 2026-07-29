import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getPartnerships());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (!body.universityId || !body.companyId) throw new Error('INVALID_INPUT');
    return getRepo().createPartnership({
      universityId: String(body.universityId),
      companyId: String(body.companyId),
      status: body.status,
      startDate: body.startDate ? String(body.startDate) : undefined,
      endDate: body.endDate ? String(body.endDate) : undefined,
    });
  });
}
