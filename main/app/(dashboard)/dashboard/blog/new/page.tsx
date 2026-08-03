"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RichTextEditor from "@/components/RichTextEditor";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

interface ImageState {
  url: string;
  alt: string;
  publicId?: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  message?: string;
}

interface CreateBlogResponse {
  success: boolean;
  message?: string;
  blog?: { slug: string };
}

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: string; // HTML from rich text editor

  thumbnail: ImageState;
  coverImage: ImageState;

  author: string;
  tags: string[];
  displayOrder: string;
  readTime: string;
  featured: boolean;

  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

const EMPTY_FORM: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  content: "",

  thumbnail: { url: "", alt: "" },
  coverImage: { url: "", alt: "" },

  author: "",
  tags: [],
  displayOrder: "0",
  readTime: "",
  featured: false,

  metaTitle: "",
  metaDescription: "",
  keywords: [],
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/*
  Mirrors what POST /api/blogs actually requires. This list also powers
  the "Required to publish" checklist at the top of the page, so the two
  stay in sync.
*/
const REQUIRED_FIELDS: {
  id: NavId;
  label: string;
  done: (form: BlogForm) => boolean;
}[] = [
  { id: "basics", label: "Post title", done: (f) => !!f.title.trim() },
  { id: "basics", label: "Slug", done: (f) => !!f.slug.trim() },
  { id: "basics", label: "Category", done: (f) => !!f.category.trim() },
  { id: "images", label: "Thumbnail image", done: (f) => !!f.thumbnail.url },
  { id: "images", label: "Cover image", done: (f) => !!f.coverImage.url },
  { id: "content", label: "Excerpt", done: (f) => !!f.excerpt.trim() },
  { id: "content", label: "Post content", done: (f) => !!f.content.trim() },
];

function validateForm(form: BlogForm): { id: NavId; message: string }[] {
  const errors: { id: NavId; message: string }[] = [];

  if (!form.title.trim()) {
    errors.push({ id: "basics", message: "Give your post a title." });
  } else if (!form.slug.trim()) {
    errors.push({ id: "basics", message: "Add a URL slug." });
  } else if (!form.category.trim()) {
    errors.push({ id: "basics", message: "Pick a category." });
  }

  if (!form.thumbnail.url) {
    errors.push({ id: "images", message: "Upload a thumbnail image." });
  } else if (!form.coverImage.url) {
    errors.push({ id: "images", message: "Upload a cover image." });
  }

  if (!form.excerpt.trim()) {
    errors.push({ id: "content", message: "Add a short excerpt." });
  } else if (!form.content.trim()) {
    errors.push({ id: "content", message: "The post needs some content." });
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
/* Shared building blocks (same styling language as the Projects editor)   */
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
/* Chip input (tags / keywords)                                             */
/* ----------------------------------------------------------------------- */

function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  return (
    <div className="flex min-h-[2.75rem] w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-[#1F4B66] focus-within:ring-2 focus-within:ring-[#1F4B66]/15">
      {values.map((value) => (
        <span
          key={value}
          className="flex items-center gap-1.5 rounded-full bg-[#1F4B66]/10 px-2.5 py-1 text-xs font-medium text-[#1F4B66]"
        >
          {value}
          <button
            type="button"
            onClick={() => onChange(values.filter((v) => v !== value))}
            className="text-[#1F4B66]/60 hover:text-[#1F4B66]"
            aria-label={`Remove ${value}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Image uploader (drag & drop / click)                                    */
/* ----------------------------------------------------------------------- */

function ImageUploader({
  label,
  hint,
  image,
  onChange,
}: {
  label: string;
  hint?: string;
  image: ImageState;
  onChange: (image: ImageState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please choose an image file.");
        return;
      }

      setUploadError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data: UploadResponse = await response.json();

        if (!response.ok || !data.success || !data.url) {
          throw new Error(data.message || "Upload failed");
        }

        onChange({
          url: data.url,
          alt: image.alt || file.name.replace(/\.[^/.]+$/, ""),
          publicId: data.publicId,
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [image.alt, onChange],
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition ${
          dragOver ? "border-[#1F4B66] bg-[#1F4B66]/5" : "border-slate-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {image.url ? (
          <div className="group relative h-40 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange({ url: "", alt: "" })}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#C1401F]"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 text-slate-400 transition hover:text-[#1F4B66]"
          >
            {uploading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#1F4B66]" />
                <span className="text-xs font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-medium">Drag & drop or click to upload</span>
              </>
            )}
          </button>
        )}
      </div>

      {uploadError && <p className="mt-1.5 text-xs font-medium text-[#C1401F]">{uploadError}</p>}

      {image.url && (
        <input
          value={image.alt}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="Alt text (for accessibility & SEO)"
          className="mt-2 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1F4B66] focus:outline-none focus:ring-2 focus:ring-[#1F4B66]/15"
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Preview (self-contained — no external BlogPreview component assumed)    */
/* ----------------------------------------------------------------------- */

function BlogPreview({ form }: { form: BlogForm }) {
  return (
    <article className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      {form.coverImage.url && (
        <div className="mb-8 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.coverImage.url} alt={form.coverImage.alt} className="h-auto w-full object-cover" />
        </div>
      )}

      <p className="font-mono text-xs uppercase tracking-widest text-[#D98E1F]">
        {form.category || "Category"}
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1C2024] sm:text-4xl">
        {form.title || "Untitled post"}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>{form.author || "Admin"}</span>
        {form.readTime && (
          <>
            <span>·</span>
            <span>{form.readTime}</span>
          </>
        )}
      </div>

      {form.excerpt && (
        <p className="mt-5 border-l-2 border-[#1F4B66] pl-4 text-base italic text-slate-600">
          {form.excerpt}
        </p>
      )}

      {form.content ? (
        <div
          className="prose prose-slate mt-8 max-w-none [&_blockquote]:border-l-2 [&_blockquote]:border-[#1F4B66] [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: form.content }}
        />
      ) : (
        <p className="mt-8 text-sm text-slate-400">Nothing written yet.</p>
      )}

      {form.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-dashed border-slate-200 pt-6">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#1F4B66]/10 px-3 py-1 text-xs font-medium text-[#1F4B66]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/* ----------------------------------------------------------------------- */
/* Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function NewBlogPage() {
  const router = useRouter();

  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showSlugField, setShowSlugField] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [focusSection, setFocusSection] = useState<NavId>("basics");

  /*
    Only surface validation errors after the user has actually tried to
    publish once — no need to greet them with red banners before they've
    typed anything.
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
  }, []);

  /* Close the preview modal with Escape. */
  useEffect(() => {
    if (!previewModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewModalOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewModalOpen]);

  const update = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    update("title", value);
    if (!slugTouched) update("slug", slugify(value));
  };

  const navigateTo = (id: NavId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusSection(id);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    update("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const removeTag = (index: number) => {
    update("tags", form.tags.filter((_, tagIndex) => tagIndex !== index));
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (!keyword || form.keywords.includes(keyword)) return;
    update("keywords", [...form.keywords, keyword]);
    setKeywordInput("");
  };

  const removeKeyword = (index: number) => {
    update("keywords", form.keywords.filter((_, keywordIndex) => keywordIndex !== index));
  };

  const sectionComplete = useMemo<Record<NavId, boolean>>(
    () => ({
      basics: !!form.title && !!form.slug && !!form.category,
      images: !!form.thumbnail.url && !!form.coverImage.url,
      content: !!form.excerpt && !!form.content,
      tags: form.tags.length > 0,
      seo: !!form.metaTitle && !!form.metaDescription,
    }),
    [form],
  );

  const progress = useMemo(() => {
    const checks = Object.values(sectionComplete);
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [sectionComplete]);

  async function handleSubmit(publishNow: boolean) {
    const status: "draft" | "published" = publishNow ? "published" : "draft";

    if (publishNow && validationErrors.length > 0) {
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

    // Drafts only need a title and slug to save something identifiable.
    if (!publishNow && (!form.title.trim() || !form.slug.trim())) {
      setShowValidation(true);
      navigateTo("basics");
      setFeedback({ type: "error", text: "Add a title and slug before saving a draft." });
      return;
    }

    setSaving(status);
    setFeedback(null);

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          excerpt: form.excerpt.trim(),
          category: form.category.trim(),
          author: form.author.trim() || "Admin",
          tags: form.tags,
          status,
          featured: form.featured,
          displayOrder: Number(form.displayOrder) || 0,
          readTime: form.readTime.trim() || undefined,
          thumbnail: form.thumbnail,
          coverImage: form.coverImage,
          content: form.content,
          seo: {
            metaTitle: form.metaTitle.trim() || form.title.trim(),
            metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
            keywords: form.keywords,
          },
        }),
      });

      const data: CreateBlogResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create blog post");
      }

      router.push("/dashboard/blog");
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
      setSaving(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky editor header */}
      <div className="sticky top-0 z-30">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Blog / New
              </p>

              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#1C2024]">
                  {form.title || "Untitled post"}
                </h1>

                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  draft
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
                disabled={saving !== null}
                onClick={() => handleSubmit(false)}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>

              <button
                type="button"
                disabled={saving !== null}
                onClick={() => handleSubmit(true)}
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
            description="How this post is identified and organized."
            errors={showValidation ? errorsBySection.basics : undefined}
          >
            <Field label="Post title" required>
              <TextInput
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="e.g. Five Lessons From Our Biggest Launch Yet"
              />
            </Field>

            <Field label="Slug" required hint="Used in the post URL">
              {!showSlugField ? (
                <button
                  type="button"
                  onClick={() => setShowSlugField(true)}
                  className="flex h-9 w-full items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-500 hover:border-[#1F4B66] hover:text-[#1F4B66]"
                >
                  /{form.slug || "your-post-slug"}
                </button>
              ) : (
                <input
                  autoFocus
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update("slug", slugify(event.target.value));
                  }}
                  onBlur={() => setShowSlugField(false)}
                  className={`${inputClass} font-mono`}
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required>
                <TextInput
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  placeholder="e.g. Engineering"
                />
              </Field>

              <Field label="Author">
                <TextInput
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                  placeholder="Jane Doe"
                />
              </Field>

              <Field label="Display order" hint="Lower shows first">
                <TextInput
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) => update("displayOrder", event.target.value)}
                />
              </Field>

              <Field label="Read time" hint="Optional">
                <TextInput
                  value={form.readTime}
                  onChange={(event) => update("readTime", event.target.value)}
                  placeholder="5 min read"
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
            description="Shown in post lists, cards, and at the top of the post."
            errors={showValidation ? errorsBySection.images : undefined}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploader
                label="Thumbnail"
                hint="Shown in post lists and cards"
                image={form.thumbnail}
                onChange={(image) => update("thumbnail", image)}
              />
              <ImageUploader
                label="Cover image"
                hint="Shown at the top of the post"
                image={form.coverImage}
                onChange={(image) => update("coverImage", image)}
              />
            </div>
          </SectionCard>

          <SectionCard
            id="content"
            n="03"
            title="Content"
            description="The excerpt and main write-up shown on the post."
            errors={showValidation ? errorsBySection.content : undefined}
          >
            <Field label="Excerpt" required hint="Shown on listing pages">
              <textarea
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                rows={2}
                placeholder="A one or two sentence summary shown on listing pages..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Content" required>
              <RichTextEditor value={form.content} onChange={(html) => update("content", html)} />
            </Field>
          </SectionCard>

          <SectionCard id="tags" n="04" title="Tags" description="Used for filtering and related posts.">
            <ChipInput values={form.tags} onChange={(tags) => update("tags", tags)} placeholder="Add a tag, press Enter" />
          </SectionCard>

          <SectionCard
            id="seo"
            n="05"
            title="SEO"
            description="Metadata used for search engines and social previews."
          >
            <Field label="Meta title" hint={`Defaults to the post title · ${form.metaTitle.length}/60`}>
              <TextInput
                value={form.metaTitle}
                onChange={(event) => update("metaTitle", event.target.value)}
                maxLength={70}
                placeholder={form.title || "Post title"}
              />
            </Field>

            <Field label="Meta description" hint={`Defaults to the excerpt · ${form.metaDescription.length}/160`}>
              <textarea
                value={form.metaDescription}
                onChange={(event) => update("metaDescription", event.target.value)}
                maxLength={170}
                rows={3}
                className={inputClass}
                placeholder={form.excerpt || "Post excerpt"}
              />
            </Field>

            <Field label="Keywords">
              <ChipInput
                values={form.keywords}
                onChange={(keywords) => update("keywords", keywords)}
                placeholder="Add a keyword, press Enter"
              />
            </Field>
          </SectionCard>

          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              disabled={saving !== null}
              onClick={() => handleSubmit(false)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              {saving === "draft" ? "Saving…" : "Save draft"}
            </button>

            <button
              type="button"
              disabled={saving !== null}
              onClick={() => handleSubmit(true)}
              className="rounded-lg bg-[#1C2024] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C2024]/90 disabled:opacity-50"
            >
              {saving === "published" ? "Publishing…" : "Publish post"}
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
          aria-label="Blog post preview"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewModalOpen(false);
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
              <BlogPreview form={form} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}