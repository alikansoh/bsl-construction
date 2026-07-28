"use client";

import { useEffect, useMemo, useState } from "react";

import RichTextEditor from "@/components/RichTextEditor";
import GalleryManager, { UploadedImage } from "@/components/GalleryManager";
import ProjectPreview from "@/components/ProjectPreview";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

type ImageField = UploadedImage;

interface CtaField {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
}

interface ListBlockField {
  title: string;
  items: string[];
}

interface ProjectDetailField {
  label: string;
  value: string;
}

interface ProjectForm {
  title: string;
  slug: string;
  shortDescription: string;

  category: string;
  client: string;
  location: string;

  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  completedAt: string;
  duration: string;

  /*
    Instead of separate uploaders for thumbnail/hero, every uploaded photo
    lands in `gallery` first. thumbnailUrl/heroImageUrl are just pointers
    into that pool — the user clicks a photo to designate it as one or the
    other. This keeps alt text in one place and lets a photo double as both
    the thumbnail and the hero if that's all they've got.
  */
  gallery: ImageField[];
  thumbnailUrl: string;
  heroImageUrl: string;

  overview: {
    title: string;
    content: string;
  };

  challenges: ListBlockField;
  solutions: ListBlockField;
  results: ListBlockField;

  technologies: string[];

  projectDetails: ProjectDetailField[];

  cta: CtaField;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const emptyForm = (): ProjectForm => ({
  title: "",
  slug: "",
  shortDescription: "",

  category: "",
  client: "",
  location: "",

  status: "draft",
  featured: false,
  displayOrder: 0,

  completedAt: "",
  duration: "",

  gallery: [],
  thumbnailUrl: "",
  heroImageUrl: "",

  overview: {
    title: "",
    content: "",
  },

  challenges: { title: "Challenges", items: [] },
  solutions: { title: "Solutions", items: [] },
  results: { title: "Results", items: [] },

  technologies: [],

  projectDetails: [],

  cta: {
    title: "",
    content: "",
    buttonLabel: "",
    buttonHref: "",
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

const findImage = (gallery: ImageField[], url: string): ImageField | null =>
  gallery.find((image) => image.url === url) ?? null;

/*
  Every field checked here is required by POST /api/projects. This list is
  also what powers the "Required to publish" checklist at the top of the
  page, so the two always stay in sync — one source of truth.
*/
const REQUIRED_FIELDS: {
  id: NavId;
  label: string;
  done: (form: ProjectForm) => boolean;
}[] = [
  { id: "basics", label: "Project title", done: (f) => !!f.title.trim() },
  { id: "basics", label: "Slug", done: (f) => !!f.slug.trim() },
  { id: "basics", label: "Category", done: (f) => !!f.category.trim() },
  {
    id: "images",
    label: "Thumbnail image",
    done: (f) => !!f.thumbnailUrl,
  },
  {
    id: "images",
    label: "Hero image",
    done: (f) => !!f.heroImageUrl,
  },
  {
    id: "overview",
    label: "Short description",
    done: (f) => !!f.shortDescription.trim(),
  },
  {
    id: "overview",
    label: "Overview title",
    done: (f) => !!f.overview.title.trim(),
  },
  {
    id: "overview",
    label: "Overview content",
    done: (f) => !!f.overview.content.trim(),
  },
  { id: "seo", label: "Meta title", done: (f) => !!f.seo.metaTitle.trim() },
  {
    id: "seo",
    label: "Meta description",
    done: (f) => !!f.seo.metaDescription.trim(),
  },
];

/*
  Validates the required fields across the form and reports exactly which
  section each problem belongs to, so the UI can jump the user straight to
  the part that needs fixing instead of leaving them guessing. Mirrors what
  POST /api/projects actually requires.
*/
function validateForm(form: ProjectForm): { id: NavId; message: string }[] {
  const errors: { id: NavId; message: string }[] = [];

  if (!form.title.trim()) {
    errors.push({ id: "basics", message: "Add a project title." });
  } else if (!form.slug.trim()) {
    errors.push({ id: "basics", message: "Add a slug." });
  } else if (!form.category.trim()) {
    errors.push({ id: "basics", message: "Add a category." });
  }

  if (form.gallery.length === 0) {
    errors.push({ id: "images", message: "Upload at least one photo." });
  } else if (!form.thumbnailUrl) {
    errors.push({
      id: "images",
      message: "Choose a thumbnail from your uploaded photos.",
    });
  } else if (!form.heroImageUrl) {
    errors.push({
      id: "images",
      message: "Choose a hero image from your uploaded photos.",
    });
  } else {
    const thumbnail = findImage(form.gallery, form.thumbnailUrl);
    const hero = findImage(form.gallery, form.heroImageUrl);

    if (!thumbnail?.alt.trim()) {
      errors.push({
        id: "images",
        message: "Add alt text to your thumbnail photo.",
      });
    } else if (!hero?.alt.trim()) {
      errors.push({
        id: "images",
        message: "Add alt text to your hero photo.",
      });
    }
  }

  if (!form.shortDescription.trim()) {
    errors.push({ id: "overview", message: "Add a short description." });
  } else if (!form.overview.title.trim()) {
    errors.push({ id: "overview", message: "Add an overview title." });
  } else if (!form.overview.content.trim()) {
    errors.push({ id: "overview", message: "Add overview content." });
  }

  form.projectDetails.forEach((detail, index) => {
    if (!detail.label.trim()) {
      errors.push({
        id: "details",
        message: `Detail ${index + 1} is missing a label.`,
      });
    } else if (!detail.value.trim()) {
      errors.push({
        id: "details",
        message: `Detail ${index + 1} is missing a value.`,
      });
    }
  });

  if (!form.seo.metaTitle.trim()) {
    errors.push({ id: "seo", message: "Add a meta title." });
  } else if (!form.seo.metaDescription.trim()) {
    errors.push({ id: "seo", message: "Add a meta description." });
  }

  return errors;
}

const NAV = [
  { id: "basics", label: "Basics", n: "01" },
  { id: "images", label: "Images", n: "02" },
  { id: "overview", label: "Overview", n: "03" },
  { id: "challenges", label: "Challenges", n: "04" },
  { id: "solutions", label: "Solutions", n: "05" },
  { id: "results", label: "Results", n: "06" },
  { id: "technologies", label: "Technologies", n: "07" },
  { id: "details", label: "Details", n: "08" },
  { id: "cta", label: "CTA", n: "09" },
  { id: "seo", label: "SEO", n: "10" },
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
  errors,
  children,
}: {
  id: string;
  n: string;
  title: string;
  description?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  const hasErrors = Boolean(errors?.length);

  return (
    <section
      id={id}
      data-nav-section={id}
      className={`scroll-mt-36 rounded-xl border bg-white p-6 shadow-sm transition-colors sm:p-8 ${
        hasErrors
          ? "border-[#C1401F]/50 ring-1 ring-[#C1401F]/20"
          : "border-slate-200"
      }`}
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

      {hasErrors && (
        <div className="mb-5 rounded-lg border border-[#C1401F]/30 bg-[#C1401F]/5 px-4 py-3">
          <p className="text-sm font-medium text-[#C1401F]">
            {errors!.length === 1
              ? "This section needs attention:"
              : `This section needs attention (${errors!.length}):`}
          </p>

          <ul className="mt-1 space-y-0.5">
            {errors!.map((message, index) => (
              <li key={index} className="text-sm text-[#C1401F]/90">
                • {message}
              </li>
            ))}
          </ul>
        </div>
      )}

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

function CheckDot({
  complete,
  hasError,
}: {
  complete: boolean;
  hasError?: boolean;
}) {
  if (hasError) {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#C1401F] text-white">
        <svg
          viewBox="0 0 12 12"
          className="h-2 w-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 3v3.5M6 8.5h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

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
  errorSections,
  onNavigate,
}: {
  active: NavId;
  sectionComplete: Record<NavId, boolean>;
  errorSections?: Partial<Record<NavId, string[]>>;
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
            const hasError = Boolean(errorSections?.[item.id]?.length);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1C2024] text-white"
                    : hasError
                      ? "text-[#C1401F] hover:bg-[#C1401F]/10"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tracking-widest ${
                    isActive ? "text-[#D98E1F]" : hasError ? "text-[#C1401F]" : "text-slate-300"
                  }`}
                >
                  {item.n}
                </span>

                <span className="whitespace-nowrap">{item.label}</span>

                <CheckDot complete={sectionComplete[item.id]} hasError={hasError} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* A reusable "title + bullet list" editor, used for Challenges, Solutions
   and Results — all three share the same {title, items[]} shape. */
function ListBlockEditor({
  value,
  onChange,
  placeholder,
}: {
  value: ListBlockField;
  onChange: (value: ListBlockField) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const item = draft.trim();

    if (!item) return;

    onChange({ ...value, items: [...value.items, item] });
    setDraft("");
  };

  const removeItem = (index: number) => {
    onChange({
      ...value,
      items: value.items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <>
      <Field label="Title">
        <TextInput
          value={value.title}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
        />
      </Field>

      <div className="space-y-2">
        {value.items.map((item, index) => (
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
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItem();
              }
            }}
            placeholder={placeholder}
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
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Required checklist                                                       */
/* ----------------------------------------------------------------------- */

function RequiredChecklist({
  form,
  onNavigate,
}: {
  form: ProjectForm;
  onNavigate: (id: NavId) => void;
}) {
  const results = REQUIRED_FIELDS.map((field) => ({
    ...field,
    done: field.done(form),
  }));

  const remaining = results.filter((field) => !field.done).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#1C2024]">
          Required to publish
        </h2>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            remaining === 0
              ? "bg-[#2F6B4F]/10 text-[#2F6B4F]"
              : "bg-[#D98E1F]/10 text-[#D98E1F]"
          }`}
        >
          {remaining === 0 ? "All set" : `${remaining} remaining`}
        </span>
      </div>

      <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {results.map((field, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onNavigate(field.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-slate-50"
            >
              <CheckDot complete={field.done} />

              <span
                className={`text-sm ${
                  field.done
                    ? "text-slate-400 line-through decoration-slate-300"
                    : "text-slate-700"
                }`}
              >
                {field.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-400">
        Drafts can be saved with any of this incomplete — these are only
        required before publishing.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function CreateProjectPage() {
  const [form, setForm] = useState<ProjectForm>(emptyForm());
  const [slugLocked, setSlugLocked] = useState(true);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [focusSection, setFocusSection] = useState<NavId>("basics");

  /*
    Only surface validation errors after the user has actually tried to
    publish once — no need to greet them with red banners on a blank form.
  */
  const [showValidation, setShowValidation] = useState(false);

  const validationErrors = useMemo(() => validateForm(form), [form]);

  const errorsBySection = useMemo(() => {
    const grouped: Partial<Record<NavId, string[]>> = {};

    validationErrors.forEach((error) => {
      grouped[error.id] = [...(grouped[error.id] ?? []), error.message];
    });

    return grouped;
  }, [validationErrors]);

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

  const update = <K extends keyof ProjectForm>(
    key: K,
    value: ProjectForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateNested = <K extends keyof ProjectForm>(
    key: K,
    patch: Partial<ProjectForm[K]>,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: {
        ...(current[key] as object),
        ...patch,
      } as ProjectForm[K],
    }));
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: slugLocked ? slugify(title) : current.slug,
    }));
  };

  const navigateTo = (id: NavId) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

    setFocusSection(id);
  };

  const handleGalleryChange = (gallery: ImageField[]) => {
    setForm((current) => {
      const stillHasThumbnail = gallery.some(
        (image) => image.url === current.thumbnailUrl,
      );

      const stillHasHero = gallery.some(
        (image) => image.url === current.heroImageUrl,
      );

      return {
        ...current,
        gallery,
        thumbnailUrl: stillHasThumbnail ? current.thumbnailUrl : "",
        heroImageUrl: stillHasHero ? current.heroImageUrl : "",
      };
    });
  };

  const addDetail = () => {
    update("projectDetails", [
      ...form.projectDetails,
      { label: "", value: "" },
    ]);
  };

  const updateDetail = (index: number, patch: Partial<ProjectDetailField>) => {
    update(
      "projectDetails",
      form.projectDetails.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, ...patch } : detail,
      ),
    );
  };

  const removeDetail = (index: number) => {
    update(
      "projectDetails",
      form.projectDetails.filter((_, detailIndex) => detailIndex !== index),
    );
  };

  const addTech = () => {
    const tech = techInput.trim();

    if (!tech) return;

    update("technologies", [...form.technologies, tech]);
    setTechInput("");
  };

  const removeTech = (index: number) => {
    update(
      "technologies",
      form.technologies.filter((_, techIndex) => techIndex !== index),
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
      basics: !!form.title && !!form.slug && !!form.category,
      images: !!form.thumbnailUrl && !!form.heroImageUrl,
      overview:
        !!form.shortDescription &&
        !!form.overview.title &&
        !!form.overview.content,
      challenges: form.challenges.items.length > 0,
      solutions: form.solutions.items.length > 0,
      results: form.results.items.length > 0,
      technologies: form.technologies.length > 0,
      details: form.projectDetails.length > 0,
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
    if (status === "published" && validationErrors.length > 0) {
      setShowValidation(true);

      const firstError = validationErrors[0];
      const sectionCount = Object.keys(errorsBySection).length;
      const firstSectionLabel =
        NAV.find((item) => item.id === firstError.id)?.label ?? "";

      navigateTo(firstError.id);

      setFeedback({
        type: "error",
        text: `Fix ${sectionCount} section${
          sectionCount > 1 ? "s" : ""
        } before publishing — starting with ${firstSectionLabel}.`,
      });

      return;
    }

    setSaving(status);
    setFeedback(null);

    const thumbnail = findImage(form.gallery, form.thumbnailUrl) ?? {
      url: "",
      alt: "",
    };

    const heroImage = findImage(form.gallery, form.heroImageUrl) ?? {
      url: "",
      alt: "",
    };

    // The thumbnail/hero photo can still appear in the public gallery too —
    // we only drop it here to avoid literally showing the same image twice
    // in a row on the live page.
    const publicGallery = form.gallery.filter(
      (image) => image.url !== thumbnail.url && image.url !== heroImage.url,
    );

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          shortDescription: form.shortDescription,

          category: form.category,
          client: form.client || undefined,
          location: form.location || undefined,

          status,
          featured: form.featured,
          displayOrder: form.displayOrder,

          completedAt: form.completedAt || undefined,
          duration: form.duration || undefined,

          thumbnail,
          heroImage,
          gallery: publicGallery,

          overview: form.overview,
          challenges: form.challenges,
          solutions: form.solutions,
          results: form.results,

          technologies: form.technologies,
          projectDetails: form.projectDetails,

          cta:
            form.cta.title || form.cta.content ? form.cta : undefined,

          seo: form.seo,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setShowValidation(false);

      setFeedback({
        type: "success",
        text: status === "published" ? "Project published." : "Draft saved.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Couldn't save the project.",
      });
    } finally {
      setSaving(null);
    }
  };

  const previewData = {
    title: form.title,
    shortDescription: form.shortDescription,
    client: form.client,
    location: form.location,
    completedAt: form.completedAt,
    duration: form.duration,
    thumbnail: findImage(form.gallery, form.thumbnailUrl) ?? {
      url: "",
      alt: "",
    },
    heroImage: findImage(form.gallery, form.heroImageUrl) ?? {
      url: "",
      alt: "",
    },
    gallery: form.gallery.filter(
      (image) =>
        image.url !== form.thumbnailUrl && image.url !== form.heroImageUrl,
    ),
    overview: form.overview,
    challenges: form.challenges,
    solutions: form.solutions,
    results: form.results,
    technologies: form.technologies,
    projectDetails: form.projectDetails,
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
                Projects / New
              </p>

              <h1 className="text-base font-semibold text-[#1C2024]">
                {form.title || "Untitled project"}
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
          errorSections={showValidation ? errorsBySection : undefined}
          onNavigate={navigateTo}
        />
      </div>

      {/* Form */}
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <RequiredChecklist form={form} onNavigate={navigateTo} />

          <SectionCard
            id="basics"
            n="01"
            title="Basics"
            description="How this project is identified and organized."
            errors={showValidation ? errorsBySection.basics : undefined}
          >
            <Field label="Project title" required>
              <TextInput
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="e.g. Riverside Office Fit-Out"
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
                <TextInput
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  placeholder="e.g. Commercial"
                />
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

              <Field label="Client">
                <TextInput
                  value={form.client}
                  onChange={(event) => update("client", event.target.value)}
                />
              </Field>

              <Field label="Location">
                <TextInput
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                />
              </Field>

              <Field label="Completed" hint="Optional">
                <TextInput
                  type="date"
                  value={form.completedAt}
                  onChange={(event) =>
                    update("completedAt", event.target.value)
                  }
                />
              </Field>

              <Field label="Duration" hint="e.g. 6 weeks">
                <TextInput
                  value={form.duration}
                  onChange={(event) => update("duration", event.target.value)}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1F4B66] focus:ring-[#1F4B66]/30"
              />
              Feature this project
            </label>
          </SectionCard>

          <SectionCard
            id="images"
            n="02"
            title="Images"
            description="Drag in your photos (you can select several at once), then pick which one is the thumbnail and which is the hero."
            errors={showValidation ? errorsBySection.images : undefined}
          >
           <GalleryManager
  photos={form.gallery}
  thumbnailUrl={form.thumbnailUrl}
  heroImageUrl={form.heroImageUrl}
  onChange={handleGalleryChange}
  onSelectThumbnail={(url: string) => update("thumbnailUrl", url)}
  onSelectHero={(url: string) => update("heroImageUrl", url)}
/>
          </SectionCard>

          <SectionCard
            id="overview"
            n="03"
            title="Overview"
            description="The summary and main write-up shown on the project page."
            errors={showValidation ? errorsBySection.overview : undefined}
          >
            <Field label="Short description" required hint="Used in cards and listings">
              <TextInput
                value={form.shortDescription}
                onChange={(event) =>
                  update("shortDescription", event.target.value)
                }
              />
            </Field>

            <Field label="Overview title" required>
              <TextInput
                value={form.overview.title}
                onChange={(event) =>
                  updateNested("overview", { title: event.target.value })
                }
              />
            </Field>

            <Field label="Overview content" required>
              <RichTextEditor
                value={form.overview.content}
                onChange={(html) =>
                  updateNested("overview", { content: html })
                }
              />
            </Field>
          </SectionCard>

          <SectionCard
            id="challenges"
            n="04"
            title="Challenges"
            description="What made this project difficult."
          >
            <ListBlockEditor
              value={form.challenges}
              onChange={(challenges) => update("challenges", challenges)}
              placeholder="Add a challenge and press Enter"
            />
          </SectionCard>

          <SectionCard
            id="solutions"
            n="05"
            title="Solutions"
            description="How the challenges were addressed."
          >
            <ListBlockEditor
              value={form.solutions}
              onChange={(solutions) => update("solutions", solutions)}
              placeholder="Add a solution and press Enter"
            />
          </SectionCard>

          <SectionCard
            id="results"
            n="06"
            title="Results"
            description="The outcomes delivered."
          >
            <ListBlockEditor
              value={form.results}
              onChange={(results) => update("results", results)}
              placeholder="Add a result and press Enter"
            />
          </SectionCard>

          <SectionCard
            id="technologies"
            n="07"
            title="Technologies"
            description="Materials, methods or tools used on the project."
          >
            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2">
              {form.technologies.map((tech, index) => (
                <span
                  key={`${tech}-${index}`}
                  className="flex items-center gap-1.5 rounded-full bg-[#1F4B66]/10 px-3 py-1 text-xs font-medium text-[#1F4B66]"
                >
                  {tech}

                  <button
                    type="button"
                    onClick={() => removeTech(index)}
                    className="text-[#1F4B66]/60 hover:text-[#1F4B66]"
                    aria-label={`Remove technology ${tech}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                value={techInput}
                onChange={(event) => setTechInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Add a technology and press Enter"
                className="min-w-[160px] flex-1 border-none px-1 py-1 text-sm outline-none"
              />
            </div>
          </SectionCard>

          <SectionCard
            id="details"
            n="08"
            title="Project details"
            description="Label/value pairs shown as a quick-facts table, e.g. Size — 4,200 sq ft."
            errors={showValidation ? errorsBySection.details : undefined}
          >
            <div className="space-y-3">
              {form.projectDetails.map((detail, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <TextInput
                    value={detail.label}
                    onChange={(event) =>
                      updateDetail(index, { label: event.target.value })
                    }
                    placeholder="Label, e.g. Size"
                  />

                  <TextInput
                    value={detail.value}
                    onChange={(event) =>
                      updateDetail(index, { value: event.target.value })
                    }
                    placeholder="Value, e.g. 4,200 sq ft"
                  />

                  <IconButton
                    label="Remove"
                    tone="danger"
                    onClick={() => removeDetail(index)}
                  />
                </div>
              ))}
            </div>

            <AddButton label="Add detail" onClick={addDetail} />
          </SectionCard>

          <SectionCard
            id="cta"
            n="09"
            title="Call to Action"
            description="Optional closing banner encouraging the visitor to get in touch."
          >
            <Field label="Title">
              <TextInput
                value={form.cta.title}
                onChange={(event) =>
                  updateNested("cta", { title: event.target.value })
                }
              />
            </Field>

            <Field label="Content">
              <RichTextEditor
                value={form.cta.content}
                onChange={(html) => updateNested("cta", { content: html })}
                minHeight={72}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label">
                <TextInput
                  value={form.cta.buttonLabel}
                  onChange={(event) =>
                    updateNested("cta", { buttonLabel: event.target.value })
                  }
                />
              </Field>

              <Field label="Button link">
                <TextInput
                  value={form.cta.buttonHref}
                  onChange={(event) =>
                    updateNested("cta", { buttonHref: event.target.value })
                  }
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="seo"
            n="10"
            title="SEO"
            description="Metadata used for search engines and social previews."
            errors={showValidation ? errorsBySection.seo : undefined}
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
              {saving === "published" ? "Publishing…" : "Publish project"}
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
          aria-label="Project page preview"
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
                  Project page preview
                </p>

                <h2 className="truncate text-sm font-semibold text-[#1C2024]">
                  {form.title || "Untitled project"}
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
              <ProjectPreview
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