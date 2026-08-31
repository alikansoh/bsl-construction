import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Terms of Service | BSL Construction",
  description:
    "Read the terms and conditions that apply to your use of the BSL Construction website and services.",
};

const LAST_UPDATED = "3 August 2026";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using the BSL Construction website (\"the site\"), or by submitting an enquiry, booking, or quote request through it, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.",
    ],
  },
  {
    id: "who-we-are",
    title: "2. About us",
    body: [
      "BSL Construction provides construction, refurbishment, and mechanical & electrical services across Greater London. References to \"we\", \"us\", or \"our\" refer to BSL Construction.",
    ],
  },
  {
    id: "use-of-site",
    title: "3. Use of the site",
    body: [
      "You agree to use the site only for lawful purposes. You must not:",
    ],
    list: [
      "Attempt to gain unauthorised access to any part of the site, our systems, or our dashboard",
      "Submit false, misleading, or fraudulent enquiry or booking information",
      "Use the site in any way that could damage, disable, or impair its functioning",
      "Copy, reproduce, or republish content from the site without permission",
    ],
  },
  {
    id: "quotes-bookings",
    title: "4. Quotes and enquiries",
    body: [
      "Submitting an enquiry or quote request through the site does not create a binding contract for work. A contract for services is only formed once we've agreed scope, pricing, and timing directly with you, typically following a site visit or consultation.",
      "Quotes provided are estimates based on the information available at the time and may be revised once the full scope of work is confirmed.",
    ],
  },
  {
    id: "no-warranty",
    title: "5. Site content and accuracy",
    body: [
      "We aim to keep the information on this site accurate and up to date, including service descriptions, project examples, and coverage areas. However, we make no warranty that the site will be error-free, uninterrupted, or that content is complete or current at all times.",
    ],
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual property",
    body: [
      "All content on this site — including text, images, logos, and project photography — is owned by or licensed to BSL Construction and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or use this content commercially without our prior written consent.",
    ],
  },
  {
    id: "liability",
    title: "7. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, BSL Construction is not liable for any indirect, incidental, or consequential loss arising from your use of the site. Nothing in these terms limits our liability for death or personal injury caused by negligence, or for fraud, where such liability cannot be excluded under UK law.",
      "Liability for any actual construction, refurbishment, or maintenance work carried out is governed separately by the contract agreed for that specific project, not by these website terms.",
    ],
  },
  {
    id: "third-party-links",
    title: "8. Third-party links",
    body: [
      "The site may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of any third-party sites linked from ours.",
    ],
  },
  {
    id: "governing-law",
    title: "9. Governing law",
    body: [
      "These terms are governed by the laws of England and Wales. Any disputes arising from your use of the site will be subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms. The \"last updated\" date above reflects the most recent revision.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact us",
    body: [
      "If you have any questions about these terms, please contact us:",
    ],
    contact: true,
  },
];

export default function TermsOfServicePage() {
  return (
    <main className={fraunces.variable}>
      <style>{`
        .bsl-serif {
          font-family: var(--font-fraunces), 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
        }
        .bsl-blueprint-grid-dark {
          background-image: radial-gradient(circle, rgba(232,197,153,0.14) 1px, transparent 1px);
          background-size: 22px 22px;
        }
      `}</style>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#26201A] via-[#1D1813] to-[#161210] px-5 pb-14 pt-28 sm:px-8 md:pb-16 md:pt-36">
        <div
          aria-hidden="true"
          className="bsl-blueprint-grid-dark pointer-events-none absolute inset-0 opacity-30"
        />
        <div className="relative mx-auto max-w-[840px]">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#E8C599]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E8C599]" />
            Legal
          </span>

          <h1 className="bsl-serif text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.02em] text-white">
            Terms of Service
          </h1>

          <p className="mt-4 text-[0.95rem] text-white/60">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#FAFAF9] px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto max-w-[840px]">
          <p className="mb-10 text-[0.95rem] leading-[1.8] text-[#6E6259]">
            These terms govern your use of the BSL Construction website.
            Please read them carefully before submitting an enquiry or
            booking request.
          </p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id}>
                <h2 className="bsl-serif mb-3 text-[1.3rem] font-medium text-[#1C1712]">
                  {section.title}
                </h2>

                {section.body?.map((p, i) => (
                  <p
                    key={i}
                    className="mb-3 text-[0.92rem] leading-[1.8] text-[#43433F]"
                  >
                    {p}
                  </p>
                ))}

                {section.list && (
                  <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[0.92rem] leading-[1.8] text-[#43433F]">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.contact && (
                  <div className="mt-4 rounded-2xl border border-[#1C1712]/8 bg-white p-5">
                    <p className="text-[0.92rem] leading-[1.9] text-[#43433F]">
                      <strong className="text-[#1C1712]">BSL Construction</strong>
                      <br />
                      Email:{" "}
                      <a
                        href="mailto:info@bslconstruction.co.uk"
                        className="text-[#A26028] hover:underline"
                      >
                        info@bslconstruction.co.uk
                      </a>
                      <br />
                      Phone:{" "}
                      <a href="tel:+447342324660" className="text-[#A26028] hover:underline">
                        +44 7342 324660
                      </a>
                      <br />
                      Based in London, United Kingdom
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-[#1C1712]/8 pt-6">
            <p className="text-[0.85rem] text-[#8a8378]">
              See also our{" "}
              <Link href="/privacy-policy" className="text-[#A26028] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}