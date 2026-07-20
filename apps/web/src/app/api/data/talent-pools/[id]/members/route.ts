import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return mutationResponse(async () => {
    await requireAuth();
    const { id } = await ctx.params;
    const body = await req.json();
    return getRepo().addToTalentPool(id, body.userId);
  });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return mutationResponse(async () => {
    await requireAuth();
    const { id } = await ctx.params;
    const body = await req.json();
    return getRepo().removeFromTalentPool(id, body.userId);
  });
}
