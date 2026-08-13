import { dataResponse, getRepo } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { mapFeedPost } from '@/backend/data/mappers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return dataResponse(async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, profiles:author_id(full_name, avatar_url)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const posts = await getRepo().getFeedPosts().catch(() => []);
    const liked = posts.find((p) => p.id === id)?.likedByMe ?? false;
    return mapFeedPost({ ...data, liked_by_me: liked });
  });
}
