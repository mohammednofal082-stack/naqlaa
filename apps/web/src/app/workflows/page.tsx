"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buildPlatformWorkflows, ROLE_LABELS } from "@careerlink/shared";
import type { UserRole } from "@careerlink/shared";
import { PublicHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Users, Smartphone, Monitor } from "lucide-react";
import { useI18n } from "@/i18n";
import { roleLabel } from "@/i18n/labels";

export default function WorkflowsPage() {
  const { t, isRTL } = useI18n();
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;
  const workflows = buildPlatformWorkflows(t);
  return (
    <div className="min-h-screen page-canvas relative">
      <AmbientBackground variant="app" />
      <PublicHeader />
      <main className="pt-24 pb-20 relative z-10">
        <section className="shell-wide mb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-sm font-semibold text-brand mb-3">{t("سيناريوهات المناقشة — 7 workflows", "Discussion Scenarios — 7 workflows")}</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-text mb-4 max-w-3xl">
              {t("من التسجيل إلى التوظيف — كل رحلة موثّقة في", "From registration to hiring — every journey documented in")} <span className="nq-gradient-text">{t("نقلة", "Naqla")}</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed mb-8">
              {t("هذه الصفحة تعرض السيناريوهات الكاملة من وثيقة SRS — نفسها على الويب والموبايل. اضغط «جرّب على الويب» أو «جرّب على الموبايل» لكل سيناريو.", "This page presents the complete scenarios from the SRS document — identical on web and mobile. Press \u201cTry on Web\u201d or \u201cTry on Mobile\u201d for each scenario.")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/login"><Button size="lg">{t("ابدأ العرض التجريبي", "Start the Demo")}<ForwardArrow className="w-4 h-4" /></Button></Link>
              <Link href="/"><Button variant="outline" size="lg">{t("الصفحة الرئيسية", "Home")}</Button></Link>
            </div>
          </motion.div>
        </section>

        <section className="shell-wide space-y-8">
          {workflows.map((wf, i) => (
            <motion.article
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="nq-card-premium overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row">
                <div
                  className="lg:w-72 p-6 flex flex-col justify-between shrink-0"
                  style={{ background: `linear-gradient(135deg, ${wf.color}18, transparent)` }}
                >
                  <div>
                    <span className="text-4xl mb-4 block">{wf.icon}</span>
                    <h2 className="font-display text-xl font-bold text-text">{wf.title}</h2>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{wf.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3.5 h-3.5" /> {wf.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                      <Users className="w-3.5 h-3.5" /> {wf.roles.join(" · ")}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 border-t lg:border-t-0 lg:border-r border-border">
                  <ol className="space-y-3 mb-6">
                    {wf.steps.map((step, si) => (
                      <li key={si} className="flex gap-3 items-start">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${wf.color}20`, color: wf.color }}
                        >
                          {si + 1}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm font-medium text-text">{step.label}</p>
                          <p className="text-xs text-text-muted">{step.actor}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald/10 border border-emerald/20 mb-6">
                    <CheckCircle2 className="w-4 h-4 text-emerald shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary"><strong className="text-text">{t("النتيجة:", "Outcome:")}</strong> {wf.outcome}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={wf.webDemo}>
                      <Button size="sm">
                        <Monitor className="w-3.5 h-3.5" /> {t("جرّب على الويب", "Try on Web")}
                      </Button>
                    </Link>
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-muted border border-border rounded-lg">
                      <Smartphone className="w-3.5 h-3.5" /> {t("الموبايل:", "Mobile:")} {wf.mobileDemo.replace("/(tabs)/", "")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="shell-wide mt-20">
          <div className="nq-hero text-center">
            <h2 className="font-display text-2xl font-bold text-text mb-3">{t("8 أدوار — نفس الصلاحيات على الويب والموبايل", "8 Roles — the same permissions on web and mobile")}</h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => roleLabel(r, t)).join(" · ")}
            </p>
            <Link href="/auth/login"><Button>{t("سجّل دخول بأي دور", "Sign in with any role")}<ForwardArrow className="w-4 h-4" /></Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
