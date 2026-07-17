/**
 * WhoWeAre.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Who We Are" section — brand accent #A26028. Built with Tailwind CSS.
 * Copy is SEO-optimized for West London renovation/construction searches,
 * naturally weaving in target service areas (Ealing, Fulham, Wembley,
 * Chiswick, Acton, Hammersmith, Richmond) without keyword-stuffing.
 *
 * CLS FIX PASS
 * - Fraunces is now loaded via `next/font/google` instead of a runtime
 *   `@import` inside a <style> tag. next/font downloads the font at BUILD
 *   time, self-hosts it, and injects the @font-face + a CSS variable into
 *   the page before first paint — so there is no external round-trip and
 *   no font-swap reflow once the page is interactive. This was the actual
 *   PageSpeed-flagged CLS source: the old @import fetched Fraunces from
 *   Google's CDN *after* the section had already painted with the
 *   fallback serif, and the metric difference between Fraunces and the
 *   fallback shifted the stat-number boxes (and everything stacked below
 *   them: labels, the next card, the photo) once the swap happened.
 * - Fixed a hydration-mismatch bug in `usePrefersReducedMotion`: it used
 *   to read `window.matchMedia(...)` inside the `useState` initializer,
 *   which returns different values on the server (always false, no
 *   `window`) vs. the client's very first render (real value). For
 *   visitors with the OS-level reduced-motion setting on, that mismatch
 *   forces React to patch the DOM right after hydration — a second,
 *   avoidable layout shift. Now it always initializes to `false` and
 *   syncs the real value in an effect, matching SSR output exactly.
 * - Added explicit `width`/`height` on the project photo as a belt-and-
 *   suspenders hint (the `aspect-[16/9]` wrapper was already reserving
 *   the box correctly, so this wasn't the CLS source, but the intrinsic
 *   size helps the browser's image-sizing heuristics regardless).
 *
 * NOTE: brand accent #A26028 isn't a default Tailwind color, so it's used
 * via arbitrary-value utilities (e.g. bg-[#A26028]). If this accent is
 * reused elsewhere, consider adding it to tailwind.config as `brand`.
 * -------------------------------------------------------------------------
 */
"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Fraunces } from "next/font/google";

// Loaded once at module scope and self-hosted at build time — no runtime
// network fetch, no font-swap reflow. Exposed as a CSS variable so the
// existing `.bsl-serif` rule below can keep its fallback stack.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

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
    target: 15,
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
const GLEAM_DURATION_MS = 900;

// Ease-out curve so the count-up starts fast and settles gently.
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Server has no `window`/`matchMedia`, so it can only ever report `false`.
// useSyncExternalStore is the correct primitive for subscribing to an
// external, mutable source like matchMedia — unlike useEffect+setState,
// it doesn't cause a synchronous set-state-in-effect (React can read the
// snapshot during render itself), and the explicit server snapshot keeps
// the first client render identical to the server's, so there's no
// hydration-mismatch repaint either.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );
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

function useIntersection<T extends Element>(threshold = 0.3) {
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

function StatCard({
  stat,
  isVisible,
  index,
  reducedMotion,
}: {
  stat: (typeof STATS)[number];
  isVisible: boolean;
  index: number;
  reducedMotion: boolean;
}) {
  const count = useCountUp(stat.target, isVisible);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !cardRef.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -7, ry: px * 7 });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  const riseY = reducedMotion ? 0 : isVisible ? 0 : 28;

  return (
    <div style={{ perspective: "900px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#A26028]/15 bg-gradient-to-br from-white/90 to-[#FDF8F2]/90 p-5 backdrop-blur-sm shadow-[0_1px_2px_rgba(11,11,13,0.04),0_10px_24px_rgba(11,11,13,0.05)] hover:border-[#A26028]/35 hover:shadow-[0_1px_2px_rgba(11,11,13,0.04),0_18px_36px_rgba(162,96,40,0.16)]"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${riseY}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transitionProperty: "transform, opacity, box-shadow, border-color",
          transitionDuration: "0.5s, 0.6s, 0.3s, 0.3s",
          transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
          transitionDelay: `${index * 120}ms, ${index * 120}ms, 0ms, 0ms`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028]/20"
        />

        {/* Icon inside a slow-rotating dashed "seal" ring, with a soft
            pulse that ripples twice as the card enters view. */}
        <span className="relative flex h-12 w-12 flex-none items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed border-[#A26028]/40 motion-reduce:animate-none"
            style={{ animation: reducedMotion ? "none" : "bslSealSpin 16s linear infinite" }}
          />
          {isVisible && !reducedMotion && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[#A26028]/50"
              style={{ animation: `bslPulseRing 1.1s ease-out ${index * 120}ms 2` }}
            />
          )}
          <span
            aria-hidden="true"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              {stat.icon}
            </svg>
          </span>
        </span>

        <span className="flex min-w-0 flex-col gap-0.5">
          <span
            className="bsl-serif bsl-stat-number text-[clamp(1.8rem,3.2vw,2.3rem)] font-semibold leading-none tabular-nums"
            style={{
              animation:
                isVisible && !reducedMotion
                  ? `bslGleam ${GLEAM_DURATION_MS}ms ease-in-out ${ANIMATION_DURATION_MS}ms 1 both`
                  : "none",
            }}
          >
            {count}
            {stat.suffix}
          </span>
          <span className="text-[0.82rem] font-medium text-[#6B6B64]">{stat.label}</span>
        </span>
      </div>
    </div>
  );
}

export default function WhoWeAre() {
  const reducedMotion = usePrefersReducedMotion();
  const [statsRef, statsVisible] = useIntersection<HTMLDivElement>(0.35);
  const [contentRef, contentVisible] = useIntersection<HTMLDivElement>(0.15);
  const [imageRef, imageVisible] = useIntersection<HTMLDivElement>(0.3);

  const fadeUp = (visible: boolean, delayMs: number) => ({
    opacity: visible || reducedMotion ? 1 : 0,
    transform: `translateY(${visible || reducedMotion ? 0 : "16px"})`,
    transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: reducedMotion ? "0ms" : `${delayMs}ms`,
  });

  return (
    <section
      aria-labelledby="who-we-are-heading"
      className={`relative overflow-hidden bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-24 ${fraunces.variable}`}
    >
      <style>{`
        .bsl-serif { font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .bsl-stat-number {
          display: inline-block;
          background-image: linear-gradient(
            115deg,
            #7c4a1e 0%,
            #a26028 20%,
            #e8c599 42%,
            #fff6e6 50%,
            #e8c599 58%,
            #a26028 80%,
            #7c4a1e 100%
          );
          background-size: 280% 100%;
          background-position-x: 30%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        @keyframes bslGleam {
          0% { background-position-x: 165%; }
          100% { background-position-x: -65%; }
        }
        @keyframes bslSealSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes bslPulseRing {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.12)_0%,rgba(162,96,40,0)_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.08)_0%,rgba(162,96,40,0)_70%)]"
      />

      <div ref={contentRef} className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-10 md:grid-cols-[1.15fr_1fr] md:gap-14">
        <div>
          <span
            style={fadeUp(contentVisible, 0)}
            className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]"
          >
            Who We Are
          </span>

          <h2
            id="who-we-are-heading"
            style={fadeUp(contentVisible, 80)}
            className="mb-6 text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-[1.18] tracking-[-0.01em] text-[#0B0B0D]"
          >
            Built on Experience, <span className="text-[#A26028]">Driven by Excellence</span>
          </h2>

          <p style={fadeUp(contentVisible, 160)} className="mb-[1.15rem] text-[clamp(1.05rem,1.6vw,1.15rem)] leading-[1.75] text-[#26261F]">
            At <strong className="font-bold text-[#0B0B0D]">BSL Construction</strong>, we
            don&apos;t just build — we deliver excellence at every step of the way. As a trusted{" "}
            <strong className="font-bold text-[#0B0B0D]">
              West London construction and renovation company
            </strong>
            , we&apos;ve earned our reputation project by project, street by street.
          </p>

          <p style={fadeUp(contentVisible, 220)} className="mb-[1.15rem] text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.75] text-[#43433F]">
            From the first conversation to the final walkthrough, we carry ourselves with
            professionalism, integrity, and discipline. We believe a truly smooth,
            stress-free renovation or building project starts with clear communication, tight
            planning, and a commitment to the highest possible standards — and we hold
            ourselves to that standard on every single job, whether it&apos;s a full house
            renovation, a home extension, or general contracting work.
          </p>

          <p style={fadeUp(contentVisible, 280)} className="mb-7 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.75] text-[#43433F]">
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
            style={fadeUp(contentVisible, 340)}
            className="mb-9 flex flex-wrap gap-2.5"
          >
            {SERVICE_AREAS.map((area, i) => (
              <span
                key={area}
                role="listitem"
                style={{
                  transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                  transitionDelay: reducedMotion ? "0ms" : `${360 + i * 45}ms`,
                  opacity: contentVisible || reducedMotion ? 1 : 0,
                  transform: contentVisible || reducedMotion ? "scale(1)" : "scale(0.85)",
                }}
                className="whitespace-nowrap rounded-full border border-[#A26028]/30 bg-[#A26028]/[0.08] px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.03em] text-[#A26028]"
              >
                {area}
              </span>
            ))}
          </div>

          <a
            href="/contact#quote"
            style={fadeUp(contentVisible, 700)}
            className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Get Your Free Quote
          </a>
        </div>

        <div className="flex flex-col gap-6 md:sticky md:top-24">
          <div ref={statsRef} className="flex flex-col gap-4">
            {STATS.map((stat, index) => (
              <StatCard
                key={stat.label}
                stat={stat}
                isVisible={statsVisible}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          {/* Project photo — plain rounded frame, fades and settles into
              place as it scrolls into view. */}
          <div
            ref={imageRef}
            className="relative"
            style={{
              opacity: imageVisible || reducedMotion ? 1 : 0,
              transform: `scale(${imageVisible || reducedMotion ? 1 : 0.96}) translateY(${
                imageVisible || reducedMotion ? 0 : 18
              }px)`,
              transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
              transitionDelay: reducedMotion ? "0ms" : "80ms",
            }}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-[0_20px_40px_-20px_rgba(11,11,13,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home.webp"
                alt="A completed BSL Construction home renovation project in West London"
                width={1024}
                height={577}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}