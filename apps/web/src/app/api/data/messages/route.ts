import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    if (!conversationId) {
      return getRepo().getConversations(user.userId);
    }
    return getRepo().getMessages(conversationId, user.userId);
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().sendMessage(body);
  });
}
