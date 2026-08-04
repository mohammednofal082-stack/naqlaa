import { NextRequest } from 'next/server';
import type { ApplicationStatus } from '@careerlink/shared';
import { mutationResponse, getRepo } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return mutationResponse(async () => {
    await requirePermission('application.review');
    const body = await req.json();
    return getRepo().updateApplicationStatus(id, body.status as ApplicationStatus, {
      interviewDate: body.interviewDate ? String(body.interviewDate) : undefined,
      meetingUrl: body.meetingUrl !== undefined ? String(body.meetingUrl || '') : undefined,
    });
  });
}
