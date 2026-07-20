"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Bookmark, BookmarkCheck } from "lucide-react";
import {
  type Job,
  type Internship,
  type Company,
} from "@careerlink/shared";
import { formatDate, formatSalary } from "@/lib/utils";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { workTypeLabel, experienceLabel } from "@/i18n/labels";

interface JobCardProps {
  job: Job;
  company: Company;
  compact?: boolean;
}

export function JobCard({ job, company, compact }: JobCardProps) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card hover className="relative overflow-hidden group">
        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved(!saved);
          }}
          className="absolute top-4 left-4 p-2 rounded-xl hover:bg-cream transition-colors z-10"
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5 text-emerald" />
          ) : (
            <Bookmark className="w-5 h-5 text-text-muted" />
          )}
        </button>

        <Link href={`/jobs/${job.id}`}>
          <div className="flex items-start gap-4 pr-2">
            <div className="relative w-14 h-14 rounded-[6px] overflow-hidden bg-cream border border-border flex-shrink-0">
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <h3 className="font-display font-bold text-lg text-text truncate group-hover:text-blue transition-colors">
                  {job.title}
                </h3>
                {job.matchPercentage != null && (
                  <span className="text-xs text-text-muted tabular-nums">{t(`· تطابق ${job.matchPercentage}%`, `· ${job.matchPercentage}% match`)}</span>
                )}
              </div>
              <p className="text-text-muted text-sm mb-2">
                {company.name}
                <span className="text-text-muted"> · {company.industry}</span>
              </p>
              {!compact && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">{job.description}</p>
              )}
              {job.skills.length > 0 && (
                <p className="text-xs text-text-muted mb-3">
                  {job.skills.slice(0, 4).join(" · ")}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                <span>{workTypeLabel(job.workType, t)}</span>
                <span>{experienceLabel(job.experienceLevel, t)}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {t(`${job.applicants} متقدم`, `${job.applicants} applicants`)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(job.postedAt)}
                </span>
              </div>
              <p className="text-emerald font-semibold mt-3 text-sm">
                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </p>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

interface InternshipCardProps {
  internship: Internship;
  company: Company;
}

export function InternshipCard({ internship, company }: InternshipCardProps) {
  const { t } = useI18n();
  const meta = [
    internship.duration,
    internship.paid ? t(`مدفوع ${internship.salary}$`, `Paid $${internship.salary}`) : t("غير مدفوع", "Unpaid"),
    internship.trainToHire ? "Train to Hire" : null,
    workTypeLabel(internship.workType, t),
  ].filter(Boolean).join(" · ");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card hover>
        <Link href="/internships">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-[6px] overflow-hidden bg-cream border border-border">
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-x-2 mb-1">
                <h3 className="font-display font-bold text-lg text-navy">{internship.title}</h3>
                {internship.matchPercentage != null && (
                  <span className="text-xs text-text-muted tabular-nums">{t(`· تطابق ${internship.matchPercentage}%`, `· ${internship.matchPercentage}% match`)}</span>
                )}
              </div>
              <p className="text-text-muted text-sm mb-2">
                {company.name}
                <span className="text-text-muted"> · {company.industry}</span>
              </p>
              <p className="text-xs text-text-muted mb-3">{meta}</p>
              <p className="text-sm text-text-secondary line-clamp-2">{internship.description}</p>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const { t } = useI18n();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card hover className="group">
        <Link href={`/companies/${company.id}`}>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-[6px] overflow-hidden bg-cream border border-border group-hover:border-border-strong transition-colors">
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg text-navy group-hover:text-blue transition-colors">
                {company.name}
                {company.verified && <span className="text-sm font-normal text-text-muted">{t(" · موثقة", " · Verified")}</span>}
              </h3>
              <p className="text-xs text-text-muted mt-1 mb-2">{company.industry}</p>
              <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                <span>{t(`${company.employees.toLocaleString()} موظف`, `${company.employees.toLocaleString()} employees`)}</span>
                <span>{t(`${company.activeJobs} وظيفة`, `${company.activeJobs} jobs`)}</span>
                <span>{company.location}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              {t("عرض", "View")}
            </Button>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
