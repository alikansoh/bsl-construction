/**
 * components/ServiceFaqAccordion.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Accessible FAQ accordion used on /services/[slug]. Single-open behavior,
 * keyboard/focus-visible support, reduced-motion friendly (no layout-shifting
 * animation beyond a short height/opacity transition).
 *
 * FAQ answers are stored as rich HTML (e.g. "<p><b>...</b></p>", lists,
 * links), same as hero/section/process content elsewhere on the page — so
 * they're rendered with dangerouslySetInnerHTML + the shared .bsl-rich-text
 * styling (defined globally in app/services/[slug]/page.tsx) rather than as
 * plain text, which would otherwise print literal "<p>" tags.
 * -------------------------------------------------------------------------
 */
"use client";

import { useState } from "react";
import type { ServiceFaq } from "@/lib/services";

export default function ServiceFaqAccordion({ faqs }: { faqs: ServiceFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs?.length) return null;

  return (
    <div className="divide-y divide-[#1C1712]/10 border-y border-[#1C1712]/10">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-button-${idx}`;

        return (
          <div key={buttonId}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="bsl-focus group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="bsl-serif text-[1.02rem] font-semibold leading-snug text-[#1C1712]">
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#A26028]/30 text-[#A26028] transition-transform duration-200 ease-out ${
                    isOpen ? "rotate-45 bg-[#A26028] text-white" : "bg-transparent"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1V11M1 6H11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                {faq.answer && (
                  <div
                    className="bsl-rich-text max-w-2xl pb-6 text-[0.92rem] leading-[1.7] text-[#6E6259]"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}