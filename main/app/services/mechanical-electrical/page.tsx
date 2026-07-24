// app/services/mechanical-electrical/page.tsx

import Link from "next/link";
import Image from "next/image";

import {
  getServicesByCategorySlug,
  getTrustBar,
} from "@/lib/services";

export const metadata = {
  title:
    "Mechanical & Electrical Services London | BSL Construction",
  description:
    "Professional mechanical and electrical services across London, including plumbing, electrical installations, repairs, maintenance and building services.",
};

export default async function MechanicalElectricalPage() {
  const services =
    await getServicesByCategorySlug(
      "mechanical-electrical"
    );

  const trustBar = await getTrustBar();

  return (
    <main className="bg-[#F7F4EF] text-[#1C1712]">

      {/* ================================================================ */}
      {/* HERO                                                            */}
      {/* ================================================================ */}

      <section className="relative min-h-[90vh] overflow-hidden bg-[#1C1712]">

        {/* Background image */}

        <div className="absolute inset-0">
          <Image
            src="/main.jpg"
            alt="Mechanical and electrical services by BSL Construction"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#1C1712]/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1712] via-[#1C1712]/75 to-transparent" />
        </div>

        {/* Hero content */}

        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl items-end px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pb-28">

          <div className="max-w-4xl">

            <div className="mb-7 flex items-center gap-4">

              <span className="h-px w-12 bg-[#C58A54]" />

              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D8B18A]">
                Mechanical & Electrical
              </span>

            </div>

            <h1 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
              The systems behind
              <br />
              <span className="text-[#D8B18A]">
                better buildings.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              From plumbing and electrical installations to
              repairs, upgrades and ongoing maintenance, BSL
              Construction delivers reliable mechanical and
              electrical services as part of a wider construction
              project or as a standalone service.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <Link
                href="/contact#quote"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#A26028] px-7 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#B87538]"
              >
                Request a Quote

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-[#1C1712]"
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
              className="flex min-h-[90px] items-center justify-center px-5 text-center"
            >

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6E6259]">
                {item.label}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* ================================================================ */}
      {/* INTRODUCTION                                                     */}
      {/* ================================================================ */}

      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-36">

        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

          <div>

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              One team. Multiple disciplines.
            </p>

            <h2 className="max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              The technical work
              <br />
              <span className="text-[#A26028]">
                you can rely on.
              </span>
            </h2>

          </div>


          <div className="max-w-2xl">

            <p className="text-xl leading-8 text-[#3D352E]">
              The systems inside a building matter just as much
              as the structure around them. Our mechanical and
              electrical teams deliver practical, compliant and
              carefully coordinated work that keeps properties
              safe, comfortable and working as they should.
            </p>

            <p className="mt-7 text-base leading-7 text-[#6E6259]">
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
        className="bg-[#EDE8E0] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >

        <div className="mx-auto max-w-7xl">

          {/* Section heading */}

          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

            <div>

              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028]">
                Our Services
              </p>

              <h2 className="max-w-3xl text-4xl font-medium leading-[1] tracking-[-0.04em] sm:text-5xl lg:text-7xl">
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

            {services.map((service, index) => {
              const heroImage = service.hero?.image;
              const heroDescription = service.hero?.description?.replace(
                /<[^>]*>/g,
                ""
              );

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group relative min-h-[560px] overflow-hidden rounded-[28px] bg-[#1C1712]"
                >

                  {/* Image */}

                  {heroImage?.url && (
                    <Image
                      src={heroImage.url}
                      alt={heroImage.alt || service.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1712] via-[#1C1712]/40 to-transparent" />


                  {/* Number */}

                  <div className="absolute right-7 top-7">

                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-xs text-white/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                  </div>


                  {/* Content */}

                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">

                    <div className="mb-4 flex items-center gap-3">

                      <span className="h-px w-8 bg-[#D8B18A]" />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D8B18A]">
                        {service.categoryName}
                      </span>

                    </div>

                    <h3 className="text-4xl font-medium tracking-[-0.03em] text-white sm:text-5xl">
                      {service.title}
                    </h3>

                    {heroDescription && (
                      <p className="mt-5 max-w-lg text-sm leading-6 text-white/65">
                        {heroDescription}
                      </p>
                    )}

                    <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-white">

                      Explore Service

                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        →
                      </span>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>

        </div>

      </section>


      {/* ================================================================ */}
      {/* WHY BSL                                                          */}
      {/* ================================================================ */}

      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-36">

        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:gap-24">

          <div>

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              Why BSL
            </p>

            <h2 className="max-w-2xl text-4xl font-medium leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Technical expertise.
              <br />
              <span className="text-[#A26028]">
                Properly managed.
              </span>
            </h2>

          </div>


          <div className="space-y-10">

            <div className="border-t border-[#1C1712]/15 pt-7">

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A26028]">
                01
              </span>

              <h3 className="mt-4 text-2xl font-medium">
                One accountable team
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#6E6259]">
                When mechanical and electrical work forms part
                of a larger construction project, our teams work
                together from the start. That means fewer delays,
                better coordination and one point of contact.
              </p>

            </div>


            <div className="border-t border-[#1C1712]/15 pt-7">

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A26028]">
                02
              </span>

              <h3 className="mt-4 text-2xl font-medium">
                Built around your property
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#6E6259]">
                Every building has different requirements. We
                assess the property, understand the scope and
                recommend the right approach rather than forcing
                every project into the same template.
              </p>

            </div>


            <div className="border-t border-[#1C1712]/15 pt-7">

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A26028]">
                03
              </span>

              <h3 className="mt-4 text-2xl font-medium">
                Quality from first fix to final test
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#6E6259]">
                We focus on getting the details right at every
                stage — from installation and coordination through
                testing, certification and final handover.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================ */}
      {/* PROCESS                                                          */}
      {/* ================================================================ */}

      <section className="bg-[#1C1712] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">

            <div>

              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#D8B18A]">
                Our Approach
              </p>

              <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Simple process.
                <br />
                <span className="text-[#D8B18A]">
                  Professional results.
                </span>
              </h2>

            </div>


            <div className="divide-y divide-white/15">

              <div className="grid gap-6 py-8 sm:grid-cols-[100px_1fr]">

                <span className="text-sm text-[#D8B18A]">
                  01
                </span>

                <div>

                  <h3 className="text-2xl font-medium">
                    Understand
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                    We listen to your requirements, assess the
                    property and establish exactly what needs to
                    be done.
                  </p>

                </div>

              </div>


              <div className="grid gap-6 py-8 sm:grid-cols-[100px_1fr]">

                <span className="text-sm text-[#D8B18A]">
                  02
                </span>

                <div>

                  <h3 className="text-2xl font-medium">
                    Plan & Coordinate
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                    We agree the scope, coordinate the relevant
                    trades and plan the work around your property
                    and programme.
                  </p>

                </div>

              </div>


              <div className="grid gap-6 py-8 sm:grid-cols-[100px_1fr]">

                <span className="text-sm text-[#D8B18A]">
                  03
                </span>

                <div>

                  <h3 className="text-2xl font-medium">
                    Deliver
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                    Our team completes the agreed installation,
                    repair or maintenance work with care and
                    attention to detail.
                  </p>

                </div>

              </div>


              <div className="grid gap-6 py-8 sm:grid-cols-[100px_1fr]">

                <span className="text-sm text-[#D8B18A]">
                  04
                </span>

                <div>

                  <h3 className="text-2xl font-medium">
                    Test & Complete
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                    We carry out the necessary checks and
                    testing, complete the final details and leave
                    you with a finished result you can rely on.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}

      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-32">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#A26028] px-7 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24">

          {/* Decorative circle */}

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/10" />


          <div className="relative max-w-3xl">

            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Start Your Project
            </p>

            <h2 className="text-4xl font-medium leading-[1] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              Need reliable
              <br />
              mechanical or
              <br />
              electrical support?
            </h2>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/70">
              Tell us what you need and our team will help you
              understand the right approach, scope and next steps.
            </p>

            <Link
              href="/contact#quote"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C1712] transition hover:bg-[#F7F4EF]"
            >
              Request a Quote

              <span>
                →
              </span>

            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}