"use client";

/**
 * WhyChooseUs.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Why Choose Us section
 *
 * Updated:
 * - Removed West London-focused SEO
 * - Added broader construction and building-services SEO keywords
 * - Added Mechanical & Electrical service keywords
 * - Added Commercial & Hotel Maintenance keywords
 * - Added trust signals and professional credentials
 * - Kept the original 3D brass medallions
 * - Kept count-up statistics
 * - Kept GSAP animations
 * - Kept mobile-safe IntersectionObserver count-up
 * - Kept reduced-motion accessibility
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
}

type IconType = "layers" | "hardhat" | "square" | "shield";

type Reason = {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: IconType;
};

/* -------------------------------------------------------------------------- */
/* SEO-FOCUSED CONTENT                                                        */
/* -------------------------------------------------------------------------- */

const REASONS: Reason[] = [
  {
    id: "comprehensive-building-services",
    badge: "Complete Building Services",
    title: "Comprehensive Building & Construction Services",
    description:
      "BSL Construction provides complete building and construction services, including new builds, house extensions, loft conversions, basement conversions, property refurbishments, full home renovations, kitchens, bathrooms, roofing, landscaping and gardening. Our team manages projects from start to finish, coordinating the right trades and expertise to deliver a professional result.",
    icon: "layers",
  },
  {
    id: "mechanical-electrical-services",
    badge: "Mechanical & Electrical",
    title: "Experienced Mechanical & Electrical Specialists",
    description:
      "Our qualified professional team delivers reliable mechanical and electrical services, including plumbing, heating, boiler installation and servicing, heat pumps, underfloor heating, gas services, air conditioning and electrical installations. We also provide water regulations and RPZ valve testing, giving residential and commercial clients access to essential building services under one roof.",
    icon: "hardhat",
  },
  {
    id: "commercial-hotel-maintenance",
    badge: "Commercial Maintenance",
    title: "Commercial & Hotel Maintenance Specialists",
    description:
      "We provide planned and reactive commercial maintenance for businesses, property managers, hotels and commercial buildings. Our services include hotel maintenance contracts, emergency call-outs, property maintenance, facilities support and ongoing mechanical and building maintenance, helping commercial clients keep their properties safe, functional and well maintained.",
    icon: "square",
  },
  {
    id: "qualified-fully-insured",
    badge: "Trusted & Fully Insured",
    title: "Qualified, Trusted & Fully Insured",
    description:
      "We combine professional workmanship with reliable project management and clear communication. BSL Construction is fully insured and supported by a qualified professional team, dedicated site supervisors and specialist expertise. Our capabilities include Gas Safe registered services, Vaillant and Worcester Bosch installation expertise, and specialist air conditioning services.",
    icon: "shield",
  },
];

/* -------------------------------------------------------------------------- */
/* STATS                                                                      */
/* -------------------------------------------------------------------------- */

const STATS: {
  value: number;
  suffix: string;
  label: string;
}[] = [
  {
    value: 15,
    suffix: "+",
    label: "Years Experience",
  },
  {
    value: 100,
    suffix: "%",
    label: "Client Satisfaction",
  },
  {
    value: 12,
    suffix: "-Mo",
    label: "Workmanship Guarantee",
  },
];

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5l8.5 4.25L12 12l-8.5-4.25L12 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.75L12 17l8.5-4.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 17.25L12 21.5l8.5-4.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HardHatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M4.5 15.5a7.5 7.5 0 0 1 15 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.5 15.5h19" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M9.5 15.5V12M14.5 15.5V12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M4.5 3.5v17h17"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 8.2h2.4M4.5 12.6h2.4M4.5 17h2.4"
        strokeLinecap="round"
      />
      <path
        d="M9.3 20.5v-2.4M13.7 20.5v-2.4M18.1 20.5v-2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 3.5l6.5 2.6v5.4c0 4.6-3.2 7.4-6.5 8.5-3.3-1.1-6.5-3.9-6.5-8.5V6.1L12 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.1l2 2 4-4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReasonIcon({ type }: { type: IconType }) {
  switch (type) {
    case "layers":
      return <LayersIcon />;

    case "hardhat":
      return <HardHatIcon />;

    case "square":
      return <SquareIcon />;

    case "shield":
      return <ShieldIcon />;
  }
}

/* -------------------------------------------------------------------------- */
/* STRUCTURED DATA                                                            */
/* -------------------------------------------------------------------------- */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "BSL Construction",
  description:
    "BSL Construction provides complete building, construction, mechanical, electrical and commercial maintenance services, including new builds, extensions, property refurbishments, plumbing, heating, gas, air conditioning, electrical services and hotel maintenance.",
  areaServed: "London",
  knowsAbout: [
    "New Builds",
    "House Extensions",
    "Loft Conversions",
    "Basement Conversions",
    "Property Refurbishments",
    "Full Home Renovations",
    "Kitchen Renovations",
    "Bathroom Renovations",
    "Roofing",
    "Landscaping",
    "Gardening",
    "Plumbing",
    "Heating",
    "Boiler Installation",
    "Boiler Servicing",
    "Heat Pumps",
    "Underfloor Heating",
    "Gas Services",
    "Air Conditioning",
    "Electrical Services",
    "Water Regulations",
    "RPZ Valve Testing",
    "Commercial Maintenance",
    "Hotel Maintenance",
    "Planned Maintenance",
    "Reactive Maintenance",
    "Facilities Support",
  ],
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const statBarRef = useRef<HTMLDivElement | null>(null);

  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const medallionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ------------------------------------------------------------------------ */
  /* STAT COUNT UP                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const statBar = statBarRef.current;

    const statEls = statRefs.current.filter(
      (el): el is HTMLSpanElement => Boolean(el)
    );

    if (!statBar || statEls.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      statEls.forEach((el, i) => {
        el.textContent = `${STATS[i].value}${STATS[i].suffix}`;
      });

      return;
    }

    gsap.set(statEls, {
      opacity: 0,
      y: 8,
    });

    let hasRun = false;

    const runCountUp = () => {
      if (hasRun) return;

      hasRun = true;

      gsap.to(statEls, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });

      statEls.forEach((el, i) => {
        const proxy = {
          val: 0,
        };

        gsap.to(proxy, {
          val: STATS[i].value,
          duration: 1.3,
          ease: "power2.out",
          delay: 0.1,

          onUpdate: () => {
            el.textContent = `${Math.round(proxy.val)}${STATS[i].suffix}`;
          },
        });
      });
    };

    const rect = statBar.getBoundingClientRect();

    const alreadyVisible =
      rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (alreadyVisible) {
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(statBar);

    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* GSAP ANIMATIONS                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;

    if (!section || !grid) return;

    const cards = cardRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );

    const medallions = medallionRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );

    if (cards.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        canHover: "(hover: hover) and (pointer: fine)",
        isDesktop: "(min-width: 1024px)",
      },
      (context) => {
        const {
          reduceMotion,
          canHover,
          isDesktop,
        } = context.conditions as {
          reduceMotion: boolean;
          canHover: boolean;
          isDesktop: boolean;
        };

        const triggers: ScrollTrigger[] = [];
        const cleanups: Array<() => void> = [];

        /* ------------------------------------------------------------------ */
        /* INITIAL STATE                                                       */
        /* ------------------------------------------------------------------ */

        gsap.set(cards, {
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : 24,
          scale: reduceMotion ? 1 : 0.97,
        });

        gsap.set(medallions, {
          opacity: reduceMotion ? 1 : 0,
          rotateY: reduceMotion ? 0 : -150,
          z: reduceMotion ? 0 : -70,
        });

        gsap.set(grid, {
          rotateX: reduceMotion || !isDesktop ? 0 : 6,
        });

        /* ------------------------------------------------------------------ */
        /* CARD ENTRANCE                                                       */
        /* ------------------------------------------------------------------ */

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            once: true,
          },

          onComplete: () => {
            if (reduceMotion) return;

            medallions.forEach((medallion, i) => {
              gsap.to(medallion, {
                y: -4,
                duration: 2.6 + (i % 3) * 0.4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: i * 0.12,
              });
            });
          },
        });

        cards.forEach((card, i) => {
          tl.to(
            card,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: reduceMotion ? 0.01 : 0.7,
              ease: "power3.out",
            },
            reduceMotion ? 0 : i * 0.1
          );
        });

        medallions.forEach((medallion, i) => {
          tl.to(
            medallion,
            {
              opacity: 1,
              rotateY: 0,
              z: 0,
              duration: reduceMotion ? 0.01 : 0.85,
              ease: "power3.out",
            },
            reduceMotion ? 0 : i * 0.1 + 0.06
          );
        });

        if (tl.scrollTrigger) {
          triggers.push(tl.scrollTrigger);
        }

        /* ------------------------------------------------------------------ */
        /* DESKTOP PARALLAX                                                    */
        /* ------------------------------------------------------------------ */

        if (isDesktop && !reduceMotion) {
          const parallax = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,

            onUpdate: (self) => {
              gsap.set(grid, {
                rotateX: 6 - self.progress * 8,
              });
            },
          });

          triggers.push(parallax);
        }

        /* ------------------------------------------------------------------ */
        /* HOVER TILT + SHINE                                                  */
        /* ------------------------------------------------------------------ */

        if (canHover && !reduceMotion) {
          cards.forEach((card, i) => {
            const medallion = medallions[i];
            const shine = shineRefs.current[i];
            const shadow = shadowRefs.current[i];

            if (!medallion) return;

            const rotateX = gsap.quickTo(medallion, "rotateX", {
              duration: 0.5,
              ease: "power3.out",
            });

            const rotateY = gsap.quickTo(medallion, "rotateY", {
              duration: 0.5,
              ease: "power3.out",
            });

            const lift = gsap.quickTo(card, "y", {
              duration: 0.4,
              ease: "power3.out",
            });

            const shadowX = shadow
              ? gsap.quickTo(shadow, "x", {
                  duration: 0.5,
                  ease: "power3.out",
                })
              : null;

            const shadowSkew = shadow
              ? gsap.quickTo(shadow, "skewX", {
                  duration: 0.5,
                  ease: "power3.out",
                })
              : null;

            const handleMove = (e: MouseEvent) => {
              const rect = medallion.getBoundingClientRect();

              const px =
                (e.clientX - rect.left) / rect.width - 0.5;

              const py =
                (e.clientY - rect.top) / rect.height - 0.5;

              rotateY(px * 28);
              rotateX(py * -28);

              shadowX?.(-px * 14);
              shadowSkew?.(-px * 22);

              if (shine) {
                shine.style.setProperty(
                  "--mx",
                  `${(px + 0.5) * 100}%`
                );

                shine.style.setProperty(
                  "--my",
                  `${(py + 0.5) * 100}%`
                );
              }
            };

            const handleEnter = () => {
              lift(-4);

              if (shine) {
                shine.style.opacity = "1";
              }

              if (shadow) {
                shadow.style.opacity = "1";
              }
            };

            const handleLeave = () => {
              rotateX(0);
              rotateY(0);
              lift(0);

              shadowX?.(0);
              shadowSkew?.(0);

              if (shine) {
                shine.style.opacity = "0";
              }

              if (shadow) {
                shadow.style.opacity = "0";
              }
            };

            card.addEventListener(
              "mousemove",
              handleMove
            );

            card.addEventListener(
              "mouseenter",
              handleEnter
            );

            card.addEventListener(
              "mouseleave",
              handleLeave
            );

            cleanups.push(() => {
              card.removeEventListener(
                "mousemove",
                handleMove
              );

              card.removeEventListener(
                "mouseenter",
                handleEnter
              );

              card.removeEventListener(
                "mouseleave",
                handleLeave
              );
            });
          });
        }

        return () => {
          triggers.forEach((trigger) => trigger.kill());
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    );

    return () => mm.revert();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      ref={sectionRef}
      aria-labelledby="why-choose-us-heading"
      className="bg-white px-5 pt-2 pb-16 lg:px-8 lg:pt-2 lg:pb-24"
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

        .bsl-shine {
          background:
            radial-gradient(
              circle at var(--mx, 50%) var(--my, 50%),
              rgba(255,255,255,0.85),
              rgba(255,255,255,0) 55%
            );
        }

        .bsl-blueprint-grid {
          background-image:
            radial-gradient(
              circle,
              rgba(28,23,18,0.07) 1px,
              transparent 1px
            );

          background-size: 22px 22px;
        }
      `}</style>

      {/* Structured Data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA),
        }}
      />

      <div className="mx-auto max-w-[1180px] min-[1440px]:max-w-[1360px]">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <header className="mx-auto mb-10 max-w-[760px] text-center lg:mb-12">
          <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#A26028]"
            />

            Why Choose Us

            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#A26028]"
            />
          </span>

          <h2
            id="why-choose-us-heading"
            className="bsl-serif mb-4 text-[clamp(2rem,4.2vw,3rem)] font-medium leading-[1.1] tracking-[-0.01em] text-[#1C1712]"
          >
            Why Choose BSL Construction?
          </h2>

          <p className="text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.7] text-[#6E6259]">
            BSL Construction provides complete building,
            mechanical, electrical and commercial maintenance
            services for residential and commercial properties.
            From new builds, house extensions and property
            refurbishments to plumbing, heating, gas, air
            conditioning, electrical services and ongoing
            commercial maintenance, our experienced team delivers
            professional solutions from one trusted company.
          </p>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* STAT BAR                                                          */}
        {/* ---------------------------------------------------------------- */}

        <div
          ref={statBarRef}
          className="mx-auto mb-12 grid max-w-2xl grid-cols-3 divide-x divide-[#1C1712]/10 lg:mb-16"
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-3 text-center sm:px-6"
            >
              <span
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="bsl-serif text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium leading-none text-[#1C1712]"
              >
                0{stat.suffix}
              </span>

              <span className="sr-only">
                {`${stat.value}${stat.suffix} ${stat.label}`}
              </span>

              <span className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#6E6259]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3D CARD WALL                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div
          ref={stageRef}
          className="relative"
          style={{
            perspective: "1400px",
          }}
        >
          <div
            aria-hidden="true"
            className="bsl-blueprint-grid pointer-events-none absolute -inset-6 -z-10 opacity-70"
          />

          <div
            ref={gridRef}
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {REASONS.map((reason, i) => (
              <div
                key={reason.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#FBF9F6] p-7 pt-8 ring-1 ring-[#1C1712]/[0.06] shadow-[0_1px_2px_rgba(28,23,18,0.05)] transition-shadow duration-300 ease-out hover:shadow-[0_28px_54px_-26px_rgba(28,23,18,0.28)]"
                style={{
                  willChange: "transform",
                }}
              >
                {/* -------------------------------------------------------- */}
                {/* 3D BRASS MEDALLION                                      */}
                {/* -------------------------------------------------------- */}

                <div
                  className="relative mb-6 h-[68px] w-[68px]"
                  style={{
                    perspective: "700px",
                  }}
                >
                  {/* Contact shadow */}

                  <div
                    aria-hidden="true"
                    ref={(el) => {
                      shadowRefs.current[i] = el;
                    }}
                    className="absolute left-1/2 top-[62px] h-2.5 w-11 -translate-x-1/2 rounded-full bg-[#1C1712]/30 opacity-0 blur-md"
                  />

                  {/* Medallion */}

                  <div
                    ref={(el) => {
                      medallionRefs.current[i] = el;
                    }}
                    className="relative h-full w-full rounded-full p-[3px]"
                    style={{
                      transformStyle: "preserve-3d",
                      background:
                        "conic-gradient(from 200deg, #8A5121, #E8C599 25%, #A26028 55%, #E8C599 80%, #8A5121)",
                      boxShadow:
                        "0 14px 26px -14px rgba(162,96,40,0.55), 0 2px 4px rgba(28,23,18,0.15)",
                    }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 34% 30%, #F3D9AE, #A26028 68%, #8A5121)",
                      }}
                    >
                      <span
                        className="text-[#FBF9F6]"
                        style={{
                          filter:
                            "drop-shadow(0 1px 0 rgba(255,255,255,0.35)) drop-shadow(0 -1px 1px rgba(28,23,18,0.4))",
                        }}
                      >
                        <ReasonIcon type={reason.icon} />
                      </span>
                    </div>

                    {/* Shine */}

                    <div
                      ref={(el) => {
                        shineRefs.current[i] = el;
                      }}
                      aria-hidden="true"
                      className="bsl-shine pointer-events-none absolute inset-0 rounded-full opacity-0"
                      style={
                        {
                          "--mx": "50%",
                          "--my": "50%",
                        } as CSSProperties
                      }
                    />
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* CARD CONTENT                                               */}
                {/* -------------------------------------------------------- */}

                <span className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                  {reason.badge}
                </span>

                <h3 className="bsl-serif mb-2.5 text-[1.12rem] font-medium leading-snug text-[#1C1712] transition-colors duration-300 group-hover:text-[#8A5121]">
                  {reason.title}
                </h3>

                <p className="text-[0.92rem] leading-[1.7] text-[#6E6259]">
                  {reason.description}
                </p>

                {/* Bottom accent */}

                <span
                  aria-hidden="true"
                  className="absolute inset-x-7 bottom-0 h-[2px] origin-left scale-x-0 bg-[#A26028] transition-transform duration-500 ease-out group-hover:scale-x-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}