"use client";

/**
 * FAQ.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Frequently Asked Questions" — an accordion section that closes out the
 * page's trust-building arc (Projects → Why Choose Us → Our Process →
 * FAQ → Contact CTA). Same system as the rest of the site: #1C1712 /
 * #6E6259 / #A26028 / #E8C599, Fraunces serif, warm ivory background.
 *
 * SIGNATURE ELEMENT — the ring marker, reused on purpose
 * - OurProcess.tsx marks its four steps with a hollow-to-filled brass
 *   ring; WhyChooseUs.tsx mounts its four reasons on brass coin
 *   medallions. This section's toggle uses the same ring language — a
 *   small circle that's a hollow outline at rest and fills brass gold
 *   when active — so a visitor who's scrolled through the whole page
 *   recognises it as the same "confirmed / checked" mark, not a new
 *   idea. Inside the ring, a plain "+" rotates into a "×" on open; no
 *   separate chevron/arrow glyph is introduced.
 * - On open, the ring gets the same one-shot pulse-ring used for the
 *   Our Process checkpoints — consistent, not decorative for its own
 *   sake.
 *
 * ACCORDION MECHANICS
 * - Expand/collapse is pure CSS via a `grid-template-rows: 0fr → 1fr`
 *   transition (no JS height-measuring, no layout thrash, and it just
 *   works identically on mobile — deliberately avoiding the kind of
 *   scroll-position-dependent triggers that caused problems elsewhere on
 *   this site). Only one item is open at a time.
 * - The first question is open by default, so the section doesn't read
 *   as an empty list on load.
 *
 * ENTRANCE
 * - Rows fade/rise in once, staggered, the first time the section is
 *   scrolled into view — detected with `IntersectionObserver` (not
 *   ScrollTrigger), for the same mobile-reliability reason noted above.
 *
 * CONTENT
 * - Eight real questions drawn from the client's own site copy: service
 *   area, service range, insurance/vetting, quotation transparency,
 *   project management, timelines, the 12-month guarantee, and how to
 *   start. Each answer stands alone (no "as mentioned above") since a
 *   search snippet or screen reader may land on just one.
 *
 * SEO
 * - Emits a minimal FAQPage JSON-LD block. If the site already has one
 *   elsewhere, merge rather than duplicate. Single <h2>; each question is
 *   its own <h3> inside a <button>, matching the heading-per-item pattern
 *   used for accessible accordions.
 *
 * ACCESSIBILITY
 * - Each trigger is a real <button> with `aria-expanded` and
 *   `aria-controls`; each panel has a matching `id` and `role="region"`.
 * - `prefers-reduced-motion: reduce` disables the entrance fade/rise and
 *   the pulse-ring; rows render already visible and the open/close grid
 *   transition still happens (it's instant/functional, not decorative)
 *   but without the ring's pulse.
 *
 * DEPENDENCY: requires `gsap` (npm install gsap) — used only for the
 * small icon-pop + pulse-ring moment, not for layout or scroll-linking.
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState, useId } from "react";
import gsap from "gsap";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Copy written to stand on its own per item — no cross-references to
// "the section above" — since search snippets and screen readers may
// surface a single answer out of context.
const FAQS: FaqItem[] = [
  {
    id: "areas-covered",
    question: "Which areas do you cover?",
    answer:
      "BSL Construction is based in West London and works across Ealing, Fulham, Wembley, Chiswick, Acton, Hammersmith, Richmond, Kensington, Chelsea, Notting Hill, and Hampstead. If you're just outside these areas, get in touch — we're often able to take on nearby projects too.",
  },
  {
    id: "services-offered",
    question: "What services do you offer?",
    answer:
      "We offer a complete range of construction services, including full property refurbishments, extensions, kitchens, bathrooms, decorating, and ongoing maintenance. We manage the entire process ourselves, so you're never left chasing different trades or timelines.",
  },
  {
    id: "insured-vetted",
    question: "Are you insured and vetted?",
    answer:
      "Yes — BSL Construction is fully insured and vetted. Much of our work comes through referrals from past clients, which we see as the clearest sign of the trust we've built across West London.",
  },
  {
    id: "quote-process",
    question: "How does quoting and planning work?",
    answer:
      "After an initial consultation and site visit, we provide a detailed quote and timeline that sets out exactly what's included, how long the work will take, and when each phase happens — no vague promises, just clear expectations before anything begins.",
  },
  {
    id: "project-management",
    question: "Do you manage the whole project, including other trades?",
    answer:
      "Yes. Our team handles every trade involved in your project and keeps the site safe, clean, and on schedule throughout. You'll receive regular updates, and we're always available to answer questions or adjust plans as work progresses.",
  },
  {
    id: "timelines",
    question: "How long will my project take?",
    answer:
      "It depends on the scope — a bathroom refurbishment and a full house extension run on very different timelines. You'll receive a realistic, written timeline as part of your quote before work begins, so you know exactly what to expect and when.",
  },
  {
    id: "guarantee",
    question: "What happens after the work is finished?",
    answer:
      "We walk through everything with you and don't sign off until you're genuinely satisfied. Every project also includes our 12-month workmanship guarantee, and we're only ever a phone call away if anything needs attention afterwards.",
  },
  {
    id: "get-started",
    question: "How do I get started?",
    answer:
      "Get in touch for a free, no-obligation quote. We'll arrange a consultation and site visit, understand your goals, and follow up with a clear, detailed proposal — with no pressure and no vague promises.",
  },
];

// TODO: merge with any existing FAQPage/Organization schema elsewhere on
// the site rather than emitting a second, competing block.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function FAQ() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const baseId = useId();

  // Entrance: fade/rise the whole list once, on first scroll into view.
  // IntersectionObserver rather than a scroll-position library, so it
  // behaves identically on mobile regardless of address-bar resizing.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (reducedMotion) {
      return;
    }

    const rows = rowRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
    gsap.set(rows, { opacity: 0, y: 16 });

    const rect = node.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    const reveal = () => {
      gsap.to(rows, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 });
    };

    if (alreadyVisible) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const handleToggle = (id: string, ringEl: HTMLSpanElement | null) => {
    const opening = openId !== id;
    setOpenId(opening ? id : null);

    if (!opening || reducedMotion || !ringEl) return;
    // One-shot checkpoint pulse — the same motif used when Our Process
    // markers activate, reused here for consistency across the page.
    ringEl.classList.remove("is-pulsing");
    // Force reflow so the animation can restart if clicked again quickly.
    void ringEl.offsetWidth;
    ringEl.classList.add("is-pulsing");
    gsap.fromTo(ringEl, { scale: 0.82 }, { scale: 1, duration: 0.4, ease: "back.out(2.6)" });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="faq-heading"
      className="bg-[#FBF9F6] px-5 py-16 lg:px-8 lg:py-24"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        .bsl-serif { font-family: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }

        .faq-ring {
          border: 1.5px solid rgba(28, 23, 18, 0.18);
          background: #ffffff;
          transition: border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease;
        }
        .faq-row.is-open .faq-ring {
          border-color: #a26028;
          background: linear-gradient(160deg, #fbf3e3, #f3e0bc);
          box-shadow: 0 6px 14px -9px rgba(162, 96, 40, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.7);
        }
        .faq-ring-icon {
          transition: color 0.4s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
          color: #6e6259;
        }
        .faq-row.is-open .faq-ring-icon {
          color: #7c4a1e;
          transform: rotate(45deg);
        }

        @keyframes faqPulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(162, 96, 40, 0.42), 0 6px 14px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(162, 96, 40, 0), 0 6px 14px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(162, 96, 40, 0), 0 6px 14px -9px rgba(162, 96, 40, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.7);
          }
        }
        .faq-ring.is-pulsing { animation: faqPulseRing 0.8s ease-out; }

        .faq-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .faq-row.is-open .faq-panel {
          grid-template-rows: 1fr;
        }
        .faq-panel > div {
          overflow: hidden;
        }

        .faq-question {
          transition: color 0.25s ease;
        }
        .faq-row:hover .faq-question {
          color: #8a5121;
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-panel { transition: none; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <div className="mx-auto max-w-[820px]">
        <header className="mx-auto mb-12 max-w-[640px] text-center lg:mb-16">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            FAQ
            <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
          </span>
          <h2
            id="faq-heading"
            className="bsl-serif mb-3 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            Questions, Answered Plainly
          </h2>
          <p className="text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.6] text-[#6E6259]">
            Everything homeowners across West London ask us before getting started. Can&apos;t find what
            you need? Get in touch and we&apos;ll answer directly.
          </p>
        </header>

        <ol className="flex flex-col divide-y divide-[#1C1712]/10 border-y border-[#1C1712]/10">
          {FAQS.map((item, i) => {
            const isOpen = openId === item.id;
            const buttonId = `${baseId}-trigger-${item.id}`;
            const panelId = `${baseId}-panel-${item.id}`;
            return (
              <li
                key={item.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={`faq-row py-1 ${isOpen ? "is-open" : ""}`}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={(e) => {
                      const ring = e.currentTarget.querySelector<HTMLSpanElement>("[data-ring]");
                      handleToggle(item.id, ring);
                    }}
                    className="flex w-full items-center gap-4 py-5 text-left"
                  >
                    <span
                      data-ring
                      aria-hidden="true"
                      className="faq-ring relative flex h-10 w-10 flex-none items-center justify-center rounded-full"
                    >
                      <svg viewBox="0 0 24 24" className="faq-ring-icon h-4 w-4" aria-hidden="true">
                        <path d="M12 4.5v15M4.5 12h15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="faq-question bsl-serif flex-1 text-[1.05rem] font-medium leading-snug text-[#1C1712] sm:text-[1.15rem]">
                      {item.question}
                    </span>
                  </button>
                </h3>

                <div className="faq-panel" id={panelId} role="region" aria-labelledby={buttonId}>
                  <div>
                    <p className="max-w-[640px] pb-6 pl-14 pr-2 text-[0.95rem] leading-[1.75] text-[#6E6259]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 text-center lg:mt-14">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-8 py-4 text-[0.95rem] font-bold text-white shadow-[0_10px_30px_-8px_rgba(162,96,40,0.5)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Still Have Questions? Get In Touch
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}