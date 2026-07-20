/**
 * app/services/page.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * v4 — lighter hero overlay + three.js wireframe accent added to header.
 *
 * CHANGES IN THIS PASS
 * 1. Overlay lightened further (55/32/65 -> 40/20/48) so the photo reads
 *    through more while nav/heading stay legible.
 * 2. HeroScene (the rotating wireframe icosahedron/octahedron) is now
 *    mounted inside the header, positioned on the right side, desktop-only,
 *    sitting above the photo/overlay/dot-grid and behind the text content.
 * -------------------------------------------------------------------------
 */
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { getAllServices } from "@/lib/services";
import HeroScene from "@/components/HeroScene";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <main className={fraunces.variable}>
      <style>{`
        .bsl-serif { font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif; }
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
      `}</style>

      {/* ---- Page header — image hero, dark overlay so nav (transparent + white text) reads ---- */}
      <header className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-40">
        {/* Background photo */}
        <Image
          src="/hero-services.avif"
          alt="London construction and office building under development"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay — keeps nav + heading legible over the photo (lightened) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1C1712]/40 via-[#1C1712]/20 to-[#1C1712]/48"
        />
        {/* Blueprint dot-grid texture on top of the overlay, fades toward the bottom */}
        <div
          aria-hidden="true"
          className="bsl-dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        {/* Rotating service-plaque carousel — desktop only, sits behind text content */}
        <HeroScene
          services={services.map((s) => ({ title: s.title, category: s.category }))}
        />

        {/* Corner marks — same motif used on cards + CTA */}
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 22 22"
          fill="none"
          className="pointer-events-none absolute left-5 top-24 text-[#A26028]/40 sm:left-8 lg:left-10"
        >
          <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 22 22"
          fill="none"
          className="pointer-events-none absolute bottom-8 right-5 text-[#A26028]/40 sm:right-8 lg:right-10"
        >
          <path d="M21 13V21H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        <div className="relative mx-auto max-w-[1180px]">
          <span className="mb-4 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#E8C599]">
            <span aria-hidden="true" className="h-px w-6 bg-[#E8C599]" />
            All Services
          </span>
          <h1 className="bsl-serif mb-5 max-w-2xl text-[clamp(2.2rem,4.8vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            Every trade a project needs, built under one roof.
          </h1>
          <div aria-hidden="true" className="bsl-gold-rule mb-6 h-px w-24" />
          <p className="max-w-xl text-[clamp(0.98rem,1.4vw,1.1rem)] leading-[1.75] text-white/70">
            {services.length} services, delivered by one accountable team across
            London — from first-fix to final snag, coordinated so nothing
            falls between trades.
          </p>

          {/* Stat strip */}
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/15 pt-8">
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                Services
              </dt>
              <dd className="bsl-serif mt-1 text-[1.6rem] font-semibold text-white">
                {services.length}
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                Coverage
              </dt>
              <dd className="bsl-serif mt-1 text-[1.6rem] font-semibold text-white">
                London
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                Delivery
              </dt>
              <dd className="bsl-serif mt-1 text-[1.6rem] font-semibold text-white">
                One team
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ---- Services grid — fully dynamic, no special-cased service ---- */}
      <section className="bg-[#FAF7F2] px-5 pb-16 pt-14 sm:px-8 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`bsl-focus group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_1px_2px_rgba(28,23,18,0.06)] ring-1 ring-transparent transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_54px_-22px_rgba(28,23,18,0.28)] hover:ring-[#A26028]/40 ${
                  idx === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {/* Corner marks — echoes the blueprint motif used site-wide */}
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 22 22"
                  fill="none"
                  className="absolute left-4 top-4 z-10 text-white/70 drop-shadow-sm"
                >
                  <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>

                {/* Index mark */}
                <span
                  aria-hidden="true"
                  className="bsl-serif absolute right-4 top-4 z-10 text-[0.72rem] font-semibold text-white/70 drop-shadow-sm"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div
                  className={`relative overflow-hidden ${
                    idx === 0 ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes={
                      idx === 0
                        ? "(min-width: 1024px) 66vw, 100vw"
                        : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    }
                    priority={idx === 0}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent"
                  />

                  {/* Category pill floats on the image, not as plain text above the title */}
                  <span className="absolute bottom-4 left-4 inline-flex w-fit items-center rounded-full bg-black/40 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                    {service.category}
                  </span>

                  {/* Gold top-accent on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#A26028] via-[#E8C599] to-[#A26028] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <h3
                    className={`bsl-serif mb-2 font-semibold leading-snug text-[#1C1712] ${
                      idx === 0 ? "text-[1.4rem] sm:text-[1.6rem]" : "text-[1.08rem]"
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`mb-5 flex-1 leading-[1.65] text-[#6E6259] ${
                      idx === 0 ? "max-w-xl text-[0.98rem]" : "text-[0.88rem]"
                    }`}
                  >
                    {service.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#A26028]">
                    Learn more
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
                  </span>
                </div>

                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 22 22"
                  fill="none"
                  className="absolute bottom-4 right-4 text-[#A26028]/15"
                >
                  <path d="M21 13V21H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Closing CTA ---- */}
      <div className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-[#1C1712] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-14">
          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="absolute left-6 top-6 text-[#A26028]/40"
          >
            <path d="M1 9V1H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg
            aria-hidden="true"
            width="26"
            height="26"
            viewBox="0 0 22 22"
            fill="none"
            className="absolute bottom-6 right-6 text-[#A26028]/40"
          >
            <path d="M21 13V21H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <div className="max-w-lg">
            <span className="mb-3 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#E8C599]">
              Still deciding?
            </span>
            <h2 className="bsl-serif mb-3 text-[clamp(1.5rem,2.8vw,2.1rem)] font-semibold leading-tight text-white">
              Not sure which service you need?
            </h2>
            <p className="text-[0.95rem] leading-[1.65] text-white/65">
              Tell us what you&apos;re planning and we&apos;ll tell you honestly which
              trades it actually involves — no obligation, no upsell.
            </p>
          </div>
          <Link
            href="/contact#quote"
            className="bsl-focus group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.88rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
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
        </div>
      </div>
    </main>
  );
}