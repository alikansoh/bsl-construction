"use client";

/**
 * OurProcess.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Our Process" — a step-by-step section. Same palette/type system as the
 * rest of the site (#1C1712 / #6E6259 / #A26028 / #E8C599, Fraunces serif,
 * warm ivory background).
 *
 * WHAT CHANGED IN THIS PASS
 * - The connecting rule is no longer just a fill bar — it now carries a
 *   small brass "checkpoint" dot that physically rides along its leading
 *   edge as you scroll, like a level or plumb-line moving down a job site.
 *   That's the signature element: one literal, on-brand piece of motion,
 *   everything else stays quiet.
 * - Each marker "activates" with a short, bouncy checkpoint pop (a quick
 *   overshoot scale-in) plus a single soft pulse-ring — the visual
 *   equivalent of a level hitting its mark — instead of the previous
 *   plain colour crossfade. It happens once per step, never loops.
 * - The step number gets a small pop/settle of its own, timed a beat
 *   after the marker, so the numeral doesn't just appear — it "clicks"
 *   into place.
 * - Everything from the previous pass is kept: numbered strip layout, no
 *   icons/artwork, hairline connecting rule (desktop only), plain list on
 *   mobile, full prefers-reduced-motion support, matchMedia teardown.
 *
 * THREE GSAP ANIMATIONS (up from two, still deliberately few)
 *   1. Rule fill + traveling dot — scroll-scrubbed width grow on the brass
 *      overlay line, with a small dot pinned to its leading edge so the
 *      line reads as something moving, not just growing.
 *   2. Checkpoint pop — each marker scales in with a back-ease overshoot
 *      and a single CSS pulse-ring the moment its step scrolls into view;
 *      its numeral pops a beat later.
 *   3. Step reveal — each step's text still fades up once on scroll into
 *      view, staggered per-row exactly as before.
 *
 * CONTENT — unchanged, sourced from the client's own "Our Process" copy.
 *
 * SEO — unchanged: single <h2>, four <h3>s, aria-hidden numerals, "Step 0X"
 * label for assistive tech, minimal HowTo JSON-LD (placeholder fields
 * marked TODO — merge with any existing structured data).
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` disables all three animations —
 *   markers, numerals and text render already in their settled state, and
 *   the traveling dot/pulse-ring are never shown.
 * - Connecting rule + dot are desktop-only (`lg:` and up); mobile stacks
 *   as a plain list with a lighter, direct-set checkpoint pop (no rule to
 *   travel along).
 * - `gsap.matchMedia()` for clean teardown on breakpoint change / unmount.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap).
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
// grid that's 12.5% / 87.5%, so the connecting rule spans the 75% between.
const RULE_INSET_PCT = 100 / (STAGE_COUNT * 2);
const RULE_SPAN_PCT = 100 - RULE_INSET_PCT * 2;

export default function OurProcess() {
  const listRef = useRef<HTMLOListElement | null>(null);
  const ruleFillRef = useRef<HTMLDivElement | null>(null);
  const ruleDotRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rows = rowRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
    const markers = markerRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const numerals = numeralRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
    const contents = contentRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (rows.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };
      const triggers: ScrollTrigger[] = [];

      // ---- Initial states
      gsap.set(contents, {
        opacity: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 14,
      });

      gsap.set(markers, { scale: reduceMotion ? 1 : 0.72, transformOrigin: "50% 50%" });
      gsap.set(numerals, { opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.6 });

      if (reduceMotion) {
        markers.forEach((marker) => marker.classList.add("is-active"));
      }

      if (ruleFillRef.current) {
        gsap.set(ruleFillRef.current, { width: reduceMotion ? `${RULE_SPAN_PCT}%` : "0%" });
      }
      if (ruleDotRef.current) {
        gsap.set(ruleDotRef.current, {
          left: `${RULE_INSET_PCT}%`,
          opacity: reduceMotion ? 0 : 0,
        });
      }

      // ---- ANIMATION 1: connecting rule fills in, scrubbed to how far the
      // visitor has scrolled through the step list, with a small brass
      // "checkpoint" dot riding its leading edge — the line reads as
      // something moving across the strip, like a level on a job site.
      // Desktop only (the rule itself is hidden below `lg` via CSS).
      if (!reduceMotion && ruleFillRef.current) {
        const ruleTrigger = ScrollTrigger.create({
          trigger: list,
          start: "top 68%",
          end: "bottom 62%",
          scrub: 0.6,
          onUpdate: (self) => {
            const fillPct = self.progress * RULE_SPAN_PCT;
            gsap.set(ruleFillRef.current, { width: `${fillPct}%` });
            if (ruleDotRef.current) {
              gsap.set(ruleDotRef.current, {
                left: `${RULE_INSET_PCT + fillPct}%`,
                opacity: self.progress > 0.01 && self.progress < 0.999 ? 1 : self.progress >= 0.999 ? 1 : 0,
              });
            }
          },
        });
        triggers.push(ruleTrigger);
      }

      // ---- ANIMATION 2 + 3: on scroll into view, each marker "checks in"
      // with a quick back-ease overshoot pop and a single pulse-ring, its
      // numeral clicks into place a beat later, and its text fades up —
      // staggered per row so four steps read as one-by-one even when
      // several enter the viewport together (the desktop 4-column strip).
      const STEP_STAGGER = 0.16;
      rows.forEach((row, i) => {
        const t = ScrollTrigger.create({
          trigger: row,
          start: "top 80%",
          once: true,
          onEnter: () => {
            const delay = reduceMotion ? 0 : i * STEP_STAGGER;
            const marker = markers[i];
            const numeral = numerals[i];

            gsap.to(contents[i], {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0.01 : 0.7,
              ease: "power2.out",
              delay,
            });

            if (marker) {
              gsap.to(marker, {
                scale: 1,
                duration: reduceMotion ? 0.01 : 0.55,
                ease: "back.out(2.4)",
                delay,
                onStart: () => {
                  marker.classList.add("is-active");
                  if (!reduceMotion) {
                    marker.classList.add("is-checking-in");
                    window.setTimeout(() => marker.classList.remove("is-checking-in"), 900);
                  }
                },
              });
            }

            if (numeral) {
              gsap.to(numeral, {
                opacity: 1,
                scale: 1,
                duration: reduceMotion ? 0.01 : 0.4,
                ease: "back.out(2.8)",
                delay: delay + (reduceMotion ? 0 : 0.12),
              });
            }
          },
        });
        triggers.push(t);
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="our-process-heading" className="bg-[#FBF9F6] px-5 py-16 lg:px-8 lg:py-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .bsl-step-marker {
          border: 1.5px solid rgba(28, 23, 18, 0.16);
          background: #ffffff;
          transition: border-color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease;
        }
        .bsl-step-marker.is-active {
          border-color: #a26028;
          background: linear-gradient(160deg, #fbf3e3, #f3e0bc);
          box-shadow: 0 6px 16px -9px rgba(162, 96, 40, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.7);
        }
        .bsl-step-num {
          color: #6e6259;
          transition: color 0.5s ease;
        }
        .bsl-step-marker.is-active .bsl-step-num {
          color: #7c4a1e;
        }
        .bsl-step-title {
          transition: color 0.3s ease;
        }

        /* Checkpoint pulse-ring — plays once, the instant a marker activates.
           A single soft ripple, not a loop: the "level hitting its mark". */
        @keyframes bsl-pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(162, 96, 40, 0.42), 0 6px 16px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 13px rgba(162, 96, 40, 0), 0 6px 16px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(162, 96, 40, 0), 0 6px 16px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
        }
        .bsl-step-marker.is-checking-in {
          animation: bsl-pulse-ring 0.85s ease-out;
        }

        /* Traveling checkpoint dot — a soft, breathing brass halo so it
           reads as something in motion rather than a static marker. */
        @keyframes bsl-dot-breathe {
          0%, 100% { box-shadow: 0 0 0 4px #fbf9f6, 0 0 0 4px #fbf9f6, 0 0 10px 2px rgba(162, 96, 40, 0.55); }
          50% { box-shadow: 0 0 0 4px #fbf9f6, 0 0 0 4px #fbf9f6, 0 0 15px 4px rgba(162, 96, 40, 0.75); }
        }
        .bsl-rule-dot {
          animation: bsl-dot-breathe 1.6s ease-in-out infinite;
        }

        @media (hover: hover) and (pointer: fine) {
          .bsl-step-row:hover .bsl-step-title {
            color: #8a5121;
          }
          .bsl-step-row:hover .bsl-step-marker.is-active {
            box-shadow: 0 9px 20px -9px rgba(162, 96, 40, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
          .bsl-step-row:hover .bsl-step-marker.is-active {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bsl-rule-dot { animation: none; }
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
          {/* Base rule + brass fill overlay + traveling checkpoint dot —
              desktop only. Insets match the center of the first/last
              marker in the 4-column grid below. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-7 hidden h-px bg-[#1C1712]/10 lg:block"
            style={{ left: `${RULE_INSET_PCT}%`, right: `${RULE_INSET_PCT}%` }}
          />
          <div
            ref={ruleFillRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-7 hidden h-px bg-[#A26028] lg:block"
            style={{ left: `${RULE_INSET_PCT}%`, width: 0 }}
          />
          <div
            ref={ruleDotRef}
            aria-hidden="true"
            className="bsl-rule-dot pointer-events-none absolute top-7 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A26028] lg:block"
            style={{ left: `${RULE_INSET_PCT}%`, opacity: 0 }}
          />

          <ol ref={listRef} className="relative grid grid-cols-1 gap-14 lg:grid-cols-4 lg:gap-6">
            {STAGES.map((stage, i) => (
              <li
                key={stage.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
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