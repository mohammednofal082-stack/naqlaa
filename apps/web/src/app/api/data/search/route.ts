import { NextRequest } from 'next/server';
import { dataResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  return dataResponse(async () => {
    await requireAuth();
    return getRepo().search(q);
  });
}
