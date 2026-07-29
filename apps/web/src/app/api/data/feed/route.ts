import { dataResponse, getRepo } from '@/backend/data/api';

export async function GET() {
  return dataResponse(() => getRepo().getFeedPosts());
}
