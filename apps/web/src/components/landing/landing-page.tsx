"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { ThemeModeSwitch } from "@/components/ui/theme-toggle";
import { LanguageSwitch } from "@/components/ui/language-toggle";
import { useI18n } from "@/i18n";
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  LayoutGrid,
  Briefcase,
  MessageSquare,
  Compass,
  GraduationCap,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Target,
  ShieldCheck,
  UserRound,
  Bell,
  Bookmark,
} from "lucide-react";
import { SmoothScroll } from "./naqla/smooth-scroll";
import {
  Float,
  Magnetic,
  Reveal,
  SpotlightCard,
  TextReveal,
  TiltCard,
} from "@/components/ui/motion";

const BRAND = "#1d4ed8";
const EASE = [0.16, 1, 0.3, 1] as const;

function LandingNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#platform", label: t("المنصة", "Platform") },
    { href: "#showcase", label: t("العرض", "Overview") },
    { href: "#how", label: t("كيف تعمل", "How it works") },
    { href: "#roles", label: t("لِمن؟", "For whom?") },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed top-0 inset-x-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="shell-wide h-16 flex items-center justify-between gap-4">
        <Link href="/" aria-label="نقلة">
          <Logo size="sm" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative hover:text-text transition-colors after:absolute after:bottom-[-4px] after:start-0 after:h-px after:w-0 after:bg-brand after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch showLabel />
          <ThemeModeSwitch showLabel />
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            {t("تسجيل الدخول", "Sign in")}
          </Link>
          <Magnetic strength={0.2}>
            <Link
              href="/auth/register"
              className="nq-pulse-ring inline-flex px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:brightness-110"
              style={{ background: BRAND, boxShadow: "0 0 36px rgba(29,78,216,0.4)" }}
            >
              {t("ابدأ مجاناً", "Start free")}
            </Link>
          </Magnetic>
          <button type="button" className="md:hidden p-2 text-text-secondary" onClick={() => setOpen(!open)} aria-label={t("القائمة", "Menu")}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border px-4 py-4 space-y-1 bg-background"
        >
          {links.slice(0, 3).map((link) => (
            <a key={link.href} href={link.href} className="block py-2 text-sm text-text-secondary" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link href="/auth/login" className="block py-2 text-sm text-text-secondary" onClick={() => setOpen(false)}>{t("تسجيل الدخول", "Sign in")}</Link>
          <Link href="/auth/register" className="block mt-2 py-3 text-center text-sm font-semibold rounded-xl text-white" style={{ background: BRAND }} onClick={() => setOpen(false)}>
            {t("إنشاء حساب", "Create account")}
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}

function HeroSection() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const stats = [
    { n: t("٨", "8"), l: t("أدوار مستخدم", "User roles") },
    { n: t("٨٣+", "83+"), l: t("صفحة تفاعلية", "Interactive pages") },
    { n: t("٣٣+", "33+"), l: t("خدمة بيانات حيّة", "Live data services") },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/naqla-hero.jpg"
            alt=""
            className="nq-kenburns absolute inset-0 w-full h-full object-cover opacity-[0.22] dark:opacity-[0.32]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-background/80" />
        <div className="nq-hero-glow top-[-20%] left-[-15%] bg-blue-500/25 dark:bg-blue-600/30" />
        <div className="nq-hero-glow bottom-[-20%] right-[-10%] bg-indigo-500/15 dark:bg-indigo-600/20" style={{ animationDelay: "-4s" }} />
        <div className="nq-hero-glow top-[35%] right-[15%] w-[28rem] h-[28rem] bg-cyan-400/10 dark:bg-cyan-500/12" style={{ animationDelay: "-7s" }} />
        <div
          className="landing-grid absolute inset-0 opacity-40"
          style={{ maskImage: "radial-gradient(ellipse 80% 70% at 50% 20%, #000 40%, transparent 100%)" }}
        />
        <div className="nq-grain" />
      </div>

      <div className="shell-wide relative z-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-bold text-text leading-[1.1] tracking-tight mb-6 mt-2">
              <TextReveal text={t("من مقاعد الجامعة", "From the classroom")} delay={0.1} as="span" className="block" />
              <span className="block mt-1 bg-gradient-to-l from-blue-500 via-cyan-500 to-indigo-500 dark:from-blue-300 dark:via-cyan-300 dark:to-indigo-300 bg-clip-text text-transparent">
                <TextReveal text={t("إلى أول وظيفة.", "to your first job.")} delay={0.35} as="span" />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="text-lg text-text-secondary leading-relaxed max-w-xl mb-9"
            >
              {t(
                "تجربة واحدة تربط الطلبة والخريجين بالشركات والجامعات — منشورات مهنية، فرص مطابَقة بدقّة لمهاراتك، وتواصل مباشر مع أصحاب القرار.",
                "One experience connecting students and graduates with companies and universities — professional posts, opportunities precisely matched to your skills, and direct contact with decision-makers."
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Magnetic>
                <Link
                  href="/auth/login"
                  className="nq-btn-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: BRAND, boxShadow: "0 14px 48px rgba(29,78,216,0.45)" }}
                >
                  {t("ابدأ الآن — مجاناً", "Get started — free")}
                  <Arrow className="w-5 h-5" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.18}>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-text border border-border bg-surface/50 hover:bg-surface-hover transition-all backdrop-blur-sm"
                >
                  <Search className="w-4 h-4" />
                  {t("تصفّح الفرص", "Browse opportunities")}
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="flex flex-wrap gap-x-10 gap-y-5 pt-2 border-t border-border"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, ease: EASE }}
                  className="pt-5"
                >
                  <p className="text-[1.85rem] font-bold text-text tabular-nums leading-none">{s.n}</p>
                  <p className="text-text-muted text-xs mt-2">{s.l}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="relative [perspective:1200px]"
          >
            <Float duration={7}>
              <TiltCard>
                <ProductPreview />
              </TiltCard>
            </Float>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MatchRing({ value }: { value: number }) {
  const { locale } = useI18n();
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-border" />
        <motion.circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-emerald-500"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.6, ease: EASE }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
        {value}
        {locale === "ar" ? "٪" : "%"}
      </span>
    </div>
  );
}

function ProductPreview() {
  const { t } = useI18n();
  const rows = [
    { who: t("أمير أبو شمس", "Amir Abu Shams"), what: t("أنهيت دورة React — الخطوة التالية: تدريب صيفي", "Finished a React course — next: a summer internship"), tag: t("تحديث", "Update") },
    { who: t("جامعة بيرزيت", "Birzeit University"), what: t("معرض التوظيف السنوي — التسجيل مفتوح", "Annual career fair — registration open"), tag: t("فعالية", "Event") },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[32px] bg-blue-500/15 blur-3xl pointer-events-none" aria-hidden />
      <div className="relative rounded-2xl border border-border bg-surface shadow-[0_40px_100px_rgba(12,18,34,0.18)] dark:shadow-[0_50px_120px_rgba(0,0,0,0.65)] overflow-hidden ring-1 ring-black/[0.03] dark:ring-white/10 nq-shine-border">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-hover/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="flex-1 text-center text-[11px] text-text-muted font-mono">naqlah.ps/feed</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 h-9 rounded-lg bg-surface-hover border border-border flex items-center px-3 text-xs text-text-muted">
              <Search className="w-3.5 h-3.5 me-2 opacity-60" />
              {t("ابحث عن وظائف، شركات، منشورات…", "Search jobs, companies, posts…")}
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-text-secondary">
              <Bell className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/70 border border-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {t("م", "M")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text truncate">{t("محمد نوفل", "Mohammed Nofal")}</p>
              <p className="text-[11px] text-text-muted truncate">{t("طالب هندسة حاسوب · جامعة النجاح الوطنية", "Computer Engineering Student · An-Najah National University")}</p>
            </div>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t("متصل", "Online")}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-brand/25 bg-brand/[0.05]">
            <div className="flex items-center gap-3">
              <MatchRing value={92} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text truncate">{t("Jawwal — تدريب صيفي", "Jawwal — Summer Internship")}</p>
                  <Bookmark className="w-3.5 h-3.5 text-text-muted shrink-0" />
                </div>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{t("قسم التقنية · رام الله · دوام كامل", "Tech Dept · Ramallah · Full-time")}</p>
                <p className="text-[11px] text-text-secondary mt-2 tracking-wide">React · TypeScript · Git</p>
              </div>
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={row.who}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.12, ease: EASE }}
              className="p-3 rounded-xl bg-surface-hover/60 border border-border"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-text">{row.who}</p>
                <span className="text-[10px] text-text-muted">{row.tag}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{row.what}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualStory() {
  const { t } = useI18n();
  return (
    <section className="py-16 md:py-24 border-t border-border relative overflow-hidden">
      <div className="shell-wide">
        <Reveal>
          <p className="text-sm font-semibold text-brand mb-3">{t("رحلة نقلة", "The Naqla journey")}</p>
          <h2 className="font-display text-3xl md:text-[2.6rem] font-bold text-text leading-tight max-w-2xl mb-10">
            {t("من الحرم الجامعي… إلى مقعدك الأول في سوق العمل", "From campus… to your first seat in the job market")}
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-5">
          <Reveal>
            <SpotlightCard className="group relative aspect-[16/10] rounded-3xl overflow-hidden border border-border nq-shine-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/naqla-career.jpg"
                alt={t("طلاب وخريجون في بيئة مهنية", "Students and graduates in a professional environment")}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                <p className="text-white/70 text-xs font-semibold mb-2">{t("المجتمع المهني", "Professional community")}</p>
                <p className="text-white font-display text-xl md:text-2xl font-bold leading-snug">
                  {t("تواصل، قدّم، وابنِ شبكتك مع الجامعات والشركات", "Connect, apply, and build your network with universities and companies")}
                </p>
              </div>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.1}>
            <SpotlightCard className="group relative aspect-[16/10] rounded-3xl overflow-hidden border border-border nq-shine-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/naqla-match.jpg"
                alt={t("تطابق فرص العمل", "Job opportunity matching")}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                <p className="text-white/70 text-xs font-semibold mb-2">{t("مطابقة المهارات", "Skills matching")}</p>
                <p className="text-white font-display text-xl md:text-2xl font-bold leading-snug">
                  {t("فرص تلائم مهاراتك — لا مجرّد قائمة وظائف", "Opportunities that fit your skills — not just a job list")}
                </p>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const { t } = useI18n();
  const showcaseCards = [
    { icon: LayoutGrid, title: t("المنشورات", "Posts"), desc: t("خلاصة مهنية حية من الشركات والجامعات والطلبة", "A live professional feed from companies, universities, and students"), tone: "from-blue-500/20 to-cyan-500/10" },
    { icon: Briefcase, title: t("الفرص", "Opportunities"), desc: t("وظائف وتدريب مع نسبة تطابق فورية لمهاراتك", "Jobs and internships with an instant match score for your skills"), tone: "from-indigo-500/20 to-blue-500/10" },
    { icon: MessageSquare, title: t("الدردشة", "Chat"), desc: t("تواصل مباشر مع HR والمرشدين والزملاء", "Direct contact with HR, mentors, and peers"), tone: "from-cyan-500/20 to-teal-500/10" },
    { icon: Compass, title: t("أدوات المسار المهني", "Career tools"), desc: t("بناء السيرة، تخطيط المسار، ومحاكاة المقابلة", "CV builder, career planning, and interview simulation"), tone: "from-violet-500/15 to-blue-500/10" },
    { icon: Target, title: t("تحليل السوق", "Market analysis"), desc: t("اتجاهات المهارات والرواتب والمواقع", "Trends in skills, salaries, and locations"), tone: "from-emerald-500/15 to-cyan-500/10" },
    { icon: Users, title: t("مجموعات المواهب", "Talent pools"), desc: t("شركات تبني قوائم مرشحين جاهزة", "Companies building ready-made candidate lists"), tone: "from-amber-500/15 to-orange-500/10" },
  ];

  const marquee = [
    t("جامعة بيرزيت", "Birzeit University"),
    t("جامعة النجاح الوطنية", "An-Najah National University"),
    "Jawwal",
    "PalPay",
    "Ooredoo",
    "Exalt",
    t("جامعة القدس", "Al-Quds University"),
    t("بنك فلسطين", "Bank of Palestine"),
    "Asal",
    "UnitOne",
  ];

  return (
    <section id="showcase" className="py-16 md:py-24 border-t border-border relative overflow-hidden">
      <div className="nq-grain opacity-[0.03]" />
      <div className="shell-wide mb-8">
        <Reveal>
          <p className="text-sm font-semibold text-brand mb-3">{t("استكشف المنصة", "Explore the platform")}</p>
          <h2 className="font-display text-3xl md:text-[2.6rem] font-bold text-text leading-tight max-w-2xl">
            {t("كل أداة في مكانها — تحرّك بينها بسلاسة", "Every tool in its place — move between them seamlessly")}
          </h2>
        </Reveal>
      </div>

      <div className="shell-wide">
        <div className="nq-hscroll pb-4 -mx-1 px-1">
          {showcaseCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <SpotlightCard className="w-[280px] sm:w-[300px] h-[220px] rounded-2xl border border-border bg-surface p-6 nq-shine-border hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.tone} border border-border flex items-center justify-center mb-5`}>
                  <card.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-text text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{card.desc}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-10 relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="nq-marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="nq-marquee-group" aria-hidden={dup === 1}>
              {marquee.map((name, idx) => (
                <span
                  key={`${dup}-${idx}`}
                  className="px-5 py-2.5 text-sm font-semibold text-text-secondary whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformSection() {
  const { t } = useI18n();
  const pillars = [
    { icon: LayoutGrid, title: t("منشورات مهنية", "Professional posts"), desc: t("أخبار الشركات والجامعات ومجتمع الطلبة في خلاصة واحدة.", "Company, university, and student community news in one feed.") },
    { icon: Briefcase, title: t("فرص حقيقية", "Real opportunities"), desc: t("وظائف وتدريب مطابَقة لمهاراتك ومسارك الأكاديمي.", "Jobs and internships matched to your skills and academic path.") },
    { icon: MessageSquare, title: t("دردشة مباشرة", "Direct chat"), desc: t("تواصل فوري مع مسؤولي التوظيف والمرشدين والزملاء.", "Instant contact with recruiters, mentors, and peers.") },
    { icon: Compass, title: t("أدوات مهنية", "Career tools"), desc: t("بناء السيرة، تخطيط المسار، وتقييم الجاهزية للتوظيف.", "CV building, career planning, and job-readiness assessment.") },
  ];

  return (
    <section id="platform" className="py-20 md:py-28 border-t border-border relative">
      <div className="shell-wide">
        <Reveal>
          <p className="text-sm font-semibold text-brand mb-3">{t("لماذا نقلة؟", "Why Naqla?")}</p>
          <h2 className="font-display text-3xl md:text-[2.5rem] font-bold text-text mb-4 max-w-2xl leading-tight">
            {t("كل ما يحتاجه الطالب للانتقال إلى سوق العمل — في منصّة واحدة", "Everything a student needs to move into the job market — in one platform")}
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-xl mb-12">
            {t("بدل التنقّل بين عشرات المواقع والمجموعات، جمعنا الرحلة كاملة في تجربة واحدة مترابطة.", "Instead of hopping between dozens of sites and groups, we brought the whole journey into one connected experience.")}
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <SpotlightCard className="group h-full p-6 rounded-2xl border border-border bg-surface hover:border-brand/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated nq-shine-border">
                <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <p.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-text mb-2">{p.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { icon: UserRound, n: t("٠١", "01"), title: t("أنشئ ملفّك المهني", "Create your professional profile"), desc: t("سيرتك، مهاراتك، ومشاريعك في صفحة واحدة احترافية تُبرز نقاط قوّتك.", "Your CV, skills, and projects on one professional page that highlights your strengths.") },
    { icon: Target, n: t("٠٢", "02"), title: t("اكتشف الفرص المناسبة", "Discover the right opportunities"), desc: t("توصيات وظائف وتدريب مبنية على تطابق مهاراتك مع متطلبات كل فرصة.", "Job and internship recommendations based on how your skills match each opportunity.") },
    { icon: ShieldCheck, n: t("٠٣", "03"), title: t("تواصل واحصل على القبول", "Connect and get accepted"), desc: t("قدّم بضغطة، تابع حالة طلبك، وتحدّث مباشرةً مع صاحب القرار.", "Apply in one click, track your application, and talk directly with the decision-maker.") },
  ];

  return (
    <section id="how" className="py-20 md:py-28 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="shell-wide relative z-10">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="text-sm font-semibold text-brand mb-3">{t("كيف تعمل؟", "How it works")}</p>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold text-text leading-tight">
              {t("ثلاث خطوات تفصلك عن فرصتك القادمة", "Three steps stand between you and your next opportunity")}
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 relative">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative h-full p-7 rounded-2xl border border-border bg-surface nq-shine-border overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-brand/10 blur-2xl group-hover:bg-brand/20 transition-colors" />
                <div className="relative flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-brand" />
                  </div>
                  <span className="font-display text-3xl font-bold text-text/10 tabular-nums group-hover:text-brand/20 transition-colors">{s.n}</span>
                </div>
                <h3 className="relative font-bold text-text text-lg mb-2">{s.title}</h3>
                <p className="relative text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const { t, isRTL } = useI18n();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const roles = [
    { icon: GraduationCap, label: t("طالب", "Student"), example: t("محمد نوفل", "Mohammed Nofal") },
    { icon: Users, label: t("خريج", "Graduate"), example: t("سارة خليل", "Sara Khalil") },
    { icon: Building2, label: t("شركة", "Company"), example: "Jawwal" },
    { icon: Compass, label: t("+ ٥ أدوار", "+5 roles"), example: t("جامعة · HR · مدرّب", "University · HR · Trainer") },
  ];

  return (
    <section id="roles" className="py-20 md:py-28 border-t border-border">
      <div className="shell-wide grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div>
            <p className="text-sm font-semibold text-brand mb-3">{t("٨ أدوار مستخدم", "8 user roles")}</p>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold text-text mb-4 leading-tight">
              {t("لكل دور تجربة مصمّمة له", "Every role gets an experience built for it")}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              {t(
                "سواء كنت طالباً، خريجاً، شركة، جامعة أو مسؤول توظيف — تحصل على لوحة تحكّم وأدوات مبنية على سيناريوهات حقيقية تخصّ دورك.",
                "Whether you are a student, graduate, company, university, or recruiter — you get a dashboard and tools built around real scenarios for your role."
              )}
            </p>
            <Magnetic strength={0.15}>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-brand font-semibold hover:brightness-110 transition-all"
              >
                {t("جرّب حسابات العرض", "Try the demo accounts")}
                <Chevron className="w-4 h-4" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r, i) => (
            <Reveal key={r.label} delay={i * 0.08}>
              <SpotlightCard className="p-5 rounded-2xl border border-border bg-surface hover:border-brand/30 transition-all duration-300 hover:-translate-y-1 nq-shine-border">
                <r.icon className="w-6 h-6 text-brand mb-3" />
                <p className="font-bold text-text">{r.label}</p>
                <p className="text-xs text-text-muted mt-1">{r.example}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LoginCTA() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  return (
    <section className="py-24 md:py-32 relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 pointer-events-none">
        <div className="nq-hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand/20 dark:bg-blue-600/25" />
        <div className="nq-grain" />
      </div>
      <div className="shell-wide relative z-10">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center rounded-3xl border border-border bg-surface/70 backdrop-blur-xl p-10 md:p-14 nq-shine-border shadow-elevated">
            <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold text-text mb-5 leading-tight">
              {t("جاهز تبدأ نقلتك؟", "Ready to begin your move?")}
            </h2>
            <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
              {t("ادخل بحساب العرض وجرّب المنشورات، البحث، والدردشة والتوصيات خلال دقيقة.", "Sign in with a demo account and try posts, search, chat, and recommendations in under a minute.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic>
                <Link
                  href="/auth/login"
                  className="nq-btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold text-white transition-transform hover:scale-[1.03]"
                  style={{ background: BRAND, boxShadow: "0 16px 56px rgba(29,78,216,0.5)" }}
                >
                  {t("تسجيل الدخول الآن", "Sign in now")}
                  <Arrow className="w-5 h-5" />
                </Link>
              </Magnetic>
              <p className="text-sm text-text-muted">
                {t("حساب تجريبي:", "Demo account:")} <span className="text-text-secondary font-mono">student@naqlah.ps</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LandingFooter() {
  const { t } = useI18n();
  return (
    <footer className="py-12 border-t border-border bg-surface">
      <div className="shell-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <Logo size="sm" />
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-text-muted">
            <Link href="/jobs" className="hover:text-text transition-colors">{t("وظائف", "Jobs")}</Link>
            <Link href="/internships" className="hover:text-text transition-colors">{t("تدريب", "Internships")}</Link>
            <Link href="/companies" className="hover:text-text transition-colors">{t("شركات", "Companies")}</Link>
            <Link href="/auth/login" className="hover:text-text transition-colors">{t("دخول", "Sign in")}</Link>
          </nav>
        </div>
        <div className="pt-6 border-t border-border text-sm text-text-muted text-center md:text-start">
          <p>{t("© ٢٠٢٦ نقلة — منصة التوظيف والتدريب الفلسطينية", "© 2026 Naqla — the Palestinian employment and training platform")}</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen text-text selection:bg-brand/20 landing-mesh">
        <LandingNav />
        <HeroSection />
        <VisualStory />
        <ShowcaseSection />
        <PlatformSection />
        <HowItWorks />
        <RolesSection />
        <LoginCTA />
        <LandingFooter />
      </div>
    </SmoothScroll>
  );
}
