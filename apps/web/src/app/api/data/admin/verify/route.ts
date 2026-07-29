import { NextRequest } from 'next/server';
import { mutationResponse, getRepo } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('admin.verify');
    const body = await req.json();
    return getRepo().verifyEntity(body);
  });
}
