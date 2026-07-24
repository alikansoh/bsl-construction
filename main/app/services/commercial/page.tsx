// app/services/construction/page.tsx

import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
} from "lucide-react";

import { getServicesByType } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Construction Services London | BSL Construction",
  description:
    "New builds, extensions and full-scale construction projects across London, delivered by one accountable team from first conversation to final handover.",
};

export default async function ConstructionPage() {
  const services =
    await getServicesByType("construction");

  return (
    <main className="overflow-x-hidden bg-[#F7F4EF] text-[#1C1712]">
      <ScrollReveal />

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}

      <section
        data-hero-root
        className="relative min-h-[100svh] bg-[#1C1712] text-white sm:min-h-[96vh] lg:min-h-[92vh]"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/building.jpg"
            alt="BSL Construction project in London"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[#1C1712]/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1712] via-[#1C1712]/75 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1712] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-[1500px] flex-col justify-between px-6 py-24 sm:min-h-[96vh] sm:px-10 sm:py-8 lg:min-h-[92vh] lg:px-16 lg:py-32">
          {/* Top */}
          
          {/* Main Hero */}
          <div className="grid gap-10 pb-8 sm:gap-12 sm:pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3 sm:mb-7">
                <span className="rounded-full border border-[#C58A52]/50 bg-[#C58A52]/10 px-4 py-2">
                  <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#D8A873]">
                    Construction
                  </span>
                </span>
              </div>

              <h1 className="max-w-4xl text-[2.75rem] font-medium leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
                Built with
                <br />
                <span className="text-[#C58A52]">
                  purpose.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-[0.95rem] leading-7 text-white/70 sm:mt-8 sm:text-base sm:leading-7 lg:text-lg">
                From new homes built from the ground up to
                thoughtfully designed extensions, we deliver
                exceptional construction with one experienced
                team responsible from first conversation
                through to final handover.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link
                  href="/contact#quote"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#A26028] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#B87537] sm:px-7 sm:py-4"
                >
                  Start Your Project

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 sm:px-7 sm:py-4"
                >
                  View Our Projects
                </Link>
              </div>
            </div>

            {/* Hero Side Content */}
            <div className="hidden justify-end lg:flex">
              <div className="max-w-xs border-l border-white/20 pl-7">
                <p className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#C58A52]">
                  Our Approach
                </p>

                <p className="mt-4 text-sm leading-7 text-white/60">
                  A single accountable team coordinating
                  every stage of your build, so your project
                  stays clear, considered and under control.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-4 sm:gap-y-0">
            {[
              ["01", "One Accountable Team"],
              ["02", "Quality Workmanship"],
              ["03", "Clear Communication"],
              ["04", "Fully Insured"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="border-r border-white/10 px-4 odd:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"
              >
                <span className="bsl-mono text-[10px] text-[#C58A52]">
                  {number}
                </span>

                <p className="mt-2 text-xs text-white/60 sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 hidden items-center gap-3 xl:flex">
          <span className="bsl-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
            Explore
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20">
            <ArrowDownRight size={14} />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* INTRODUCTION                                                     */}
      {/* ================================================================ */}

      <section className="bg-[#F7F4EF] px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[0.35fr_1fr] lg:gap-14">
            <div data-reveal>
              <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#A26028]">
                01 — Construction
              </span>
            </div>

            <div data-reveal>
              <h2 className="max-w-5xl text-3xl font-medium leading-[1.1] tracking-[-0.035em] sm:text-4xl sm:leading-[1.05] lg:text-6xl xl:text-7xl">
                Construction that
                <span className="text-[#A26028]">
                  {" "}works around you.
                </span>
              </h2>

              <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-2">
                <p className="text-base leading-7 text-[#6E6259] sm:leading-8">
                  Every project starts with a different brief.
                  A new home has to feel personal. An extension
                  needs to belong to the house it changes.
                  And every build needs to be delivered with
                  care, clarity and control.
                </p>

                <p className="text-base leading-7 text-[#6E6259] sm:leading-8">
                  At BSL Construction, we bring experienced
                  project management and skilled trades together
                  under one accountable team — giving you a
                  smoother journey from the first site meeting
                  to the moment we hand over the keys.
                </p>
              </div>
            </div>
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
        <div className="mx-auto max-w-[1500px]">
          {/* Section Header */}
          <div
            data-reveal
            className="mb-10 flex flex-col justify-between gap-6 sm:mb-16 sm:gap-8 md:flex-row md:items-end"
          >
            <div>
              <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#A26028]">
                02 — What We Build
              </span>

              <h2 className="mt-5 max-w-3xl text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl xl:text-6xl">
                Our construction
                <br />
                <span className="text-[#A26028]">
                  services.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#6E6259]">
              Explore our construction services, each delivered
              with the same attention to detail, communication
              and quality that defines every BSL project.
            </p>
          </div>

          {/* Dynamic Service Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {services.map((service, index) => {
              const shortDescription = service.hero?.description
                ? service.hero.description.replace(/<[^>]*>/g, "")
                : `Professional ${service.title.toLowerCase()} services delivered by BSL Construction.`;

              const image = service.hero?.image ?? {
                url: "/building.jpg",
                alt: service.title,
              };

              return (
                <div key={service.id} data-reveal-group="construction-cards">
                  <ServiceCard
                    slug={service.slug}
                    categorySlug={service.categorySlug}
                    title={service.title}
                    shortDescription={shortDescription}
                    category={service.categoryName}
                    image={image}
                    index={index}
                    accent="#A26028"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WHY BSL                                                         */}
      {/* ================================================================ */}

      <section className="bg-[#1C1712] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div data-reveal>
              <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#C58A52]">
                03 — Why BSL
              </span>

              <h2 className="mt-5 max-w-md text-3xl font-medium leading-[1.1] tracking-[-0.035em] sm:mt-6 sm:text-4xl sm:leading-[1.05] lg:text-5xl xl:text-6xl">
                Built on
                <br />
                <span className="text-[#C58A52]">
                  trust.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/55 sm:mt-7">
                Construction is about more than what gets built.
                It&apos;s about how the project is managed, how clearly
                you are kept informed, and how confidently you
                can move forward.
              </p>
            </div>

            <div className="grid border-t border-white/15 sm:grid-cols-2">
              {[
                {
                  number: "01",
                  title: "One Accountable Team",
                  text: "From the first conversation to final handover, you have one experienced team responsible for keeping your project moving.",
                },
                {
                  number: "02",
                  title: "Quality Workmanship",
                  text: "We care about the details that make the difference — from the structure beneath the surface to the finishes you see every day.",
                },
                {
                  number: "03",
                  title: "Clear Communication",
                  text: "A well-managed project starts with clear expectations, realistic programmes and straightforward communication.",
                },
                {
                  number: "04",
                  title: "Fully Insured",
                  text: "Professional construction delivered with the appropriate care, standards and insurance to give you confidence throughout.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  data-reveal-group="construction-why"
                  className="border-b border-white/15 p-6 sm:p-7 lg:p-9"
                >
                  <span className="bsl-mono text-[10px] text-[#C58A52]">
                    {item.number}
                  </span>

                  <h3 className="mt-6 text-xl font-medium sm:mt-8">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/50 sm:mt-4">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PROCESS                                                          */}
      {/* ================================================================ */}

      <section className="bg-[#F7F4EF] px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
            <div data-reveal>
              <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-[#A26028]">
                04 — The Process
              </span>

              <h2 className="mt-5 max-w-md text-3xl font-medium leading-[1.1] tracking-[-0.035em] sm:mt-6 sm:text-4xl sm:leading-[1.05] lg:text-5xl xl:text-6xl">
                A clear path
                <br />
                <span className="text-[#A26028]">
                  forward.
                </span>
              </h2>
            </div>

            <div className="border-t border-[#1C1712]/15">
              {[
                {
                  number: "01",
                  title: "Understand",
                  text: "We start by understanding your vision, your property and what you want the finished project to achieve.",
                },
                {
                  number: "02",
                  title: "Plan",
                  text: "We establish the scope, programme and construction approach, making sure expectations are clear before work begins.",
                },
                {
                  number: "03",
                  title: "Build",
                  text: "Our team manages the project on site, coordinating trades, materials and the work required to bring your plans to life.",
                },
                {
                  number: "04",
                  title: "Handover",
                  text: "We complete the final details, carry out snagging and make sure your project is ready for you to enjoy.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  data-reveal-group="construction-process"
                  className="group grid gap-3 border-b border-[#1C1712]/15 py-7 sm:gap-5 sm:py-8 sm:grid-cols-[80px_220px_1fr] sm:items-start"
                >
                  <span className="bsl-mono text-[10px] text-[#A26028]">
                    {step.number}
                  </span>

                  <h3 className="text-xl font-medium">
                    {step.title}
                  </h3>

                  <p className="max-w-lg text-sm leading-7 text-[#6E6259]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRUST BAR                                                        */}
      {/* ================================================================ */}

      <section className="border-y border-[#1C1712]/10 bg-[#EDE8E0]">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 sm:grid-cols-5">
          {[
            "Professional Team",
            "Exceptional Service",
            "All Work Guaranteed",
            "Fully Insured",
            "Highly Recommended",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 border-r border-[#1C1712]/10 px-4 py-6 last:border-r-0 sm:px-5 sm:py-7"
            >
              <Check
                size={15}
                className="shrink-0 text-[#A26028]"
              />

              <span className="text-xs font-medium text-[#4F463F]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* FINAL CTA                                                        */}
      {/* ================================================================ */}

      <section className="relative overflow-hidden bg-[#A26028] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16 lg:py-36">
        {/* Decorative Circle */}
        <div className="absolute -right-40 -top-40 hidden h-[500px] w-[500px] rounded-full border border-white/10 sm:block" />

        <div className="absolute -right-20 -top-20 hidden h-[350px] w-[350px] rounded-full border border-white/10 sm:block" />

        <div data-reveal className="relative mx-auto max-w-[1500px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
            <div>
              <span className="bsl-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                Start Your Project
              </span>

              <h2 className="mt-5 max-w-4xl text-3xl font-medium leading-[1.05] tracking-[-0.04em] sm:mt-6 sm:text-5xl lg:text-6xl xl:text-8xl">
                Let&apos;s build
                <br />
                something
                <br />
                exceptional.
              </h2>
            </div>

            <div>
              <p className="mb-6 max-w-sm text-sm leading-7 text-white/70 sm:mb-7">
                Tell us about your project, your plans and
                what you&apos;re looking to achieve. We&apos;ll take it
                from there.
              </p>

              <Link
                href="/contact#quote"
                className="group inline-flex items-center gap-4 rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C1712] transition-all duration-300 hover:-translate-y-1 sm:px-7 sm:py-4"
              >
                Get a Quote

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}