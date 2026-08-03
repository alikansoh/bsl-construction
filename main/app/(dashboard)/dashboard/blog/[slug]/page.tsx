"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import RichTextEditor from "@/components/RichTextEditor";
import GalleryManager, { UploadedImage } from "@/components/GalleryManager";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

type ImageField = UploadedImage;

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;

  category: string;
  author: string;
  tags: string[];

  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  publishedAt: string;
  readTime: string;

  /*
    Same gallery-pool pattern as the project editor: every photo lives in
    `gallery`, and thumbnailUrl/coverImageUrl just point at one of them.
    The API stores thumbnail/coverImage separately, so we re-merge them
    back into one pool on load — see `blogToForm` below.
  */
  gallery: ImageField[];
  thumbnailUrl: string;
  coverImageUrl: string;

  content: string;

  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

/* Raw shape returned by GET /api/blogs/[slug] */
interface BlogApiResponse {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;
  publishedAt?: string;
  readTime?: string;
  thumbnail?: ImageField;
  coverImage?: ImageField;
  content: string;
  seo: { metaTitle: string; metaDescription: string; keywords: string[] };
}

const findImage = (gallery: ImageField[], url: string): ImageField | null =>
  gallery.find((image) => image.url === url) ?? null;

/*
  Reconstruct the merged gallery pool from the saved record: the thumbnail
  and cover image are stored separately, so we stitch them back together
  here, deduping by url just in case.
*/
function blogToForm(blog: BlogApiResponse): BlogForm {
  const pool: ImageField[] = [];
  const seen = new Set<string>();

  const add = (image?: ImageField) => {
    if (!image?.url || seen.has(image.url)) return;
    seen.add(image.url);
    pool.push(image);
  };

  add(blog.thumbnail);
  add(blog.coverImage);

  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",

    category: blog.category ?? "",
    author: blog.author ?? "",
    tags: blog.tags ?? [],

    status: blog.status ?? "draft",
    featured: blog.featured ?? false,
    displayOrder: blog.displayOrder ?? 0,

    publishedAt: blog.publishedAt ?? "",
    readTime: blog.readTime ?? "",

    gallery: pool,
    thumbnailUrl: blog.thumbnail?.url ?? "",
    coverImageUrl: blog.coverImage?.url ?? "",

    content: blog.content ?? "",

    seo: {
      metaTitle: blog.seo?.metaTitle ?? "",
      metaDescription: blog.seo?.metaDescription ?? "",
      keywords: blog.seo?.keywords ?? [],
    },
  };
}

/*
  Every field checked here is required by PUT /api/blogs/[slug] before a
  post can go live. This list also powers the "Required to publish"
  checklist at the top of the page, so the two stay in sync.
*/
const REQUIRED_FIELDS: {
  id: NavId;
  label: string;
  done: (form: BlogForm) => boolean;
}[] = [
  { id: "basics", label: "Blog title", done: (f) => !!f.title.trim() },
  { id: "basics", label: "Category", done: (f) => !!f.category.trim() },
  { id: "basics", label: "Author", done: (f) => !!f.author.trim() },
  {
    id: "images",
    label: "Thumbnail image",
    done: (f) => !!f.thumbnailUrl,
  },
  {
    id: "images",
    label: "Cover image",
    done: (f) => !!f.coverImageUrl,
  },
  {
    id: "content",
    label: "Excerpt",
    done: (f) => !!f.excerpt.trim(),
  },
  {
    id: "content",
    label: "Post content",
    done: (f) => !!f.content.trim(),
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
  section each problem belongs to. Mirrors what PUT /api/blogs/[slug]
  actually requires. (Slug isn't checked here — it's immutable once the
  post exists, the API strips any slug sent in the body.)
*/
function validateForm(form: BlogForm): { id: NavId; message: string }[] {
  const errors: { id: NavId; message: string }[] = [];

  if (!form.title.trim()) {
    errors.push({ id: "basics", message: "Add a blog title." });
  } else if (!form.category.trim()) {
    errors.push({ id: "basics", message: "Add a category." });
  } else if (!form.author.trim()) {
    errors.push({ id: "basics", message: "Add an author." });
  }

  if (form.gallery.length === 0) {
    errors.push({ id: "images", message: "Upload at least one photo." });
  } else if (!form.thumbnailUrl) {
    errors.push({
      id: "images",
      message: "Choose a thumbnail from your uploaded photos.",
    });
  } else if (!form.coverImageUrl) {
    errors.push({
      id: "images",
      message: "Choose a cover image from your uploaded photos.",
    });
  } else {
    const thumbnail = findImage(form.gallery, form.thumbnailUrl);
    const cover = findImage(form.gallery, form.coverImageUrl);

    if (!thumbnail?.alt.trim()) {
      errors.push({
        id: "images",
        message: "Add alt text to your thumbnail photo.",
      });
    } else if (!cover?.alt.trim()) {
      errors.push({
        id: "images",
        message: "Add alt text to your cover photo.",
      });
    }
  }

  if (!form.excerpt.trim()) {
    errors.push({ id: "content", message: "Add an excerpt." });
  } else if (!form.content.trim()) {
    errors.push({ id: "content", message: "Add the post content." });
  }

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
  { id: "content", label: "Content", n: "03" },
  { id: "tags", label: "Tags", n: "04" },
  { id: "seo", label: "SEO", n: "05" },
] as const;

type NavId = (typeof NAV)[number]["id"];

/* ----------------------------------------------------------------------- */
/* Small components (identical to the project editor)                      */
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
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
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
        <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth={2}>
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
      <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M2.5 6.5L4.5 8.5L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
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

function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const value = draft.trim();
    if (!value) return;

    onChange([...values, value]);
    setDraft("");
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, valueIndex) => valueIndex !== index));
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-2">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="flex items-center gap-1.5 rounded-full bg-[#1F4B66]/10 px-3 py-1 text-xs font-medium text-[#1F4B66]"
        >
          {value}
          <button
            type="button"
            onClick={() => removeValue(index)}
            className="text-[#1F4B66]/60 hover:text-[#1F4B66]"
            aria-label={`Remove ${value}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addValue();
          }
        }}
        placeholder={placeholder}
        className="min-w-[160px] flex-1 border-none px-1 py-1 text-sm outline-none"
      />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Required checklist                                                       */
/* ----------------------------------------------------------------------- */

function RequiredChecklist({
  form,
  onNavigate,
}: {
  form: BlogForm;
  onNavigate: (id: NavId) => void;
}) {
  const results = REQUIRED_FIELDS.map((field) => ({ ...field, done: field.done(form) }));
  const remaining = results.filter((field) => !field.done).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#1C2024]">Required to publish</h2>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            remaining === 0 ? "bg-[#2F6B4F]/10 text-[#2F6B4F]" : "bg-[#D98E1F]/10 text-[#D98E1F]"
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
                  field.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700"
                }`}
              >
                {field.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-slate-400">
        Drafts can be saved with any of this incomplete — these are only required before publishing.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function EditBlogPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const originalSlug = params.slug;

  const [form, setForm] = useState<BlogForm | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [keywordsInput, setKeywordsInput] = useState("");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [focusSection, setFocusSection] = useState<NavId>("basics");

  /*
    Only surface validation errors after the user has actually tried to
    publish once — no need to greet them with red banners the moment the
    post loads.
  */
  const [showValidation, setShowValidation] = useState(false);

  /* Load the existing blog post once we know the slug. */
  useEffect(() => {
    if (!originalSlug) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/blogs/${originalSlug}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Blog post not found");
        }

        if (!cancelled) {
          setForm(blogToForm(data.blog));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Couldn't load this blog post.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [originalSlug]);

  const validationErrors = useMemo(
    () => (form ? validateForm(form) : []),
    [form],
  );

  const errorsBySection = useMemo(() => {
    const grouped: Partial<Record<NavId, string[]>> = {};

    validationErrors.forEach((error) => {
      grouped[error.id] = [...(grouped[error.id] ?? []), error.message];
    });

    return grouped;
  }, [validationErrors]);

  /* Track the active editor section. */
  useEffect(() => {
    if (!form) return;

    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry) {
          setFocusSection(visibleEntry.target.id as NavId);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [form]);

  /* Close the preview modal with Escape. */
  useEffect(() => {
    if (!previewModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewModalOpen]);

  const update = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateNested = <K extends keyof BlogForm>(
    key: K,
    patch: Partial<BlogForm[K]>,
  ) => {
    setForm((current) =>
      current
        ? {
            ...current,
            [key]: { ...(current[key] as object), ...patch } as BlogForm[K],
          }
        : current,
    );
  };

  const navigateTo = (id: NavId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusSection(id);
  };

  const handleGalleryChange = (gallery: ImageField[]) => {
    setForm((current) => {
      if (!current) return current;

      const stillHasThumbnail = gallery.some((image) => image.url === current.thumbnailUrl);
      const stillHasCover = gallery.some((image) => image.url === current.coverImageUrl);

      return {
        ...current,
        gallery,
        thumbnailUrl: stillHasThumbnail ? current.thumbnailUrl : "",
        coverImageUrl: stillHasCover ? current.coverImageUrl : "",
      };
    });
  };

  const addKeyword = () => {
    if (!form) return;
    const keyword = keywordsInput.trim();
    if (!keyword) return;

    updateNested("seo", { keywords: [...form.seo.keywords, keyword] });
    setKeywordsInput("");
  };

  const removeKeyword = (index: number) => {
    if (!form) return;
    updateNested("seo", {
      keywords: form.seo.keywords.filter((_, keywordIndex) => keywordIndex !== index),
    });
  };

  const sectionComplete = useMemo<Record<NavId, boolean>>(() => {
    if (!form) {
      return {
        basics: false,
        images: false,
        content: false,
        tags: false,
        seo: false,
      };
    }

    return {
      basics: !!form.title && !!form.category && !!form.author,
      images: !!form.thumbnailUrl && !!form.coverImageUrl,
      content: !!form.excerpt && !!form.content,
      tags: form.tags.length > 0,
      seo: !!form.seo.metaTitle && !!form.seo.metaDescription,
    };
  }, [form]);

  const progress = useMemo(() => {
    const checks = Object.values(sectionComplete);
    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [sectionComplete]);

  const handleSubmit = async (status: "draft" | "published") => {
    if (!form) return;

    if (status === "published" && validationErrors.length > 0) {
      setShowValidation(true);

      const firstError = validationErrors[0];
      const sectionCount = Object.keys(errorsBySection).length;
      const firstSectionLabel = NAV.find((item) => item.id === firstError.id)?.label ?? "";

      navigateTo(firstError.id);

      setFeedback({
        type: "error",
        text: `Fix ${sectionCount} section${sectionCount > 1 ? "s" : ""} before publishing — starting with ${firstSectionLabel}.`,
      });

      return;
    }

    setSaving(status);
    setFeedback(null);

    const thumbnail = findImage(form.gallery, form.thumbnailUrl) ?? { url: "", alt: "" };
    const coverImage = findImage(form.gallery, form.coverImageUrl) ?? { url: "", alt: "" };

    try {
      const response = await fetch(`/api/blogs/${originalSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,

          category: form.category,
          author: form.author,
          tags: form.tags,

          status,
          featured: form.featured,
          displayOrder: form.displayOrder,

          publishedAt: form.publishedAt || undefined,
          readTime: form.readTime || undefined,

          thumbnail,
          coverImage,

          content: form.content,

          seo: form.seo,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setShowValidation(false);
      update("status", status);

      setFeedback({
        type: "success",
        text: status === "published" ? "Blog post published." : "Draft saved.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Couldn't save the blog post.",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/blogs/${originalSlug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/admin/blogs");
    } catch (error) {
      setDeleting(false);
      setConfirmingDelete(false);
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Couldn't delete the blog post.",
      });
    }
  };

  /* ----------------------------------- Loading / error states ----------------------------------- */

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm rounded-xl border border-[#C1401F]/30 bg-white p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-[#1C2024]">Couldn&apos;t load this blog post</h1>
          <p className="mt-2 text-sm text-slate-500">{loadError}</p>

          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="mt-4 inline-flex rounded-lg bg-[#1C2024] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1C2024]/90"
          >
            Back to blog posts
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading blog post…</p>
      </div>
    );
  }

  const previewData = {
    title: form.title,
    excerpt: form.excerpt,
    category: form.category,
    author: form.author,
    tags: form.tags,
    publishedAt: form.publishedAt,
    readTime: form.readTime,
    thumbnail: findImage(form.gallery, form.thumbnailUrl) ?? { url: "", alt: "" },
    coverImage: findImage(form.gallery, form.coverImageUrl) ?? { url: "", alt: "" },
    content: form.content,
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
                Blog / Edit
              </p>

              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#1C2024]">
                  {form.title || "Untitled post"}
                </h1>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    form.status === "published"
                      ? "bg-[#2F6B4F]/10 text-[#2F6B4F]"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {form.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#D98E1F] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="font-mono text-xs text-slate-400">{progress}%</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="inline-flex rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Preview post
              </button>

              <button
                type="button"
                disabled={saving !== null || deleting}
                onClick={() => handleSubmit("draft")}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>

              <button
                type="button"
                disabled={saving !== null || deleting}
                onClick={() => handleSubmit("published")}
                className="rounded-lg bg-[#1C2024] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1C2024]/90 disabled:opacity-50"
              >
                {saving === "published"
                  ? "Publishing…"
                  : form.status === "published"
                    ? "Update"
                    : "Publish"}
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
            description="How this post is identified and organized."
            errors={showValidation ? errorsBySection.basics : undefined}
          >
            <Field label="Blog title" required>
              <TextInput
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. 5 Trends Shaping Commercial Interiors in 2026"
              />
            </Field>

            <Field label="Slug" hint="Locked — the page URL can't change once published">
              <TextInput value={form.slug} disabled className="bg-slate-50 text-slate-500" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required>
                <TextInput
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  placeholder="e.g. Design Trends"
                />
              </Field>

              <Field label="Author" required>
                <TextInput
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                  placeholder="e.g. Jane Doe"
                />
              </Field>

              <Field label="Display order" hint="Lower shows first">
                <TextInput
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) => update("displayOrder", Number(event.target.value))}
                />
              </Field>

              <Field label="Read time" hint="e.g. 5 min read">
                <TextInput
                  value={form.readTime}
                  onChange={(event) => update("readTime", event.target.value)}
                />
              </Field>

              <Field label="Published" hint="Optional — stamped automatically on first publish">
                <TextInput
                  type="date"
                  value={form.publishedAt}
                  onChange={(event) => update("publishedAt", event.target.value)}
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
              Feature this post
            </label>
          </SectionCard>

          <SectionCard
            id="images"
            n="02"
            title="Images"
            description="Drag in your photos (you can select several at once), then pick which one is the thumbnail and which is the cover image."
            errors={showValidation ? errorsBySection.images : undefined}
          >
            <GalleryManager
              photos={form.gallery}
              thumbnailUrl={form.thumbnailUrl}
              heroImageUrl={form.coverImageUrl}
              onChange={handleGalleryChange}
              onSelectThumbnail={(url: string) => update("thumbnailUrl", url)}
              onSelectHero={(url: string) => update("coverImageUrl", url)}
            />
          </SectionCard>

          <SectionCard
            id="content"
            n="03"
            title="Content"
            description="The excerpt and main write-up shown on the blog page."
            errors={showValidation ? errorsBySection.content : undefined}
          >
            <Field label="Excerpt" required hint="Used in cards and listings">
              <textarea
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>

            <Field label="Post content" required>
              <RichTextEditor
                value={form.content}
                onChange={(html) => update("content", html)}
              />
            </Field>
          </SectionCard>

          <SectionCard
            id="tags"
            n="04"
            title="Tags"
            description="Topic tags shown on the post and used for filtering."
          >
            <ChipInput
              values={form.tags}
              onChange={(tags) => update("tags", tags)}
              placeholder="Add a tag and press Enter"
            />
          </SectionCard>

          <SectionCard
            id="seo"
            n="05"
            title="SEO"
            description="Metadata used for search engines and social previews."
            errors={showValidation ? errorsBySection.seo : undefined}
          >
            <Field label="Meta title" required hint={`${form.seo.metaTitle.length}/60`}>
              <TextInput
                value={form.seo.metaTitle}
                onChange={(event) => updateNested("seo", { metaTitle: event.target.value })}
                maxLength={70}
              />
            </Field>

            <Field label="Meta description" required hint={`${form.seo.metaDescription.length}/160`}>
              <textarea
                value={form.seo.metaDescription}
                onChange={(event) => updateNested("seo", { metaDescription: event.target.value })}
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

          <div className="flex items-center justify-between gap-3 pb-8">
            <div>
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg border border-[#C1401F]/30 px-4 py-2.5 text-sm font-medium text-[#C1401F] hover:bg-[#C1401F]/5"
                >
                  Delete post
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Delete this post? This can&apos;t be undone.</span>

                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="rounded-lg bg-[#C1401F] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#C1401F]/90 disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>

                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={saving !== null || deleting}
                onClick={() => handleSubmit("draft")}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>

              <button
                type="button"
                disabled={saving !== null || deleting}
                onClick={() => handleSubmit("published")}
                className="rounded-lg bg-[#1C2024] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C2024]/90 disabled:opacity-50"
              >
                {saving === "published"
                  ? "Publishing…"
                  : form.status === "published"
                    ? "Update post"
                    : "Publish post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full page preview modal */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2024]/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Blog post preview"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewModalOpen(false);
            }
          }}
        >
          <div className="flex h-[calc(100dvh-1.5rem)] w-full max-w-[1440px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                  Blog post preview
                </p>

                <h2 className="truncate text-sm font-semibold text-[#1C2024]">
                  {form.title || "Untitled post"}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:inline-flex">
                  {form.status === "published" ? "Live preview" : "Draft preview"}
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

          
          </div>
        </div>
      )}
    </div>
  );
}