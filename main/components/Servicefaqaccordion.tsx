"use client";

/**
 * ServiceFaqAccordion.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Per-service FAQ accordion for /services/[slug]. Fully data-driven: it
 * renders whatever `faqs` array the current service provides in
 * data/services.json, so a new service picks up a working FAQ section
 * automatically as long as it has a `faqs` field (see lib/services.ts).
 *
 * DESIGN
 * - The expand/collapse control is a small brass ring badge — the same
 *   motif used for the checklist icons and the coin medallions elsewhere
 *   on the site (WhyChooseUs.tsx) — so this reads as part of the same
 *   family rather than a bolted-on FAQ widget.
 * - Rows open independently, not one-at-a-time: these are short,
 *   standalone answers a reader may want to compare, not a guided
 *   sequence, so there's no reason to force one closed to read another.
 * - Expand/collapse animates via `grid-template-rows: 0fr -> 1fr` on a
 *   wrapping grid, not `height: auto` or a JS-measured height — this
 *   transitions smoothly on the compositor without ever reading layout
 *   from JS. `prefers-reduced-motion: reduce` removes the transition
 *   entirely; panels still open/close, just instantly.
 * - Semantics: each question is a real <h3> containing the toggle
 *   <button>, with aria-expanded/aria-controls wiring the button to its
 *   panel — standard accessible accordion pattern, keyboard operable with
 *   no extra handling needed.
 * -------------------------------------------------------------------------
 */

import { useId, useState } from "react";

export type ServiceFaq = {
  question: string;
  answer: string;
};

export default function ServiceFaqAccordion({ faqs }: { faqs: ServiceFaq[] }) {
  const baseId = useId();
  // First question open by default so the section never lands looking
  // empty; everything else starts collapsed.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  if (!faqs || faqs.length === 0) return null;

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="divide-y divide-[#1C1712]/10 border-y border-[#1C1712]/10">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .bsl-faq-panel,
          .bsl-faq-badge,
          .bsl-faq-badge svg path {
            transition: none !important;
          }
        }
      `}</style>

      {faqs.map((faq, i) => {
        const isOpen = open.has(i);
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={faq.question}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 py-5 text-left sm:gap-5 sm:py-6"
              >
                <span
                  aria-hidden="true"
                  className="bsl-faq-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
                  style={{
                    borderColor: isOpen ? "#A26028" : "rgba(28,23,18,0.2)",
                    background: isOpen ? "#A26028" : "transparent",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M6 1.5V10.5"
                      stroke={isOpen ? "#FBF9F6" : "#A26028"}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      className="transition-opacity duration-200"
                      style={{ opacity: isOpen ? 0 : 1 }}
                    />
                    <path
                      d="M1.5 6H10.5"
                      stroke={isOpen ? "#FBF9F6" : "#A26028"}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="bsl-serif flex-1 text-[1rem] font-medium leading-snug text-[#1C1712] sm:text-[1.08rem]">
                  {faq.question}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="bsl-faq-panel grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-6 pl-11 pr-2 text-[0.94rem] leading-[1.7] text-[#6E6259] sm:pl-12">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}