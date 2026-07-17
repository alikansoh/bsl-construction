/**
 * ContactCTA.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Full-bleed "Contact Us" call-to-action banner — brand accent #A26028.
 * Built with Tailwind CSS, matching the design language established in
 * WhoWeAre.tsx (Fraunces serif stat numbers on a brass gradient, dashed
 * "seal" icon rings, staggered scroll reveals, reduced-motion support).
 *
 * DESIGN NOTES
 * - Reference brief asked for a banner shaped like a competitor's dark
 *   photo + orange stat-strip layout. Rather than copy that palette
 *   (generic construction-site orange), the stat strip reuses this
 *   site's own signature — brass-gradient serif numerals inside dashed
 *   seal rings — so the section reads as part of BSL's identity rather
 *   than a template. The photo + overlapping stat card *shape* is kept,
 *   since that composition (hero photo bleeding into a stat strip) is
 *   what makes the layout feel substantial.
 * - Background photo does a slow, one-time "Ken Burns" settle (scale
 *   1.08 → 1) the first time the section scrolls into view, then holds
 *   still — restraint over a looping effect.
 * - Heading / copy / CTAs stagger in as the section enters view; the stat
 *   strip staggers in slightly after, so the eye lands on the message
 *   first and the numbers second.
 * - Copy is SEO-oriented for West London renovation/construction
 *   searches: naturally mentions the service area names and core
 *   service lines without keyword-stuffing.
 * - `prefers-reduced-motion: reduce` is respected throughout: the
 *   Ken Burns zoom, count-up gleam, seal spin/pulse, and stagger
 *   transforms are all skipped in favour of immediate final states;
 *   only simple opacity fades remain.
 *
 * IMAGE
 * - Background photo is now served locally via `next/image` from
 *   `/public/cta.webp` (previously an external Unsplash URL). Rendered
 *   with `fill` + `sizes="100vw"` since it's a full-bleed section
 *   background, and `priority` since this section is typically visible
 *   without scrolling on many pages. Drop your file at
 *   `/public/cta.webp` — swap the filename/path below if it lives
 *   somewhere else.
 *
 * FIX PASS
 * - The "Areas Covered" stat pill was removed. It duplicated coverage
 *   info that already lives in FAQ.tsx and needed a manually-synced
 *   SERVICE_AREAS array in this file just to feed one number. Replaced
 *   with a "5/5" client-rating stat instead — reuses the same count-up
 *   pill mechanics (target 5, suffix "/5") — and the now-unused
 *   SERVICE_AREAS array was removed.
 * - Stat-strip responsiveness: the row layout used to switch on at the
 *   `sm` (640px) breakpoint, too narrow to fit four icon+label pills
 *   without squeezing — combined with a forced `whitespace-nowrap` on
 *   the label, that overflowed rather than wrapped. Moved the row
 *   layout to `md` (768px), let labels wrap instead of forcing nowrap,
 *   and added `min-w-0` on each pill so flex children can actually
 *   shrink instead of forcing the row wider than its container.
 * - Fraunces now loads via `next/font/google` instead of a runtime
 *   `@import` inside a <style> tag — same CLS fix applied to
 *   WhoWeAre.tsx (the old @import fetched the font from Google's CDN
 *   after first paint, and the fallback→Fraunces metric change shifted
 *   the stat-pill row once it swapped in).
 * - `usePrefersReducedMotion` rebuilt on `useSyncExternalStore` instead
 *   of a `useState` initializer that read `window.matchMedia` directly
 *   (server/client mismatch) plus a `useEffect` `setState` call (which
 *   also trips the `react-hooks/set-state-in-effect` lint rule).
 *
 * NOTE: brand accent #A26028 isn't a default Tailwind color, so it's
 * used via arbitrary-value utilities (e.g. bg-[#A26028]), matching the
 * convention in WhoWeAre.tsx.
 * -------------------------------------------------------------------------
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Fraunces } from "next/font/google";

// Loaded once at module scope and self-hosted at build time — no runtime
// network fetch, no font-swap reflow.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const HERO_IMAGE_SRC = "/cta.webp";

const PHONE_DISPLAY = "020 1234 5678";
const PHONE_HREF = "tel:+442012345678";

const STATS = [
  { label: "Projects Completed", target: 150, suffix: "+" },
  { label: "Years of Experience", target: 15, suffix: "+" },
  { label: "Client Satisfaction", target: 100, suffix: "%" },
  { label: "Client Rating", target: 5, suffix: "/5" },
];

const COUNT_DURATION_MS = 1600;
const GLEAM_DURATION_MS = 900;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

// ---------------------------------------------------------------------
// Hooks (mirrors WhoWeAre.tsx — worth lifting to a shared /hooks file if
// this pattern is used a third time on the site).
// ---------------------------------------------------------------------

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );
}

function useCountUp(target: number, shouldStart: boolean, duration = COUNT_DURATION_MS) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutQuint(progress) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldStart, target, duration]);

  return value;
}

function useIntersection<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
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

// ---------------------------------------------------------------------
// Stat pill — horizontal variant of WhoWeAre's stat card, sized for a
// strip rather than a stacked column.
// ---------------------------------------------------------------------

function StatPill({
  stat,
  isVisible,
  index,
  reducedMotion,
  showDivider,
}: {
  stat: (typeof STATS)[number];
  isVisible: boolean;
  index: number;
  reducedMotion: boolean;
  showDivider: boolean;
}) {
  const count = useCountUp(stat.target, isVisible);
  const riseY = reducedMotion ? 0 : isVisible ? 0 : 18;

  return (
    <div
      className={`relative flex min-w-0 flex-1 items-center gap-3 px-5 py-1.5 md:px-6 ${
        showDivider ? "md:border-l md:border-[#A26028]/15" : ""
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${riseY}px)`,
        transitionProperty: "transform, opacity",
        transitionDuration: "0.6s",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: reducedMotion ? "0ms" : `${index * 110}ms`,
      }}
    >
      <span className="relative flex h-11 w-11 flex-none items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-dashed border-[#A26028]/40"
          style={{ animation: reducedMotion ? "none" : "ctaSealSpin 16s linear infinite" }}
        />
        {isVisible && !reducedMotion && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-[#A26028]/50"
            style={{ animation: `ctaPulseRing 1.1s ease-out ${index * 110}ms 2` }}
          />
        )}
        <span
          aria-hidden="true"
          className="relative h-2 w-2 rounded-full bg-[#A26028]"
        />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className="cta-serif cta-stat-number text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-none tabular-nums"
          style={{
            animation:
              isVisible && !reducedMotion
                ? `ctaGleam ${GLEAM_DURATION_MS}ms ease-in-out ${COUNT_DURATION_MS}ms 1 both`
                : "none",
          }}
        >
          {count}
          {stat.suffix}
        </span>
        <span className="text-[0.76rem] font-medium leading-snug text-[#6B6B64]">
          {stat.label}
        </span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------

export default function ContactCTA() {
  const reducedMotion = usePrefersReducedMotion();
  const [contentRef, contentVisible] = useIntersection<HTMLDivElement>(0.3);
  const [statsRef, statsVisible] = useIntersection<HTMLDivElement>(0.4);

  const fadeUp = (delayMs: number) => ({
    opacity: contentVisible || reducedMotion ? 1 : 0,
    transform: `translateY(${contentVisible || reducedMotion ? 0 : "18px"})`,
    transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: reducedMotion ? "0ms" : `${delayMs}ms`,
  });

  return (
    <section
      aria-labelledby="contact-cta-heading"
      className={`relative overflow-hidden bg-[#0B0B0D] px-5 pb-24 pt-20 sm:px-8 sm:pb-28 sm:pt-28 ${fraunces.variable}`}
    >
      <style>{`
        .cta-serif { font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .cta-stat-number {
          display: inline-block;
          background-image: linear-gradient(
            115deg,
            #7c4a1e 0%, #a26028 20%, #e8c599 42%,
            #fff6e6 50%, #e8c599 58%, #a26028 80%, #7c4a1e 100%
          );
          background-size: 280% 100%;
          background-position-x: 30%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        @keyframes ctaGleam {
          0% { background-position-x: 165%; }
          100% { background-position-x: -65%; }
        }
        @keyframes ctaSealSpin { to { transform: rotate(360deg); } }
        @keyframes ctaPulseRing {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes ctaKenBurns {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }
      `}</style>

      {/* Background photo + overlay */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{
            animation: reducedMotion ? "none" : "ctaKenBurns 7s ease-out both",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,11,13,0.93)_0%,rgba(20,14,8,0.8)_45%,rgba(162,96,40,0.45)_100%)]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.25)_0%,rgba(162,96,40,0)_70%)]"
      />

      <div ref={contentRef} className="relative mx-auto max-w-[880px] text-center">
        <h2
          id="contact-cta-heading"
          style={fadeUp(0)}
          className="mb-5 text-[clamp(2rem,5vw,3.1rem)] font-extrabold leading-[1.15] tracking-[-0.01em] text-white"
        >
          Let&apos;s Build Your <span className="text-[#E8C599]">Dream Renovation</span>,
          Together
        </h2>

        <p
          style={fadeUp(90)}
          className="mx-auto mb-9 max-w-[620px] text-[clamp(1rem,1.6vw,1.1rem)] leading-[1.75] text-white/75"
        >
          Whether it&apos;s a full house renovation, a home extension, or general
          contracting work, BSL Construction brings the same discipline and
          craftsmanship to every project across{" "}
          <strong className="font-semibold text-white">Ealing</strong>,{" "}
          <strong className="font-semibold text-white">Fulham</strong>,{" "}
          <strong className="font-semibold text-white">Chiswick</strong>, and the
          rest of West London. Tell us about your project and we&apos;ll get back
          to you with a free, no-obligation quote.
        </p>

        <div style={fadeUp(160)} className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact#quote"
            className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-8 py-4 text-[0.95rem] font-bold text-white shadow-[0_10px_30px_-8px_rgba(162,96,40,0.6)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Get Your Free Quote
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-[0.95rem] font-bold text-white backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10"
          >
            Call {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Stat strip — overlaps the bottom edge of the photo, echoing the
          brief's reference layout, styled in BSL's own brass language. */}
      <div className="relative z-10 mx-auto mt-14 max-w-[1040px] sm:mt-16">
        <div
          ref={statsRef}
          className="flex flex-col divide-y divide-[#A26028]/15 rounded-3xl border border-[#A26028]/15 bg-[#FDF8F2]/95 px-3 py-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)] backdrop-blur-sm md:flex-row md:divide-y-0 md:px-2 md:py-3"
        >
          {STATS.map((stat, index) => (
            <StatPill
              key={stat.label}
              stat={stat}
              isVisible={statsVisible}
              index={index}
              reducedMotion={reducedMotion}
              showDivider={index > 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}