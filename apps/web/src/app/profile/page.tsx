"use client";

import Image from "next/image";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { useProfile } from "@/hooks/data";
import { MapPin, Download, Edit } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function ProfilePage() {
  const { t } = useI18n();
  const { data, loading } = useProfile();
  if (loading || !data) {
    return (
      <DashboardLayout>
        <Header title={t("الملف الشخصي", "Profile")} />
        <div className="space-y-4 mt-6">
          <div className="nq-skeleton h-48 rounded-2xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="nq-skeleton h-32 rounded-xl" />
              <div className="nq-skeleton h-48 rounded-xl" />
            </div>
            <div className="nq-skeleton h-64 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const { user: currentUser, profile } = data;

  return (
    <DashboardLayout>
      <Header title={t("الملف الشخصي", "Profile")} />

      <div className="nq-page-enter mt-6">
      <div className="nq-gradient-panel overflow-hidden mb-6">
        <div className="relative h-40 md:h-48">
          <Image src={profile.coverPhoto} alt="Cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 to-transparent" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-14 relative z-10 px-5 pb-5">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-surface shadow-card shrink-0">
            <Image src={currentUser.avatar} alt={currentUser.firstName} fill className="object-cover" />
          </div>
          <div className="flex-1 pb-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-text">{currentUser.firstName} {currentUser.lastName}</h1>
            <p className="text-text-secondary text-sm mt-0.5">{profile.headline}</p>
            <p className="text-text-muted text-xs flex items-center gap-1 mt-1.5">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </p>
          </div>
          <Link href="/profile/edit" className="sm:ms-auto w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto"><Edit className="w-4 h-4" /> {t("تعديل الملف", "Edit Profile")}</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-text-secondary font-medium">{t("اكتمال الملف", "Profile Completion")}</span>
          <span className="nq-chip-emerald nq-chip tabular-nums">{profile.profileCompletion}%</span>
        </div>
        <ProgressBar value={profile.profileCompletion} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle className="font-display mb-3">{t("نبذة", "About")}</CardTitle>
            <p className="text-text-secondary leading-relaxed">{profile.about}</p>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("التعليم", "Education")}</CardTitle>
            {profile.education.map((edu) => (
              <div key={edu.university} className="flex justify-between">
                <div>
                  <p className="font-semibold text-text">{edu.university}</p>
                  <p className="text-sm text-text-secondary">{edu.degree} - {edu.major}</p>
                </div>
                <div className="text-left">
                  <p className="text-text-muted text-xs">{edu.startYear} - {edu.endYear}</p>
                  {edu.gpa && <p className="text-text-muted text-xs mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("الخبرة", "Experience")}</CardTitle>
            {profile.experience.map((exp) => (
              <div key={exp.id} className="mb-5 last:mb-0">
                <p className="font-semibold text-text">{exp.position}</p>
                <p className="text-sm text-blue font-medium">{exp.company}</p>
                <p className="text-text-muted text-xs mt-0.5">{exp.startDate} - {exp.current ? t("الحالي", "Present") : exp.endDate}</p>
                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("المشاريع", "Projects")}</CardTitle>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.projects.map((proj) => (
                <div key={proj.id} className="nq-lift rounded-xl overflow-hidden border border-border bg-surface">
                  <div className="relative h-32">
                    <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-text">{proj.title}</p>
                    <p className="text-sm text-text-secondary line-clamp-2 mt-1">{proj.description}</p>
                    <p className="text-text-muted text-xs mt-2">{proj.technologies.join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <Card>
            <CardTitle className="font-display mb-4">{t("المهارات", "Skills")}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="nq-chip">{skill}</span>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("الشهادات", "Certifications")}</CardTitle>
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="mb-3 last:mb-0">
                <p className="font-semibold text-sm text-text">{cert.name}</p>
                <p className="text-text-muted text-xs mt-0.5">{cert.issuer} - {cert.date}</p>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("السيرة الذاتية", "Resume")}</CardTitle>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4" />
              {t("تحميل CV", "Download CV")}
            </Button>
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="nq-stat">
                <p className="text-2xl font-bold text-blue tabular-nums">{profile.connections}</p>
                <p className="text-text-muted text-xs mt-0.5">{t("اتصال", "Connections")}</p>
              </div>
              <div className="nq-stat">
                <p className="text-2xl font-bold text-emerald tabular-nums">{profile.followers}</p>
                <p className="text-text-muted text-xs mt-0.5">{t("متابع", "Followers")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
