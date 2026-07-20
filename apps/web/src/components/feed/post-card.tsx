"use client";

import Link from "next/link";
import type { FeedPost } from "@careerlink/shared";
import { getPostAuthor } from "@careerlink/shared";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  liked,
  onLike,
}: {
  post: FeedPost;
  liked?: boolean;
  onLike: () => void;
}) {
  const { t } = useI18n();
  const author = getPostAuthor(post);
  const typeLabels: Record<FeedPost["type"], string> = {
    update: t("تحديث", "Update"),
    job: t("فرصة عمل", "Job Opportunity"),
    achievement: t("إنجاز", "Achievement"),
    event: t("فعالية", "Event"),
    article: t("مقال", "Article"),
  };

  return (
    <article className="nq-card nq-lift li-card p-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={author.avatar} alt={author.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-text">
            {author.name}
            <span className="nq-chip ms-2 font-normal">{typeLabels[post.type]}</span>
          </p>
          <p className="text-xs text-text-muted">{author.subtitle}</p>
          <p className="text-xs text-text-muted mt-0.5">{formatDateTime(post.createdAt)}</p>
        </div>
      </div>

      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      {post.tags.length > 0 && (
        <p className="text-xs text-text-muted mb-3">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="text-brand hover:underline me-2">
              #{tag}
            </Link>
          ))}
        </p>
      )}

      {post.jobId && (
        <Link
          href={`/jobs/${post.jobId}`}
          className="nq-lift flex items-center gap-2 mb-3 p-3 rounded-lg border border-border text-sm font-medium text-brand hover:bg-surface-hover"
        >
          <Briefcase className="w-4 h-4" />
          {t("عرض تفاصيل الفرصة", "View opportunity details")}
        </Link>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-border text-text-muted">
        <button
          type="button"
          onClick={onLike}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            liked ? "text-red-500" : "hover:text-text"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          {post.likes}
        </button>
        <span className="flex items-center gap-1.5 text-xs">
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </span>
        <button type="button" className="flex items-center gap-1.5 text-xs ms-auto hover:text-text">
          <Share2 className="w-4 h-4" />
          {t("مشاركة", "Share")}
        </button>
      </div>
    </article>
  );
}
