"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FeedPost } from "@careerlink/shared";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Briefcase, Flag, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies, useUsers } from "@/hooks/data";
import { Button } from "@/components/ui/button";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  authorName?: string;
  authorAvatar?: string;
};

function usePostAuthor(post: FeedPost) {
  const { data: users } = useUsers();
  const { data: companies } = useCompanies();
  const { t } = useI18n();

  if (post.authorType === "company") {
    const company = companies?.find((c) => c.id === post.authorId);
    return company
      ? { name: company.name, avatar: company.logo, subtitle: company.industry }
      : { name: t("شركة", "Company"), avatar: "", subtitle: "" };
  }

  if (post.authorName) {
    return {
      name: post.authorName,
      avatar: post.authorAvatar ?? "",
      subtitle: t("عضو نقلة", "Naqla member"),
    };
  }

  const user = users?.find((u) => u.id === post.authorId);
  return user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        subtitle: user.role,
      }
    : { name: t("مستخدم", "User"), avatar: "", subtitle: "" };
}

export function PostCard({
  post,
  liked,
  onLike,
  onCommentCount,
}: {
  post: FeedPost;
  liked?: boolean;
  onLike: () => void;
  onCommentCount?: (postId: string, count: number) => void;
}) {
  const { t } = useI18n();
  const author = usePostAuthor(post);
  const [openComments, setOpenComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const typeLabels: Record<FeedPost["type"], string> = {
    update: t("تحديث", "Update"),
    job: t("فرصة عمل", "Job Opportunity"),
    achievement: t("إنجاز", "Achievement"),
    event: t("فعالية", "Event"),
    article: t("مقال", "Article"),
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/feed/${encodeURIComponent(post.id)}/comments`);
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setComments(json.data as Comment[]);
        onCommentCount?.(post.id, json.data.length);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openComments) void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openComments, post.id]);

  const submitComment = async () => {
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/data/feed/${encodeURIComponent(post.id)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      const created = json.data as Comment;
      setComments((prev) => [...prev, created]);
      setText("");
      onCommentCount?.(post.id, comments.length + 1);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التعليق", "Comment failed"));
    } finally {
      setBusy(false);
    }
  };

  const reportPost = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/data/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "post",
          targetId: post.id,
          targetLabel: post.content.slice(0, 80),
          reason: t("محتوى غير مناسب", "Inappropriate content"),
          link: "/feed",
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "FAILED");
      }
      setMsg(t("تم إرسال البلاغ", "Report submitted"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل البلاغ", "Report failed"));
    } finally {
      setBusy(false);
    }
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
        <button
          type="button"
          onClick={() => setOpenComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs hover:text-text"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs hover:text-text"
          onClick={() => void reportPost()}
          disabled={busy}
        >
          <Flag className="w-4 h-4" />
          {t("بلاغ", "Report")}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs ms-auto hover:text-text"
          onClick={() => {
            const url = typeof window !== "undefined" ? `${window.location.origin}/feed` : "/feed";
            void navigator.clipboard?.writeText(url);
          }}
        >
          <Share2 className="w-4 h-4" />
          {t("مشاركة", "Share")}
        </button>
      </div>

      {msg && <p className="text-xs text-text-secondary mt-2">{msg}</p>}

      {openComments && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {loading ? (
            <div className="nq-skeleton h-12" />
          ) : comments.length === 0 ? (
            <p className="text-xs text-text-muted">{t("لا تعليقات بعد", "No comments yet")}</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar src={c.authorAvatar || "/globe.svg"} alt={c.authorName ?? ""} size="sm" />
                <div className="flex-1 rounded-lg border border-border bg-surface-hover/40 px-3 py-2">
                  <p className="text-xs font-semibold text-text">{c.authorName ?? t("مستخدم", "User")}</p>
                  <p className="text-sm text-text-secondary mt-0.5 whitespace-pre-wrap">{c.content}</p>
                  <p className="text-[11px] text-text-muted mt-1">{formatDateTime(c.createdAt)}</p>
                </div>
              </div>
            ))
          )}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("اكتب تعليقاً...", "Write a comment...")}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitComment();
              }}
            />
            <Button size="sm" disabled={busy || !text.trim()} onClick={() => void submitComment()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
