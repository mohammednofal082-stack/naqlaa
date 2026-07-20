import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return mutationResponse(async () => {
    await requireAuth();
    await getRepo().markNotificationRead(id);
    return { read: true };
  });
}
