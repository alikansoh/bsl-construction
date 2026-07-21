"use client";

import { useEffect, useRef, useState, useId } from "react";
import gsap from "gsap";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    id: "areas-covered",
    question: "Which areas do you cover?",
    answer:
      "We provide building, construction, mechanical, electrical and commercial maintenance services across London and surrounding areas.",
  },
  {
    id: "services-offered",
    question: "What services do you offer?",
    answer:
      "We offer complete building services, including new builds, extensions, refurbishments, plumbing, heating, boilers, gas, air conditioning, electrical work, landscaping, gardening and commercial maintenance.",
  },
  {
    id: "insured-vetted",
    question: "Are you fully insured?",
    answer:
      "Yes. BSL Construction is fully insured and works with a qualified professional team to deliver reliable and professional construction and maintenance services.",
  },
  {
    id: "qualified-team",
    question: "Do you use qualified professionals?",
    answer:
      "Yes. Our team includes qualified professionals, Gas Safe registered engineers, Vaillant installers, Worcester Bosch installers and air conditioning specialists.",
  },
  {
    id: "commercial-maintenance",
    question: "Do you offer commercial and hotel maintenance?",
    answer:
      "Yes. We provide planned and reactive commercial maintenance and hotel maintenance contracts, including ongoing repairs, servicing and building support.",
  },
  {
    id: "project-management",
    question: "Do you manage the whole project?",
    answer:
      "Yes. Our team manages the project from start to finish, with a dedicated site supervisor overseeing the work, trades and project progress.",
  },
  {
    id: "quote-process",
    question: "How do I get a quote?",
    answer:
      "Contact us to arrange a consultation and site visit. We will discuss your requirements and provide a clear, detailed quote for your project.",
  },
  {
    id: "get-started",
    question: "How do I get started?",
    answer:
      "Simply get in touch with BSL Construction. Whether you need a new build, refurbishment, building maintenance or commercial services, our team can discuss your requirements and help you plan the next step.",
  },
];

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

    const handler = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };

    mq.addEventListener("change", handler);

    return () => {
      mq.removeEventListener("change", handler);
    };
  }, []);

  return reduced;
}

export default function FAQ() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLDivElement | null>(null);

  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [openId, setOpenId] = useState<string | null>(
    FAQS[0].id
  );

  const baseId = useId();

  /*
   * Entrance animation
   * Uses IntersectionObserver instead of ScrollTrigger
   * for reliable behaviour on mobile devices.
   */
  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;

    const rows = rowRefs.current.filter(
      (el): el is HTMLLIElement => Boolean(el)
    );

    if (rows.length === 0) return;

    if (reducedMotion) {
      gsap.set(rows, {
        opacity: 1,
        y: 0,
      });

      return;
    }

    gsap.set(rows, {
      opacity: 0,
      y: 16,
    });

    const reveal = () => {
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
      });
    };

    const rect = node.getBoundingClientRect();

    const alreadyVisible =
      rect.top < window.innerHeight * 0.9 &&
      rect.bottom > 0;

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
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  const handleToggle = (
    id: string,
    ringEl: HTMLSpanElement | null
  ) => {
    const opening = openId !== id;

    setOpenId(opening ? id : null);

    if (!opening || reducedMotion || !ringEl) {
      return;
    }

    ringEl.classList.remove("is-pulsing");

    // Force reflow so the animation can restart
    // if the user opens the same item again quickly.
    void ringEl.offsetWidth;

    ringEl.classList.add("is-pulsing");

    gsap.fromTo(
      ringEl,
      {
        scale: 0.82,
      },
      {
        scale: 1,
        duration: 0.4,
        ease: "back.out(2.6)",
      }
    );
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="faq-heading"
      className="bg-[#FBF9F6] px-5 py-16 lg:px-8 lg:py-24"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        .bsl-serif {
          font-family:
            'Fraunces',
            'Iowan Old Style',
            'Palatino Linotype',
            Palatino,
            serif;
        }

        /* FAQ ring */

        .faq-ring {
          border: 1.5px solid rgba(28, 23, 18, 0.18);
          background: #ffffff;
          transition:
            border-color 0.4s ease,
            background 0.4s ease,
            box-shadow 0.4s ease;
        }

        .faq-row.is-open .faq-ring {
          border-color: #a26028;
          background:
            linear-gradient(
              160deg,
              #fbf3e3,
              #f3e0bc
            );

          box-shadow:
            0 6px 14px -9px
              rgba(162, 96, 40, 0.5),
            inset 0 1px 1px
              rgba(255, 255, 255, 0.7);
        }

        .faq-ring-icon {
          color: #6e6259;

          transition:
            color 0.4s ease,
            transform 0.35s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        .faq-row.is-open .faq-ring-icon {
          color: #7c4a1e;
          transform: rotate(45deg);
        }

        /* Ring pulse */

        @keyframes faqPulseRing {
          0% {
            box-shadow:
              0 0 0 0
                rgba(162, 96, 40, 0.42),
              0 6px 14px -9px
                rgba(162, 96, 40, 0.5),
              inset 0 1px 1px
                rgba(255, 255, 255, 0.7);
          }

          70% {
            box-shadow:
              0 0 0 12px
                rgba(162, 96, 40, 0),
              0 6px 14px -9px
                rgba(162, 96, 40, 0.5),
              inset 0 1px 1px
                rgba(255, 255, 255, 0.7);
          }

          100% {
            box-shadow:
              0 0 0 0
                rgba(162, 96, 40, 0),
              0 6px 14px -9px
                rgba(162, 96, 40, 0.5),
              inset 0 1px 1px
                rgba(255, 255, 255, 0.7);
          }
        }

        .faq-ring.is-pulsing {
          animation:
            faqPulseRing 0.8s ease-out;
        }

        /* Accordion */

        .faq-panel {
          display: grid;
          grid-template-rows: 0fr;

          transition:
            grid-template-rows
              0.45s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        .faq-row.is-open .faq-panel {
          grid-template-rows: 1fr;
        }

        .faq-panel > div {
          overflow: hidden;
        }

        /* Question hover */

        .faq-question {
          transition: color 0.25s ease;
        }

        .faq-row:hover .faq-question {
          color: #8a5121;
        }

        /* Accessibility */

        @media (prefers-reduced-motion: reduce) {
          .faq-panel {
            transition: none;
          }

          .faq-ring-icon {
            transition: none;
          }

          .faq-question {
            transition: none;
          }
        }
      `}</style>

      {/* FAQ Structured Data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            STRUCTURED_DATA
          ),
        }}
      />

      <div className="mx-auto max-w-[820px]">
        {/* Header */}

        <header className="mx-auto mb-12 max-w-[640px] text-center lg:mb-16">
          <span
            className="
              mb-3
              inline-flex
              items-center
              justify-center
              gap-2
              text-[0.72rem]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#A26028]
            "
          >
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#A26028]"
            />

            FAQ

            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#A26028]"
            />
          </span>

          <h2
            id="faq-heading"
            className="
              bsl-serif
              mb-3
              text-[clamp(2rem,4.2vw,3rem)]
              font-medium
              leading-[1.1]
              tracking-[-0.01em]
              text-[#1C1712]
            "
          >
            Frequently Asked Questions
          </h2>

          <p
            className="
              text-[clamp(0.95rem,1.6vw,1.05rem)]
              leading-[1.6]
              text-[#6E6259]
            "
          >
            Find answers to common questions about
            our construction, building and
            maintenance services.
          </p>
        </header>

        {/* FAQ List */}

        <ol
          className="
            flex
            flex-col
            divide-y
            divide-[#1C1712]/10
            border-y
            border-[#1C1712]/10
          "
        >
          {FAQS.map((item, i) => {
            const isOpen =
              openId === item.id;

            const buttonId =
              `${baseId}-trigger-${item.id}`;

            const panelId =
              `${baseId}-panel-${item.id}`;

            return (
              <li
                key={item.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={`
                  faq-row
                  py-1
                  ${isOpen ? "is-open" : ""}
                `}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={(e) => {
                      const ring =
                        e.currentTarget.querySelector<HTMLSpanElement>(
                          "[data-ring]"
                        );

                      handleToggle(
                        item.id,
                        ring
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-4
                      py-5
                      text-left
                    "
                  >
                    {/* Ring */}

                    <span
                      data-ring
                      aria-hidden="true"
                      className="
                        faq-ring
                        relative
                        flex
                        h-10
                        w-10
                        flex-none
                        items-center
                        justify-center
                        rounded-full
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="
                          faq-ring-icon
                          h-4
                          w-4
                        "
                        aria-hidden="true"
                      >
                        <path
                          d="
                            M12 4.5v15
                            M4.5 12h15
                          "
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>

                    {/* Question */}

                    <span
                      className="
                        faq-question
                        bsl-serif
                        flex-1
                        text-[1.05rem]
                        font-medium
                        leading-snug
                        text-[#1C1712]
                        sm:text-[1.15rem]
                      "
                    >
                      {item.question}
                    </span>
                  </button>
                </h3>

                {/* Answer */}

                <div
                  className="faq-panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <div>
                    <p
                      className="
                        max-w-[640px]
                        pb-6
                        pl-14
                        pr-2
                        text-[0.95rem]
                        leading-[1.75]
                        text-[#6E6259]
                      "
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* CTA */}

        <div
          className="
            mt-12
            text-center
            lg:mt-14
          "
        >
          <a
            href="/contact"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#A26028]
              px-8
              py-4
              text-[0.95rem]
              font-bold
              text-white
              shadow-[0_10px_30px_-8px_rgba(162,96,40,0.5)]
              transition-all
              duration-200
              ease-out
              hover:-translate-y-0.5
              hover:bg-[#8A5121]
            "
          >
            Still Have Questions?
            Get In Touch

            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="
                  M5 12h14
                  M13 6l6 6-6 6
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}