"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n";
import { FloatingParticles } from "./floating-particles";
import { DoorCard } from "./door-card";
import { OpportunityCard } from "./opportunity-card";

const DOORS = [
  {
    id: "internship",
    label: "تدريب",
    labelEn: "Internship",
    opportunity: { title: "تدريب Frontend", titleEn: "Frontend Internship", icon: "🎓", accent: "blue" as const },
    accent: "blue" as const,
    position: "top-[6%] right-[2%] sm:right-[4%] md:right-[6%]",
    cardDirection: "left" as const,
  },
  {
    id: "job",
    label: "وظيفة",
    labelEn: "Job",
    opportunity: { title: "Junior React Developer", titleEn: "Junior React Developer", icon: "💼", accent: "teal" as const },
    accent: "teal" as const,
    position: "top-[6%] left-[2%] sm:left-[4%] md:left-[6%]",
    cardDirection: "right" as const,
  },
  {
    id: "project",
    label: "مشروع",
    labelEn: "Project",
    opportunity: { title: "مشروع تخرج ممول", titleEn: "Funded graduation project", icon: "🚀", accent: "purple" as const },
    accent: "purple" as const,
    position: "bottom-[10%] right-[2%] sm:right-[4%] md:right-[6%]",
    cardDirection: "left" as const,
  },
  {
    id: "startup",
    label: "شركة ناشئة",
    labelEn: "Startup",
    opportunity: { title: "فرصة مع شركة ناشئة", titleEn: "A role at a startup", icon: "⚡", accent: "cyan" as const },
    accent: "cyan" as const,
    position: "bottom-[10%] left-[2%] sm:left-[4%] md:left-[6%]",
    cardDirection: "right" as const,
  },
];

const OPEN_INTERVAL = 2200;
const LOOP_PAUSE = 5500;

function StudentFigure() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  return (
    <motion.div
      className="relative z-20"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.2 }}
    >
      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-blue-500/30 blur-xl rounded-full"
        animate={reduced ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox="0 0 120 200"
        className="w-[90px] h-[150px] sm:w-[100px] sm:h-[168px] md:w-[120px] md:h-[200px] drop-shadow-[0_0_40px_rgba(59,130,246,0.35)]"
        aria-hidden
        animate={reduced ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="studentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="192" rx="32" ry="6" fill="rgba(0,0,0,0.35)" />
        <rect x="38" y="95" width="44" height="70" rx="10" fill="url(#studentGrad)" opacity="0.9" />
        <circle cx="60" cy="72" r="26" fill="#fcd9b6" />
        <ellipse cx="60" cy="58" rx="28" ry="16" fill="#1e293b" />
        <polygon points="30,62 60,48 90,62 60,56" fill="url(#capGrad)" />
        <rect x="57" y="48" width="6" height="14" fill="#14b8a6" />
        <circle cx="63" cy="46" r="3" fill="#fbbf24" />
        <rect x="24" y="100" width="16" height="8" rx="4" fill="url(#studentGrad)" transform="rotate(-20 32 104)" />
        <rect x="80" y="100" width="16" height="8" rx="4" fill="url(#studentGrad)" transform="rotate(20 88 104)" />
        <rect x="44" y="162" width="14" height="28" rx="6" fill="#1e3a5f" />
        <rect x="62" y="162" width="14" height="28" rx="6" fill="#1e3a5f" />
        <rect x="78" y="118" width="18" height="22" rx="2" fill="#14b8a6" opacity="0.8" />
        <line x1="82" y1="124" x2="92" y2="124" stroke="white" strokeWidth="1" opacity="0.5" />
        <line x1="82" y1="130" x2="90" y2="130" stroke="white" strokeWidth="1" opacity="0.5" />
      </motion.svg>

      <p className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-white/50 whitespace-nowrap">
        {t("خريج 2025", "Class of 2025")}
      </p>
    </motion.div>
  );
}

function DoorsScene({
  openIndex,
  activeIndex,
  hoveredDoor,
  setHoveredDoor,
  onDoorClick,
  parallaxX,
  parallaxY,
}: {
  openIndex: number;
  activeIndex: number;
  hoveredDoor: number | null;
  setHoveredDoor: (i: number | null) => void;
  onDoorClick: (i: number) => void;
  parallaxX: ReturnType<typeof useSpring>;
  parallaxY: ReturnType<typeof useSpring>;
}) {
  const { t } = useI18n();
  const activeDoor = activeIndex >= 0 ? DOORS[activeIndex] : null;

  return (
    <div className="w-full">
      <motion.div
        className="relative w-full max-w-[300px] sm:max-w-[420px] md:max-w-[480px] aspect-square mx-auto"
        style={{ x: parallaxX, y: parallaxY }}
      >
        <motion.div
          className="absolute inset-[14%] rounded-full border border-white/5"
          animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-[24%] rounded-full border border-blue-500/10"
          animate={{ scale: [1.04, 1, 1.04], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <StudentFigure />
        </div>

        {DOORS.map((door, i) => (
          <DoorCard
            key={door.id}
            label={t(door.label, door.labelEn)}
            opportunity={{ title: t(door.opportunity.title, door.opportunity.titleEn), icon: door.opportunity.icon, accent: door.opportunity.accent }}
            accent={door.accent}
            isOpen={openIndex >= i}
            isActive={activeIndex === i || hoveredDoor === i}
            index={i}
            cardDirection={door.cardDirection}
            className={door.position}
            onHover={() => setHoveredDoor(i)}
            onClick={() => onDoorClick(i)}
          />
        ))}
      </motion.div>

      <div className="sm:hidden mt-4 px-2 min-h-[52px]">
        {activeDoor && activeIndex >= 0 && (
          <OpportunityCard
            title={t(activeDoor.opportunity.title, activeDoor.opportunity.titleEn)}
            icon={activeDoor.opportunity.icon}
            accent={activeDoor.accent}
            visible={openIndex >= activeIndex}
            variant="inline"
          />
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  const reduced = useReducedMotion();
  const { t, isRTL } = useI18n();
  const [openIndex, setOpenIndex] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredDoor, setHoveredDoor] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, -10]), { stiffness: 80, damping: 20 });
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 80, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reduced]
  );

  const handleDoorClick = useCallback((i: number) => {
    setPaused(true);
    setActiveIndex(i);
    setOpenIndex(i);
    setTimeout(() => setPaused(false), LOOP_PAUSE + 2000);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;

    setOpenIndex(-1);
    const timers: ReturnType<typeof setTimeout>[] = [];

    DOORS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setOpenIndex(i);
          setActiveIndex(i);
        }, 900 + i * OPEN_INTERVAL)
      );
    });

    timers.push(
      setTimeout(() => {
        setOpenIndex(-1);
        setCycle((c) => c + 1);
      }, 900 + DOORS.length * OPEN_INTERVAL + LOOP_PAUSE)
    );

    return () => timers.forEach(clearTimeout);
  }, [cycle, paused, reduced]);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[#050d18]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
        setHoveredDoor(null);
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[min(600px,90vw)] h-[min(600px,70vh)] bg-blue-600/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[min(500px,80vw)] h-[min(500px,60vh)] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,95vw)] h-[min(400px,50vh)] bg-teal-500/6 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <FloatingParticles count={reduced ? 12 : 28} />

      <div className="relative z-10 shell-wide pt-24 pb-20 md:pt-28 md:pb-24 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center w-full">
          <motion.div
            className="text-right order-2 lg:order-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.p
              className="text-sm font-medium text-blue-300/80 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {t("منصة مهنية · فلسطين", "Career platform · Palestine")}
            </motion.p>

            <h1 className="font-display text-[clamp(1.85rem,5vw,3.75rem)] font-bold text-white leading-[1.1] mb-5">
              {t("كل فرصة", "Every opportunity")}
              <br />
              <span className="bg-gradient-to-l from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
                {t("تبدأ بنقلة", "begins with Naqla")}
              </span>
            </h1>

            <p className="text-[15px] md:text-lg text-white/55 leading-relaxed max-w-lg mb-8">
              {t("من التدريب إلى الوظيفة… منصة تربط الطلاب والخريجين بالشركات عبر مطابقة دقيقة للمهارات.", "From internship to job — a platform connecting students and graduates with companies through precise skills matching.")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-[0_4px_24px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-0.5"
              >
                {t("ابدأ رحلتك", "Start your journey")}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white/80 border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all"
              >
                {t("استكشف الفرص", "Explore opportunities")}
              </Link>
            </div>

            <div className="flex gap-6 mt-10 pt-8 border-t border-white/10">
              {[
                { v: "+12", l: t("قطاع", "Sectors") },
                { v: "4", l: t("مسارات", "Paths") },
                { v: "∞", l: t("فرص", "Opportunities") },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-xl md:text-2xl font-bold text-white tabular-nums">{s.v}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <DoorsScene
              openIndex={openIndex}
              activeIndex={activeIndex}
              hoveredDoor={hoveredDoor}
              setHoveredDoor={setHoveredDoor}
              onDoorClick={handleDoorClick}
              parallaxX={parallaxX}
              parallaxY={parallaxY}
            />
          </div>
        </div>
      </div>

      <motion.a
        href="#opportunities"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
        animate={reduced ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        aria-label={t("انتقل للفرص", "Go to opportunities")}
      >
        <span className="text-[10px] tracking-widest uppercase">{t("اكتشف", "Discover")}</span>
        <ChevronDown className="w-4 h-4" />
      </motion.a>

      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-cream via-cream/80 to-transparent pointer-events-none" />
    </section>
  );
}
