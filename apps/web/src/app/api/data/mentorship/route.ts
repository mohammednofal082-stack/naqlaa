import { NextRequest } from 'next/server';
import type { SessionStatus } from '@careerlink/shared';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET() {
  return dataResponse(() => getRepo().getMentorshipSessions());
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAnyRole('mentor', 'admin');
    await requireAuth();
    const body = await req.json();
    const id = String(body.id ?? '');
    const status = body.status as SessionStatus;
    if (!id || !status) throw new Error('INVALID_INPUT');
    return getRepo().updateMentorshipStatus(id, status, {
      scheduledAt: body.scheduledAt ? String(body.scheduledAt) : undefined,
      meetingLink: body.meetingLink ? String(body.meetingLink) : undefined,
    });
  });
}
