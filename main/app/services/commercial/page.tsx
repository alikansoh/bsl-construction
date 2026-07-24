// app/services/commercial/page.tsx

import Link from "next/link";
import Image from "next/image";

import {
  getServicesByCategorySlug,
  getTrustBar,
} from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title:
    "Commercial Property Services London | BSL Construction",
  description:
    "Reliable commercial maintenance, facilities support and property services across London. One experienced team, one point of contact.",
};

export default async function CommercialServicesPage() {
  const services =
    await getServicesByCategorySlug("commercial");

  const trustBar = await getTrustBar();

  return (
    <main className="overflow-x-hidden bg-[#F8F5F0] text-[#1C1712]">
      <ScrollReveal />

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}

      <section
        data-hero-root
        className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#1C1712] sm:min-h-[92vh] lg:min-h-[88vh]"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/com.jpg"
            alt="Commercial property and facilities management"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#1C1712]/70" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1712] via-[#1C1712]/80 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1712] via-transparent to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-16 pt-28 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center gap-4 sm:mb-8">
              <span className="h-px w-12 bg-[#C58A55]" />

              <span className="bsl-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#D7C7B6] sm:text-[0.68rem] sm:tracking-[0.22em]">
                Commercial Property Services
              </span>
            </div>

            <h1 className="max-w-5xl text-[2.75rem] font-medium leading-[0.98] tracking-[-0.045em] text-white xs:text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] lg:leading-[0.95] lg:tracking-[-0.055em]">
              Property support
              <br />
              <span className="text-[#C58A55]">
                that works.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[0.95rem] leading-7 text-white/70 sm:mt-8 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              From planned maintenance to ongoing facilities
              support, BSL Construction gives commercial
              property owners and managers one reliable team
              to keep their buildings operating, maintained
              and ready for what comes next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="#services"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#A26028] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-1 hover:bg-[#B57236] sm:px-7 sm:py-4"
              >
                Explore Our Services

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/contact#quote"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:border-white/60 hover:bg-white/10 sm:px-7 sm:py-4"
              >
                Discuss Your Requirements
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 right-6 hidden items-center gap-4 lg:flex">
          <span className="bsl-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
            Discover
          </span>

          <div className="h-12 w-px bg-white/20" />
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRUST BAR                                                        */}
      {/* ================================================================ */}

      <section className="border-b border-[#1C1712]/10 bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-y divide-[#1C1712]/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
          {trustBar.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-center px-4 py-5 text-center sm:px-5 sm:py-6"
            >
              <div>
                <span className="mb-2 block text-[#A26028]">
                  ◆
                </span>

                <span className="bsl-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#5F554D] sm:text-[0.62rem] sm:tracking-[0.16em]">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* INTRODUCTION                                                     */}
      {/* ================================================================ */}

      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
          <div data-reveal>
            <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#A26028]">
              Commercial
            </span>

            <h2 className="mt-5 max-w-xl text-3xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-4xl sm:leading-[1] lg:text-5xl xl:text-6xl">
              A better way to look after your property.
            </h2>
          </div>

          <div data-reveal className="max-w-2xl">
            <p className="text-base leading-7 text-[#625950] sm:text-lg sm:leading-8">
              Commercial buildings need more than reactive
              repairs. They need a team that understands the
              property, the people using it and the business
              operating inside it.
            </p>

            <p className="mt-5 text-base leading-7 text-[#625950] sm:mt-6 sm:text-lg sm:leading-8">
              BSL Construction provides a coordinated approach
              to maintenance and facilities support, giving
              property managers and businesses a single,
              accountable point of contact.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SERVICES                                                         */}
      {/* ================================================================ */}

      <section
        id="services"
        className="scroll-mt-24 bg-[#EDE8E0] px-6 py-16 sm:scroll-mt-28 sm:px-10 sm:py-24 lg:px-16 lg:py-36"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Section header */}
          <div
            data-reveal
            className="flex flex-col justify-between gap-6 border-b border-[#1C1712]/15 pb-8 sm:gap-8 sm:pb-10 md:flex-row md:items-end"
          >
            <div>
              <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#A26028]">
                Our Services
              </span>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-5xl xl:text-6xl">
                Built around
                <br />
                your building.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-[#6E6259]">
              Flexible commercial property support, from
              scheduled maintenance to ongoing facilities
              management.
            </p>
          </div>

          {/* Service cards */}
          <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-2">
            {services.map((service, index) => {
              const shortDescription = service.hero?.description
                ? service.hero.description.replace(/<[^>]*>/g, "")
                : `Professional ${service.title.toLowerCase()} services delivered by BSL Construction.`;

              const image = service.hero?.image ?? {
                url: "/com.jpg",
                alt: service.title,
              };

              return (
                <div key={service.id} data-reveal-group="commercial-cards">
                  <ServiceCard
                    slug={service.slug}
                    title={service.title}
                    shortDescription={shortDescription}
                    category={service.categoryName}
                    image={image}
                    index={index}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURE STATEMENT                                                */}
      {/* ================================================================ */}

      <section className="bg-[#1C1712] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div data-reveal>
            <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#C58A55]">
              One Team
            </span>

            <h2 className="mt-5 max-w-4xl text-3xl font-medium leading-[1.02] tracking-[-0.045em] sm:mt-6 sm:text-4xl sm:leading-[0.98] lg:text-5xl xl:text-7xl">
              One point of contact.
              <br />
              Less to manage.
            </h2>
          </div>

          <div data-reveal className="flex items-end">
            <div>
              <p className="text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Building fabric, general repairs, M&E
                coordination and improvement works — brought
                together under one accountable team.
              </p>

              <Link
                href="/contact#quote"
                className="group mt-8 inline-flex items-center gap-3 border-b border-[#C58A55] pb-2 text-sm font-semibold uppercase tracking-[0.1em] text-white"
              >
                Talk to our team

                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WHY BSL                                                          */}
      {/* ================================================================ */}

      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div data-reveal>
              <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#A26028]">
                Why BSL
              </span>

              <h2 className="mt-5 text-3xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-4xl sm:leading-[1] lg:text-5xl">
                Property support
                <br />
                without the runaround.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[24px] bg-[#1C1712]/10 sm:grid-cols-2">
              {[
                {
                  number: "01",
                  title: "One Team",
                  text: "A single point of contact across your property maintenance and building requirements.",
                },
                {
                  number: "02",
                  title: "Responsive",
                  text: "A practical approach to scheduled works, repairs and ongoing property needs.",
                },
                {
                  number: "03",
                  title: "Clear Communication",
                  text: "Straightforward updates and clear reporting, so you always know what's happening.",
                },
                {
                  number: "04",
                  title: "Built to Last",
                  text: "Quality workmanship and considered solutions designed to reduce repeat issues.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  data-reveal-group="why-bsl"
                  className="bg-white p-7 sm:p-8 lg:p-10"
                >
                  <span className="bsl-mono text-xs text-[#A26028]">
                    {item.number}
                  </span>

                  <h3 className="mt-6 text-xl font-medium tracking-[-0.03em] sm:mt-8 sm:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#6E6259] sm:mt-4">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA                                                              */}
      {/* ================================================================ */}

      <section className="px-6 pb-16 sm:px-10 sm:pb-24 lg:px-16 lg:pb-36">
        <div
          data-reveal
          className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[#A26028] px-6 py-12 sm:rounded-[32px] sm:px-12 sm:py-16 lg:px-20 lg:py-24"
        >
          <div className="absolute -right-20 -top-20 hidden h-80 w-80 rounded-full border border-white/10 sm:block" />
          <div className="absolute -right-8 -top-8 hidden h-56 w-56 rounded-full border border-white/10 sm:block" />

          <div className="relative max-w-4xl">
            <span className="bsl-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/60">
              Let&apos;s Talk
            </span>

            <h2 className="mt-5 text-3xl font-medium leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl sm:leading-[1] lg:text-5xl xl:text-7xl">
              Need a reliable team
              <br />
              behind your property?
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:mt-7 sm:text-base">
              Tell us about your building, portfolio or
              maintenance requirements. We&apos;ll discuss the
              right level of support for your business.
            </p>

            <Link
              href="/contact#quote"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C1712] transition hover:-translate-y-1 sm:mt-9 sm:px-7 sm:py-4"
            >
              Discuss Your Requirements

              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}