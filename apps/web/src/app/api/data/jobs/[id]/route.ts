import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';
import type { UpdateJobInput } from '@/backend/data/types';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return dataResponse(() => getRepo().getJobById(id));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return mutationResponse(async () => {
    await requirePermission('job.create');
    const body = (await req.json()) as UpdateJobInput;
    return getRepo().updateJob(id, {
      status: body.status,
      title: body.title,
      description: body.description,
      requirements: body.requirements,
      skills: body.skills,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      location: body.location,
      workType: body.workType,
      experienceLevel: body.experienceLevel,
    });
  });
}
