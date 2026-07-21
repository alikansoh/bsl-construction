// app/services/mechanical-electrical/page.tsx

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
    "Mechanical & Electrical Services London | BSL Construction",
  description:
    "Professional mechanical and electrical services across London, including plumbing, electrical installations, repairs, maintenance and building services.",
};

export default function MechanicalElectricalPage() {
  const services =
    getServicesByCategorySlug(
      "mechanical-electrical"
    );

  const trustBar = getTrustBar();

  return (
    <main className="overflow-x-hidden bg-[#F7F4EF] text-[#1C1712]">
      <ScrollReveal />

      {/* ================================================================ */}
      {/* HERO                                                            */}
      {/* ================================================================ */}

      <section
        data-hero-root
        className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#1C1712] sm:min-h-[94vh] lg:min-h-[90vh]"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/main.jpg"
            alt="Mechanical and electrical services by BSL Construction"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#1C1712]/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1712] via-[#1C1712]/75 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-28 sm:px-10 sm:pb-20 lg:px-16 lg:pb-28">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center gap-4 sm:mb-7">
              <span className="h-px w-12 bg-[#C58A54]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8B18A] sm:tracking-[0.25em]">
                Mechanical & Electrical
              </span>
            </div>

            <h1 className="max-w-4xl text-[2.75rem] font-medium leading-[1] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
              The systems behind
              <br />
              <span className="text-[#D8B18A]">
                better buildings.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[0.95rem] leading-7 text-white/70 sm:mt-8 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              From plumbing and electrical installations to
              repairs, upgrades and ongoing maintenance, BSL
              Construction delivers reliable mechanical and
              electrical services as part of a wider construction
              project or as a standalone service.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <Link
                href="/contact#quote"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#A26028] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#B87538] sm:px-7 sm:py-4"
              >
                Request a Quote

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-[#1C1712] sm:px-7 sm:py-4"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>

        {/* Bottom label */}
        <div className="absolute bottom-8 right-6 hidden lg:block lg:right-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            BSL Construction
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRUST BAR                                                        */}
      {/* ================================================================ */}

      <section className="border-b border-[#1C1712]/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#1C1712]/10 lg:grid-cols-5">
          {trustBar.map((item) => (
            <div
              key={item.id}
              className="flex min-h-[80px] items-center justify-center px-4 text-center sm:min-h-[90px] sm:px-5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6259] sm:tracking-[0.16em]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* INTRODUCTION                                                     */}
      {/* ================================================================ */}

      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div data-reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028] sm:mb-5">
              One team. Multiple disciplines.
            </p>

            <h2 className="max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.035em] sm:text-4xl sm:leading-[1.05] lg:text-5xl xl:text-6xl">
              The technical work
              <br />
              <span className="text-[#A26028]">
                you can rely on.
              </span>
            </h2>
          </div>

          <div data-reveal className="max-w-2xl">
            <p className="text-lg leading-7 text-[#3D352E] sm:text-xl sm:leading-8">
              The systems inside a building matter just as much
              as the structure around them. Our mechanical and
              electrical teams deliver practical, compliant and
              carefully coordinated work that keeps properties
              safe, comfortable and working as they should.
            </p>

            <p className="mt-6 text-base leading-7 text-[#6E6259] sm:mt-7">
              Whether you&apos;re building a new home, extending an
              existing property, refurbishing a commercial space
              or simply need a reliable team for repairs and
              maintenance, we bring the same attention to detail
              and professional standard to every project.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SERVICES                                                         */}
      {/* ================================================================ */}

      <section
        id="services"
        className="scroll-mt-24 bg-[#EDE8E0] px-6 py-16 sm:scroll-mt-28 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          {/* Section heading */}
          <div
            data-reveal
            className="mb-10 flex flex-col justify-between gap-6 sm:mb-16 sm:gap-8 lg:flex-row lg:items-end"
          >
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028] sm:mb-5">
                Our Services
              </p>

              <h2 className="max-w-3xl text-3xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl xl:text-7xl">
                Mechanical &
                <br />
                Electrical Services
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#6E6259]">
              From essential installations to ongoing
              maintenance, explore the services our team provides
              across London.
            </p>
          </div>

          {/* Dynamic services */}
          <div className="grid gap-6 lg:grid-cols-2">
            {services.map((service, index) => (
              <div key={service.id} data-reveal-group="me-cards">
                <ServiceCard
                  slug={service.slug}
                  title={service.title}
                  shortDescription={service.shortDescription}
                  category={service.category}
                  image={service.image}
                  index={index}
                  accent="#A26028"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WHY BSL                                                          */}
      {/* ================================================================ */}

      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-24">
          <div data-reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028] sm:mb-5">
              Why BSL
            </p>

            <h2 className="max-w-2xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-4xl sm:leading-[1.03] lg:text-5xl xl:text-6xl">
              Technical expertise.
              <br />
              <span className="text-[#A26028]">
                Properly managed.
              </span>
            </h2>
          </div>

          <div className="space-y-8 sm:space-y-10">
            {[
              {
                number: "01",
                title: "One accountable team",
                text: "When mechanical and electrical work forms part of a larger construction project, our teams work together from the start. That means fewer delays, better coordination and one point of contact.",
              },
              {
                number: "02",
                title: "Built around your property",
                text: "Every building has different requirements. We assess the property, understand the scope and recommend the right approach rather than forcing every project into the same template.",
              },
              {
                number: "03",
                title: "Quality from first fix to final test",
                text: "We focus on getting the details right at every stage — from installation and coordination through testing, certification and final handover.",
              },
            ].map((item) => (
              <div
                key={item.number}
                data-reveal
                className="border-t border-[#1C1712]/15 pt-6 sm:pt-7"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A26028]">
                  {item.number}
                </span>

                <h3 className="mt-3 text-xl font-medium sm:mt-4 sm:text-2xl">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#6E6259]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PROCESS                                                          */}
      {/* ================================================================ */}

      <section className="bg-[#1C1712] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div data-reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#D8B18A] sm:mb-5">
                Our Approach
              </p>

              <h2 className="text-3xl font-medium leading-[1.1] tracking-[-0.04em] sm:text-4xl sm:leading-[1.05] lg:text-5xl xl:text-6xl">
                Simple process.
                <br />
                <span className="text-[#D8B18A]">
                  Professional results.
                </span>
              </h2>
            </div>

            <div className="divide-y divide-white/15">
              {[
                {
                  number: "01",
                  title: "Understand",
                  text: "We listen to your requirements, assess the property and establish exactly what needs to be done.",
                },
                {
                  number: "02",
                  title: "Plan & Coordinate",
                  text: "We agree the scope, coordinate the relevant trades and plan the work around your property and programme.",
                },
                {
                  number: "03",
                  title: "Deliver",
                  text: "Our team completes the agreed installation, repair or maintenance work with care and attention to detail.",
                },
                {
                  number: "04",
                  title: "Test & Complete",
                  text: "We carry out the necessary checks and testing, complete the final details and leave you with a finished result you can rely on.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  data-reveal-group="me-process"
                  className="grid gap-4 py-7 sm:gap-6 sm:py-8 sm:grid-cols-[100px_1fr]"
                >
                  <span className="text-sm text-[#D8B18A]">
                    {step.number}
                  </span>

                  <div>
                    <h3 className="text-xl font-medium sm:text-2xl">
                      {step.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}

      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div
          data-reveal
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#A26028] px-6 py-12 sm:rounded-[32px] sm:px-12 sm:py-20 lg:px-20 lg:py-24"
        >
          {/* Decorative circle */}
          <div className="absolute -right-24 -top-24 hidden h-80 w-80 rounded-full border border-white/10 sm:block" />
          <div className="absolute -bottom-32 -left-20 hidden h-72 w-72 rounded-full border border-white/10 sm:block" />

          <div className="relative max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:mb-6">
              Start Your Project
            </p>

            <h2 className="text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl sm:leading-[1] lg:text-5xl xl:text-7xl">
              Need reliable
              <br />
              mechanical or
              <br />
              electrical support?
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:mt-7 sm:text-base">
              Tell us what you need and our team will help you
              understand the right approach, scope and next steps.
            </p>

            <Link
              href="/contact#quote"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C1712] transition hover:bg-[#F7F4EF] sm:mt-9 sm:px-7 sm:py-4"
            >
              Request a Quote

              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}