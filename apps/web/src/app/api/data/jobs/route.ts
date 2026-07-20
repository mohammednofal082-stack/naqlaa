import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getJobs());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().createJob(body);
  });
}
