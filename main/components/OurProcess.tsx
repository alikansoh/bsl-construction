"use client";

/**
 * OurProcess.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Our Process" — a step-by-step section. Palette and type still come from
 * the shared site system (#1C1712 / #6E6259 / #A26028 / #E8C599, Fraunces
 * serif, warm ivory background) so it doesn't clash with Projects.tsx /
 * WhyChooseUs.tsx, but the composition itself is a deliberate departure
 * from the previous pass.
 *
 * WHAT CHANGED IN THIS PASS (full rebuild, not a tweak)
 * - No icons, anywhere. No medallions, no artwork, no per-stage imagery
 *   at all — every prior icon (raster or inline SVG) is gone.
 * - Replaced the zig-zag flip-card grid with a single, quiet step strip:
 *   a numbered marker, a title, a description — connected by one hairline
 *   rule that runs the full width on desktop (stacking to a plain list on
 *   mobile, where a cross-page line has no room to read as a line).
 * - Replaced four separate flourish animations (card flip, travelling
 *   marker, stamp punch, numeral tally + gleam) with exactly two
 *   restrained ones: the connecting rule fills in as you scroll past the
 *   section, and each step's text settles in with a plain fade + rise —
 *   the kind of motion a professional-services site uses, not a novelty.
 * - Dropped the blueprint dot-grid backdrop and the custom pencil cursor.
 *   Both were charming but read as playful rather than as a company you'd
 *   trust with a renovation budget; the section now sits on plain ivory.
 * - Numerals are no longer oversized brass-gradient display type — they're
 *   modest, sit inside a plain ring marker, and only change from a hollow
 *   outline to a filled brass ring once their step has been read, as a
 *   quiet progress cue rather than a spectacle.
 *
 * SIGNATURE ELEMENT — the connecting rule
 * - A single hairline line runs behind all four markers. A second line,
 *   drawn in brass, grows across the top of it in lock-step with scroll
 *   position, so the whole strip reads as one continuous line being
 *   completed left-to-right — a plain, literal "process" metaphor with no
 *   ornament attached to it.
 *
 * TWO GSAP ANIMATIONS (down from four)
 *   1. Rule fill — scroll-scrubbed width grow on the brass overlay line,
 *      tied to how far the visitor has scrolled through the step list.
 *   2. Step reveal — each step's text fades up once on scroll-into-view;
 *      its marker swaps from a hollow ring to a filled brass ring at the
 *      same moment, via a CSS class toggle (no per-property tween needed).
 *
 * CONTENT
 * - Four stages, taken directly from the client's own "Our Process" copy:
 *   Consultation & Site Visit, Planning & Quotation, Build & Project
 *   Management, Completion & Aftercare. Nothing invented; copy unchanged
 *   from the previous pass.
 *
 * SEO
 * - Single <h2> with four <h3> stage headings, no skipped levels. Marker
 *   numerals are decorative and aria-hidden; the "Step 0X" label next to
 *   each heading carries the equivalent information for assistive tech.
 * - Minimal HowTo JSON-LD retained. Placeholder fields are marked TODO —
 *   merge with any existing structured data rather than duplicating.
 *
 * ACCESSIBILITY / PERFORMANCE
 * - `prefers-reduced-motion: reduce` disables the rule-fill scrub and the
 *   fade/rise; markers render already-filled and text renders already
 *   visible.
 * - The connecting rule is desktop-only (`lg:` and up, matching a 4-column
 *   grid); on mobile the steps stack as a plain list with no line, since a
 *   line across a single narrow column has nothing to connect.
 * - Implemented with `gsap.matchMedia()` so behaviour is cleanly torn
 *   down on breakpoint change / unmount.
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
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rows = rowRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
    const markers = markerRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
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

      if (reduceMotion) {
        markers.forEach((marker) => marker.classList.add("is-active"));
      }

      if (ruleFillRef.current) {
        gsap.set(ruleFillRef.current, { width: reduceMotion ? `${RULE_SPAN_PCT}%` : "0%" });
      }

      // ---- ANIMATION 1: connecting rule fills in, scrubbed to how far the
      // visitor has scrolled through the step list. Desktop only (the rule
      // itself is hidden below `lg` via CSS).
      if (!reduceMotion && ruleFillRef.current) {
        const ruleTrigger = ScrollTrigger.create({
          trigger: list,
          start: "top 68%",
          end: "bottom 62%",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.set(ruleFillRef.current, { width: `${self.progress * RULE_SPAN_PCT}%` });
          },
        });
        triggers.push(ruleTrigger);
      }

      // ---- ANIMATION 2: each step's text fades up once on scroll-into-
      // view; its marker swaps from hollow to filled at the same moment.
      rows.forEach((row, i) => {
        const t = ScrollTrigger.create({
          trigger: row,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(contents[i], {
              opacity: 1,
              y: 0,
              duration: reduceMotion ? 0.01 : 0.7,
              ease: "power2.out",
            });
            markers[i]?.classList.add("is-active");
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
        @media (hover: hover) and (pointer: fine) {
          .bsl-step-row:hover .bsl-step-title {
            color: #8a5121;
          }
          .bsl-step-row:hover .bsl-step-marker.is-active {
            box-shadow: 0 9px 20px -9px rgba(162, 96, 40, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
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
          {/* Base rule + brass fill overlay — desktop only. Insets match the
              center of the first/last marker in the 4-column grid below. */}
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
                  <span className="bsl-step-num bsl-serif text-[1.05rem] font-medium">{stage.number}</span>
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