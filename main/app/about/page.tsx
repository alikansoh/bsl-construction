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
 *
 * Signature element for this page: a blueprint TITLE BLOCK in the hero
 * (the stamped info box printed in the corner of every real architectural
 * drawing — project / sheet / scope / location).
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

const TITLE_BLOCK = [
  { label: "Project", value: "BSL Construction" },
  { label: "Sheet", value: "About — 01" },
  { label: "Scope", value: "Building, M&E & Maintenance" },
  { label: "Location", value: "London, UK" },
];

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

function useReveal<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisible(true);
      return;
    }

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

        .bsl-hero-accent {
          background-image: linear-gradient(100deg, #E8C599 10%, #FFF3DC 45%, #C98A3F 80%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .bsl-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }

        .bsl-fade.bsl-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .bsl-fade {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* ==================================================================
          HERO — TITLE BLOCK
      =================================================================== */}

      <section
        aria-labelledby="about-hero-heading"
        className="relative overflow-hidden bg-gradient-to-b from-[#26201A] via-[#1D1813] to-[#161210] px-5 pb-16 pt-28 sm:px-8 md:pb-24 md:pt-36"
      >
        {/* Soft light glow behind the nav logo, top-left — echoes the
            brass glow blobs below, just cream-toned and closer to the
            surface so it can host a dark logo mark. */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 340px 220px at 6% 4%, rgba(250,248,246,0.95) 0%, rgba(250,248,246,0.65) 32%, rgba(250,248,246,0.22) 55%, rgba(250,248,246,0) 78%)",
          }}
        />

        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-30"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(232,197,153,0.22)_0%,rgba(232,197,153,0)_70%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-24 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.16)_0%,rgba(162,96,40,0)_70%)]"
        />

        <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-end gap-10 md:grid-cols-[1.3fr_0.7fr] md:gap-8">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#E8C599] backdrop-blur-sm">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E8C599]" />
              About BSL Construction
            </span>

            <h1
              id="about-hero-heading"
              className="bsl-serif max-w-3xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white"
            >
              Built on trades,
              <br />
              <span className="bsl-hero-accent italic">run like a practice.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[clamp(0.98rem,1.5vw,1.1rem)] leading-[1.75] text-white/70">
              We started as a small team of tradespeople and grew into a
              complete building, mechanical, electrical and commercial
              maintenance company — without losing the habit of turning up,
              doing the job properly, and being reachable afterwards.
            </p>
          </div>

          {/* Title block — the blueprint stamp, reimagined as a glass card */}

          <div className="w-full max-w-sm justify-self-start rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] backdrop-blur-xl md:justify-self-end">
            <span className="mb-4 inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/40">
              <span aria-hidden="true" className="h-px w-4 bg-white/25" />
              Title Block
            </span>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              {TITLE_BLOCK.map((row) => (
                <div key={row.label} className="min-w-0">
                  <dt className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/40">
                    {row.label}
                  </dt>
                  <dd className="bsl-serif mt-0.5 truncate text-[0.98rem] text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ==================================================================
          OUR STORY
      =================================================================== */}

      <section
        aria-labelledby="our-story-heading"
        className="relative bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-24"
      >
        <div
          ref={storyRef}
          className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16"
        >
          <div className={`bsl-fade ${storyVisible ? "bsl-visible" : ""}`}>
            <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              Our Story
            </span>

            <h2
              id="our-story-heading"
              className="bsl-serif mb-6 text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.15] text-[#0B0B0D]"
            >
              One team, so nothing gets lost between trades
            </h2>
          </div>

          <div
            className={`bsl-fade flex flex-col gap-5 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.8] text-[#43433F] ${
              storyVisible ? "bsl-visible" : ""
            }`}
            style={{ transitionDelay: "120ms" }}
          >
            <p>
              BSL Construction was founded in London by tradespeople who kept
              seeing the same problem: building work, mechanical services and
              ongoing maintenance were treated as separate jobs for separate
              companies, and clients were left coordinating between them.
            </p>

            <p>
              We built BSL the other way round.{" "}
              <strong className="font-bold text-[#0B0B0D]">
                One team handles the building, the plumbing and heating, the
                electrics, and the maintenance that follows
              </strong>
              , so nothing gets lost in translation between trades — and
              there&apos;s always someone who knows the full history of the job.
            </p>

            <p>
              Fifteen years on, that approach hasn&apos;t changed. We&apos;ve
              simply gotten better at it: more qualified people, wider
              services, and long-standing maintenance relationships with
              property managers, hotels and commercial clients across London.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================
          MISSION & VISION
      =================================================================== */}

      <section
        aria-labelledby="mission-heading"
        className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-24"
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
              Our mission & vision
            </h2>
          </header>

          <div
            ref={missionRef}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
          >
            {MISSION_VISION.map((item, i) => (
              <div
                key={item.label}
                className={`bsl-fade relative overflow-hidden rounded-2xl border border-[#1C1712]/8 bg-[#FBF9F6] p-8 md:p-10 ${
                  missionVisible ? "bsl-visible" : ""
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028]/20"
                />

                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]">
                  <ValueIcon type={item.icon} />
                </span>

                <h3 className="bsl-serif mb-3 text-[1.3rem] font-medium text-[#1C1712]">
                  {item.label}
                </h3>

                <p className="text-[0.98rem] leading-[1.75] text-[#6E6259]">
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
        className="bg-[#FBF9F6] px-5 py-16 sm:px-8 md:py-24"
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
                className={`bsl-fade flex flex-col gap-3 p-7 ${
                  valuesVisible ? "bsl-visible" : ""
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]">
                  <ValueIcon type={v.icon} />
                </span>

                <h3 className="bsl-serif text-[1.05rem] font-medium text-[#1C1712]">
                  {v.label}
                </h3>

                <p className="text-[0.86rem] leading-[1.65] text-[#6E6259]">
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

      <section className="bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-24">
        <div
          ref={bandRef}
          className={`bsl-fade mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14 ${
            bandVisible ? "bsl-visible" : ""
          }`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_20px_40px_-20px_rgba(11,11,13,0.35)] md:order-2">
            <Image
              src="/aboutus.webp"
              alt="A recent BSL Construction building project in London"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>

          <div className="md:order-1">
            <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              On Site
            </span>

            <h2 className="bsl-serif mb-5 text-[clamp(1.9rem,3.4vw,2.4rem)] font-medium leading-[1.18] text-[#0B0B0D]">
              Fully insured, Gas Safe registered, and on site when we say
              we&apos;ll be
            </h2>

            <p className="mb-4 text-[clamp(0.95rem,1.4vw,1.02rem)] leading-[1.75] text-[#43433F]">
              Every project is supervised by a dedicated site lead, backed by
              a qualified professional team across building, mechanical and
              electrical trades. It&apos;s the reason clients keep coming
              back for the next project — and the maintenance contract after
              that.
            </p>

            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
            >
              Get Your Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================
          CTA BAND
      =================================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-[#1D1813] to-[#161210] px-5 py-16 sm:px-8 md:py-20">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-30"
        />

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="bsl-serif text-[clamp(1.6rem,3vw,2.1rem)] font-medium text-white">
              Have a project in mind?
            </h2>
            <p className="mt-2 max-w-md text-[0.95rem] leading-[1.7] text-white/65">
              Tell us what you&apos;re building or maintaining, and we&apos;ll get back
              to you with next steps.
            </p>
          </div>

          <Link
            href="/contact#quote"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-8 py-4 text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}