import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().bookMentorship(body);
  });
}
