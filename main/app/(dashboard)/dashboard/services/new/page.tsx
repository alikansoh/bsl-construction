"use client";

import { useEffect, useMemo, useState } from "react";

import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader, { UploadedImage } from "@/components/ImageUploader";
import GalleryUploader from "@/components/GalleryUploader";
import ServicePreview from "@/components/ServicePreview";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

type ImageField = UploadedImage;

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

interface ServiceForm {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;
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
    keywords: string[];
  };
}

const CATEGORIES = [
  { slug: "construction", name: "Construction" },
  { slug: "mechanical-electrical", name: "Mechanical & Electrical" },
  { slug: "commercial", name: "Commercial" },
];

const emptyForm = (): ServiceForm => ({
  title: "",
  slug: "",
  categorySlug: "",
  categoryName: "",
  status: "draft",
  featured: false,
  displayOrder: 0,
  hero: {
    eyebrow: "",
    title: "",
    description: "",
    image: { url: "", alt: "" },
    primaryCta: { label: "Get a Quote", href: "/contact#quote" },
    secondaryCta: { label: "View Our Projects", href: "/projects" },
  },
  sections: [],
  whatsIncluded: {
    title: "What's Included",
    intro: "",
    items: [],
  },
  process: {
    title: "",
    description: "",
    steps: [],
  },
  gallery: [],
  faqs: [],
  cta: {
    title: "",
    content: "",
    buttonLabel: "Discuss Your Project",
    buttonHref: "/contact",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
});

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const NAV = [
  { id: "basics", label: "Basics", n: "01" },
  { id: "hero", label: "Hero", n: "02" },
  { id: "sections", label: "Content", n: "03" },
  { id: "included", label: "Included", n: "04" },
  { id: "process", label: "Process", n: "05" },
  { id: "gallery", label: "Gallery", n: "06" },
  { id: "faqs", label: "FAQs", n: "07" },
  { id: "cta", label: "CTA", n: "08" },
  { id: "seo", label: "SEO", n: "09" },
] as const;

type NavId = (typeof NAV)[number]["id"];

/* ----------------------------------------------------------------------- */
/* Small components                                                         */
/* ----------------------------------------------------------------------- */

function SectionCard({
  id,
  n,
  title,
  description,
  children,
}: {
  id: string;
  n: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-nav-section={id}
      className="scroll-mt-36 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-start gap-3 border-b border-dashed border-slate-200 pb-4">
        <span className="font-mono text-xs font-semibold tracking-widest text-[#D98E1F]">
          {n}
        </span>

        <div>
          <h2 className="text-lg font-semibold text-[#1C2024]">{title}</h2>

          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-[#C1401F]">*</span>}
        {hint && (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1F4B66] focus:ring-2 focus:ring-[#1F4B66]/15";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputClass} ${props.className ?? ""}`}
    />
  );
}

function IconButton({
  onClick,
  label,
  tone = "default",
}: {
  onClick: () => void;
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        tone === "danger"
          ? "text-[#C1401F] hover:bg-[#C1401F]/10"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-[#1F4B66] hover:bg-[#1F4B66]/5 hover:text-[#1F4B66]"
    >
      <span className="text-base leading-none">+</span>
      {label}
    </button>
  );
}

function CtaFields({
  value,
  onChange,
  legend,
}: {
  value: CtaField;
  onChange: (cta: CtaField) => void;
  legend: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${legend} label`}>
        <TextInput
          value={value.label}
          onChange={(event) =>
            onChange({
              ...value,
              label: event.target.value,
            })
          }
        />
      </Field>

      <Field label={`${legend} link`}>
        <TextInput
          value={value.href}
          onChange={(event) =>
            onChange({
              ...value,
              href: event.target.value,
            })
          }
          placeholder="/contact#quote"
        />
      </Field>
    </div>
  );
}

function CheckDot({
  complete,
}: {
  complete: boolean;
}) {
  return (
    <span
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors ${
        complete ? "bg-[#2F6B4F] text-white" : "bg-slate-200 text-transparent"
      }`}
    >
      <svg
        viewBox="0 0 12 12"
        className="h-2 w-2"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          d="M2.5 6.5L4.5 8.5L9.5 3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function TopTabBar({
  active,
  sectionComplete,
  onNavigate,
}: {
  active: NavId;
  sectionComplete: Record<NavId, boolean>;
  onNavigate: (id: NavId) => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1600px] px-2 sm:px-4">
        <div
          className="flex gap-1 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {NAV.map((item) => {
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1C2024] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tracking-widest ${
                    isActive ? "text-[#D98E1F]" : "text-slate-300"
                  }`}
                >
                  {item.n}
                </span>

                <span className="whitespace-nowrap">{item.label}</span>

                <CheckDot complete={sectionComplete[item.id]} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function CreateServicePage() {
  const [form, setForm] = useState<ServiceForm>(emptyForm());
  const [slugLocked, setSlugLocked] = useState(true);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [focusSection, setFocusSection] = useState<NavId>("basics");

  /* Track the active editor section. */
  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visibleEntry) {
          setFocusSection(visibleEntry.target.id as NavId);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /* Close the preview modal with Escape. */
  useEffect(() => {
    if (!previewModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewModalOpen]);

  const update = <K extends keyof ServiceForm>(
    key: K,
    value: ServiceForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateNested = <K extends keyof ServiceForm>(
    key: K,
    patch: Partial<ServiceForm[K]>,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: {
        ...(current[key] as object),
        ...patch,
      } as ServiceForm[K],
    }));
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: slugLocked ? slugify(title) : current.slug,
    }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    const category = CATEGORIES.find((item) => item.slug === categorySlug);

    setForm((current) => ({
      ...current,
      categorySlug,
      categoryName: category?.name ?? "",
    }));
  };

  const navigateTo = (id: NavId) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    setFocusSection(id);
  };

  const addSection = () => {
    setForm((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: `section-${Date.now()}`,
          layout:
            current.sections.length % 2 === 0
              ? "image-left"
              : "image-right",
          title: "",
          content: "",
          image: { url: "", alt: "" },
          cta: { label: "", href: "" },
        },
      ],
    }));
  };

  const updateSection = (
    index: number,
    patch: Partial<SectionField>,
  ) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    }));
  };

  const removeSection = (index: number) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter(
        (_, sectionIndex) => sectionIndex !== index,
      ),
    }));
  };

  const addItem = () => {
    const item = newItem.trim();

    if (!item) {
      return;
    }

    updateNested("whatsIncluded", {
      items: [...form.whatsIncluded.items, item],
    });

    setNewItem("");
  };

  const removeItem = (index: number) => {
    updateNested("whatsIncluded", {
      items: form.whatsIncluded.items.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
  };

  const addStep = () => {
    updateNested("process", {
      steps: [
        ...form.process.steps,
        {
          step: form.process.steps.length + 1,
          title: "",
          content: "",
        },
      ],
    });
  };

  const updateStep = (index: number, patch: Partial<StepField>) => {
    updateNested("process", {
      steps: form.process.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step,
      ),
    });
  };

  const removeStep = (index: number) => {
    updateNested("process", {
      steps: form.process.steps
        .filter((_, stepIndex) => stepIndex !== index)
        .map((step, stepIndex) => ({
          ...step,
          step: stepIndex + 1,
        })),
    });
  };

  const addFaq = () => {
    update("faqs", [
      ...form.faqs,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const updateFaq = (index: number, patch: Partial<FaqField>) => {
    update(
      "faqs",
      form.faqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, ...patch } : faq,
      ),
    );
  };

  const removeFaq = (index: number) => {
    update(
      "faqs",
      form.faqs.filter((_, faqIndex) => faqIndex !== index),
    );
  };

  const addKeyword = () => {
    const keyword = keywordsInput.trim();

    if (!keyword) {
      return;
    }

    updateNested("seo", {
      keywords: [...form.seo.keywords, keyword],
    });

    setKeywordsInput("");
  };

  const removeKeyword = (index: number) => {
    updateNested("seo", {
      keywords: form.seo.keywords.filter(
        (_, keywordIndex) => keywordIndex !== index,
      ),
    });
  };

  const sectionComplete = useMemo<Record<NavId, boolean>>(
    () => ({
      basics: !!form.title && !!form.slug && !!form.categorySlug,
      hero:
        !!form.hero.eyebrow &&
        !!form.hero.title &&
        !!form.hero.description &&
        !!form.hero.image.url,
      sections: form.sections.length > 0,
      included: !!form.whatsIncluded.intro,
      process:
        !!form.process.title &&
        !!form.process.description &&
        form.process.steps.length > 0,
      gallery: form.gallery.length > 0,
      faqs: form.faqs.length > 0,
      cta: !!form.cta.title && !!form.cta.content,
      seo: !!form.seo.metaTitle && !!form.seo.metaDescription,
    }),
    [form],
  );

  const progress = useMemo(() => {
    const checks = Object.values(sectionComplete);
    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [sectionComplete]);

  const handleSubmit = async (status: "draft" | "published") => {
    setSaving(status);
    setFeedback(null);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setFeedback({
        type: "success",
        text: status === "published" ? "Service published." : "Draft saved.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Couldn't save the service.",
      });
    } finally {
      setSaving(null);
    }
  };

  const previewData = {
    title: form.title,
    hero: form.hero,
    sections: form.sections,
    whatsIncluded: form.whatsIncluded,
    process: form.process,
    gallery: form.gallery,
    faqs: form.faqs,
    cta: form.cta,
    seo: form.seo,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky editor header */}
      <div className="sticky top-0 z-30">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Services / New
              </p>

              <h1 className="text-base font-semibold text-[#1C2024]">
                {form.title || "Untitled service"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#D98E1F] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="font-mono text-xs text-slate-400">
                  {progress}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="inline-flex rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Preview page
              </button>

              <button
                type="button"
                disabled={saving !== null}
                onClick={() => handleSubmit("draft")}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>

              <button
                type="button"
                disabled={saving !== null}
                onClick={() => handleSubmit("published")}
                className="rounded-lg bg-[#1C2024] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1C2024]/90 disabled:opacity-50"
              >
                {saving === "published" ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`px-4 py-2 text-center text-sm sm:px-6 ${
                feedback.type === "success"
                  ? "bg-[#2F6B4F]/10 text-[#2F6B4F]"
                  : "bg-[#C1401F]/10 text-[#C1401F]"
              }`}
            >
              {feedback.text}
            </div>
          )}
        </header>

        <TopTabBar
          active={focusSection}
          sectionComplete={sectionComplete}
          onNavigate={navigateTo}
        />
      </div>

      {/* Form */}
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <SectionCard
            id="basics"
            n="01"
            title="Basics"
            description="How this service is identified and organized."
          >
            <Field label="Service title" required>
              <TextInput
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="e.g. Loft Conversions"
              />
            </Field>

            <Field label="Slug" required hint="Used in the page URL">
              <div className="flex gap-2">
                <TextInput
                  value={form.slug}
                  disabled={slugLocked}
                  onChange={(event) =>
                    update("slug", slugify(event.target.value))
                  }
                  className={
                    slugLocked ? "bg-slate-50 text-slate-500" : ""
                  }
                />

                <button
                  type="button"
                  onClick={() => setSlugLocked((current) => !current)}
                  className="whitespace-nowrap rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  {slugLocked ? "Edit manually" : "Auto-generate"}
                </button>
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required>
                <select
                  value={form.categorySlug}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select a category</option>

                  {CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Display order" hint="Lower shows first">
                <TextInput
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) =>
                    update("displayOrder", Number(event.target.value))
                  }
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.featured}
                onClick={() => update("featured", !form.featured)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.featured ? "bg-[#D98E1F]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.featured ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Featured service
                </p>

                <p className="text-xs text-slate-500">
                  Highlighted on the services overview page
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="hero"
            n="02"
            title="Hero"
            description="The banner shown at the top of the service page."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Eyebrow" required hint="Small label above the title">
                <TextInput
                  value={form.hero.eyebrow}
                  onChange={(event) =>
                    updateNested("hero", {
                      eyebrow: event.target.value,
                    })
                  }
                  placeholder="Construction"
                />
              </Field>

              <Field label="Hero title" required>
                <TextInput
                  value={form.hero.title}
                  onChange={(event) =>
                    updateNested("hero", {
                      title: event.target.value,
                    })
                  }
                  placeholder="Loft Conversions"
                />
              </Field>
            </div>

            <Field label="Description" required>
              <RichTextEditor
                value={form.hero.description}
                onChange={(html) =>
                  updateNested("hero", {
                    description: html,
                  })
                }
                placeholder="Describe the service in a couple of sentences..."
              />
            </Field>

            <ImageUploader
              label="Hero image"
              required
              aspect="video"
              value={form.hero.image}
              onChange={(image) =>
                updateNested("hero", {
                  image,
                })
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <CtaFields
                legend="Primary CTA"
                value={form.hero.primaryCta}
                onChange={(primaryCta) =>
                  updateNested("hero", {
                    primaryCta,
                  })
                }
              />

              <CtaFields
                legend="Secondary CTA"
                value={form.hero.secondaryCta}
                onChange={(secondaryCta) =>
                  updateNested("hero", {
                    secondaryCta,
                  })
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            id="sections"
            n="03"
            title="Content sections"
            description="Alternating image/text blocks that expand on the service."
          >
            {form.sections.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No sections yet — add one to start building the page body.
              </p>
            )}

            <div className="space-y-5">
              {form.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Section {index + 1}
                    </span>

                    <IconButton
                      label="Remove"
                      tone="danger"
                      onClick={() => removeSection(index)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                      <Field label="Layout">
                        <select
                          value={section.layout}
                          onChange={(event) =>
                            updateSection(index, {
                              layout: event.target.value as SectionField["layout"],
                            })
                          }
                          className={inputClass}
                        >
                          <option value="image-left">Image left</option>
                          <option value="image-right">Image right</option>
                        </select>
                      </Field>

                      <Field label="Section title" required>
                        <TextInput
                          value={section.title}
                          onChange={(event) =>
                            updateSection(index, {
                              title: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>

                    <Field label="Content" required>
                      <RichTextEditor
                        value={section.content}
                        onChange={(html) =>
                          updateSection(index, {
                            content: html,
                          })
                        }
                      />
                    </Field>

                    <ImageUploader
                      value={section.image}
                      onChange={(image) =>
                        updateSection(index, {
                          image,
                        })
                      }
                    />

                    <CtaFields
                      legend="Section CTA (optional)"
                      value={section.cta}
                      onChange={(cta) =>
                        updateSection(index, {
                          cta,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <AddButton label="Add content section" onClick={addSection} />
          </SectionCard>

          <SectionCard
            id="included"
            n="04"
            title="What's Included"
            description="A bullet list of what's covered as standard."
          >
            <Field label="Title" required>
              <TextInput
                value={form.whatsIncluded.title}
                onChange={(event) =>
                  updateNested("whatsIncluded", {
                    title: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Intro" required>
              <RichTextEditor
                value={form.whatsIncluded.intro}
                onChange={(html) =>
                  updateNested("whatsIncluded", {
                    intro: html,
                  })
                }
              />
            </Field>

            <div className="space-y-2">
              {form.whatsIncluded.items.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D98E1F]" />

                  <span className="flex-1 text-sm text-slate-700">{item}</span>

                  <IconButton
                    label="Remove"
                    tone="danger"
                    onClick={() => removeItem(index)}
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <TextInput
                  value={newItem}
                  onChange={(event) => setNewItem(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addItem();
                    }
                  }}
                  placeholder="Add an included item and press Enter"
                />

                <button
                  type="button"
                  onClick={addItem}
                  className="whitespace-nowrap rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Add
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="process"
            n="05"
            title="Process"
            description="The numbered steps shown to explain how the work runs."
          >
            <Field label="Title" required>
              <TextInput
                value={form.process.title}
                onChange={(event) =>
                  updateNested("process", {
                    title: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Description" required>
              <RichTextEditor
                value={form.process.description}
                onChange={(html) =>
                  updateNested("process", {
                    description: html,
                  })
                }
              />
            </Field>

            <div className="space-y-4">
              {form.process.steps.map((step, index) => (
                <div
                  key={step.step}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1C2024] font-mono text-xs text-white">
                      {step.step}
                    </span>

                    <IconButton
                      label="Remove"
                      tone="danger"
                      onClick={() => removeStep(index)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Field label="Step title" required>
                      <TextInput
                        value={step.title}
                        onChange={(event) =>
                          updateStep(index, {
                            title: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Step content" required>
                      <RichTextEditor
                        value={step.content}
                        onChange={(html) =>
                          updateStep(index, {
                            content: html,
                          })
                        }
                        minHeight={72}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <AddButton label="Add step" onClick={addStep} />
          </SectionCard>

          <SectionCard
            id="gallery"
            n="06"
            title="Gallery"
            description="Additional project photos shown lower on the page."
          >
            <GalleryUploader
              images={form.gallery}
              onChange={(gallery) => update("gallery", gallery)}
            />
          </SectionCard>

          <SectionCard
            id="faqs"
            n="07"
            title="FAQs"
            description="Common questions shown near the bottom of the page."
          >
            <div className="space-y-4">
              {form.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      FAQ {index + 1}
                    </span>

                    <IconButton
                      label="Remove"
                      tone="danger"
                      onClick={() => removeFaq(index)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Field label="Question" required>
                      <TextInput
                        value={faq.question}
                        onChange={(event) =>
                          updateFaq(index, {
                            question: event.target.value,
                          })
                        }
                      />
                    </Field>

                    <Field label="Answer" required>
                      <RichTextEditor
                        value={faq.answer}
                        onChange={(html) =>
                          updateFaq(index, {
                            answer: html,
                          })
                        }
                        minHeight={72}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <AddButton label="Add FAQ" onClick={addFaq} />
          </SectionCard>

          <SectionCard
            id="cta"
            n="08"
            title="Call to Action"
            description="The closing banner encouraging the visitor to get in touch."
          >
            <Field label="Title" required>
              <TextInput
                value={form.cta.title}
                onChange={(event) =>
                  updateNested("cta", {
                    title: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Content" required>
              <RichTextEditor
                value={form.cta.content}
                onChange={(html) =>
                  updateNested("cta", {
                    content: html,
                  })
                }
                minHeight={72}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label" required>
                <TextInput
                  value={form.cta.buttonLabel}
                  onChange={(event) =>
                    updateNested("cta", {
                      buttonLabel: event.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Button link" required>
                <TextInput
                  value={form.cta.buttonHref}
                  onChange={(event) =>
                    updateNested("cta", {
                      buttonHref: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="seo"
            n="09"
            title="SEO"
            description="Metadata used for search engines and social previews."
          >
            <Field
              label="Meta title"
              required
              hint={`${form.seo.metaTitle.length}/60`}
            >
              <TextInput
                value={form.seo.metaTitle}
                onChange={(event) =>
                  updateNested("seo", {
                    metaTitle: event.target.value,
                  })
                }
                maxLength={70}
              />
            </Field>

            <Field
              label="Meta description"
              required
              hint={`${form.seo.metaDescription.length}/160`}
            >
              <textarea
                value={form.seo.metaDescription}
                onChange={(event) =>
                  updateNested("seo", {
                    metaDescription: event.target.value,
                  })
                }
                maxLength={170}
                rows={3}
                className={inputClass}
              />
            </Field>

            <Field label="Keywords">
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2">
                {form.seo.keywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#1F4B66]/10 px-3 py-1 text-xs font-medium text-[#1F4B66]"
                  >
                    {keyword}

                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="text-[#1F4B66]/60 hover:text-[#1F4B66]"
                      aria-label={`Remove keyword ${keyword}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  value={keywordsInput}
                  onChange={(event) => setKeywordsInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Add a keyword and press Enter"
                  className="min-w-[160px] flex-1 border-none px-1 py-1 text-sm outline-none"
                />
              </div>
            </Field>
          </SectionCard>

          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              disabled={saving !== null}
              onClick={() => handleSubmit("draft")}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            <button
              type="button"
              disabled={saving !== null}
              onClick={() => handleSubmit("published")}
              className="rounded-lg bg-[#1C2024] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C2024]/90 disabled:opacity-50"
            >
              {saving === "published" ? "Publishing…" : "Publish service"}
            </button>
          </div>
        </div>
      </div>

      {/* Full page preview modal */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2024]/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Service page preview"
          onMouseDown={(event) => {
            /*
              Only close if the user clicked the backdrop itself.
              Clicks inside the modal should remain interactive.
            */
            if (event.target === event.currentTarget) {
              setPreviewModalOpen(false);
            }
          }}
        >
          <div className="flex h-[calc(100dvh-1.5rem)] w-full max-w-[1440px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Service page preview
                </p>

                <h2 className="truncate text-sm font-semibold text-[#1C2024]">
                  {form.title || "Untitled service"}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:inline-flex">
                  Draft preview
                </span>

                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close preview"
                  title="Close preview"
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    ×
                  </span>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAF7F2]">
              <ServicePreview
                focusSection={focusSection}
                data={previewData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}