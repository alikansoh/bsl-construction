"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

interface ImageField {
  url: string;
  alt: string;
}

interface ListBlockField {
  title: string;
  items: string[];
}

interface ProjectDetailField {
  label: string;
  value: string;
}

interface CtaField {
  title: string;
  content: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface ProjectPreviewData {
  title: string;
  shortDescription: string;

  client: string;
  location: string;
  completedAt: string;
  duration: string;

  thumbnail: ImageField;
  heroImage: ImageField;
  gallery: ImageField[];

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

type FocusSection =
  | "basics"
  | "images"
  | "overview"
  | "challenges"
  | "solutions"
  | "results"
  | "technologies"
  | "details"
  | "gallery"
  | "cta"
  | "seo"
  | string;

interface ProjectPreviewProps {
  focusSection: FocusSection;
  data: ProjectPreviewData;
}

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

const formatDate = (value: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const SECTION_TARGETS: Record<string, string> = {
  basics: "hero",
  images: "hero",
  overview: "overview",
  challenges: "challenges",
  solutions: "solutions",
  results: "results",
  technologies: "technologies",
  details: "details",
  gallery: "gallery",
  cta: "cta",
  seo: "seo",
};

/* ----------------------------------------------------------------------- */
/* Small Components                                                         */
/* ----------------------------------------------------------------------- */

function Highlight({
  active,
  children,
  id,
}: {
  active: boolean;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div
      id={`preview-${id}`}
      data-preview-section={id}
      className={`scroll-mt-24 rounded-2xl transition-all duration-300 ${
        active
          ? "ring-2 ring-[#a07b42] ring-offset-4 ring-offset-[#FAF7F2]"
          : "ring-2 ring-transparent ring-offset-4 ring-offset-transparent"
      }`}
    >
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-black/10 bg-white/60 px-4 py-6 text-center text-sm text-gray-400">
      {children}
    </p>
  );
}

function RichText({ html }: { html: string }) {
  if (!html?.trim()) return null;

  return (
    <div
      className="prose prose-sm max-w-none text-gray-600 prose-headings:text-[#111214] prose-a:text-[#a07b42]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ----------------------------------------------------------------------- */
/* Component                                                                */
/* ----------------------------------------------------------------------- */

export default function ProjectPreview({
  focusSection,
  data,
}: ProjectPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTarget = SECTION_TARGETS[focusSection] ?? "";

  useEffect(() => {
    if (!activeTarget) return;

    const node = containerRef.current?.querySelector(
      `#preview-${activeTarget}`
    );

    node?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeTarget]);

  const hasDetails = data.projectDetails.some(
    (detail) => detail.label || detail.value
  );

  const metaBadges = [
    data.client && {
      label: "Client",
      value: data.client,
    },

    data.location && {
      label: "Location",
      value: data.location,
    },

    data.duration && {
      label: "Duration",
      value: data.duration,
    },

    data.completedAt && {
      label: "Completed",
      value: formatDate(data.completedAt),
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
  }[];

  return (
    <div
      ref={containerRef}
      className="mx-auto max-w-4xl px-4 py-10 sm:px-8"
    >
      <div className="space-y-10">

        {/* ------------------------------------------------------------ */}
        {/* Hero                                                          */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="hero"
          active={activeTarget === "hero"}
        >
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">

            <div className="relative h-72 w-full overflow-hidden bg-gray-100 sm:h-96">

              {data.heroImage?.url ? (
                <Image
                  src={data.heroImage.url}
                  alt={
                    data.heroImage.alt ||
                    data.title ||
                    "Hero image"
                  }
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No hero image yet
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />


              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">

                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  {data.title || "Untitled project"}
                </h1>


                {data.shortDescription && (
                  <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                    {data.shortDescription}
                  </p>
                )}

              </div>

            </div>


            {metaBadges.length > 0 && (
              <div className="grid grid-cols-2 divide-x divide-y divide-black/[0.06] border-t border-black/[0.06] sm:grid-cols-4 sm:divide-y-0">

                {metaBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className="px-4 py-3.5 text-center"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {badge.label}
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-[#111214]">
                      {badge.value}
                    </p>

                  </div>
                ))}

              </div>
            )}

          </div>
        </Highlight>


        {/* ------------------------------------------------------------ */}
        {/* Overview                                                      */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="overview"
          active={activeTarget === "overview"}
        >

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-semibold tracking-tight text-[#111214]">
              {data.overview.title || "Overview"}
            </h2>


            {data.overview.content ? (
              <div className="mt-3">
                <RichText html={data.overview.content} />
              </div>
            ) : (
              <div className="mt-3">
                <EmptyNote>
                  Add overview content to see it here.
                </EmptyNote>
              </div>
            )}

          </div>

        </Highlight>        {/* ------------------------------------------------------------ */}
        {/* Challenges / Solutions / Results                              */}
        {/* ------------------------------------------------------------ */}

        <div className="grid gap-5 sm:grid-cols-3">

          <Highlight
            id="challenges"
            active={activeTarget === "challenges"}
          >
            <ListBlockCard
              title={
                data.challenges.title ||
                "Challenges"
              }
              items={data.challenges.items}
              accent="#C1401F"
              placeholder="No challenges added yet."
            />
          </Highlight>


          <Highlight
            id="solutions"
            active={activeTarget === "solutions"}
          >
            <ListBlockCard
              title={
                data.solutions.title ||
                "Solutions"
              }
              items={data.solutions.items}
              accent="#1F4B66"
              placeholder="No solutions added yet."
            />
          </Highlight>


          <Highlight
            id="results"
            active={activeTarget === "results"}
          >
            <ListBlockCard
              title={
                data.results.title ||
                "Results"
              }
              items={data.results.items}
              accent="#2F6B4F"
              placeholder="No results added yet."
            />
          </Highlight>

        </div>



        {/* ------------------------------------------------------------ */}
        {/* Technologies                                                  */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="technologies"
          active={activeTarget === "technologies"}
        >

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-semibold tracking-tight text-[#111214]">
              Technologies
            </h2>


            {data.technologies.length > 0 ? (

              <div className="mt-4 flex flex-wrap gap-2">

                {data.technologies.map(
                  (tech, index) => (

                    <span
                      key={`${tech}-${index}`}
                      className="rounded-full bg-[#a07b42]/10 px-3.5 py-1.5 text-xs font-semibold text-[#a07b42]"
                    >
                      {tech}
                    </span>

                  )
                )}

              </div>

            ) : (

              <div className="mt-4">
                <EmptyNote>
                  No technologies added yet.
                </EmptyNote>
              </div>

            )}

          </div>

        </Highlight>




        {/* ------------------------------------------------------------ */}
        {/* Project Details                                               */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="details"
          active={activeTarget === "details"}
        >

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-semibold tracking-tight text-[#111214]">
              Project details
            </h2>



            {hasDetails ? (

              <dl className="mt-4 divide-y divide-black/[0.06]">

                {data.projectDetails
                  .filter(
                    (detail) =>
                      detail.label ||
                      detail.value
                  )
                  .map(
                    (detail, index) => (

                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 py-2.5"
                      >

                        <dt className="text-sm text-gray-500">
                          {detail.label || "—"}
                        </dt>


                        <dd className="text-sm font-medium text-[#111214]">
                          {detail.value || "—"}
                        </dd>

                      </div>

                    )
                  )}

              </dl>

            ) : (

              <div className="mt-4">

                <EmptyNote>
                  No project details added yet.
                </EmptyNote>

              </div>

            )}

          </div>

        </Highlight>        {/* ------------------------------------------------------------ */}
        {/* Gallery                                                       */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="gallery"
          active={activeTarget === "gallery"}
        >

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-semibold tracking-tight text-[#111214]">
              Gallery
            </h2>


            {data.gallery.length > 0 ? (

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {data.gallery.map(
                  (image, index) => (

                    <div
                      key={`${image.url}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                    >

                      <Image
                        src={image.url}
                        alt={
                          image.alt ||
                          `Gallery image ${index + 1}`
                        }
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="mt-4">

                <EmptyNote>
                  No gallery images added yet.
                </EmptyNote>

              </div>

            )}

          </div>

        </Highlight>



        {/* ------------------------------------------------------------ */}
        {/* CTA                                                           */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="cta"
          active={activeTarget === "cta"}
        >

          {data.cta.title || data.cta.content ? (

            <div className="rounded-2xl bg-[#111214] p-8 text-center shadow-sm sm:p-12">

              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {data.cta.title || "Ready to get started?"}
              </h2>


              {data.cta.content && (

                <div className="mx-auto mt-3 max-w-md text-sm text-white/70">

                  <RichText
                    html={data.cta.content}
                  />

                </div>

              )}


              {data.cta.buttonLabel && (

                <span className="mt-6 inline-flex rounded-xl bg-[#a07b42] px-6 py-3 text-sm font-semibold text-white">
                  {data.cta.buttonLabel}
                </span>

              )}

            </div>

          ) : (

            <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-8 text-center">

              <EmptyNote>
                Add a call-to-action title or content to see it rendered here.
                This section is optional.
              </EmptyNote>

            </div>

          )}

        </Highlight>




        {/* ------------------------------------------------------------ */}
        {/* SEO                                                           */}
        {/* ------------------------------------------------------------ */}

        <Highlight
          id="seo"
          active={activeTarget === "seo"}
        >

          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-semibold tracking-tight text-[#111214]">
              Search preview
            </h2>


            <p className="mt-1 text-sm text-gray-500">
              A rough approximation of how this page could appear in search
              results.
            </p>


            <div className="mt-4 rounded-xl border border-black/[0.06] bg-[#f6f7f9] p-4">

              <p className="truncate text-xs text-[#2F6B4F]">
                yoursite.com/projects/{data.title ? "…" : ""}
              </p>


              <p className="mt-1 truncate text-base text-[#1a0dab]">
                {data.seo.metaTitle ||
                  data.title ||
                  "Untitled project"}
              </p>


              <p className="mt-1 text-sm text-gray-600">

                {data.seo.metaDescription ||
                  data.shortDescription ||
                  "Add a meta description to see it previewed here."}

              </p>

            </div>



            {data.seo.keywords.length > 0 && (

              <div className="mt-4 flex flex-wrap gap-2">

                {data.seo.keywords.map(
                  (keyword, index) => (

                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600"
                    >
                      {keyword}
                    </span>

                  )
                )}

              </div>

            )}

          </div>

        </Highlight>


      </div>
    </div>
  );
}



/* ========================================================================= */
/* List Block Card                                                          */
/* ========================================================================= */

function ListBlockCard({
  title,
  items,
  accent,
  placeholder,
}: {
  title: string;
  items: string[];
  accent: string;
  placeholder: string;
}) {

  return (

    <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">

      <h3 className="text-base font-semibold tracking-tight text-[#111214]">
        {title}
      </h3>



      {items.length > 0 ? (

        <ul className="mt-3 space-y-2">

          {items.map(
            (item, index) => (

              <li
                key={index}
                className="flex gap-2 text-sm text-gray-600"
              >

                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: accent,
                  }}
                />

                <span>
                  {item}
                </span>

              </li>

            )
          )}

        </ul>

      ) : (

        <p className="mt-3 text-sm text-gray-400">
          {placeholder}
        </p>

      )}

    </div>

  );
}