import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getConversations());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (!body.userId) throw new Error('INVALID_INPUT');
    return getRepo().createConversation(String(body.userId));
  });
}
