import { NextRequest } from 'next/server';
import { dataResponse, getRepo } from '@/backend/data/api';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  return dataResponse(() => getRepo().search(q));
}
