"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";
import { AmbientGlow, MagneticButton } from "./shared";

const PATH_D =
  "M 80 280 C 140 260, 180 220, 240 240 S 360 200, 420 230 S 540 260, 600 220 S 720 180, 800 210 S 920 240, 1000 200";

function StudentSilhouette() {
  return (
    <svg viewBox="0 0 100 140" className="w-20 h-28 md:w-24 md:h-32" aria-hidden>
      <defs>
        <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="132" rx="22" ry="4" fill="rgba(37,99,235,0.3)" />
      <rect x="32" y="68" width="36" height="50" rx="8" fill="url(#stGrad)" />
      <circle cx="50" cy="48" r="18" fill="#fcd9b6" />
      <ellipse cx="50" cy="38" rx="20" ry="11" fill="#1e293b" />
      <polygon points="28,42 50,32 72,42 50,38" fill="#7c3aed" />
      <rect x="58" y="78" width="14" height="18" rx="2" fill="#06b6d4" opacity="0.9" />
    </svg>
  );
}

function ProfessionalSilhouette() {
  return (
    <svg viewBox="0 0 100 140" className="w-20 h-28 md:w-24 md:h-32" aria-hidden>
      <defs>
        <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="132" rx="24" ry="4" fill="rgba(124,58,237,0.35)" />
      <rect x="30" y="66" width="40" height="52" rx="8" fill="url(#proGrad)" />
      <circle cx="50" cy="46" r="18" fill="#fcd9b6" />
      <ellipse cx="50" cy="36" rx="20" ry="10" fill="#334155" />
      <rect x="38" y="72" width="24" height="6" rx="2" fill="white" opacity="0.3" />
      <motion.circle
        cx="72"
        cy="40"
        r="6"
        fill="#fbbf24"
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/60"
          style={{
            right: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function HeroJourney() {
  const { t, isRTL } = useI18n();
  const MILESTONES = [
    { id: "degree", icon: "🎓", label: t("شهادة جامعية", "University degree"), x: 18, y: 38 },
    { id: "skills", icon: "💻", label: t("تطوير مهارات", "Skill development"), x: 32, y: 52 },
    { id: "project", icon: "📁", label: t("مشروع حقيقي", "Real project"), x: 48, y: 42 },
    { id: "intern", icon: "🏢", label: t("تدريب عملي", "Hands-on internship"), x: 62, y: 55 },
    { id: "job", icon: "💼", label: t("عرض وظيفة", "Job offer"), x: 76, y: 44 },
  ];
  const containerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const sceneRef = useRef(null);
  const sceneInView = useInView(sceneRef, { once: true });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const parallaxX = useSpring(mouse.x, { stiffness: 40, damping: 20 });
  const parallaxY = useSpring(mouse.y, { stiffness: 40, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const pathProgress = useSpring(useTransform(scrollYProgress, [0, 0.85], [0, 1]), {
    stiffness: 60,
    damping: 20,
  });

  useEffect(() => {
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!path || !glow) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    glow.style.strokeDasharray = `${len}`;
    glow.style.strokeDashoffset = `${len}`;

    const unsub = pathProgress.on("change", (v) => {
      const offset = len * (1 - v);
      path.style.strokeDashoffset = `${offset}`;
      glow.style.strokeDashoffset = `${offset}`;
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 3.5,
      delay: 0.6,
      ease: "power2.inOut",
    });
    gsap.to(glow, {
      strokeDashoffset: 0,
      duration: 3.5,
      delay: 0.6,
      ease: "power2.inOut",
    });

    return () => unsub();
  }, [pathProgress]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-[200vh] bg-[#050816]"
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setMouse({
            x: ((e.clientX - r.left) / r.width - 0.5) * 24,
            y: ((e.clientY - r.top) / r.height - 0.5) * 16,
          });
        }}
      >
        <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute inset-0 pointer-events-none">
          <AmbientGlow className="w-[500px] h-[500px] bg-blue-600/15 top-0 right-0" />
          <AmbientGlow className="w-[400px] h-[400px] bg-purple-600/12 bottom-0 left-0" />
          <AmbientGlow className="w-[300px] h-[300px] bg-cyan-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
        <FloatingParticles />

        <div className="relative z-10 h-full shell-wide flex flex-col justify-center pt-20 pb-8">
          <motion.div
            className="text-center mb-6 md:mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-[clamp(1.75rem,5vw,3.5rem)] font-bold text-white leading-[1.1] mb-4">
              {t("من طالب...", "From student...")}
              <span className="bg-gradient-to-l from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {" "}{t("إلى فرصة حقيقية", "to a real opportunity")}
              </span>
            </h1>
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {t("منصة تربط الطلاب والخريجين بالشركات والتدريب والمشاريع لبناء مستقبلهم المهني.", "A platform connecting students and graduates with companies, internships, and projects to build their careers.")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <MagneticButton
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-l from-blue-600 to-purple-600 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
              >
                {t("ابدأ رحلتك", "Start your journey")}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </MagneticButton>
              <MagneticButton
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/80 border border-white/15 bg-white/5 backdrop-blur-md"
              >
                {t("استكشف الفرص", "Explore opportunities")}
              </MagneticButton>
            </div>
          </motion.div>

          <div ref={sceneRef} className="relative flex-1 min-h-[280px] md:min-h-[340px] max-h-[50vh]">
            <svg
              viewBox="0 0 1080 320"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                ref={glowRef}
                d={PATH_D}
                fill="none"
                stroke="url(#pathGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.35"
                filter="url(#glow)"
              />
              <path
                ref={pathRef}
                d={PATH_D}
                fill="none"
                stroke="url(#pathGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {MILESTONES.map((m, i) => (
                <motion.g
                  key={m.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={sceneInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.35, type: "spring", stiffness: 120 }}
                >
                  <circle
                    cx={(m.x / 100) * 1080}
                    cy={(m.y / 100) * 320}
                    r="28"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={(m.x / 100) * 1080}
                    cy={(m.y / 100) * 320}
                    r="20"
                    fill="rgba(37,99,235,0.15)"
                  />
                  <text
                    x={(m.x / 100) * 1080}
                    y={(m.y / 100) * 320 + 6}
                    textAnchor="middle"
                    fontSize="18"
                  >
                    {m.icon}
                  </text>
                  <text
                    x={(m.x / 100) * 1080}
                    y={(m.y / 100) * 320 + 44}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="11"
                    fontFamily="var(--font-cairo)"
                  >
                    {m.label}
                  </text>
                </motion.g>
              ))}
            </svg>

            <motion.div
              className="absolute left-[2%] bottom-[8%] md:bottom-[12%] flex flex-col items-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <StudentSilhouette />
              <span className="text-[10px] text-blue-300/80 mt-1 font-semibold">{t("طالب", "Student")}</span>
            </motion.div>

            <motion.div
              className="absolute right-[2%] bottom-[8%] md:bottom-[12%] flex flex-col items-center"
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 2.8, duration: 0.8 }}
            >
              <ProfessionalSilhouette />
              <span className="text-[10px] text-purple-300/80 mt-1 font-semibold">{t("محترف", "Professional")}</span>
            </motion.div>
          </div>

          <motion.p
            className="text-center text-[11px] text-white/30 mt-2"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {t("مرّر لاستكشاف الرحلة ↓", "Scroll to explore the journey ↓")}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
