import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return dataResponse(async () => {
    await requireAuth();
    const { id } = await ctx.params;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('feed_post_comments')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const profile = row.profiles as { full_name?: string; avatar_url?: string } | null;
      return {
        id: String(row.id),
        postId: String(row.post_id),
        userId: String(row.user_id),
        content: String(row.content),
        createdAt: String(row.created_at),
        authorName: profile?.full_name ? String(profile.full_name) : undefined,
        authorAvatar: profile?.avatar_url ? String(profile.avatar_url) : undefined,
      };
    });
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const { id } = await ctx.params;
    const body = await req.json();
    const content = String(body.content ?? '').trim();
    if (!content) throw new Error('INVALID_INPUT');

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('feed_post_comments')
      .insert({
        post_id: id,
        user_id: user.userId,
        content,
      })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single();
    if (error) throw error;

    const profile = data.profiles as { full_name?: string; avatar_url?: string } | null;
    return {
      id: String(data.id),
      postId: String(data.post_id),
      userId: String(data.user_id),
      content: String(data.content),
      createdAt: String(data.created_at),
      authorName: profile?.full_name ? String(profile.full_name) : user.fullName,
      authorAvatar: profile?.avatar_url ? String(profile.avatar_url) : user.avatar,
    };
  });
}
