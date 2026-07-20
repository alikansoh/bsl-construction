/**
 * app/services/[slug]/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * Service detail page. Fully dynamic — reads one service from
 * data/services.json via lib/services.ts.
 *
 * DESIGN PASS — "service sheet" identity
 * ---------------------------------------------------------------------
 * The page keeps the site's existing palette (ink / paper / brass / pale
 * gold) but reaches for one clear, subject-grounded signature: this is a
 * construction company, so the page borrows the vocabulary of an
 * architectural drawing set — a title block, figure numbers, registration
 * marks (crop-mark ticks) at the corners of framed photography — rather
 * than generic marketing chrome. A monospaced face (IBM Plex Mono) is
 * introduced purely for that "spec sheet" layer: labels, captions, the
 * hero title block, breadcrumb, nav. Everything else (headings, body
 * copy) is untouched typographically so the page still belongs to the
 * rest of the site.
 *
 * 1. Hero gained a title block (Category / Delivery / Coverage) styled
 *    like a drawing's corner stamp, four registration-mark corners, a
 *    vertical brand mark on desktop, and a slower, richer Ken Burns drift.
 * 2. Section imagery now sits in a small "mat" with hover-revealed
 *    registration marks and a hanging figure-number tag (Fig. 01, 02…),
 *    and the whole row fades/lifts into view once on scroll.
 * 3. Gallery, "what's included," and process sections got quieter
 *    refinements: mono eyebrows, warm-tinted shadows, a two-line step
 *    badge (STEP 0X + title) instead of a bare number.
 * 4. New: ServiceSectionNav (scroll-spy + progress rail) and Reveal
 *    (once-only scroll reveal, reduced-motion safe, no-JS safe) — small,
 *    reusable client components, not one-off inline scripts.
 * -------------------------------------------------------------------------
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { getAllServices, getServiceBySlug } from "@/lib/services";
import ServiceFaqAccordion from "@/components/Servicefaqaccordion";
import ServiceGallerySlider from "@/components/ServiceGallerySlider";
import ServiceSectionNav from "@/components/ServiceSectionNav";
import Reveal from "@/components/Reveal";

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
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.seo.metaTitle,
    description: service.seo.metaDescription,
    keywords: service.seo.keywords,
    openGraph: {
      title: service.seo.metaTitle,
      description: service.seo.metaDescription,
      images: [{ url: service.image.url }],
    },
  };
}

/** Four small crop-mark corners — the page's recurring "registration mark" motif. */
function CornerTicks({
  tone = "brass",
  interactive = true,
}: {
  tone?: "brass" | "pale";
  interactive?: boolean;
}) {
  const stroke = tone === "pale" ? "#E8C599" : "#A26028";
  const corners = [
    { pos: "left-0 top-0", rotate: "" },
    { pos: "right-0 top-0", rotate: "rotate-90" },
    { pos: "right-0 bottom-0", rotate: "rotate-180" },
    { pos: "left-0 bottom-0", rotate: "-rotate-90" },
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
          <path d="M1 6.5V1H6.5" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ))}
    </>
  );
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) notFound();

  const hasProcess = service.process?.length > 0;
  const hasHighlights = service.highlights?.length > 0;
  const hasFaqs = service.faqs?.length > 0;
  const hasAreas = service.areas?.length > 0;
  const hasGallery = (service.gallery?.length ?? 0) > 0;

  const faqSchema = hasFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  const inPageNav = [
    { href: "#overview", label: "Overview" },
    ...(hasHighlights ? [{ href: "#included", label: "What's included" }] : []),
    ...(hasGallery ? [{ href: "#gallery", label: "Gallery" }] : []),
    ...(hasProcess ? [{ href: "#process", label: "How it works" }] : []),
    ...(hasFaqs ? [{ href: "#faqs", label: "FAQs" }] : []),
    { href: "#quote", label: "Get a quote" },
  ];

  return (
    <main className={`${fraunces.variable} ${plexMono.variable}`}>
      <style>{`
        .bsl-serif { font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
        .bsl-mono {
          font-family: var(--font-plex-mono), ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
        }
        .bsl-gold-rule {
          background: linear-gradient(90deg, transparent, #E8C599 45%, #E8C599 55%, transparent);
        }
        .bsl-focus:focus-visible {
          outline: 2px solid #A26028;
          outline-offset: 3px;
          border-radius: 4px;
        }
        .bsl-dot-grid {
          background-image: radial-gradient(circle, rgba(232,197,153,0.16) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .bsl-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
        }
        html { scroll-behavior: smooth; }

        @keyframes bsl-kenburns {
          from { transform: scale(1.03) translate3d(0, 0, 0); }
          to { transform: scale(1.13) translate3d(-1.2%, -1%, 0); }
        }
        .bsl-hero-image {
          animation: bsl-kenburns 26s ease-in-out infinite alternate;
        }
        .bsl-section-image {
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), filter 0.9s ease;
        }
        .bsl-section-row:hover .bsl-section-image,
        .bsl-section-row:focus-within .bsl-section-image {
          transform: scale(1.06);
          filter: saturate(1.08) brightness(1.02);
        }

        .bsl-reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bsl-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .bsl-hero-image { animation: none; }
          .bsl-section-image { transition: none; }
          .bsl-section-row:hover .bsl-section-image { transform: none; filter: none; }
          .bsl-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* No-JS safety net: never leave scroll-reveal content permanently hidden. */}
      <noscript>
        <style>{`.bsl-reveal { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* ---- Hero — service image, dark overlay, title block ---- */}
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

        {/* Registration marks — four corners, always on, quiet */}
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 14 14" fill="none" className="pointer-events-none absolute left-5 top-24 text-[#E8C599]/45 sm:left-8 lg:left-10">
          <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 14 14" fill="none" className="pointer-events-none absolute right-5 top-24 rotate-90 text-[#E8C599]/45 sm:right-8 lg:right-10">
          <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 14 14" fill="none" className="pointer-events-none absolute left-5 bottom-8 -rotate-90 text-[#E8C599]/45 sm:left-8 lg:left-10">
          <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 14 14" fill="none" className="pointer-events-none absolute bottom-8 right-5 rotate-180 text-[#E8C599]/45 sm:right-8 lg:right-10">
          <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>

        {/* Vertical brand mark — desktop only, editorial flourish */}
        <div aria-hidden="true" className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 xl:right-10 lg:block">
          <span className="bsl-mono block text-[0.68rem] font-medium uppercase tracking-[0.32em] text-white/35 [writing-mode:vertical-rl]">
            BSL Construction
          </span>
        </div>

        <div className="relative mx-auto max-w-[1180px]">
          <nav aria-label="Breadcrumb" className="bsl-mono mb-5 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.1em] text-white/55">
            <Link href="/services" className="bsl-focus hover:text-white/90">
              Services
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/85">{service.title}</span>
          </nav>

          <span className="bsl-mono mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#E8C599]">
            <span aria-hidden="true" className="h-px w-6 bg-[#E8C599]" />
            {service.category}
          </span>
          <h1 className="bsl-serif mb-5 max-w-2xl text-[clamp(2.6rem,5.6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
            {service.title}
          </h1>
          <div aria-hidden="true" className="bsl-gold-rule mb-6 h-px w-24" />
          <p className="max-w-2xl text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.75] text-white/70">
            {service.shortDescription}
          </p>

          {hasAreas && (
            <ul className="mt-8 flex flex-wrap gap-2 border-t border-white/15 pt-6">
              {service.areas.map((area) => (
                <li
                  key={area}
                  className="bsl-mono rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.03em] text-white/75 backdrop-blur-sm"
                >
                  {area}
                </li>
              ))}
            </ul>
          )}

          {/* Title block — a drawing's corner stamp, repurposed as the quick-facts strip */}
          <div className="relative mt-10 inline-block max-w-full rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-6 backdrop-blur-sm sm:px-8">
            <span className="bsl-mono absolute -top-2.5 left-6 bg-[#1C1712] px-2 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-[#E8C599]/80">
              Service Sheet
            </span>
            <dl className="flex flex-wrap gap-x-10 gap-y-5">
              <div>
                <dt className="bsl-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/50">
                  Category
                </dt>
                <dd className="bsl-serif mt-1.5 text-[1.3rem] font-semibold text-white">
                  {service.category}
                </dd>
              </div>
              <div className="border-l border-white/15 pl-10">
                <dt className="bsl-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/50">
                  Delivery
                </dt>
                <dd className="bsl-serif mt-1.5 text-[1.3rem] font-semibold text-white">
                  One team
                </dd>
              </div>
              {hasAreas && (
                <div className="border-l border-white/15 pl-10">
                  <dt className="bsl-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/50">
                    Coverage
                  </dt>
                  <dd className="bsl-serif mt-1.5 text-[1.3rem] font-semibold text-white">
                    {service.areas.length > 1 ? `${service.areas[0]} + more` : service.areas[0]}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </header>

      {/* ---- Sticky in-page nav (scroll-spy + progress rail) ---- */}
      <ServiceSectionNav items={inPageNav} />

      {/* ---- Overview — editorial, matted photography with generous space ---- */}
      <section id="overview" className="scroll-mt-16 bg-[#FAF7F2] px-5 pb-4 pt-20 sm:px-8 lg:pt-28">
        <div className="space-y-28 lg:space-y-36">
          {service.sections.map((sec, index) => {
            const imageOnRight = index % 2 === 1;
            const figureNumber = String(index + 1).padStart(2, "0");

            if (!sec.image) {
              return (
                <Reveal key={sec.id} id={sec.id} className="scroll-mt-24">
                  <div className="relative mx-auto max-w-[600px] text-center">
                    <span
                      aria-hidden="true"
                      className="bsl-serif pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-10 select-none text-[5rem] font-semibold leading-none text-[#1C1712]/[0.04] lg:text-[6.5rem]"
                    >
                      {figureNumber}
                    </span>
                    <span className="bsl-mono relative mb-5 inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.26em] text-[#A26028]">
                      <span aria-hidden="true" className="h-px w-6 bg-[#A26028]/50" />
                      Overview
                      <span aria-hidden="true" className="h-px w-6 bg-[#A26028]/50" />
                    </span>
                    <h2 className="bsl-serif relative mb-5 text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-[1.25] tracking-[-0.01em] text-[#1C1712]">
                      {sec.heading}
                    </h2>
                    <p className="relative mx-auto max-w-[52ch] text-[0.98rem] leading-[1.9] text-[#5C544A]">
                      {sec.body}
                    </p>
                  </div>
                </Reveal>
              );
            }

            return (
              <Reveal key={sec.id} id={sec.id} className="scroll-mt-24">
                <div
                  className={`bsl-section-row group mx-auto flex max-w-[1080px] flex-col items-center gap-12 lg:items-center lg:gap-20 ${
                    imageOnRight ? "lg:flex-row-reverse" : "lg:flex-row"
                  }`}
                >
                  {/* Image — small, matted like a framed print, caption sits below as a wall label */}
                  <figure className="w-full shrink-0 lg:w-[38%]">
                    <div className="relative mx-auto max-w-[380px] p-4 lg:mx-0">
                      <span
                        aria-hidden="true"
                        className="absolute inset-2 -z-10 translate-x-2 translate-y-2 bg-[#E8C599]/25 lg:translate-x-3 lg:translate-y-3"
                      />
                      <div className="relative bg-[#FAF7F2] p-2.5 shadow-[0_1px_3px_rgba(28,23,18,0.08)] ring-1 ring-[#1C1712]/[0.06]">
                        <CornerTicks />
                        <div className="relative aspect-[4/5] w-full overflow-hidden">
                          <Image
                            src={sec.image.url}
                            alt={sec.image.alt}
                            fill
                            sizes="(min-width: 1024px) 380px, 70vw"
                            className="bsl-section-image object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <figcaption className="bsl-mono mx-auto mt-4 flex max-w-[380px] items-center gap-3 text-[0.62rem] uppercase tracking-[0.18em] text-[#8A7F72] lg:mx-0">
                      <span aria-hidden="true" className="h-px w-4 bg-[#1C1712]/15" />
                      Fig. {figureNumber}
                    </figcaption>
                  </figure>

                  {/* Text — kicker, quiet ghost numeral, narrow measure for an unhurried read */}
                  <div className="relative w-full lg:w-[54%]">
                    <span
                      aria-hidden="true"
                      className="bsl-serif pointer-events-none absolute -left-1 -top-8 -z-10 select-none text-[5rem] font-semibold leading-none text-[#1C1712]/[0.035] lg:-top-10 lg:text-[6.5rem]"
                    >
                      {figureNumber}
                    </span>
                    <span className="bsl-mono relative mb-4 inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.26em] text-[#A26028]">
                      <span aria-hidden="true" className="h-px w-6 bg-[#A26028]/60" />
                      Overview — {figureNumber}
                    </span>
                    <h2 className="bsl-serif relative mb-5 max-w-[24ch] text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-[1.25] tracking-[-0.01em] text-[#1C1712]">
                      {sec.heading}
                    </h2>
                    <p className="relative max-w-[46ch] text-[0.98rem] leading-[1.9] text-[#5C544A]">
                      {sec.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}

          <Reveal>
            <div className="mx-auto flex max-w-[780px] items-center gap-4">
              <div aria-hidden="true" className="h-px flex-1 bg-[#1C1712]/10" />
              <Link
                id="quote"
                href="/contact#quote"
                className="bsl-focus group scroll-mt-24 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-7 py-3 text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121] hover:shadow-[0_14px_28px_-12px_rgba(162,96,40,0.55)]"
              >
                Get a quote
                <svg
                  width="13"
                  height="13"
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
              </Link>
              <div aria-hidden="true" className="h-px flex-1 bg-[#1C1712]/10" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- What's included — full-width card grid ---- */}
      {hasHighlights && (
        <section id="included" className="scroll-mt-16 bg-[#FAF7F2] px-5 pb-16 pt-20 sm:px-8 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-[1180px]">
            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              What&apos;s included
            </span>
            <h2 className="bsl-serif mb-9 max-w-2xl text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
              Every job, whatever the size, gets the same standard.
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.highlights.map((highlight, i) => (
                <Reveal
                  key={highlight}
                  delay={Math.min(i * 60, 240)}
                  className="group relative overflow-hidden rounded-[1.25rem] bg-white shadow-[0_1px_2px_rgba(28,23,18,0.06)] ring-1 ring-[#1C1712]/[0.04] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-18px_rgba(162,96,40,0.28)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] scale-x-0 bg-[#A26028] transition-transform duration-300 ease-out origin-left group-hover:scale-x-100"
                  />
                  <div className="flex items-start gap-4 p-6">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1712] text-[#E8C599] transition-colors duration-300 group-hover:bg-[#A26028]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8.5L6.2 11.5L13 4.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <p className="pt-1.5 text-[0.98rem] font-medium leading-[1.6] text-[#1C1712]">
                      {highlight}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Gallery — project photos, shown only if the service has any ---- */}
      {hasGallery && (
        <section
          id="gallery"
          className={`scroll-mt-16 px-5 py-20 sm:px-8 lg:px-10 lg:py-28 ${
            hasHighlights ? "bg-white" : "bg-[#FAF7F2]"
          }`}
        >
          <div className="mx-auto max-w-[1080px]">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
                  <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
                  Gallery
                </span>
                <h2 className="bsl-serif max-w-2xl text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
                  A closer look at {service.title.toLowerCase()} on site.
                </h2>
              </div>
              <p className="bsl-mono text-[0.78rem] tracking-[0.01em] text-[#6E6259]">
                Tap a photo to view it full-screen, or use the arrows to browse.
              </p>
            </div>

            <ServiceGallerySlider images={service.gallery} title={service.title} />
          </div>
        </section>
      )}

      {/* ---- Process timeline (real sequence, so numbering is earned) ---- */}
      {hasProcess && (
        <section
          id="process"
          className={`scroll-mt-16 px-5 py-20 sm:px-8 lg:py-28 ${
            hasGallery ? "bg-[#FAF7F2]" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-[780px]">
            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              How it works
            </span>
            <h2 className="bsl-serif mb-11 text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
              From first visit to handover
            </h2>

            <ol className="relative space-y-11 border-l border-[#1C1712]/10 pl-9">
              {service.process.map((step, i) => (
                <Reveal as="li" key={step.step} delay={Math.min(i * 80, 240)} className="relative">
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
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ---- FAQs ---- */}
      {hasFaqs && (
        <section
          id="faqs"
          className={`scroll-mt-16 px-5 py-20 sm:px-8 lg:py-28 ${
            hasProcess ? "bg-[#FAF7F2]" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-[820px]">
            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              Questions
            </span>
            <h2 className="bsl-serif mb-9 text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-[1.15] text-[#1C1712]">
              Frequently asked about {service.title.toLowerCase()}
            </h2>
            <ServiceFaqAccordion faqs={service.faqs} />
          </div>
        </section>
      )}

      {/* ---- Closing CTA ---- */}
      <div className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <Reveal className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-[#1C1712] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="bsl-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          />
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" className="pointer-events-none absolute left-6 top-6 text-[#A26028]/40">
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" className="pointer-events-none absolute right-6 top-6 rotate-90 text-[#A26028]/40">
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" className="pointer-events-none absolute left-6 bottom-6 -rotate-90 text-[#A26028]/40">
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" className="pointer-events-none absolute bottom-6 right-6 rotate-180 text-[#A26028]/40">
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <div className="relative max-w-lg">
            <span className="bsl-mono mb-3 inline-flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.24em] text-[#E8C599]">
              Ready to start?
            </span>
            <h2 className="bsl-serif mb-3 text-[clamp(1.6rem,2.9vw,2.2rem)] font-semibold leading-tight text-white">
              Let&apos;s scope your {service.title.toLowerCase()} project.
            </h2>
            <p className="text-[1rem] leading-[1.65] text-white/65">
              Tell us what you&apos;re planning and we&apos;ll come back with a clear,
              honest scope — no obligation, no upsell.
            </p>
          </div>
          <Link
            href="/contact#quote"
            className="bsl-focus group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121] hover:shadow-[0_16px_32px_-14px_rgba(162,96,40,0.6)]"
          >
            Talk to the Team
            <svg
              width="14"
              height="14"
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
          </Link>
        </Reveal>
      </div>
    </main>
  );
}