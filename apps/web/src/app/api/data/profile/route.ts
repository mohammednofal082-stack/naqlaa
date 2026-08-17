import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const requestedId = req.nextUrl.searchParams.get('userId') || undefined;
    // Only the authenticated user can request their own editable profile bundle.
    // Public profiles are available via dedicated public routes if needed.
    if (requestedId && requestedId !== user.userId && user.role !== 'admin') {
      throw new Error('FORBIDDEN');
    }
    return getRepo().getProfile(requestedId || user.userId);
  });
}

export async function PUT(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().updateProfile(body);
  });
}
