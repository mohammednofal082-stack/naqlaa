import { dataResponse, getRepo } from '@/lib/data/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return dataResponse(() => getRepo().getInternshipById(id));
}
