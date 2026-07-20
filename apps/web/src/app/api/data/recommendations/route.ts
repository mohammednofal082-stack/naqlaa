import { NextRequest } from 'next/server';
import { dataResponse, getRepo } from '@/lib/data/api';

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get('role') ?? undefined;
  return dataResponse(() => getRepo().getRecommendations(role));
}
