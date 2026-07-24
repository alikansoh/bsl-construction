"use client";

/**
 * ServicePreview
 * -------------------------------------------------------------------------
 * Editor preview for service pages.
 *
 * This component converts draft/editor data into the service shape expected
 * by ServicePageContent, which is also used by app/services/[slug]/page.tsx.
 *
 * Result: the preview and frontend share the same markup, layout, spacing,
 * colours, typography, section order, gallery, FAQs, and CTA design.
 */

import { useMemo, type ReactNode } from "react";

import ServicePageContent from "@/components/ServicePageContent";

interface ImageField {
  url: string;
  alt: string;
}

interface CtaField {
  label: string;
  href: string;
}

interface SectionField {
  id: string;
  layout: "image-left" | "image-right";
  title: string;
  content: string;
  image: ImageField;
  cta: CtaField;
}

interface StepField {
  step: number;
  title: string;
  content: string;
}

interface FaqField {
  question: string;
  answer: string;
}

type FocusSection =
  | "basics"
  | "hero"
  | "sections"
  | "included"
  | "process"
  | "gallery"
  | "faqs"
  | "cta"
  | "seo";

interface PreviewData {
  title: string;

  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: ImageField;
    primaryCta: CtaField;
    secondaryCta: CtaField;
  };

  sections: SectionField[];

  whatsIncluded: {
    title: string;
    intro: string;
    items: string[];
  };

  process: {
    title: string;
    description: string;
    steps: StepField[];
  };

  gallery: ImageField[];

  faqs: FaqField[];

  cta: {
    title: string;
    content: string;
    buttonLabel: string;
    buttonHref: string;
  };

  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

interface PreviewProps {
  focusSection: FocusSection;
  data: PreviewData;

  /**
   * Pass getTrustBar() from the parent/server component if available.
   * It is optional so the preview can still work while editing.
   */
  trustBarItems?: Array<{
    label?: string;
    title?: string;
    value?: string;
    [key: string]: unknown;
  }>;

  /**
   * Optional service type. Match this to the field in your editor if you
   * support construction, trade, and property-specific page language.
   */
  serviceType?: "construction" | "trade" | "property";
}

/* ==========================================================================
   PREVIEW-ONLY QUOTE FORM
============================================================================ */

function QuoteFormPreview({
  serviceTitle,
}: {
  serviceTitle: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#1C1712]/10 bg-white p-6 shadow-[0_1px_3px_rgba(28,23,18,0.06)] sm:p-8">
      <p className="mb-5 text-sm font-medium text-[#1C1712]">
        Request a quote for {serviceTitle}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#5C544A]">
            Name
          </label>
          <div className="h-11 rounded-md border border-[#1C1712]/15 bg-[#FAF7F2]" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#5C544A]">
            Email address
          </label>
          <div className="h-11 rounded-md border border-[#1C1712]/15 bg-[#FAF7F2]" />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-[#5C544A]">
          Tell us about your requirements
        </label>
        <div className="h-28 rounded-md border border-[#1C1712]/15 bg-[#FAF7F2]" />
      </div>

      <span className="mt-5 inline-flex rounded-full bg-[#A26028] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white">
        Send enquiry
      </span>
    </div>
  );
}

/* ==========================================================================
   PREVIEW-ONLY SEO PANEL
============================================================================ */

function SeoPreview({
  metaTitle,
  metaDescription,
}: {
  metaTitle: string;
  metaDescription: string;
}) {
  return (
    <section className="border-t border-[#1C1712]/10 bg-white px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[#A26028]">
          Search result preview
        </p>

        <div className="max-w-2xl rounded-md border border-slate-200 bg-white p-4">
          <p className="truncate text-[1.05rem] text-[#1a0dab]">
            {metaTitle || "Meta title will appear here"}
          </p>

          <p className="mt-1 text-xs text-[#006621]">
            bslconstruction.co.uk › services › preview
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {metaDescription || "Meta description will appear here."}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export default function ServicePreview({
  focusSection,
  data,
  trustBarItems = [],
  serviceType = "trade",
}: PreviewProps) {
  /*
    The editor fields use different names from the production service data.
    Convert them once, then give the shared production renderer the result.
  */
  const previewService = useMemo(() => {
    const title = data.title || data.hero.title || "Service title";

    return {
      slug: "preview",

      title,

      category: data.hero.eyebrow || "Services",

      serviceType,

      image: {
        url: data.hero.image.url,
        alt: data.hero.image.alt || title,
      },

      shortDescription:
        data.hero.description ||
        "Your service introduction will appear here.",

      primaryCta: {
        label: data.hero.primaryCta.label || "Get a Quote",
        href: data.hero.primaryCta.href || "#quote",
      },

      secondaryCta: data.hero.secondaryCta.label
        ? {
            label: data.hero.secondaryCta.label,
            href: data.hero.secondaryCta.href || "#overview",
          }
        : undefined,

      sections: data.sections.map((section, index) => ({
        id: section.id || `section-${index + 1}`,

        layout: section.layout,

        /*
          Production page uses `heading` and `body`.
          The editor uses `title` and `content`.
        */
        heading: section.title || "Section title",
        body: section.content || "Section content will appear here.",

        image: {
          url: section.image.url,
          alt:
            section.image.alt ||
            section.title ||
            `Service image ${index + 1}`,
        },

        cta: section.cta?.label
          ? {
              label: section.cta.label,
              href: section.cta.href || "#quote",
            }
          : undefined,
      })),

      whatsIncluded: {
        title: data.whatsIncluded.title || "What's Included",
        intro:
          data.whatsIncluded.intro ||
          "From the initial scope through to completion, our team coordinates every important part of the work.",
        items: data.whatsIncluded.items,
      },

      gallery: data.gallery.map((image, index) => ({
        url: image.url,
        alt: image.alt || `${title} gallery image ${index + 1}`,
      })),

      processTitle:
        data.process.title || "From first visit to completion",

      processDescription: data.process.description,

      process: data.process.steps.map((step, index) => ({
        step: step.step || index + 1,
        title: step.title || `Step ${index + 1}`,
        description: step.content || "Process step description.",
      })),

      faqs: data.faqs.map((faq) => ({
        question: faq.question || "Question",
        answer: faq.answer || "Answer",
      })),

      cta: {
        title: data.cta.title,
        content: data.cta.content,
        buttonLabel: data.cta.buttonLabel,
        buttonHref: data.cta.buttonHref || "#quote",
      },

      seo: {
        metaTitle: data.seo.metaTitle,
        metaDescription: data.seo.metaDescription,
        keywords: [],
      },
    };
  }, [data, serviceType]);

  /*
    The shared renderer gets the same data structure as the real page.
    The quote form is a visual-only version because a preview should not
    submit a real enquiry.
  */
  const quoteForm: ReactNode = (
    <QuoteFormPreview serviceTitle={previewService.title} />
  );

  return (
    <div className="h-full overflow-y-auto bg-[#FAF7F2] text-[#1C1712]">
      <ServicePageContent
        service={previewService}
        trustBarItems={trustBarItems}
        preview
        quoteForm={quoteForm}
      />

      {focusSection === "seo" && (
        <SeoPreview
          metaTitle={data.seo.metaTitle}
          metaDescription={data.seo.metaDescription}
        />
      )}
    </div>
  );
}