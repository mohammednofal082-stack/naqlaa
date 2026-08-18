import { dataResponse, getRepo, requireAuth } from '@/backend/data/api';

export async function GET() {
  return dataResponse(async () => {
    await requireAuth();
    return getRepo().getInternshipRequests();
  });
}
