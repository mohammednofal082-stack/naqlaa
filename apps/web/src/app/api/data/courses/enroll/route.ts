import { NextRequest } from 'next/server';
import { mutationResponse, getRepo, requireAuth } from '@/lib/data/api';

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    return getRepo().enrollCourse(body.courseId);
  });
}
