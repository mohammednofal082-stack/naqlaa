import { dataResponse, getRepo } from '@/lib/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getMentorshipSessions());
}
