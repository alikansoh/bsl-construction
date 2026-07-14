/**
 * WhoWeAre.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Who We Are" section — brand accent #A26028. Built with Tailwind CSS.
 * Copy is SEO-optimized for West London renovation/construction searches,
 * naturally weaving in target service areas (Ealing, Fulham, Wembley,
 * Chiswick, Acton, Hammersmith, Richmond) without keyword-stuffing.
 * - Semantic <section>/<h2> for on-page SEO structure.
 * - Stat cards show icons, count-up numbers, and rise-in on scroll.
 * - Fully responsive: stacked on mobile, split layout on desktop.
 *
 * NOTE: brand accent #A26028 isn't a default Tailwind color, so it's used
 * via arbitrary-value utilities (e.g. bg-[#A26028]). If this accent is
 * reused elsewhere, consider adding it to tailwind.config as `brand`.
 * -------------------------------------------------------------------------
 */
"use client";
import { useEffect, useRef, useState } from "react";

const SERVICE_AREAS = [
  "Ealing",
  "Fulham",
  "Wembley",
  "Chiswick",
  "Acton",
  "Hammersmith",
  "Richmond",
];

const STATS = [
  {
    label: "Years of Experience",
    target: 10,
    suffix: "+",
    icon: (
      <path d="M12 7v5l3 2M12 3a9 9 0 1 0 9 9" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    label: "Projects Completed",
    target: 150,
    suffix: "+",
    icon: (
      <path
        d="M4 21V9l8-5 8 5v12M9 21v-6h6v6M4 21h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Client Satisfaction Focus",
    target: 100,
    suffix: "%",
    icon: (
      <path
        d="M9 12.5l2 2 4.5-4.5M12 3l7 3v5c0 4.5-3 8.25-7 10-4-1.75-7-5.5-7-10V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const ANIMATION_DURATION_MS = 1600;

// Ease-out curve so the count-up starts fast and settles gently.
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

function useCountUp(target: number, shouldStart: boolean, duration = ANIMATION_DURATION_MS) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStart, target, duration]);

  return value;
}

function StatCard({
  stat,
  isVisible,
  index,
}: {
  stat: (typeof STATS)[number];
  isVisible: boolean;
  index: number;
}) {
  const count = useCountUp(stat.target, isVisible);

  return (
    <div
      className={`
        group relative flex items-center gap-4 overflow-hidden rounded-2xl
        border border-[#A26028]/15 bg-gradient-to-br from-white to-[#FDF8F2]
        p-5 shadow-[0_1px_2px_rgba(11,11,13,0.04),0_10px_24px_rgba(11,11,13,0.05)]
        transition-all duration-300 ease-out
        hover:border-[#A26028]/35 hover:shadow-[0_1px_2px_rgba(11,11,13,0.04),0_14px_30px_rgba(162,96,40,0.12)]
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}
        motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none
      `}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#A26028] to-[#A26028]/15"
      />

      <span
        aria-hidden="true"
        className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#A26028]/25 bg-[#A26028]/10 text-[#A26028]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
          {stat.icon}
        </svg>
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[clamp(1.65rem,3vw,2.1rem)] font-extrabold leading-none tabular-nums text-[#0B0B0D]">
          {count}
          {stat.suffix}
        </span>
        <span className="text-[0.82rem] font-medium text-[#6B6B64]">{stat.label}</span>
      </span>
    </div>
  );
}

export default function WhoWeAre() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="who-we-are-heading"
      className="relative overflow-hidden bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.12)_0%,rgba(162,96,40,0)_70%)]"
      />

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-10 md:grid-cols-[1.6fr_1fr] md:gap-16">
        <div>
          <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
            Who We Are
          </span>

          <h2
            id="who-we-are-heading"
            className="mb-6 text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0B0B0D]"
          >
            Built on Experience, <span className="text-[#A26028]">Driven by Excellence</span>
          </h2>

          <p className="mb-[1.15rem] text-[clamp(1.05rem,1.6vw,1.15rem)] leading-[1.75] text-[#26261F]">
            At <strong className="font-bold text-[#0B0B0D]">BSL Construction</strong>, we
            don&apos;t just build — we deliver excellence at every step of the way. As a trusted{" "}
            <strong className="font-bold text-[#0B0B0D]">
              West London construction and renovation company
            </strong>
            , we&apos;ve earned our reputation project by project, street by street.
          </p>

          <p className="mb-[1.15rem] text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.75] text-[#43433F]">
            From the first conversation to the final walkthrough, we carry ourselves with
            professionalism, integrity, and discipline. We believe a truly smooth,
            stress-free renovation or building project starts with clear communication, tight
            planning, and a commitment to the highest possible standards — and we hold
            ourselves to that standard on every single job, whether it&apos;s a full house
            renovation, a home extension, or general contracting work.
          </p>

          <p className="mb-7 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.75] text-[#43433F]">
            Based in West London, we specialise in{" "}
            <strong className="font-bold text-[#0B0B0D]">
              home renovations, extensions, and construction services
            </strong>{" "}
            across <strong className="font-bold text-[#0B0B0D]">Ealing</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Fulham</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Wembley</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Chiswick</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Acton</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Hammersmith</strong>,{" "}
            <strong className="font-bold text-[#0B0B0D]">Richmond</strong>, and the
            surrounding areas. Nothing is considered complete until our clients are genuinely
            satisfied and proud of the result.
          </p>

          <div
            role="list"
            aria-label="Areas we serve"
            className="mb-9 flex flex-wrap gap-2.5"
          >
            {SERVICE_AREAS.map((area) => (
              <span
                key={area}
                role="listitem"
                className="whitespace-nowrap rounded-full border border-[#A26028]/30 bg-[#A26028]/[0.08] px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.03em] text-[#A26028]"
              >
                {area}
              </span>
            ))}
          </div>

          <a
            href="/contact#quote"
            className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Get Your Free Quote
          </a>
        </div>

        <div ref={statsRef} className="flex flex-col gap-4 md:sticky md:top-24">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} isVisible={statsVisible} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}