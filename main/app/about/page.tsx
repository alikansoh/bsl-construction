"use client";

/**
 * AboutUs.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "About Us" page.
 *
 * Design language carried over from Hero.tsx / WhoWeAre.tsx / WhyChooseUs.tsx:
 * - Fraunces serif for display type, system sans for body
 * - Brass/terracotta accent (#A26028) on warm cream (#FAFAF9/#FBF9F6)
 * - Blueprint dot-grid texture as the site's recurring "drawn on paper" motif
 * -------------------------------------------------------------------------
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

/* -------------------------------------------------------------------------- */
/* CONTENT                                                                    */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: 15, suffix: "+", label: "Years working across London" },
  { value: 4, suffix: "", label: "Core trades under one team" },
  { value: 12, suffix: "", label: "Month workmanship guarantee" },
  { value: 1, suffix: "", label: "Point of contact, quote to aftercare" },
] as const;

const CREDENTIALS = [
  "Gas Safe registered",
  "Fully insured",
  "Supervised site management",
  "Vaillant & Worcester Bosch",
  "Water regs & RPZ testing",
  "12-month guarantee",
] as const;

const STORY_BEATS = [
  {
    no: "01",
    title: "The problem we kept seeing",
    body: "Building work, mechanical services and ongoing maintenance were treated as separate jobs for separate companies — and clients were left coordinating between them.",
  },
  {
    no: "02",
    title: "How we built BSL differently",
    body: "One team handles the building, the plumbing and heating, the electrics, and the maintenance that follows — so nothing gets lost in translation between trades.",
  },
  {
    no: "03",
    title: "Fifteen years on",
    body: "The approach hasn't changed — we've just gotten better at it: more qualified people, wider services, and long-standing maintenance relationships with property managers, hotels and commercial clients.",
  },
] as const;

const MISSION_VISION = [
  {
    label: "Our Mission",
    icon: "level",
    statement:
      "To deliver complete building, mechanical and commercial maintenance services under one accountable team — so clients never have to chase multiple contractors to get a job done properly.",
  },
  {
    label: "Our Vision",
    icon: "compass",
    statement:
      "To be the single trusted point of contact for buildings across London — from the first extension, through every mechanical and electrical service, to the maintenance that keeps a property running for years after.",
  },
] as const;

const VALUES = [
  {
    label: "Workmanship",
    detail:
      "Qualified, fully insured tradespeople working under supervised site management, on every job regardless of size.",
    icon: "level",
  },
  {
    label: "Communication",
    detail:
      "One point of contact from quote to completion, with clear timelines and no surprises along the way.",
    icon: "compass",
  },
  {
    label: "Standards",
    detail:
      "Gas Safe registered engineers, Vaillant and Worcester Bosch installation expertise, and water regulations & RPZ valve testing.",
    icon: "square",
  },
  {
    label: "Guarantee",
    detail:
      "A 12-month workmanship guarantee on completed work, because we stand behind the job after we've left site.",
    icon: "shield",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */

function ValueIcon({ type }: { type: (typeof VALUES)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    className: "h-5 w-5",
    "aria-hidden": true as const,
  };

  switch (type) {
    case "level":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="5" rx="1.2" strokeLinejoin="round" />
          <circle cx="12" cy="12.5" r="1.6" />
          <path d="M7 10v5M17 10v5" strokeLinecap="round" />
        </svg>
      );

    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M14.8 9.2l-2.2 5.6-5.6 2.2 2.2-5.6 5.6-2.2z" strokeLinejoin="round" />
        </svg>
      );

    case "square":
      return (
        <svg {...common}>
          <path d="M4.5 3.5v17h17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 8.2h2.4M4.5 12.6h2.4M4.5 17h2.4" strokeLinecap="round" />
          <path d="M9.3 20.5v-2.4M13.7 20.5v-2.4M18.1 20.5v-2.4" strokeLinecap="round" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path
            d="M12 3.5l6.5 2.6v5.4c0 4.6-3.2 7.4-6.5 8.5-3.3-1.1-6.5-3.9-6.5-8.5V6.1L12 3.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12.1l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

/* -------------------------------------------------------------------------- */
/* HOOKS                                                                      */
/* -------------------------------------------------------------------------- */

function useReveal<T extends Element>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced-motion users are handled purely in CSS (the transition is
    // disabled and the end-state is forced visible), so we can always observe.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

/** Count from 0 → target once `active` flips true. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;

    if (reduced) {
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

function StatItem({
  stat,
  active,
  index,
}: {
  stat: (typeof STATS)[number];
  active: boolean;
  index: number;
}) {
  const n = useCountUp(stat.value, active, 1100 + index * 160);

  return (
    <div
      className={`bsl-reveal ${active ? "is-visible" : ""} relative px-6 py-8 text-center sm:py-10`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="bsl-serif text-[clamp(2.6rem,6vw,3.6rem)] font-medium leading-none text-white">
        {n}
        <span className="text-[#E8C599]">{stat.suffix}</span>
      </div>
      <div className="mx-auto mt-3 max-w-[14rem] text-[0.8rem] leading-[1.5] text-white/60">
        {stat.label}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STRUCTURED DATA                                                            */
/* -------------------------------------------------------------------------- */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  about: {
    "@type": "HomeAndConstructionBusiness",
    name: "BSL Construction",
    areaServed: "London",
    description:
      "BSL Construction is a complete building, mechanical, electrical and commercial maintenance company based in London.",
  },
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function AboutUs() {
  const [storyRef, storyVisible] = useReveal<HTMLDivElement>(0.15);
  const [statsRef, statsVisible] = useReveal<HTMLDivElement>(0.3);
  const [missionRef, missionVisible] = useReveal<HTMLDivElement>(0.15);
  const [valuesRef, valuesVisible] = useReveal<HTMLDivElement>(0.15);
  const [bandRef, bandVisible] = useReveal<HTMLDivElement>(0.2);

  return (
    <main className={fraunces.variable}>
      <style>{`
        .bsl-serif {
          font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
        }

        .bsl-blueprint-grid {
          background-image: radial-gradient(circle, rgba(28,23,18,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .bsl-blueprint-grid-dark {
          background-image: radial-gradient(circle, rgba(232,197,153,0.14) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        @keyframes bsl-hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bsl-hero-anim > * {
          opacity: 0;
          animation: bsl-hero-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .bsl-hero-anim > *:nth-child(1) { animation-delay: 0.04s; }
        .bsl-hero-anim > *:nth-child(2) { animation-delay: 0.13s; }
        .bsl-hero-anim > *:nth-child(3) { animation-delay: 0.22s; }
        .bsl-hero-anim > *:nth-child(4) { animation-delay: 0.31s; }
        .bsl-hero-anim > *:nth-child(5) { animation-delay: 0.40s; }

        @keyframes bsl-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .bsl-float { animation: bsl-float 6s ease-in-out infinite; }

        .bsl-reveal {
          opacity: 0;
          transform: translateY(26px);
          filter: blur(6px);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.8s ease;
        }
        .bsl-reveal.is-visible {
          opacity: 1;
          transform: none;
          filter: none;
        }

        .bsl-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .bsl-fade.bsl-visible { opacity: 1; transform: translateY(0); }

        .bsl-drop::first-letter {
          font-family: var(--font-fraunces), serif;
          float: left;
          font-size: 3.4rem;
          line-height: 0.8;
          font-weight: 500;
          padding: 0.35rem 0.55rem 0 0;
          color: #A26028;
        }

        @media (prefers-reduced-motion: reduce) {
          .bsl-hero-anim > *,
          .bsl-reveal,
          .bsl-fade {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            animation: none !important;
            transition: none !important;
          }
          .bsl-float { animation: none !important; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* ==================================================================
          PAGE INTRO
      =================================================================== */}

      <section
        aria-labelledby="about-hero-heading"
        className="relative overflow-hidden bg-[#FAFAF9] px-5 pt-28 pb-16 sm:px-8 md:pt-36 md:pb-24"
      >
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(120%_80%_at_80%_0%,#000_0%,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-32 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.12)_0%,rgba(162,96,40,0)_70%)]"
        />

        <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="bsl-hero-anim">
            <span className="relative mb-5 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              About BSL Construction
            </span>

            <h1
              id="about-hero-heading"
              className="bsl-serif text-[clamp(2.4rem,5.4vw,4rem)] font-medium leading-[1.06] tracking-[-0.02em] text-[#0B0B0D]"
            >
              Built on trades,{" "}
              <span className="italic text-[#A26028]">run like a practice.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[clamp(1rem,1.5vw,1.12rem)] leading-[1.8] text-[#43433F]">
              We grew from a small team of tradespeople into a complete building,
              mechanical, electrical and commercial maintenance company — without
              losing the habit of turning up, doing the job properly, and being
              reachable afterwards.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/contact#quote"
                className="group inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white shadow-[0_18px_40px_-16px_rgba(162,96,40,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#8A5121]"
              >
                Get a free quote
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  <path
                    d="M2 7h10M12 7l-4.5-4.5M12 7l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-[#1C1712]/20 px-7 py-3.5 text-[0.95rem] font-semibold text-[#1C1712] transition-colors duration-200 hover:border-[#A26028] hover:text-[#A26028]"
              >
                See our work
              </Link>
            </div>
          </div>

          {/* Framed portrait — blueprint corner ticks + floating tag */}
          <div className="bsl-reveal is-visible relative mx-auto w-full max-w-[520px]">
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rounded-[26px] border border-[#A26028]/25" />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] shadow-[0_40px_80px_-40px_rgba(11,11,13,0.45)]">
                <Image
                  src="/gallery4.webp"
                  alt="BSL Construction team on a London project"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,13,0)_55%,rgba(11,11,13,0.5)_100%)]"
                />
              </div>

              {/* corner ticks */}
              <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-[#A26028]" />
              <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-[#A26028]" />

              {/* floating credential tag */}
              <div className="bsl-float absolute -bottom-6 -left-6 hidden rounded-2xl border border-[#1C1712]/10 bg-white/95 px-5 py-4 shadow-[0_24px_50px_-24px_rgba(11,11,13,0.5)] backdrop-blur sm:block">
                <div className="bsl-serif text-2xl font-medium text-[#0B0B0D]">15+ yrs</div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#A26028]">
                  On site in London
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials ribbon */}
        <div className="relative mx-auto mt-14 max-w-[1180px] border-t border-[#1C1712]/10 pt-6 md:mt-20">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.82rem] font-medium text-[#6E6259]">
            {CREDENTIALS.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#A26028]">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================================================================
          STATS BAND
      =================================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-[#1D1813] to-[#161210] px-5 sm:px-8">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-25"
        />
        <div
          ref={statsRef}
          className="relative mx-auto grid max-w-[1180px] grid-cols-2 divide-x divide-y divide-white/10 lg:grid-cols-4 lg:divide-y-0"
        >
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} active={statsVisible} index={i} />
          ))}
        </div>
      </section>

      {/* ==================================================================
          OUR STORY
      =================================================================== */}

      <section
        aria-labelledby="our-story-heading"
        className="relative bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-28"
      >
        <div
          ref={storyRef}
          className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16"
        >
          <div
            className={`bsl-fade md:sticky md:top-28 md:self-start ${
              storyVisible ? "bsl-visible" : ""
            }`}
          >
            <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              Our Story
            </span>

            <h2
              id="our-story-heading"
              className="bsl-serif text-[clamp(1.9rem,3.6vw,2.7rem)] font-medium leading-[1.12] text-[#0B0B0D]"
            >
              One team, so nothing gets lost between trades
            </h2>

            <p className="mt-5 max-w-sm text-[0.95rem] leading-[1.8] text-[#6E6259]">
              Founded in London by tradespeople — and still run the same way.
            </p>
          </div>

          <div className="relative">
            {/* connecting rule */}
            <span
              aria-hidden="true"
              className="absolute left-[15px] top-2 bottom-2 hidden w-px bg-[#1C1712]/12 sm:block"
            />

            <ol className="flex flex-col gap-10">
              {STORY_BEATS.map((beat, i) => (
                <li
                  key={beat.no}
                  className={`bsl-fade relative sm:pl-14 ${
                    storyVisible ? "bsl-visible" : ""
                  }`}
                  style={{ transitionDelay: `${120 + i * 120}ms` }}
                >
                  <span className="mb-2 hidden h-8 w-8 items-center justify-center rounded-full border border-[#A26028]/40 bg-[#FAFAF9] text-[0.72rem] font-bold text-[#A26028] sm:absolute sm:left-0 sm:top-0 sm:flex">
                    {beat.no}
                  </span>

                  <h3 className="bsl-serif text-[1.25rem] font-medium text-[#0B0B0D]">
                    {beat.title}
                  </h3>
                  <p
                    className={`mt-2 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.85] text-[#43433F] ${
                      i === 0 ? "bsl-drop" : ""
                    }`}
                  >
                    {beat.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ==================================================================
          MISSION & VISION
      =================================================================== */}

      <section
        aria-labelledby="mission-heading"
        className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-28"
      >
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="relative mx-auto max-w-[1180px]">
          <header className="mx-auto mb-12 max-w-xl text-center md:mb-16">
            <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              What Drives Us
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            </span>

            <h2
              id="mission-heading"
              className="bsl-serif text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.15] text-[#1C1712]"
            >
              Our mission &amp; vision
            </h2>
          </header>

          <div
            ref={missionRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
          >
            {MISSION_VISION.map((item, i) => (
              <div
                key={item.label}
                className={`bsl-fade group relative overflow-hidden rounded-2xl border border-[#1C1712]/8 bg-[#FBF9F6] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#A26028]/30 hover:shadow-[0_28px_60px_-30px_rgba(28,23,18,0.35)] md:p-10 ${
                  missionVisible ? "bsl-visible" : ""
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028]/20 transition-transform duration-500 group-hover:scale-x-100"
                />
                <span
                  aria-hidden="true"
                  className="bsl-serif pointer-events-none absolute -bottom-6 -right-2 text-[7rem] font-medium leading-none text-[#1C1712]/[0.04]"
                >
                  0{i + 1}
                </span>

                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028] transition-colors duration-300 group-hover:bg-[#A26028] group-hover:text-white">
                  <ValueIcon type={item.icon} />
                </span>

                <h3 className="bsl-serif mb-3 text-[1.35rem] font-medium text-[#1C1712]">
                  {item.label}
                </h3>

                <p className="relative text-[1rem] leading-[1.8] text-[#6E6259]">
                  {item.statement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          VALUES — SPEC SHEET
      =================================================================== */}

      <section
        aria-labelledby="values-heading"
        className="bg-[#FBF9F6] px-5 py-16 sm:px-8 md:py-28"
      >
        <div className="mx-auto max-w-[1180px]">
          <header className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              How We Work
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            </span>

            <h2
              id="values-heading"
              className="bsl-serif text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.15] text-[#1C1712]"
            >
              The specification we hold ourselves to
            </h2>
          </header>

          <div
            ref={valuesRef}
            className="grid grid-cols-1 divide-y divide-[#1C1712]/8 overflow-hidden rounded-2xl border border-[#1C1712]/8 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
          >
            {VALUES.map((v, i) => (
              <div
                key={v.label}
                className={`bsl-fade group relative flex flex-col gap-3 p-7 transition-colors duration-300 hover:bg-[#FBF9F6] ${
                  valuesVisible ? "bsl-visible" : ""
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-[#A26028] transition-transform duration-500 group-hover:scale-x-100"
                />

                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#A26028]/25 text-[#A26028] transition-colors duration-300 group-hover:bg-[#A26028] group-hover:text-white">
                    <ValueIcon type={v.icon} />
                  </span>
                  <span className="bsl-serif text-[0.85rem] font-medium text-[#1C1712]/25">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="bsl-serif mt-1 text-[1.1rem] font-medium text-[#1C1712]">
                  {v.label}
                </h3>

                <p className="text-[0.88rem] leading-[1.7] text-[#6E6259]">
                  {v.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          PHOTO BAND
      =================================================================== */}

      <section className="bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-28">
        <div
          ref={bandRef}
          className={`bsl-fade mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 ${
            bandVisible ? "bsl-visible" : ""
          }`}
        >
          <div className="relative md:order-2">
            <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[28px] border border-[#A26028]/25" />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(11,11,13,0.4)]">
              <Image
                src="/aboutus.webp"
                alt="A recent BSL Construction building project in London"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-[#A26028]" />
            <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-[#A26028]" />

            <div className="bsl-float absolute -bottom-6 right-6 hidden rounded-2xl border border-[#1C1712]/10 bg-white/95 px-5 py-4 shadow-[0_24px_50px_-24px_rgba(11,11,13,0.5)] backdrop-blur sm:block">
              <div className="bsl-serif text-xl font-medium text-[#0B0B0D]">12-month</div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#A26028]">
                Workmanship guarantee
              </div>
            </div>
          </div>

          <div className="md:order-1">
            <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              On Site
            </span>

            <h2 className="bsl-serif mb-5 text-[clamp(1.9rem,3.4vw,2.5rem)] font-medium leading-[1.16] text-[#0B0B0D]">
              Fully insured, Gas Safe registered, and on site when we say
              we&apos;ll be
            </h2>

            <p className="mb-6 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.8] text-[#43433F]">
              Every project is supervised by a dedicated site lead, backed by a
              qualified professional team across building, mechanical and
              electrical trades. It&apos;s the reason clients keep coming back
              for the next project — and the maintenance contract after that.
            </p>

            <Link
              href="/contact#quote"
              className="group inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
            >
              Get your free quote
              <svg
                width="15"
                height="15"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M2 7h10M12 7l-4.5-4.5M12 7l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================
          CTA BAND
      =================================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-[#1D1813] to-[#120F0C] px-5 py-20 sm:px-8 md:py-28">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,197,153,0.16)_0%,rgba(232,197,153,0)_70%)]"
        />

        <div className="relative mx-auto max-w-[820px] text-center">
          <h2 className="bsl-serif text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-[1.1] text-white">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[1rem] leading-[1.75] text-white/65">
            Tell us what you&apos;re building or maintaining, and we&apos;ll get
            back to you with clear next steps — free of charge.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact#quote"
              className="group inline-flex items-center gap-2 rounded-full bg-[#A26028] px-8 py-4 text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_20px_44px_-18px_rgba(162,96,40,0.8)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
            >
              Get in touch
              <svg
                width="15"
                height="15"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M2 7h10M12 7l-4.5-4.5M12 7l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="tel:+447342324660"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/5"
            >
              +44 7342 324660
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
