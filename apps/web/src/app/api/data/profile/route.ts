import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getProfile());
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().updateProfile(body);
  });
}
