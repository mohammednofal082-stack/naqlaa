"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import type { UserProfileBundle } from "@/backend/data";
import { Award, MapPin, MessageSquare } from "lucide-react";

type BadgeRow = { code: string; nameAr: string; nameEn: string; awardedAt: string };

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { t, isRTL } = useI18n();
  const { user } = useApp();
  const [data, setData] = useState<UserProfileBundle | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundProfile, setNotFoundProfile] = useState(false);

  useEffect(() => {
    setLoading(true);
    void fetch(`/api/data/profile?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) setNotFoundProfile(true);
        else setData(json.data as UserProfileBundle);
      })
      .catch(() => setNotFoundProfile(true))
      .finally(() => setLoading(false));

    void fetch(`/api/data/badges?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) setBadges(json.data as BadgeRow[]);
      })
      .catch(() => {});
  }, [userId]);

  if (!loading && (notFoundProfile || !data)) notFound();

  if (loading || !data) {
    return (
      <PageLayout>
        <div className="nq-skeleton h-48 rounded-2xl" />
      </PageLayout>
    );
  }

  const { user: profileUser, profile } = data;

  return (
    <PageLayout>
      <div className="nq-page-enter">
        <div className="nq-gradient-panel overflow-hidden mb-6">
          <div className="relative h-40 md:h-48">
            {profile.coverPhoto ? (
              <Image src={profile.coverPhoto} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-navy/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 to-transparent" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-14 relative z-10 px-5 pb-5">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-surface shadow-card shrink-0 bg-brand-muted">
              {profileUser.avatar ? (
                <Image src={profileUser.avatar} alt={profileUser.firstName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand">
                  {profileUser.firstName?.[0] ?? "?"}
                </div>
              )}
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-text">
                {profileUser.firstName} {profileUser.lastName}
              </h1>
              {profile.headline && (
                <p className="text-text-secondary text-sm mt-0.5">{profile.headline}</p>
              )}
              {profile.location && (
                <p className="text-text-muted text-xs flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </p>
              )}
            </div>
            {user && user.userId !== userId && (
              <Link href={`/messages?user=${userId}`} className="sm:ms-auto w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <MessageSquare className="w-4 h-4" />
                  {t("مراسلة", "Message")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            {profile.about && (
              <Card>
                <CardTitle className="font-display mb-3">{t("نبذة", "About")}</CardTitle>
                <p className="text-text-secondary leading-relaxed">{profile.about}</p>
              </Card>
            )}

            {profile.education?.length > 0 && (
              <Card>
                <CardTitle className="font-display mb-4">{t("التعليم", "Education")}</CardTitle>
                {profile.education.map((edu) => (
                  <div key={`${edu.university}-${edu.startYear}`} className="flex justify-between mb-3 last:mb-0">
                    <div>
                      <p className="font-semibold text-text">{edu.university}</p>
                      <p className="text-sm text-text-secondary">
                        {edu.degree} - {edu.major}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-text-muted text-xs">
                        {edu.startYear} - {edu.endYear}
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {profile.experience?.length > 0 && (
              <Card>
                <CardTitle className="font-display mb-4">{t("الخبرة", "Experience")}</CardTitle>
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="mb-5 last:mb-0">
                    <p className="font-semibold text-text">{exp.position}</p>
                    <p className="text-sm text-blue font-medium">{exp.company}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {exp.startDate} - {exp.current ? t("الحالي", "Present") : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </Card>
            )}

            {profile.projects?.length > 0 && (
              <Card>
                <CardTitle className="font-display mb-4">{t("المشاريع", "Projects")}</CardTitle>
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="nq-lift rounded-xl overflow-hidden border border-border bg-surface"
                    >
                      {proj.image && (
                        <div className="relative h-32">
                          <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-semibold text-text">{proj.title}</p>
                        <p className="text-sm text-text-secondary line-clamp-2 mt-1">{proj.description}</p>
                        {proj.technologies?.length > 0 && (
                          <p className="text-text-muted text-xs mt-2">{proj.technologies.join(" · ")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            {profile.skills?.length > 0 && (
              <Card>
                <CardTitle className="font-display mb-4">{t("المهارات", "Skills")}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="nq-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {badges.length > 0 && (
              <Card>
                <CardTitle className="font-display mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand" />
                  {t("الشارات", "Badges")}
                </CardTitle>
                <div className="space-y-2">
                  {badges.map((b) => (
                    <div key={`${b.code}-${b.awardedAt}`} className="flex items-center justify-between gap-2">
                      <span className="nq-chip nq-chip-emerald">
                        {isRTL ? b.nameAr || b.code : b.nameEn || b.code}
                      </span>
                      <span className="text-[11px] text-text-muted">{String(b.awardedAt).slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
