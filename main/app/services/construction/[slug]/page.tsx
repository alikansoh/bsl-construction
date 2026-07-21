/**
 * app/services/[slug]/page.tsx
 * -------------------------------------------------------------------------
 * BSL Construction — Dynamic Service Detail Page
 *
 * Features:
 * - Dynamic service pages
 * - Static generation
 * - Dynamic metadata
 * - Automatic service selection in QuoteForm
 * - Service-type-aware language
 * - Construction / Trade / Property service handling
 * - Shared London-wide areas
 * - Editorial overview layout
 * - What's Included
 * - Gallery
 * - Process timeline
 * - FAQs + FAQ schema
 * - Trust bar
 * - Sticky in-page navigation
 * - On-page quote form
 * - Dynamic closing CTA
 * -------------------------------------------------------------------------
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";

import {
  getAllServices,
  getServiceBySlug,
  getTrustBar,
} from "@/lib/services";

import ServiceFaqAccordion from "@/components/Servicefaqaccordion";
import ServiceGallerySlider from "@/components/ServiceGallerySlider";
import ServiceSectionNav from "@/components/ServiceSectionNav";
import QuoteForm from "@/components/ServiceQuoteForm";
import Reveal from "@/components/Reveal";
import TrustBar from "@/components/TrustBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/* Static Params                                                              */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
  return getAllServices().map((service) => ({
    slug: service.slug,
  }));
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const service = getServiceBySlug(slug);

  if (!service) {
    return {};
  }

  return {
    title: service.seo.metaTitle,
    description: service.seo.metaDescription,
    keywords: service.seo.keywords,

    openGraph: {
      title: service.seo.metaTitle,
      description: service.seo.metaDescription,
      images: [
        {
          url: service.image.url,
          alt: service.image.alt,
        },
      ],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Shared Components                                                          */
/* -------------------------------------------------------------------------- */

function CornerTicks({
  tone = "brass",
  interactive = true,
}: {
  tone?: "brass" | "pale";
  interactive?: boolean;
}) {
  const stroke =
    tone === "pale"
      ? "#E8C599"
      : "#A26028";

  const corners = [
    {
      pos: "left-0 top-0",
      rotate: "",
    },
    {
      pos: "right-0 top-0",
      rotate: "rotate-90",
    },
    {
      pos: "right-0 bottom-0",
      rotate: "rotate-180",
    },
    {
      pos: "left-0 bottom-0",
      rotate: "-rotate-90",
    },
  ];

  return (
    <>
      {corners.map((corner) => (
        <svg
          key={corner.pos}
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`pointer-events-none absolute ${corner.pos} ${corner.rotate} ${
            interactive
              ? "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-80 group-focus-within:opacity-80"
              : "opacity-60"
          }`}
        >
          <path
            d="M1 6.5V1H6.5"
            stroke={stroke}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </>
  );
}

function ArrowIcon({
  size = 13,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
    >
      <path
        d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="relative h-px w-full bg-[#1C1712]/8"
    >
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#E8C599]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared London Areas                                                        */
/* -------------------------------------------------------------------------- */

const SHARED_AREAS = [
  "City of London",
  "Westminster",
  "Kensington & Chelsea",
  "Camden",
  "Islington",
  "Hackney",
  "Hammersmith & Fulham",
  "Wandsworth",
  "Richmond upon Thames",
  "Kingston upon Thames",
  "Merton",
  "Lambeth",
  "Southwark",
  "Lewisham",
  "Greenwich",
  "Tower Hamlets",
  "Haringey",
  "Barnet",
  "Brent",
  "Ealing",
  "Hounslow",
  "Enfield",
  "Bromley",
  "Croydon",
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function ServiceDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  /* ------------------------------------------------------------------------ */
  /* Content Flags                                                            */
  /* ------------------------------------------------------------------------ */

  const hasWhatsIncluded =
    (service.whatsIncluded?.items?.length ?? 0) > 0;

  const hasFaqs =
    service.faqs?.length > 0;

  const hasGallery =
    (service.gallery?.length ?? 0) > 0;

  const hasProcess =
    service.process?.length > 0;

  const trustBarItems =
    getTrustBar();

  /* ------------------------------------------------------------------------ */
  /* Service Type                                                             */
  /* ------------------------------------------------------------------------ */

  const serviceType =
    service.serviceType ?? "trade";

  const isConstruction =
    serviceType === "construction";

  const isTrade =
    serviceType === "trade";

  const isProperty =
    serviceType === "property";

  /* ------------------------------------------------------------------------ */
  /* Dynamic Language                                                         */
  /* ------------------------------------------------------------------------ */

  const workLabel =
    isConstruction
      ? "project"
      : isProperty
        ? "property work"
        : "service";

  const workPluralLabel =
    isConstruction
      ? "projects"
      : isProperty
        ? "property services"
        : "services";

  const overviewTitle =
    isConstruction
      ? `A considered approach to ${service.title.toLowerCase()}.`
      : isTrade
        ? `Professional ${service.title.toLowerCase()}, carried out properly.`
        : `Reliable ${service.title.toLowerCase()} for your property.`;

  const overviewDescription =
    isConstruction
      ? "Every project is approached with the same focus on quality, clear communication and careful coordination. From the first conversation through to completion, our team keeps the work organised, transparent and accountable."
      : isTrade
        ? `Every ${service.title.toLowerCase()} job is approached with a focus on quality, clear communication and professional workmanship. From the initial enquiry through to completion, our team keeps the work organised, transparent and accountable.`
        : `Every ${service.title.toLowerCase()} service is approached with care, clear communication and attention to detail. Our team keeps the work organised, transparent and focused on delivering a properly finished result.`;

  const areasTitle =
    isConstruction
      ? "Delivering projects across London."
      : isTrade
        ? "Providing professional services across London."
        : "Supporting properties across London.";

  const areasDescription =
    isConstruction
      ? "BSL Construction works across London, supporting homeowners, developers, landlords, property managers and commercial clients with professional construction and property services."
      : isTrade
        ? `BSL Construction provides professional ${service.title.toLowerCase()} services across London for homeowners, landlords, property managers and commercial clients.`
        : `BSL Construction provides professional property services across London, supporting homeowners, landlords, property managers and commercial clients.`;

  const quoteTitle =
    isConstruction
      ? `Let's talk about your ${service.title.toLowerCase()} project.`
      : isTrade
        ? `Let's talk about your ${service.title.toLowerCase()} needs.`
        : `Let's talk about your property requirements.`;

  const quoteDescription =
    isConstruction
      ? "Tell us about your plans, your property and what you're looking to achieve. Our team will review your requirements and get back to you."
      : isTrade
        ? `Tell us what you need for your ${service.title.toLowerCase()}. Our team will review your requirements and get back to you with the next steps.`
        : "Tell us what you need and our team will review your requirements and get back to you with the next steps.";

  const closingTitle =
    service.cta?.title ??
    (
      isConstruction
        ? `Let's scope your ${service.title.toLowerCase()} project.`
        : isTrade
          ? `Need professional ${service.title.toLowerCase()}?`
          : `Let's discuss your property requirements.`
    );

  const closingContent =
    service.cta?.content ??
    (
      isConstruction
        ? "Tell us what you're planning and we'll come back with a clear, honest scope — no obligation, no upsell."
        : isTrade
          ? `Tell us what you need and we'll come back with a clear, honest scope for your ${service.title.toLowerCase()} — no obligation, no upsell.`
          : "Tell us what you need and we'll come back with a clear, honest scope — no obligation, no upsell."
    );

  const closingButton =
    service.cta?.buttonLabel ??
    (
      isConstruction
        ? "Discuss Your Project"
        : "Request a Quote"
    );

  /* ------------------------------------------------------------------------ */
  /* FAQ Schema                                                               */
  /* ------------------------------------------------------------------------ */

  const faqSchema = hasFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  /* ------------------------------------------------------------------------ */
  /* In-page Navigation                                                       */
  /* ------------------------------------------------------------------------ */

  const inPageNav = [
    {
      href: "#overview",
      label: "Overview",
    },

    ...(hasWhatsIncluded
      ? [
          {
            href: "#included",
            label: "What's included",
          },
        ]
      : []),

    ...(hasGallery
      ? [
          {
            href: "#gallery",
            label: "Gallery",
          },
        ]
      : []),

    ...(hasProcess
      ? [
          {
            href: "#process",
            label: "How it works",
          },
        ]
      : []),

    {
      href: "#areas",
      label: "Areas we cover",
    },

    ...(hasFaqs
      ? [
          {
            href: "#faqs",
            label: "FAQs",
          },
        ]
      : []),

    {
      href: "#quote",
      label: "Get a quote",
    },
  ];

  return (
    <main
      className={`${fraunces.variable} ${plexMono.variable}`}
    >
      {/* ================================================================== */}
      {/* GLOBAL STYLES                                                       */}
      {/* ================================================================== */}

      <style>{`
        .bsl-serif {
          font-family:
            var(--font-fraunces),
            'Iowan Old Style',
            'Palatino Linotype',
            Palatino,
            serif;
        }

        .bsl-mono {
          font-family:
            var(--font-plex-mono),
            ui-monospace,
            SFMono-Regular,
            'SF Mono',
            Menlo,
            Consolas,
            monospace;
        }

        .bsl-gold-rule {
          background:
            linear-gradient(
              90deg,
              transparent,
              #E8C599 45%,
              #E8C599 55%,
              transparent
            );
        }

        .bsl-focus:focus-visible {
          outline: 2px solid #A26028;
          outline-offset: 3px;
          border-radius: 4px;
        }

        .bsl-dot-grid {
          background-image:
            radial-gradient(
              circle,
              rgba(232,197,153,0.16) 1px,
              transparent 1px
            );
          background-size: 22px 22px;
        }

        .bsl-grain {
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
        }

        html {
          scroll-behavior: smooth;
        }

        @keyframes bsl-kenburns {
          from {
            transform: scale(1.03) translate3d(0, 0, 0);
          }

          to {
            transform: scale(1.13) translate3d(-1.2%, -1%, 0);
          }
        }

        .bsl-hero-image {
          animation:
            bsl-kenburns
            26s
            ease-in-out
            infinite
            alternate;
        }

        .bsl-section-image {
          transition:
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.9s ease;
        }

        .bsl-section-row:hover
        .bsl-section-image,
        .bsl-section-row:focus-within
        .bsl-section-image {
          transform: scale(1.06);
          filter:
            saturate(1.08)
            brightness(1.02);
        }

        .bsl-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bsl-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .bsl-hero-image {
            animation: none;
          }

          .bsl-section-image {
            transition: none;
          }

          .bsl-section-row:hover
          .bsl-section-image {
            transform: none;
            filter: none;
          }

          .bsl-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <noscript>
        <style>
          {`
            .bsl-reveal {
              opacity: 1 !important;
              transform: none !important;
            }
          `}
        </style>
      </noscript>

      {/* ================================================================== */}
      {/* FAQ SCHEMA                                                          */}
      {/* ================================================================== */}

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      {/* ================================================================== */}
      {/* HERO                                                                */}
      {/* ================================================================== */}

      <header className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={service.image.url}
            alt={service.image.alt}
            fill
            priority
            sizes="100vw"
            className="bsl-hero-image object-cover"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1C1712]/60 via-[#1C1712]/32 to-[#1C1712]/72"
        />

        <div
          aria-hidden="true"
          className="bsl-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        />

        <div
          aria-hidden="true"
          className="bsl-dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        {/* Registration Marks */}

        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill="none"
          className="pointer-events-none absolute left-5 top-24 text-[#E8C599]/45 sm:left-8 lg:left-10"
        >
          <path
            d="M1 9V1H9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill="none"
          className="pointer-events-none absolute right-5 top-24 rotate-90 text-[#E8C599]/45 sm:right-8 lg:right-10"
        >
          <path
            d="M1 9V1H9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill="none"
          className="pointer-events-none absolute left-5 bottom-8 -rotate-90 text-[#E8C599]/45 sm:left-8 lg:left-10"
        >
          <path
            d="M1 9V1H9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          fill="none"
          className="pointer-events-none absolute bottom-8 right-5 rotate-180 text-[#E8C599]/45 sm:right-8 lg:right-10"
        >
          <path
            d="M1 9V1H9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        {/* Vertical Brand Mark */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block xl:right-10"
        >
          <span className="bsl-mono block text-[0.68rem] font-medium uppercase tracking-[0.32em] text-white/35 [writing-mode:vertical-rl]">
            BSL Construction
          </span>
        </div>

        <div className="relative mx-auto max-w-[1180px]">
          {/* Breadcrumb */}

          <nav
            aria-label="Breadcrumb"
            className="bsl-mono mb-5 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.1em] text-white/55"
          >
            <Link
              href="/services"
              className="bsl-focus hover:text-white/90"
            >
              Services
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span className="text-white/85">
              {service.title}
            </span>
          </nav>

          {/* Category */}

          <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#E8C599]">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[#E8C599]"
            />

            {service.category}
          </span>

          {/* Title */}

          <h1 className="bsl-serif mb-5 max-w-2xl text-[clamp(2.6rem,5.6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
            {service.title}
          </h1>

          <div
            aria-hidden="true"
            className="bsl-gold-rule mb-6 h-px w-24"
          />

          <p className="max-w-2xl text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.75] text-white/70">
            {service.shortDescription}
          </p>

          {/* Hero CTAs */}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="#quote"
              className="bsl-focus group inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121] hover:shadow-[0_14px_28px_-12px_rgba(162,96,40,0.55)]"
            >
              {service.primaryCta?.label ??
                "Get a Quote"}

              <ArrowIcon />
            </Link>

            {service.secondaryCta && (
              <Link
                href={service.secondaryCta.href}
                className="bsl-focus bsl-mono text-[0.78rem] font-medium uppercase tracking-[0.06em] text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
              >
                {service.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* TRUST BAR                                                           */}
      {/* ================================================================== */}

      <TrustBar items={trustBarItems} />

      {/* ================================================================== */}
      {/* IN-PAGE NAV                                                         */}
      {/* ================================================================== */}

      <ServiceSectionNav items={inPageNav} />

      {/* ================================================================== */}
      {/* OVERVIEW                                                            */}
      {/* ================================================================== */}

      <section
        id="overview"
        className="scroll-mt-16 bg-[#FAF7F2] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1180px]">

          {/* Intro Header */}

          <div className="mb-16 grid gap-10 lg:mb-24 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-[#A26028]"
                />

                Overview
              </span>

              <h2 className="bsl-serif max-w-2xl text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1C1712]">
                {overviewTitle}
              </h2>
            </div>

            <div className="border-l border-[#A26028]/25 pl-6 lg:pl-8">
              <p className="text-[1rem] leading-[1.85] text-[#5C544A]">
                {overviewDescription}
              </p>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-px w-8 bg-[#A26028]" />

                <span className="bsl-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#A26028]">
                  BSL Construction
                </span>
              </div>
            </div>
          </div>

          {/* Overview Rows */}

          <div className="space-y-28 lg:space-y-36">
            {service.sections.map((sec, i) => {
              const imageOnRight =
                sec.layout === "image-right";

              const position =
                `${String(i + 1).padStart(2, "0")} / ${String(
                  service.sections.length
                ).padStart(2, "0")}`;

              return (
                <Reveal
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-24"
                >
                  <div
                    className={`bsl-section-row group mx-auto flex max-w-[1080px] flex-col items-start gap-12 lg:gap-16 ${
                      imageOnRight
                        ? "lg:flex-row-reverse"
                        : "lg:flex-row"
                    }`}
                  >
                    {/* Image */}

                    <figure className="w-full shrink-0 lg:w-[46%]">
                      <div className="relative mx-auto max-w-[480px] p-4 lg:mx-0">
                        <span
                          aria-hidden="true"
                          className="absolute inset-2 -z-10 translate-x-3 translate-y-3 bg-[#E8C599]/25 lg:translate-x-4 lg:translate-y-4"
                        />

                        <div className="relative bg-[#FAF7F2] p-2.5 shadow-[0_1px_3px_rgba(28,23,18,0.08)] ring-1 ring-[#1C1712]/[0.06]">
                          <CornerTicks />

                          <div className="relative aspect-[6/7] w-full overflow-hidden">
                            {sec.image && (
                              <Image
                                src={sec.image.url}
                                alt={sec.image.alt}
                                fill
                                sizes="(min-width: 1024px) 480px, 86vw"
                                className="bsl-section-image object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {sec.image && (
                        <figcaption className="mt-3 flex items-baseline gap-3 px-4">
                          <span className="bsl-mono shrink-0 text-[0.68rem] font-medium tracking-[0.08em] text-[#A26028]">
                            Fig. {String(i + 1).padStart(2, "0")}
                          </span>

                          <span className="bsl-mono text-[0.72rem] leading-snug tracking-[0.01em] text-[#8A8074]">
                            {sec.image.alt}
                          </span>
                        </figcaption>
                      )}
                    </figure>

                    {/* Text */}

                    <div className="w-full lg:w-[50%] lg:pt-8">
                      <span className="bsl-mono mb-4 inline-flex items-center gap-3 text-[0.68rem] font-medium tracking-[0.2em] text-[#A26028]">
                        <span
                          aria-hidden="true"
                          className="h-px w-6 bg-[#A26028]/60"
                        />

                        {position}
                      </span>

                      <h3 className="bsl-serif mb-5 max-w-[26ch] text-[clamp(1.7rem,2.8vw,2.35rem)] font-medium leading-[1.22] tracking-[-0.01em] text-[#1C1712]">
                        {sec.heading}
                      </h3>

                      <p className="mb-7 max-w-[50ch] text-[1rem] leading-[1.9] text-[#5C544A]">
                        {sec.body}
                      </p>

                      {sec.cta && (
                        <Link
                          href={sec.cta.href}
                          className="bsl-focus group/cta inline-flex items-center gap-2 rounded-full border border-[#A26028] px-5 py-2.5 text-[0.76rem] font-semibold uppercase tracking-[0.06em] text-[#A26028] transition-all duration-200 ease-out hover:bg-[#A26028] hover:text-white"
                        >
                          {sec.cta.label}

                          <ArrowIcon size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ================================================================== */}
      {/* WHAT'S INCLUDED                                                     */}
      {/* ================================================================== */}

      {hasWhatsIncluded && (
        <>
          <section
            id="included"
            className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
          >
            <div className="mx-auto max-w-[1180px]">

              <div className="grid gap-10 border-b border-[#1C1712]/10 pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-[#A26028]"
                    />

                    {service.whatsIncluded?.title ??
                      "What's Included"}
                  </span>

                  <h2 className="bsl-serif max-w-xl text-[clamp(2rem,3.5vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1C1712]">
                    A complete service, carefully coordinated.
                  </h2>
                </div>

                <div className="lg:max-w-xl lg:justify-self-end">
                  <p className="text-[1rem] leading-[1.85] text-[#5C544A]">
                    {service.whatsIncluded?.intro ??
                      "From the initial scope through to completion, our team coordinates the essential elements of the work with a clear focus on quality, safety and a properly finished result."}
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-x-10 gap-y-0 md:grid-cols-2 lg:grid-cols-3">
                {service.whatsIncluded!.items.map(
                  (item, i) => (
                    <Reveal
                      key={item}
                      delay={Math.min(i * 60, 240)}
                      className="group relative border-b border-[#1C1712]/10 py-7 first:pt-0 md:nth-[2]:pt-0 lg:nth-[3]:pt-0"
                    >
                      <div className="flex items-start gap-5">

                        <span className="bsl-mono shrink-0 text-[0.7rem] font-medium tracking-[0.12em] text-[#A26028]">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1712] text-[#E8C599] transition-colors duration-300 group-hover:bg-[#A26028]">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M3 8.5L6.2 11.5L13 4.5"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <p className="max-w-[28ch] text-[0.98rem] font-medium leading-[1.65] text-[#1C1712]">
                            {item}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  )
                )}
              </div>

              <div className="mt-12 flex flex-col gap-5 border-t border-[#1C1712]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="bsl-mono max-w-xl text-[0.72rem] uppercase leading-[1.7] tracking-[0.08em] text-[#8A8074]">
                  Scope and specification are confirmed before work begins, so you have a clear understanding of what is included.
                </p>

                <Link
                  href="#quote"
                  className="bsl-focus group inline-flex shrink-0 items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#A26028]"
                >
                  Discuss Your Requirements

                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ================================================================== */}
      {/* GALLERY                                                             */}
      {/* ================================================================== */}

      {hasGallery && (
        <>
          <section
            id="gallery"
            className="scroll-mt-16 bg-[#FAF7F2] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
          >
            <div className="mx-auto max-w-[1080px]">

              <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-[#A26028]"
                    />

                    Gallery
                  </span>

                  <h2 className="bsl-serif max-w-2xl text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
                    A closer look at{" "}
                    {service.title.toLowerCase()}{" "}
                    on site.
                  </h2>
                </div>

                <p className="bsl-mono text-[0.78rem] tracking-[0.01em] text-[#6E6259]">
                  Tap a photo to view it full-screen, or use the arrows to browse.
                </p>
              </div>

              <ServiceGallerySlider
                images={service.gallery}
                title={service.title}
              />
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ================================================================== */}
      {/* PROCESS                                                             */}
      {/* ================================================================== */}

      {hasProcess && (
        <>
          <section
            id="process"
            className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:py-28"
          >
            <div className="mx-auto max-w-[780px]">

              <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-[#A26028]"
                />

                How it works
              </span>

              <h2 className="bsl-serif mb-4 text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
                {service.processTitle ??
                  "From first visit to completion"}
              </h2>

              {service.processDescription && (
                <p className="mb-11 max-w-xl text-[1rem] leading-[1.7] text-[#5C544A]">
                  {service.processDescription}
                </p>
              )}

              <ol className="relative space-y-11 border-l border-[#1C1712]/10 pl-9">
                {service.process.map(
                  (step, i) => (
                    <Reveal
                      as="li"
                      key={step.step}
                      delay={Math.min(i * 80, 240)}
                      className="relative"
                    >
                      <span
                        aria-hidden="true"
                        className="bsl-mono absolute -left-[2.95rem] flex h-10 w-10 items-center justify-center rounded-full border border-[#A26028]/25 bg-[#1C1712] text-[0.82rem] font-medium text-[#E8C599] shadow-[0_6px_16px_-6px_rgba(162,96,40,0.45)]"
                      >
                        {String(step.step).padStart(2, "0")}
                      </span>

                      <p className="bsl-mono mb-1.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#A26028]">
                        Step {String(step.step).padStart(2, "0")}
                      </p>

                      <h3 className="bsl-serif mb-2 text-[1.2rem] font-semibold text-[#1C1712]">
                        {step.title}
                      </h3>

                      <p className="max-w-lg text-[1rem] leading-[1.75] text-[#5C544A]">
                        {step.description}
                      </p>
                    </Reveal>
                  )
                )}
              </ol>
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* ================================================================== */}
      {/* AREAS COVERED                                                       */}
      {/* ================================================================== */}

      <section
        id="areas"
        className="scroll-mt-16 bg-[#1C1712] px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1180px]">

          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left */}

            <div>
              <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#E8C599]">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-[#E8C599]"
                />

                Areas We Cover
              </span>

              <h2 className="bsl-serif max-w-md text-[clamp(2rem,3.5vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
                {areasTitle}
              </h2>

              <p className="mt-6 max-w-md text-[1rem] leading-[1.85] text-white/60">
                {areasDescription}
              </p>

              <Link
                href="#quote"
                className="bsl-focus group mt-8 inline-flex items-center gap-2 rounded-full border border-[#E8C599]/50 px-5 py-2.5 text-[0.76rem] font-semibold uppercase tracking-[0.06em] text-[#E8C599] transition-colors hover:bg-[#E8C599] hover:text-[#1C1712]"
              >
                {isConstruction
                  ? "Discuss Your Project"
                  : "Request a Quote"}

                <ArrowIcon size={12} />
              </Link>
            </div>

            {/* Right */}

            <div className="grid grid-cols-2 gap-x-6 gap-y-0 border-t border-white/10 sm:grid-cols-3">
              {SHARED_AREAS.map(
                (area, i) => (
                  <div
                    key={area}
                    className="flex items-center gap-3 border-b border-white/10 py-5"
                  >
                    <span className="bsl-mono text-[0.62rem] text-[#E8C599]/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="text-[0.88rem] text-white/75">
                      {area}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ================================================================== */}
      {/* FAQ                                                                 */}
      {/* ================================================================== */}

      {hasFaqs && (
        <section
          id="faqs"
          className="scroll-mt-16 bg-[#FAF7F2] px-5 py-20 sm:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-[820px]">

            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-[#A26028]"
              />

              Questions
            </span>

            <h2 className="bsl-serif mb-9 text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
              Frequently asked about{" "}
              {service.title.toLowerCase()}
            </h2>

            <ServiceFaqAccordion
              faqs={service.faqs}
            />
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* QUOTE FORM                                                          */}
      {/* ================================================================== */}

      <section
        id="quote"
        className="scroll-mt-16 bg-[#FAF7F2] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-[1180px]">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

            {/* Left Content */}

            <div>
              <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-[#A26028]"
                />

                Get a Quote
              </span>

              <h2 className="bsl-serif max-w-lg text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1C1712]">
                {quoteTitle}
              </h2>

              <p className="mt-6 max-w-lg text-[1rem] leading-[1.85] text-[#5C544A]">
                {quoteDescription}
              </p>

              <div className="mt-8 border-l border-[#A26028]/30 pl-6">
                <p className="bsl-mono text-[0.7rem] uppercase tracking-[0.12em] text-[#8A8074]">
                  Service enquiry
                </p>

                <p className="mt-2 text-sm font-medium text-[#1C1712]">
                  {service.title}
                </p>
              </div>
            </div>

            {/* Quote Form */}

            <div>
              <QuoteForm
                defaultService={service.title}
                serviceSlug={service.slug}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CLOSING CTA                                                         */}
      {/* ================================================================== */}

      <div className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <Reveal className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-[#1C1712] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-14">

          <div
            aria-hidden="true"
            className="bsl-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          />

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="pointer-events-none absolute left-6 top-6 text-[#A26028]/40"
          >
            <path
              d="M1 9V1H9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="pointer-events-none absolute right-6 top-6 rotate-90 text-[#A26028]/40"
          >
            <path
              d="M1 9V1H9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="pointer-events-none absolute left-6 bottom-6 -rotate-90 text-[#A26028]/40"
          >
            <path
              d="M1 9V1H9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="pointer-events-none absolute bottom-6 right-6 rotate-180 text-[#A26028]/40"
          >
            <path
              d="M1 9V1H9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative max-w-lg">
            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.24em] text-[#E8C599]">
              Ready to start?
            </span>

            <h2 className="bsl-serif mb-3 text-[clamp(1.6rem,2.9vw,2.2rem)] font-semibold leading-tight text-white">
              {closingTitle}
            </h2>

            <p className="text-[1rem] leading-[1.65] text-white/65">
              {closingContent}
            </p>
          </div>

          <Link
            href="#quote"
            className="bsl-focus group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121] hover:shadow-[0_16px_32px_-14px_rgba(162,96,40,0.6)]"
          >
            {closingButton}

            <ArrowIcon size={14} />
          </Link>
        </Reveal>
      </div>
    </main>
  );
}