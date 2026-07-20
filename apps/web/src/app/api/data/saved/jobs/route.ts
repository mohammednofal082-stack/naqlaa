import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const { jobId } = await req.json();
    await getRepo().saveJob(jobId);
    return { saved: true };
  });
}

export async function DELETE(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const { jobId } = await req.json();
    await getRepo().unsaveJob(jobId);
    return { saved: false };
  });
}
