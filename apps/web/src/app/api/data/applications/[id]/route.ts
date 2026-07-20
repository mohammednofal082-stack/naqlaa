import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/lib/data/api';
import type { ApplicationStatus } from '@careerlink/shared';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return mutationResponse(async () => {
    await requireAuth();
    const { status } = await req.json();
    return getRepo().updateApplicationStatus(id, status as ApplicationStatus);
  });
}
