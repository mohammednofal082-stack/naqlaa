import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return mutationResponse(async () => {
    await requireAuth();
    const { id } = await ctx.params;
    if (!id) throw new Error('INVALID_INPUT');
    return getRepo().toggleFeedLike(id);
  });
}
