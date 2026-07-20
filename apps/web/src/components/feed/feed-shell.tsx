"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { studentProfile, dashboardStats, applications, getJobsWithCompany } from "@careerlink/shared";
import { Bookmark, ClipboardList, FileUp, Compass } from "lucide-react";

export function FeedProfileCard() {
  const { user } = useApp();
  const { t } = useI18n();
  if (!user) return null;

  const myApps = applications.filter((a) => a.studentId === user.userId).length;

  return (
    <div className="nq-card nq-lift li-card overflow-hidden">
      <div className="h-12 bg-gradient-to-l from-brand/25 via-brand/10 to-transparent" />
      <div className="px-4 pb-3 -mt-7">
        <Link href="/profile" className="inline-block">
          <div className="w-14 h-14 rounded-full border-2 border-[var(--li-card)] overflow-hidden bg-[var(--li-card)]">
            <Image
              src={user.avatar}
              alt={user.fullName}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        <Link href="/profile" className="block mt-2">
          <p className="font-semibold text-sm text-text hover:text-brand transition-colors leading-snug">
            {user.fullName}
          </p>
          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{studentProfile.headline}</p>
        </Link>
        <div className="mt-3 pt-3 border-t border-border space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">{t("اكتمال الملف", "Profile completion")}</span>
            <span className="text-brand font-semibold tabular-nums">{dashboardStats.profileCompletion}%</span>
          </div>
          <div className="h-1 rounded-full bg-[var(--li-input)] overflow-hidden">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${dashboardStats.profileCompletion}%` }}
            />
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-text-muted">{t("طلباتي", "My applications")}</span>
            <span className="text-text font-semibold tabular-nums">{myApps}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        {[
          { href: "/saved", label: t("المحفوظات", "Saved"), icon: Bookmark },
          { href: "/applications", label: t("طلبات التقديم", "Applications"), icon: ClipboardList },
          { href: "/ai", label: t("الأدوات المهنية", "Career Tools"), icon: Compass },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-[var(--li-nav-hover)] transition-colors"
          >
            <item.icon className="w-4 h-4 text-text-muted shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FeedRightRail() {
  const { t } = useI18n();
  const jobs = getJobsWithCompany()
    .filter((j) => j.matchPercentage && j.matchPercentage >= 70)
    .slice(0, 2);

  return (
    <aside className="space-y-2">
      <div className="nq-card nq-lift li-card p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-muted flex items-center justify-center shrink-0">
            <FileUp className="w-5 h-5 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">{t("حلّل سيرتك الذاتية", "Analyze your resume")}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {t("ارفع PDF واحصل على تحليل ATS ودرجة جاهزية فورية.", "Upload a PDF and get instant ATS analysis and a readiness score.")}
            </p>
            <Link
              href="/ai/cv-analyzer"
              className="text-xs font-semibold text-brand hover:underline mt-2 inline-block"
            >
              {t("رفع وتحليل السيرة", "Upload and analyze resume")}
            </Link>
          </div>
        </div>
      </div>

      {jobs.length > 0 ? (
        <div className="nq-card li-card p-4">
          <p className="nq-section-label">{t("فرص مناسبة لك", "Opportunities that match you")}</p>
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="nq-lift block group p-2 -mx-2 rounded-lg border border-transparent hover:border-border hover:bg-surface-hover transition-colors">
                <p className="text-sm font-medium text-text group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                  {job.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{job.company.name}</p>
                {job.matchPercentage && (
                  <span className="nq-chip nq-chip-emerald mt-1 inline-flex">{t(`تطابق ${job.matchPercentage}%`, `${job.matchPercentage}% match`)}</span>
                )}
              </Link>
            ))}
          </div>
          <Link href="/jobs" className="nq-btn-ghost w-full justify-center mt-3 text-brand text-xs">
            {t("عرض كل الفرص", "View all opportunities")}
          </Link>
        </div>
      ) : (
        <div className="nq-card li-card p-4 text-center">
          <p className="text-sm font-semibold text-text">{t("لا توجد فرص محفوظة", "No saved opportunities")}</p>
          <p className="text-xs text-text-muted mt-1 mb-3">{t("ابدأ بالبحث عن وظائف تناسب مهاراتك", "Start searching for jobs that match your skills")}</p>
          <Link href="/jobs" className="nq-btn-primary-sm">{t("تصفح الوظائف", "Browse jobs")}</Link>
        </div>
      )}

      <div className="nq-card li-card p-4">
        <p className="text-xs font-semibold text-text-muted mb-2">{t("الأدوات المهنية", "Career Tools")}</p>
        <div className="space-y-0.5">
          {[
            { href: "/ai/career-path", label: t("خارطة المسار المهني", "Career Path Map") },
            { href: "/ai/interview", label: t("محاكاة المقابلة", "Interview Simulation") },
            { href: "/journey", label: t("رحلتي المهنية", "My Career Journey") },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block text-sm text-text-secondary hover:text-brand py-1.5 transition-colors"
            >
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
