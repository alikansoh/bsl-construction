"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Replace this file in /public with the real hotel & commercial image.
const IMAGE_SRC = "/commercial.jpeg";

const SERVICES = [
  "Planned preventative maintenance (PPM)",
  "24/7 reactive & emergency call-outs",
  "Plumbing, heating, boilers & gas",
  "Electrical, lighting & air conditioning",
  "Room, corridor & public area refurbishments",
  "Out-of-hours works with minimal disruption",
];

const CLIENTS = ["Hotels", "Offices", "Retail", "Property Managers"];

function useIntersection<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

export default function HotelCommercial() {
  const [sectionRef, visible] = useIntersection<HTMLDivElement>(0.15);

  const fadeUp = (delayMs: number) => ({
    opacity: visible ? 1 : 0,
    transform: `translateY(${visible ? 0 : "16px"})`,
    transition:
      "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
    transitionDelay: `${delayMs}ms`,
  });

  return (
    <section
      aria-labelledby="hotel-commercial-heading"
      className="relative overflow-hidden bg-[#0B0B0D] px-5 py-16 text-white sm:px-8 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(162,96,40,0.22)_0%,rgba(162,96,40,0)_70%)]"
      />

      <div
        ref={sectionRef}
        className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14"
      >
        {/* IMAGE */}

        <div
          className="relative order-2 md:order-1"
          style={{
            opacity: visible ? 1 : 0,
            transform: `scale(${visible ? 1 : 0.96})`,
            transition:
              "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="relative w-full overflow-hidden rounded-3xl bg-[#1A1A1D] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
            <Image
              src={IMAGE_SRC}
              alt="BSL Construction hotel and commercial maintenance services in London"
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="h-auto w-full"
              loading="lazy"
            />
          </div>

          <div className="absolute -bottom-5 left-5 right-5 hidden flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0B0B0D]/85 p-4 backdrop-blur-md sm:left-auto sm:right-[-1rem] sm:flex sm:max-w-[300px]">
            <span className="w-full text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#E8C599]">
              Trusted By
            </span>
            {CLIENTS.map((client) => (
              <span
                key={client}
                className="rounded-full bg-white/10 px-3 py-1 text-[0.8rem] font-medium"
              >
                {client}
              </span>
            ))}
          </div>
        </div>

        {/* CONTENT */}

        <div className="order-1 md:order-2">
          <span
            style={fadeUp(0)}
            className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#E8C599] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#E8C599]"
          >
            Hotel &amp; Commercial
          </span>

          <h2
            id="hotel-commercial-heading"
            style={fadeUp(80)}
            className="mb-6 text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold leading-[1.18] tracking-[-0.01em]"
          >
            Hotel & Commercial
            <span className="text-[#E8C599]"> Maintenance Services</span>
          </h2>

          <p
            style={fadeUp(160)}
            className="mb-[1.15rem] text-[clamp(1rem,1.5vw,1.1rem)] leading-[1.75] text-white/85"
          >
            We keep hotels, offices and commercial buildings across London
            running smoothly with{" "}
            <strong className="font-bold text-white">
              planned and reactive maintenance
            </strong>{" "}
            delivered by one professional team.
          </p>

          <p
            style={fadeUp(220)}
            className="mb-7 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.75] text-white/70"
          >
            From ongoing maintenance contracts to emergency call-outs and
            refurbishments, we work around your guests, tenants and
            operations to minimise downtime and protect your property.
          </p>

          <ul
            style={fadeUp(280)}
            className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {SERVICES.map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 text-[0.95rem] text-white/90"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#A26028]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="h-3 w-3"
                  >
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {service}
              </li>
            ))}
          </ul>

          <div style={fadeUp(340)} className="flex flex-wrap gap-3">
            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
            >
              Request a Maintenance Quote
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/60"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
