"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Service {
  _id: string;
  id?: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;

  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;

    image: {
      url: string;
      alt: string;
    };

    primaryCta: {
      label: string;
      href: string;
    };

    secondaryCta: {
      label: string;
      href: string;
    };
  };
}

interface ServicesResponse {
  success: boolean;
  services?: Service[];
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

type StatusFilter = "all" | "published" | "draft";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhancements: search + status filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Delete flow: which service is pending confirmation, and delete state
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch("/api/services", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: ServicesResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load services"
          );
        }

        if (!cancelled) {
          setServices(data.services || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load services:", error);

          setError(
            error instanceof Error
              ? error.message
              : "Something went wrong"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-dismiss the success notice after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const publishedCount = services.filter(
    (service) => service.status === "published"
  ).length;

  const draftCount = services.filter(
    (service) => service.status === "draft"
  ).length;

  const featuredCount = services.filter(
    (service) => service.featured
  ).length;

  const visibleServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus =
        statusFilter === "all" || service.status === statusFilter;

      const matchesSearch =
        term.length === 0 ||
        service.title.toLowerCase().includes(term) ||
        service.categoryName.toLowerCase().includes(term) ||
        service.slug.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [services, searchTerm, statusFilter]);

  function requestDelete(service: Service) {
    setDeleteError(null);
    setPendingDelete(service);
  }

  function cancelDelete() {
    if (deleting) return; // don't allow closing mid-request
    setPendingDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/services/${encodeURIComponent(pendingDelete.slug)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data: DeleteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service");
      }

      setServices((prev) =>
        prev.filter((service) => service.slug !== pendingDelete.slug)
      );

      setNotice(`"${pendingDelete.title}" was deleted.`);
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f6f7f9]">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a07b42]">
                Content Management
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
                Services
              </h1>

              <p className="mt-1.5 text-sm text-gray-500">
                Manage your construction and property services.
              </p>
            </div>

            <Link
              href="/dashboard/services/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#a07b42] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#896735] hover:shadow-md"
            >
              + Add Service
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Success notice                                                   */}
        {/* ---------------------------------------------------------------- */}

        {notice && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-700">{notice}</p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Statistics                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Services"
            value={services.length}
          />

          <StatCard
            label="Published"
            value={publishedCount}
          />

          <StatCard
            label="Drafts"
            value={draftCount}
          />

          <StatCard
            label="Featured"
            value={featuredCount}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Search + Filter                                                  */}
        {/* ---------------------------------------------------------------- */}

        {!loading && !error && services.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, category or slug..."
                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#111214] placeholder:text-gray-400 focus:border-[#a07b42] focus:outline-none focus:ring-2 focus:ring-[#a07b42]/20"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-1">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "published", label: "Published" },
                  { key: "draft", label: "Drafts" },
                ] as { key: StatusFilter; label: string }[]
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    statusFilter === option.key
                      ? "bg-[#111214] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                            */}
        {/* ---------------------------------------------------------------- */}

        {error && !loading && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Loading                                                          */}
        {/* ---------------------------------------------------------------- */}

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
              >
                <div className="h-56 animate-pulse bg-gray-200" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />

                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Empty (no services at all)                                       */}
        {/* ---------------------------------------------------------------- */}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a07b42]/10 text-2xl">
              🏗️
            </div>

            <h2 className="text-lg font-semibold text-[#111214]">
              No services yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first service to start managing your
              website content.
            </p>

            <Link
              href="/dashboard/services/new"
              className="mt-6 inline-flex rounded-xl bg-[#a07b42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#896735]"
            >
              Create Your First Service
            </Link>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* No results for current search/filter                            */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          !error &&
          services.length > 0 &&
          visibleServices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
              <h2 className="text-base font-semibold text-[#111214]">
                No services match your search
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try a different search term or change the status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-5 inline-flex rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#111214] transition hover:border-[#a07b42] hover:text-[#a07b42]"
              >
                Clear search & filters
              </button>
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* Services                                                         */}
        {/* ---------------------------------------------------------------- */}

        {!loading && visibleServices.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onDeleteRequest={() => requestDelete(service)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------------- */}
      {/* Delete confirmation modal                                        */}
      {/* ---------------------------------------------------------------- */}

      {pendingDelete && (
        <DeleteConfirmModal
          service={pendingDelete}
          deleting={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* Stat Card                                                                 */
/* ========================================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111214]">
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* Service Card                                                              */
/* ========================================================================= */

function ServiceCard({
  service,
  onDeleteRequest,
}: {
  service: Service;
  onDeleteRequest: () => void;
}) {
  const imageUrl = service.hero?.image?.url;

  const plainDescription = (
    service.hero?.description || service.hero?.subtitle || ""
  ).replace(/<[^>]*>/g, "").trim();

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ------------------------------------------------------------------ */}
      {/* Image                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative h-56 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              service.hero.image.alt ||
              service.title
            }
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1280px) 50vw,
              33vw
            "
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status */}
        <div className="absolute left-4 top-4 flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md ${
              service.status === "published"
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            {service.status}
          </span>

          {service.featured && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#111214] backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDeleteRequest}
          aria-label={`Delete ${service.title}`}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-red-600"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0v12a2 2 0 002 2h6a2 2 0 002-2V7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
            {service.categoryName}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#111214]">
              {service.title}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Order: {service.displayOrder}
            </p>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-gray-500">
          {plainDescription || "No description available."}
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-black/[0.06] pt-4">
          <Link
            href={`/dashboard/services/${service.slug}`}
            className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-center text-sm font-semibold text-[#111214] transition hover:border-[#a07b42] hover:bg-[#a07b42]/5 hover:text-[#a07b42]"
          >
            Edit
          </Link>

          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#111214] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            View
          </Link>

          <button
            type="button"
            onClick={onDeleteRequest}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ========================================================================= */
/* Delete Confirmation Modal                                                 */
/* ========================================================================= */

function DeleteConfirmModal({
  service,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  service: Service;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0v12a2 2 0 002 2h6a2 2 0 002-2V7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="delete-modal-title"
          className="text-lg font-semibold tracking-tight text-[#111214]"
        >
          Delete &ldquo;{service.title}&rdquo;?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          This will permanently remove this service from your website.
          This action cannot be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#111214] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Deleting...
              </>
            ) : (
              "Delete Service"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}