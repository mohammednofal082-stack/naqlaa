"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { FeedPost } from "@careerlink/shared";
import { PageLayout } from "@/components/layout/page-layout";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/contexts/social-context";
import { useI18n } from "@/i18n";

export default function FeedPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const { t } = useI18n();
  const { posts, toggleLike, isPostLiked, setPostCommentCount } = useSocial();
  const [post, setPost] = useState<FeedPost | null>(posts.find((p) => p.id === postId) ?? null);
  const [loading, setLoading] = useState(!post);

  useEffect(() => {
    const fromFeed = posts.find((p) => p.id === postId);
    if (fromFeed) {
      setPost(fromFeed);
      setLoading(false);
      return;
    }
    void fetch(`/api/data/feed/${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setPost(json.data as FeedPost);
      })
      .finally(() => setLoading(false));
  }, [postId, posts]);

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto nq-page-enter">
        <Link href="/feed">
          <Button size="sm" variant="outline" className="mb-4">{t("العودة للفيد", "Back to feed")}</Button>
        </Link>
        {loading ? (
          <div className="nq-skeleton h-64 rounded-xl" />
        ) : !post ? (
          <p className="text-text-secondary">{t("المنشور غير موجود", "Post not found")}</p>
        ) : (
          <PostCard
            post={post}
            liked={isPostLiked(post.id) || post.likedByMe}
            onLike={() => toggleLike(post.id)}
            onCommentCount={setPostCommentCount}
          />
        )}
      </div>
    </PageLayout>
  );
}
