"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { FileText, Map, Mic, ArrowLeft, ArrowRight, Compass, Target, Lightbulb } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AiHubPage() {
  const { t, isRTL } = useI18n();

  const features = [
    {
      href: "/ai/skill-gap",
      icon: Target,
      title: t("تحليل فجوة المهارات", "Skill Gap Analysis"),
      description: t(
        "خوارزمية تقارن مهاراتك بمتطلبات السوق وتقترح كورسات ومشاريع",
        "An algorithm that compares your skills against market requirements and suggests courses and projects"
      ),
    },
    {
      href: "/ai/recommendations",
      icon: Lightbulb,
      title: t("التوصيات المخصّصة", "Recommendations"),
      description: t(
        "وظائف، تدريب، كورسات، ومرشدون مرتبون حسب نسبة التطابق",
        "Jobs, internships, courses, and mentors ranked by match rate"
      ),
    },
    {
      href: "/ai/cv-analyzer",
      icon: FileText,
      title: t("تحليل السيرة الذاتية", "CV Analysis"),
      description: t(
        "ارفع PDF واحصل على درجة ATS، نقاط القوة، والمهارات الناقصة",
        "Upload a PDF and receive an ATS score, strengths, and missing skills"
      ),
    },
    {
      href: "/ai/career-path",
      icon: Map,
      title: t("خارطة المسار المهني", "Career Path"),
      description: t(
        "خطة تعلم مخصصة حسب تخصصك وهدفك المهني",
        "A personalized learning plan based on your specialization and career goal"
      ),
    },
    {
      href: "/ai/interview",
      icon: Mic,
      title: t("محاكاة المقابلة", "Interview Simulation"),
      description: t(
        "أسئلة واقعية وتقييم فوري لتحسين أدائك",
        "Realistic questions and instant evaluation to improve your performance"
      ),
    },
  ];

  const tips = [
    t(
      "ابدأ بتحليل السيرة قبل كل تقديم مهم",
      "Begin with a CV analysis before every important application"
    ),
    t(
      "استخدم خارطة المسار لتحديد المهارات الناقصة",
      "Use the career path to identify missing skills"
    ),
    t(
      "جرّب محاكاة المقابلة قبل أول مقابلة حقيقية",
      "Try the interview simulation before your first real interview"
    ),
  ];

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("التطوير المهني", "Professional Development")}
        title={t("الأدوات المهنية", "Career Tools")}
        subtitle={t(
          "أدوات تحليل ومطابقة تساعدك في كل مرحلة من رحلتك المهنية",
          "Analysis and matching tools to support you at every stage of your career journey"
        )}
      />

      <div className="nq-page-enter">
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group block h-full">
            <div className="nq-card nq-lift h-full p-5 flex flex-col hover:border-brand/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-brand-muted flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-brand" />
              </div>
              <h2 className="font-display font-bold text-base text-text mb-2">{f.title}</h2>
              <p className="text-sm text-text-muted leading-relaxed flex-1">{f.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand mt-4">
                {t("فتح الأداة", "Open tool")}
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="nq-gradient-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-brand" />
          <p className="font-display font-bold text-sm text-text">{t("نصائح للاستخدام الأمثل", "Tips for best use")}</p>
        </div>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={tip} className="flex gap-2 text-sm text-text-secondary">
              <span className="text-brand font-bold tabular-nums">{i + 1}.</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </DashboardLayout>
  );
}
