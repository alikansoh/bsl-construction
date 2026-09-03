"use client";

/**
 * ContactUs.tsx — BSL Construction
 * -------------------------------------------------------------------------
 * "Contact Us" page. Shares the design system introduced on the About page:
 * - Fraunces serif for display type, system sans for body
 * - Brass/terracotta accent (#A26028) on warm cream (#FAFAF9/#FBF9F6)
 * - Blueprint dot-grid texture, warm-charcoal hero with a cream logo glow
 * - Glassmorphic "block" card pattern (used here as the Contact Block)
 *
 * NOTE — placeholder business details:
 * The phone number, email, and hours below are placeholders. Swap
 * CONTACT_METHODS for your real details before shipping this page.
 *
 * NOTE — form submission:
 * handleSubmit posts to /api/bookings, which saves the enquiry to the
 * Booking collection and surfaces it in /dashboard/bookings.
 * -------------------------------------------------------------------------
 */

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

/* -------------------------------------------------------------------------- */
/* CONTENT                                                                    */
/* -------------------------------------------------------------------------- */

const CONTACT_BLOCK = [
  { label: "Response", value: "Within 1 working day" },
  { label: "Hours", value: "Mon–Fri, 8:00–18:00" },
  { label: "Call", value: "07378 412002" },
  { label: "Coverage", value: "London & surrounding" },
];

const CONTACT_METHODS = [
  {
    icon: "phone",
    label: "Call Us",
    value: "07378 412002",
    href: "tel:+447378412002",
    note: "Mon–Fri, 8:00–18:00",
  },
  {
    icon: "mail",
    label: "Email Us",
    value: "info@bsl-construction.co.uk",
    href: "mailto:info@bsl-construction.co.uk",
    note: "We reply within one working day",
  },
  {
    icon: "pin",
    label: "Visit Us",
    value: "London, United Kingdom",
    href: undefined,
    note: "Site visits by appointment",
  },
  {
    icon: "clock",
    label: "Emergency Call-Outs",
    value: "Available for maintenance clients",
    href: undefined,
    note: "Ask about out-of-hours cover",
  },
] as const;

const SERVICES = [
  "New Build",
  "Extension or Refurbishment",
  "Plumbing & Heating",
  "Electrical",
  "Air Conditioning",
  "Commercial Maintenance",
  "Hotel Maintenance",
  "Other",
];

const SERVICE_AREAS = [
  "Central London",
  "North London",
  "South London",
  "East London",
  "West London",
  "Greater London",
];

const FAQS = [
  {
    q: "Do you offer free quotes?",
    a: "Yes. Every quote is free and comes with no obligation — tell us about the job and we'll arrange a time to take a look.",
  },
  {
    q: "What areas do you cover?",
    a: "We work across Greater London, covering residential and commercial projects in Central, North, South, East and West London.",
  },
  {
    q: "Do you handle emergency call-outs?",
    a: "Yes, for clients on an active maintenance contract. Call our main number and we'll get someone to you as quickly as possible.",
  },
  {
    q: "How quickly can you start?",
    a: "It depends on the scope of the job and current bookings. We'll give you a realistic start date as soon as we've scoped the work.",
  },
];

/* -------------------------------------------------------------------------- */
/* ICONS                                                                      */
/* -------------------------------------------------------------------------- */

function ContactIcon({ type }: { type: (typeof CONTACT_METHODS)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    className: "h-5 w-5",
    "aria-hidden": true as const,
  };

  switch (type) {
    case "phone":
      return (
        <svg {...common}>
          <path
            d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-1 2-2 2-7 0-13.5-6.5-13.5-13.5 0-1 1-2 2-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" strokeLinejoin="round" />
          <path d="M4.5 6.5L12 12.5l7.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "pin":
      return (
        <svg {...common}>
          <path
            d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9.5" r="2.4" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 flex-none text-[#A26028] transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* HOOKS                                                                      */
/* -------------------------------------------------------------------------- */

function useReveal<T extends Element>(threshold = 0.15) {
  const ref = useRef<T | null>(null);

  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Already visible (reduced motion) — no observer needed.
    if (visible) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  return [ref, visible] as const;
}

/* -------------------------------------------------------------------------- */
/* STRUCTURED DATA                                                            */
/* -------------------------------------------------------------------------- */

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  about: {
    "@type": "HomeAndConstructionBusiness",
    name: "BSL Construction",
    areaServed: "London",
    email: "info@bsl-construction.co.uk",
    telephone: "07378 412002",
  },
};

/* -------------------------------------------------------------------------- */
/* FORM STATE                                                                 */
/* -------------------------------------------------------------------------- */

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function ContactUs() {
  const [formRef, formVisible] = useReveal<HTMLDivElement>(0.1);
  const [areaRef, areaVisible] = useReveal<HTMLDivElement>(0.2);
  const [faqRef, faqVisible] = useReveal<HTMLDivElement>(0.1);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong sending your message.");
      }

      setStatus("success");
      setForm(INITIAL_FORM);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong sending your message."
      );
      setStatus("error");
    }
  }

  return (
    <main className={fraunces.variable}>
      <style>{`
        .bsl-serif {
          font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
        }

        .bsl-blueprint-grid {
          background-image: radial-gradient(circle, rgba(28,23,18,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .bsl-blueprint-grid-dark {
          background-image: radial-gradient(circle, rgba(232,197,153,0.14) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        @keyframes bsl-hero-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bsl-hero-anim > * {
          opacity: 0;
          animation: bsl-hero-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .bsl-hero-anim > *:nth-child(1) { animation-delay: 0.04s; }
        .bsl-hero-anim > *:nth-child(2) { animation-delay: 0.14s; }
        .bsl-hero-anim > *:nth-child(3) { animation-delay: 0.24s; }

        @media (prefers-reduced-motion: reduce) {
          .bsl-hero-anim > * {
            opacity: 1 !important;
            animation: none !important;
          }
        }

        .bsl-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }

        .bsl-fade.bsl-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .bsl-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(28,23,18,0.12);
          background: #FFFFFF;
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          color: #1C1712;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .bsl-field::placeholder {
          color: rgba(28,23,18,0.35);
        }

        .bsl-field:focus {
          outline: none;
          border-color: #A26028;
          box-shadow: 0 0 0 3px rgba(162,96,40,0.14);
        }

        @media (prefers-reduced-motion: reduce) {
          .bsl-fade {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* ==================================================================
          PAGE INTRO
      =================================================================== */}

      <section
        aria-labelledby="contact-hero-heading"
        className="bg-[#FAFAF9] px-5 pt-28 pb-10 sm:px-8 md:pt-36 md:pb-14"
      >
        <div className="bsl-hero-anim mx-auto max-w-[1180px]">
          <span className="relative mb-4 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
            Contact BSL Construction
          </span>

          <h1
            id="contact-hero-heading"
            className="bsl-serif max-w-3xl text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.02em] text-[#0B0B0D]"
          >
            Let&apos;s talk about{" "}
            <span className="italic text-[#A26028]">your next project.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[clamp(0.98rem,1.5vw,1.1rem)] leading-[1.75] text-[#43433F]">
            New build, refurbishment, or an ongoing maintenance contract — tell
            us what you need and we&apos;ll come back with clear next steps, free
            of charge.
          </p>

          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#1C1712]/10 pt-5">
            {CONTACT_BLOCK.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#A26028]">
                  {row.label}
                </dt>
                <dd className="bsl-serif mt-0.5 text-[0.98rem] leading-snug text-[#0B0B0D]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ==================================================================
          CONTACT METHODS + FORM
      =================================================================== */}

      <section
        aria-labelledby="contact-form-heading"
        className="relative bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-24"
      >
        <div
          ref={formRef}
          className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-14"
        >
          {/* Contact method cards */}

          <div className={`bsl-fade ${formVisible ? "bsl-visible" : ""}`}>
            <span className="relative mb-3 inline-block pl-9 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#A26028] before:absolute before:left-0 before:top-1/2 before:h-[2px] before:w-7 before:-translate-y-1/2 before:bg-[#A26028]">
              Get In Touch
            </span>

            <h2
              id="contact-form-heading"
              className="bsl-serif mb-6 text-[clamp(1.9rem,3.4vw,2.4rem)] font-medium leading-[1.15] text-[#0B0B0D]"
            >
              However suits you best
            </h2>

            <div className="flex flex-col gap-4">
              {CONTACT_METHODS.map((method) => {
                const content = (
                  <div className="group flex items-start gap-4 rounded-2xl border border-[#1C1712]/8 bg-white p-5 transition-colors duration-200 hover:border-[#A26028]/30">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]">
                      <ContactIcon type={method.icon} />
                    </span>

                    <div className="min-w-0">
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#A26028]">
                        {method.label}
                      </span>

                      <span className="bsl-serif mt-1 block text-[1rem] font-medium text-[#1C1712]">
                        {method.value}
                      </span>

                      <span className="mt-0.5 block text-[0.82rem] text-[#6E6259]">
                        {method.note}
                      </span>
                    </div>
                  </div>
                );

                return method.href ? (
                  <a key={method.label} href={method.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={method.label}>{content}</div>
                );
              })}
            </div>
          </div>

          {/* Form */}

          <div
            className={`bsl-fade rounded-3xl border border-[#1C1712]/8 bg-white p-6 shadow-[0_1px_2px_rgba(28,23,18,0.05),0_20px_50px_-30px_rgba(28,23,18,0.25)] sm:p-8 md:p-10 ${
              formVisible ? "bsl-visible" : ""
            }`}
            style={{ transitionDelay: "120ms" }}
          >
            {status === "success" ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A26028]/10 text-[#A26028]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 12.5l2 2 4.5-4.5M12 3l7 3v5c0 4.5-3 8.25-7 10-4-1.75-7-5.5-7-10V6l7-3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <h3 className="bsl-serif mb-2 text-[1.4rem] font-medium text-[#1C1712]">
                  Message sent
                </h3>

                <p className="max-w-sm text-[0.95rem] leading-[1.7] text-[#6E6259]">
                  Thanks for getting in touch. We&apos;ll get back to you
                  within one working day.
                </p>

                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-[0.85rem] font-semibold text-[#A26028] underline-offset-4 hover:underline"
                 >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate id="quote">
                <h3 className="bsl-serif mb-6 text-[1.3rem] font-medium text-[#1C1712]">
                  Request a free quote
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-[0.78rem] font-medium text-[#43433F]"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="bsl-field"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-[0.78rem] font-medium text-[#43433F]"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="bsl-field"
                      placeholder="07000 000000"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-[0.78rem] font-medium text-[#43433F]"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="bsl-field"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="service"
                      className="mb-1.5 block text-[0.78rem] font-medium text-[#43433F]"
                    >
                      Service needed
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="bsl-field"
                      value={form.service}
                      onChange={(e) => updateField("service", e.target.value)}
                    >
                      <option value="">Select a service</option>
                      {SERVICES.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-[0.78rem] font-medium text-[#43433F]"
                    >
                      Tell us about the job
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      className="bsl-field resize-none"
                      placeholder="A few lines about the project — location, scope, and rough timing."
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                    />
                  </div>
                </div>

                {status === "error" && (
                  <p className="mt-4 text-[0.85rem] text-red-600">
                    {errorMessage ||
                      "Something went wrong sending your message. Please try again, or call us directly."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-[0.95rem] font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {status === "submitting" ? "Sending…" : "Send Message"}
                  {status !== "submitting" && <SendIcon />}
                </button>

                <p className="mt-3 text-[0.75rem] leading-[1.5] text-[#6E6259]/80">
                  By submitting, you agree to be contacted about your
                  enquiry. We don&apos;t share your details with third
                  parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================================
          SERVICE AREA
      =================================================================== */}

      <section
        aria-labelledby="service-area-heading"
        className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 md:py-24"
      >
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="relative mx-auto max-w-[1180px]">
          <header className="mx-auto mb-10 max-w-xl text-center md:mb-12">
            <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              Where We Work
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            </span>

            <h2
              id="service-area-heading"
              className="bsl-serif text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.15] text-[#1C1712]"
            >
              Serving Greater London
            </h2>
          </header>

          <div
            ref={areaRef}
            className={`bsl-fade mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 ${
              areaVisible ? "bsl-visible" : ""
            }`}
          >
            {SERVICE_AREAS.map((area) => (
              <span
                key={area}
                className="rounded-full border border-[#A26028]/25 bg-[#FBF9F6] px-5 py-2 text-[0.85rem] font-medium text-[#1C1712]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================
          FAQ
      =================================================================== */}

      <section
        aria-labelledby="faq-heading"
        className="bg-[#FBF9F6] px-5 py-16 sm:px-8 md:py-24"
      >
        <div className="mx-auto max-w-[840px]">
          <header className="mb-10 text-center md:mb-12">
            <span className="mb-3 inline-flex items-center justify-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#A26028]">
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
              FAQ
              <span aria-hidden="true" className="h-px w-6 bg-[#A26028]" />
            </span>

            <h2
              id="faq-heading"
              className="bsl-serif text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.15] text-[#1C1712]"
            >
              Common questions
            </h2>
          </header>

          <div
            ref={faqRef}
            className={`bsl-fade divide-y divide-[#1C1712]/8 overflow-hidden rounded-2xl border border-[#1C1712]/8 bg-white ${
              faqVisible ? "bsl-visible" : ""
            }`}
          >
            {FAQS.map((item, i) => {
              const open = openFaq === i;

              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[0.98rem] font-semibold text-[#1C1712]">
                      {item.q}
                    </span>
                    <ChevronIcon open={open} />
                  </button>

                  <div
                    className="grid overflow-hidden px-6 transition-[grid-template-rows] duration-300 ease-out"
                    style={{
                      gridTemplateRows: open ? "1fr" : "0fr",
                    }}
                  >
                    <div className="min-h-0">
                      <p className="pb-5 text-[0.9rem] leading-[1.7] text-[#6E6259]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================
          CTA BAND
      =================================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-[#1D1813] to-[#161210] px-5 py-16 sm:px-8 md:py-20">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-30"
        />

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="bsl-serif text-[clamp(1.6rem,3vw,2.1rem)] font-medium text-white">
              Prefer to talk it through?
            </h2>
            <p className="mt-2 max-w-md text-[0.95rem] leading-[1.7] text-white/65">
              Call us directly and we&apos;ll talk through your project on
              the spot.
            </p>
          </div>

          <Link
            href="tel:+447378412002"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#A26028] px-8 py-4 text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#8A5121]"
          >
            Call 07378 412002
          </Link>
        </div>
      </section>
    </main>
  );
}