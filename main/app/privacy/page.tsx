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
  title: "Privacy Policy | BSL Construction",
  description:
    "Read BSL Construction's privacy policy to understand how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "3 August 2026";

const SECTIONS = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    body: [
      "BSL Construction (\"we\", \"us\", \"our\") is a construction, refurbishment and mechanical & electrical services company based in London, United Kingdom. This policy explains how we collect, use, store and protect personal information when you use our website, request a quote, or otherwise interact with us.",
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information we collect",
    body: [
      "When you submit an enquiry or quote request through our website, we may collect: your name, email address, phone number, the service you're enquiring about, and any details you provide about your project.",
      "We may also automatically collect limited technical information such as your browser type, device information, and pages visited, via standard server logs and cookies, to help us understand site usage and improve performance.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How we use your information",
    body: [
      "We use the information you provide to:",
    ],
    list: [
      "Respond to your enquiry or quote request",
      "Schedule site visits, call-outs, or consultations",
      "Provide updates about ongoing or requested work",
      "Maintain records for accounting, legal, and insurance purposes",
      "Improve our website and services",
    ],
  },
  {
    id: "legal-basis",
    title: "4. Legal basis for processing",
    body: [
      "We process your personal data on the basis of legitimate interest (responding to enquiries and providing quotes), contractual necessity (where you engage us for work), and consent (for optional marketing communications, where applicable), in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.",
    ],
  },
  {
    id: "sharing",
    title: "5. Sharing your information",
    body: [
      "We do not sell your personal information. We do not share your details with third parties for marketing purposes.",
      "We may share limited information with trusted subcontractors, suppliers, or professional advisors strictly where necessary to deliver a project you've engaged us for, or where required by law.",
    ],
  },
  {
    id: "retention",
    title: "6. Data retention",
    body: [
      "We retain enquiry and booking information for as long as necessary to respond to your request, deliver any agreed work, and meet our legal, accounting, and insurance obligations — typically no longer than 6 years after a project concludes, unless a longer period is required by law.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your rights",
    body: [
      "Under UK data protection law, you have the right to:",
    ],
    list: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate data",
      "Request deletion of your data, where applicable",
      "Object to or restrict certain processing",
      "Withdraw consent at any time, where processing is based on consent",
    ],
    after: [
      "To exercise any of these rights, contact us using the details below. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies",
    body: [
      "Our website may use essential cookies required for core functionality (such as keeping you signed in to the dashboard) and, where applicable, analytics cookies to help us understand site usage. You can control cookies through your browser settings at any time.",
    ],
  },
  {
    id: "security",
    title: "9. Security",
    body: [
      "We take reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to this policy",
    body: [
      "We may update this policy from time to time to reflect changes in our practices or legal requirements. The \"last updated\" date at the top of this page will reflect the most recent revision.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact us",
    body: [
      "If you have any questions about this privacy policy or how we handle your data, please contact us:",
    ],
    contact: true,
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
            This policy explains how BSL Construction collects, uses, and
            protects your personal information when you visit our website or
            request our services.
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

                {section.after?.map((p, i) => (
                  <p
                    key={i}
                    className="mb-3 text-[0.92rem] leading-[1.8] text-[#43433F]"
                  >
                    {p}
                  </p>
                ))}

                {section.contact && (
                  <div className="mt-4 rounded-2xl border border-[#1C1712]/8 bg-white p-5">
                    <p className="text-[0.92rem] leading-[1.9] text-[#43433F]">
                      <strong className="text-[#1C1712]">BSL Construction</strong>
                      <br />
                      Email:{" "}
                      <a
                        href="mailto:info@bsl-construction.co.uk"
                        className="text-[#A26028] hover:underline"
                      >
                        info@bsl-construction.co.uk
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
              <Link href="/terms" className="text-[#A26028] hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}