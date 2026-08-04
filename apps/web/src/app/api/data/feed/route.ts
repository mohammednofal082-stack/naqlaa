import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getFeedPosts());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (!body.content || !String(body.content).trim()) throw new Error('INVALID_INPUT');
    return getRepo().createFeedPost({
      content: String(body.content),
      type: body.type,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      jobId: body.jobId ? String(body.jobId) : undefined,
    });
  });
}
