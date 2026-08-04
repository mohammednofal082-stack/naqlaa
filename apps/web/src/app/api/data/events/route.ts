import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getEvents());
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (!body.title || !body.startAt) throw new Error('INVALID_INPUT');
    return getRepo().createEvent({
      title: String(body.title),
      description: body.description ? String(body.description) : undefined,
      location: body.location ? String(body.location) : undefined,
      startAt: String(body.startAt),
      endAt: body.endAt ? String(body.endAt) : undefined,
      type: body.type,
      organizerType: body.organizerType,
      organizerId: body.organizerId ? String(body.organizerId) : undefined,
      status: body.status,
    });
  });
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (!body.id) throw new Error('INVALID_INPUT');
    return getRepo().updateEvent(String(body.id), {
      title: body.title !== undefined ? String(body.title) : undefined,
      location: body.location !== undefined ? String(body.location) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
    });
  });
}
