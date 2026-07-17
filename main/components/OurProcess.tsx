"use client";

/**
 * OurProcess.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Our Process" — a step-by-step section. Same palette/type system as the
 * rest of the site (#1C1712 / #6E6259 / #A26028 / #E8C599, Fraunces serif,
 * warm ivory background).
 *
 * PERFORMANCE PASS — CHANGED IN THIS FILE (per the Lighthouse report)
 * 1. FONT: removed the in-component `@import url(fonts.googleapis.com...)`
 *    for Fraunces — that was the still-unfixed 4th component the network
 *    dependency tree was pointing at. Now loaded via `next/font/google`,
 *    self-hosted at build time, no extra render-blocking round trip to
 *    fonts.googleapis.com / fonts.gstatic.com.
 * 2. NON-COMPOSITED ANIMATIONS: the checkpoint pulse-ring and the
 *    traveling dot's "breathing" halo used to animate `box-shadow`
 *    directly (paint on every frame). The step marker's activated state
 *    animated `border-color` / `background` / `box-shadow` via a CSS
 *    transition (also paint-triggering). All of these are now built from
 *    static, pre-painted layers whose *visibility* is driven purely by
 *    `opacity` and `transform` (scale), which the compositor can run on
 *    its own thread:
 *      - `.bsl-step-marker::after` — pre-styled "active" layer (gradient
 *        bg, brass border, drop shadow) that's simply opacity-faded in/out.
 *      - `.bsl-step-marker::before` — the checkpoint pulse ring, animated
 *        via `transform: scale()` + `opacity` instead of `box-shadow`.
 *      - `.bsl-rule-dot::after` — a blurred halo behind the dot, animated
 *        via `transform: scale()` + `opacity` instead of `box-shadow`.
 *    The numeral's color swap (grey → brass) no longer transitions
 *    `color` — it's an instant class-driven swap that lands right as the
 *    numeral itself fades in via opacity, so there's no visible loss of
 *    smoothness.
 * 3. FORCED REFLOW: the connecting rule's fill and the traveling dot used
 *    to be driven by GSAP animating `width` and `left` every tick — both
 *    are layout properties, so the browser was recalculating layout on
 *    every frame of a ~1.6s timeline (this is almost certainly the
 *    147ms/112ms×2 "Forced reflow" entries in the report). Replaced with:
 *      - the fill bar is rendered at its final width up front and animated
 *        with `scaleX` (transform-origin: left) instead of `width`.
 *      - the dot's track width is measured once (a single, non-interleaved
 *        read) and the dot is moved every tick with `transform: translateX`
 *        computed in JS, instead of writing `left` every tick.
 *    Both are now compositor-only — no layout, no paint, per frame.
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` skips the animated sequence entirely:
 *   the rule renders already filled, markers/numerals/text render already
 *   in their settled state, and the traveling dot is never shown.
 * - Connecting rule + dot are desktop-only (`lg:` and up, matching the
 *   4-column grid); mobile stacks as a plain list and still gets the
 *   per-marker checkpoint pop/numeral/text sequence, just without a rule
 *   to travel along.
 * - Runs once per mount; the timeline and any pending timers are killed on
 *   unmount so nothing fires after the component is gone.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap). ScrollTrigger is not
 * required for this pass, since the sequence is mount-driven rather than
 * scroll-driven — only base `gsap` is imported.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

type Stage = {
  id: string;
  number: string;
  title: string;
  description: string;
};

// Copy sourced from the client's own "Our Process" section — tightened
// for on-screen length, nothing added that wasn't already claimed.
const STAGES: Stage[] = [
  {
    id: "consultation",
    number: "01",
    title: "Consultation & Site Visit",
    description:
      "We start by getting to know you, your space, and your goals — understanding your priorities and any challenges up front. Then we visit the site in person, assess the work required, and gather everything we need to prepare a clear, accurate proposal built around your vision.",
  },
  {
    id: "planning",
    number: "02",
    title: "Planning & Quotation",
    description:
      "You receive a detailed quote and timeline outlining exactly what's included, how long it will take, and when each phase happens. No vague promises — just clear expectations and full transparency before any work begins.",
  },
  {
    id: "build",
    number: "03",
    title: "Build & Project Management",
    description:
      "Our experienced team gets to work, handling every trade and keeping the site safe, clean, and on schedule. You'll receive regular updates throughout, and we're always available to answer questions or adjust plans as needed.",
  },
  {
    id: "completion",
    number: "04",
    title: "Completion & Aftercare",
    description:
      "We walk through everything together and don't sign off until you're 100% satisfied. We're still here after handover, should anything need attention — every project includes our aftercare support for full peace of mind.",
  },
];

// TODO: replace placeholder url/image, and merge with any existing
// structured data rather than emitting a second, competing block.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "The BSL Construction Renovation Process",
  description:
    "How BSL Construction takes a renovation project from first consultation through to completion and aftercare.",
  step: STAGES.map((s) => ({
    "@type": "HowToStep",
    name: s.title,
    text: s.description,
  })),
};

const STAGE_COUNT = STAGES.length;
// First/last marker sit at the center of their grid column; on a 4-column
// grid that's 12.5% / 87.5%, so the connecting rule/track spans the 75%
// between. These stay percentage-based only for *layout* (set once, never
// animated) — the animated pieces inside the track move via transform.
const RULE_INSET_PCT = 100 / (STAGE_COUNT * 2);
const RULE_SPAN_PCT = 100 - RULE_INSET_PCT * 2;
const STEP_STAGGER = 0.35;
const DOT_SIZE = 10; // px, matches h-2.5 w-2.5

export default function OurProcess() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const ruleFillRef = useRef<HTMLDivElement | null>(null);
  const ruleDotRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const markers = markerRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const numerals = numeralRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
    const contents = contentRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (markers.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Single, one-off read of the track's width (not interleaved with any
    // writes), used to convert the dot's progress fraction into a pixel
    // offset for `transform: translateX`, instead of writing `left` every
    // tick (which would force layout on every frame).
    const trackWidthPx = trackRef.current?.getBoundingClientRect().width ?? 0;

    const pulseTimeouts: number[] = [];
    let tl: gsap.core.Timeline | null = null;

    if (prefersReducedMotion) {
      // Settled end-state, no motion at all.
      gsap.set(markers, { scale: 1 });
      markers.forEach((marker) => marker.classList.add("is-active"));
      gsap.set(numerals, { opacity: 1, scale: 1 });
      gsap.set(contents, { opacity: 1, y: 0 });
      if (ruleFillRef.current) gsap.set(ruleFillRef.current, { scaleX: 1 });
      if (ruleDotRef.current) gsap.set(ruleDotRef.current, { opacity: 0 });
    } else {
      // ---- Initial states
      gsap.set(markers, { scale: 0.72, transformOrigin: "50% 50%" });
      gsap.set(numerals, { opacity: 0, scale: 0.6 });
      gsap.set(contents, { opacity: 0, y: 14 });
      if (ruleFillRef.current) {
        gsap.set(ruleFillRef.current, { scaleX: 0, transformOrigin: "0% 50%" });
      }
      if (ruleDotRef.current) {
        gsap.set(ruleDotRef.current, { x: -DOT_SIZE / 2, y: -DOT_SIZE / 2, opacity: 0 });
      }

      // ---- The whole sequence plays once, on mount. A small brass
      // "checkpoint" dot rides the leading edge of the rule as it fills
      // (like a level moving across a job site); each marker checks in
      // with a bouncy pop + single pulse-ring the instant the dot reaches
      // it, its numeral clicks into place a beat later, and its text
      // fades up — staggered per step.
      tl = gsap.timeline({ delay: 0.15 });

      if (ruleFillRef.current) {
        tl.to(
          ruleFillRef.current,
          {
            scaleX: 1,
            duration: 1.6,
            ease: "power1.inOut",
            onStart: () => {
              if (ruleDotRef.current) gsap.set(ruleDotRef.current, { opacity: 1 });
            },
            onUpdate: function () {
              if (!ruleDotRef.current || !trackWidthPx) return;
              const px = this.progress() * trackWidthPx;
              gsap.set(ruleDotRef.current, { x: px - DOT_SIZE / 2 });
            },
            onComplete: () => {
              if (ruleDotRef.current) gsap.to(ruleDotRef.current, { opacity: 0, duration: 0.4 });
            },
          },
          0
        );
      }

      markers.forEach((marker, i) => {
        const t = i * STEP_STAGGER + 0.1;

        tl!.to(
          marker,
          {
            scale: 1,
            duration: 0.55,
            ease: "back.out(2.4)",
            onStart: () => {
              marker.classList.add("is-active", "is-checking-in");
              const id = window.setTimeout(() => marker.classList.remove("is-checking-in"), 900);
              pulseTimeouts.push(id);
            },
          },
          t
        );

        if (numerals[i]) {
          tl!.to(
            numerals[i],
            { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.8)" },
            t + 0.12
          );
        }

        if (contents[i]) {
          tl!.to(contents[i], { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, t);
        }
      });
    }

    return () => {
      tl?.kill();
      pulseTimeouts.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      aria-labelledby="our-process-heading"
      className={`${fraunces.variable} bg-[#FBF9F6] px-5 py-16 lg:px-8 lg:py-24`}
    >
      <style>{`
        .bsl-serif { font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .bsl-step-marker {
          position: relative;
          border: 1.5px solid rgba(28, 23, 18, 0.16);
          background: #ffffff;
        }

        /* Activated state — pre-painted layer, only ever opacity-faded.
           No border-color/background/box-shadow animation, so nothing
           forces paint per frame; the compositor handles the fade alone. */
        .bsl-step-marker::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1.5px solid #a26028;
          background: linear-gradient(160deg, #fbf3e3, #f3e0bc);
          box-shadow: 0 6px 16px -9px rgba(162, 96, 40, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.7);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .bsl-step-marker.is-active::after {
          opacity: 1;
        }

        .bsl-step-num {
          position: relative;
          z-index: 1; /* stay above the ::after activation layer */
          color: #6e6259;
        }
        .bsl-step-marker.is-active .bsl-step-num {
          color: #7c4a1e;
        }
        .bsl-step-title {
          transition: color 0.3s ease;
        }

        /* Checkpoint pulse-ring — plays once, the instant a marker
           activates. Built as a ring that scales up while fading out
           (transform + opacity only), rather than animating box-shadow. */
        .bsl-step-marker::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(162, 96, 40, 0.45);
          opacity: 0;
          transform: scale(1);
          pointer-events: none;
        }
        @keyframes bsl-pulse-ring {
          0% { opacity: 0.45; transform: scale(1); }
          70% { opacity: 0; transform: scale(1.85); }
          100% { opacity: 0; transform: scale(1.85); }
        }
        .bsl-step-marker.is-checking-in::before {
          animation: bsl-pulse-ring 0.85s ease-out;
        }

        /* Traveling checkpoint dot — solid brass dot with a fixed ivory
           ring border (static, so it's never repainted); the "breathing"
           glow behind it is a separate blurred layer animated purely via
           transform: scale + opacity, instead of animating box-shadow. */
        .bsl-rule-dot {
          position: relative;
          border: 4px solid #fbf9f6;
          box-sizing: content-box;
        }
        .bsl-rule-dot::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          background: rgba(162, 96, 40, 0.55);
          filter: blur(4px);
          opacity: 0.4;
          transform: scale(1);
          animation: bsl-dot-breathe 1.6s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes bsl-dot-breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.75; }
        }

        @media (hover: hover) and (pointer: fine) {
          .bsl-step-row:hover .bsl-step-title {
            color: #8a5121;
          }
          .bsl-step-row:hover .bsl-step-marker.is-active {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bsl-rule-dot::after { animation: none; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        <header className="mx-auto mb-14 max-w-[680px] text-center lg:mb-20">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            Our Process
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
          </span>
          <h2
            id="our-process-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            From First Visit To Final Handover
          </h2>
          <p className="text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]">
            Four stages, no vague promises — every BSL Construction project moves through the same
            disciplined process, so you always know exactly where things stand.
          </p>
          <span aria-hidden="true" className="mx-auto mt-5 block h-px w-16 rounded-full bg-[#A26028]" />
        </header>

        <div className="relative">
          {/* Track: width/position set once (layout), never animated.
              Everything that moves inside it (fill, dot) does so purely
              via `transform`, so no layout or paint work happens per
              frame — desktop only. */}
          <div
            ref={trackRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-7 hidden h-px lg:block"
            style={{ left: `${RULE_INSET_PCT}%`, width: `${RULE_SPAN_PCT}%` }}
          >
            <div className="absolute inset-0 bg-[#1C1712]/10" />
            <div
              ref={ruleFillRef}
              className="absolute inset-0 bg-[#A26028]"
            />
            <div
              ref={ruleDotRef}
              className="bsl-rule-dot absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-[#A26028]"
              style={{ opacity: 0 }}
            />
          </div>

          <ol className="relative grid grid-cols-1 gap-14 lg:grid-cols-4 lg:gap-6">
            {STAGES.map((stage, i) => (
              <li
                key={stage.id}
                className="bsl-step-row relative flex flex-col items-start text-left lg:items-center lg:text-center"
              >
                <div
                  ref={(el) => {
                    markerRefs.current[i] = el;
                  }}
                  aria-hidden="true"
                  className="bsl-step-marker relative z-10 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                >
                  <span
                    ref={(el) => {
                      numeralRefs.current[i] = el;
                    }}
                    className="bsl-step-num bsl-serif text-[1.05rem] font-medium"
                  >
                    {stage.number}
                  </span>
                </div>

                <div
                  ref={(el) => {
                    contentRefs.current[i] = el;
                  }}
                >
                  <span className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                    Step {stage.number}
                  </span>
                  <h3 className="bsl-serif bsl-step-title mb-2.5 text-[1.15rem] font-medium leading-snug text-[#1C1712]">
                    {stage.title}
                  </h3>
                  <p className="max-w-[500px] text-[0.9rem] leading-[1.7] text-[#6E6259] lg:mx-auto lg:max-w-[240px]">
                    {stage.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}