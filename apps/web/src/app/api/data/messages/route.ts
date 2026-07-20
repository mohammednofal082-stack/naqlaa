import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get('conversationId');
  if (!conversationId) {
    return dataResponse(() => getRepo().getConversations());
  }
  return dataResponse(() => getRepo().getMessages(conversationId));
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().sendMessage(body);
  });
}
