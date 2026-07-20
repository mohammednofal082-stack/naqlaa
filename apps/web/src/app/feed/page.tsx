"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { FeedProfileCard, FeedRightRail } from "@/components/feed/feed-shell";
import { FeedHero } from "@/components/feed/feed-hero";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/contexts/social-context";
import { useApp } from "@/contexts/app-context";
import { getRoleExperience } from "@/components/role/role-experience";
import type { FeedPost } from "@careerlink/shared";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export default function FeedPage() {
  const { t } = useI18n();
  const { posts, toggleLike, isPostLiked } = useSocial();
  const { user } = useApp();
  const filters: { key: "all" | FeedPost["type"]; label: string }[] = [
    { key: "all", label: t("الكل", "All") },
    { key: "update", label: t("تحديثات", "Updates") },
    { key: "job", label: t("وظائف", "Jobs") },
    { key: "achievement", label: t("إنجازات", "Achievements") },
    { key: "event", label: t("فعاليات", "Events") },
    { key: "article", label: t("مقالات", "Articles") },
  ];
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const role = getRoleExperience(user?.role ?? "student", t);

  const filtered = posts.filter((p) => (filter === "all" ? true : p.type === filter));

  return (
    <DashboardLayout>
      <div className="nq-page-enter nq-feed-layout">
        <main className="min-w-0">
          <FeedHero />
          <div className="lg:hidden mb-3">
            <FeedProfileCard />
          </div>
          <PostComposer />

          <div className="li-filter-tabs scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn("li-filter-tab", filter === f.key && "li-filter-tab-active")}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <EmptyState
                icon={LayoutGrid}
                title={role.emptyStates.jobs?.title ?? t("لا توجد منشورات", "No posts yet")}
                description={
                  filter === "all"
                    ? t("كن أول من يشارك تحديثاً أو إنجازاً مع مجتمع نقلة", "Be the first to share an update or achievement with the Naqla community")
                    : t("لا توجد منشورات في هذا القسم — جرّب فلتراً آخر", "No posts in this section — try another filter")
                }
                action={
                  <Link href="/jobs">
                    <Button size="sm">{t("استكشف الفرص", "Explore Opportunities")}</Button>
                  </Link>
                }
              />
            ) : (
              filtered.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={isPostLiked(post.id)}
                  onLike={() => toggleLike(post.id)}
                />
              ))
            )}
          </div>
        </main>

        <div className="hidden lg:block min-w-0">
          <FeedRightRail />
        </div>
      </div>
    </DashboardLayout>
  );
}
