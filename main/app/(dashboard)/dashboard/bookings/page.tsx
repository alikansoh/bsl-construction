"use client";

import { useEffect, useMemo, useState } from "react";

interface Booking {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: "new" | "contacted" | "completed";
  createdAt: string;
}

interface BookingsResponse {
  success: boolean;
  bookings?: Booking[];
  message?: string;
}

interface MutateResponse {
  success: boolean;
  booking?: Booking;
  message?: string;
}

type StatusFilter = "all" | "new" | "contacted" | "completed";
type SortOrder = "newest" | "oldest";
type BookingStatus = Booking["status"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const [pendingDelete, setPendingDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail modal — store only the id; derive the booking object below so it
  // always reflects the latest data without needing an effect.
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: BookingsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        if (!cancelled) {
          setBookings(data.bookings || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load bookings:", error);
          setError(
            error instanceof Error ? error.message : "Something went wrong"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!copiedId) return;
    const timeout = setTimeout(() => setCopiedId(null), 1800);
    return () => clearTimeout(timeout);
  }, [copiedId]);

  const activeBooking = useMemo(
    () => bookings.find((b) => b._id === activeBookingId) ?? null,
    [bookings, activeBookingId]
  );

  const newCount = bookings.filter((b) => b.status === "new").length;
  const contactedCount = bookings.filter((b) => b.status === "contacted").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const visibleBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const matchesSearch =
        term.length === 0 ||
        booking.name.toLowerCase().includes(term) ||
        booking.email.toLowerCase().includes(term) ||
        (booking.service || "").toLowerCase().includes(term) ||
        (booking.phone || "").toLowerCase().includes(term) ||
        booking.message.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [bookings, searchTerm, statusFilter, sortOrder]);

  function requestDelete(booking: Booking) {
    setDeleteError(null);
    setPendingDelete(booking);
  }

  function cancelDelete() {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(pendingDelete._id)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data: MutateResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete booking");
      }

      setBookings((prev) =>
        prev.filter((booking) => booking._id !== pendingDelete._id)
      );

      setNotice(`Booking from "${pendingDelete.name}" was deleted.`);
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setDeleting(false);
    }
  }

  async function updateStatus(booking: Booking, status: BookingStatus): Promise<void> {
    setUpdatingId(booking._id);

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(booking._id)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data: MutateResponse = await response.json();

      if (!response.ok || !data.success || !data.booking) {
        throw new Error(data.message || "Failed to update booking");
      }

      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? data.booking! : b))
      );
    } catch (error) {
      console.error("Failed to update booking:", error);
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Wraps the async updateStatus call so the handler passed to JSX props is
  // typed as `(status: BookingStatus) => void`, not `Promise<void>`.
  function handleStatusChange(booking: Booking, status: BookingStatus): void {
    void updateStatus(booking, status);
  }

  function copyEmail(booking: Booking) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(booking.email).catch(() => {});
    }
    setCopiedId(booking._id);
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "all";

  return (
    <div className="min-h-full bg-[#f6f7f9]">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a07b42]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a07b42]" />
              Content Management
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
                Bookings
              </h1>

              {newCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                  {newCount} new enquir{newCount === 1 ? "y" : "ies"}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm text-gray-500">
              Enquiries submitted through the Contact Us form.
            </p>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {notice && (
          <div className="mb-6 flex animate-[fadeIn_0.25s_ease] items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-sm font-medium text-emerald-800">{notice}</p>
            </div>

            <button
              type="button"
              onClick={() => setNotice(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Bookings"
            value={bookings.length}
            accent="border-l-[#111214]"
            icon={<InboxIcon />}
          />
          <StatCard
            label="New"
            value={newCount}
            accent="border-l-blue-500"
            icon={<SparkIcon />}
            highlight={newCount > 0}
          />
          <StatCard
            label="Contacted"
            value={contactedCount}
            accent="border-l-amber-500"
            icon={<ChatIcon />}
          />
          <StatCard
            label="Completed"
            value={completedCount}
            accent="border-l-emerald-500"
            icon={<CheckCircleIcon />}
          />
        </div>

        {/* Search + Filter + Sort */}
        {!loading && !error && bookings.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, service..."
                className="h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] pl-10 pr-4 text-sm text-[#111214] placeholder:text-gray-400 focus:border-[#a07b42] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a07b42]/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-black/10 bg-[#fafafa] p-1">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "new", label: "New" },
                    { key: "contacted", label: "Contacted" },
                    { key: "completed", label: "Completed" },
                  ] as { key: StatusFilter; label: string }[]
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatusFilter(option.key)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      statusFilter === option.key
                        ? "bg-[#111214] text-white shadow-sm"
                        : "text-gray-500 hover:bg-black/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="h-[38px] rounded-xl border border-black/10 bg-[#fafafa] px-3 text-xs font-semibold text-gray-600 focus:border-[#a07b42] focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </span>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm"
              >
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a07b42]/10 text-2xl">
              📬
            </div>

            <h2 className="text-lg font-semibold text-[#111214]">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Enquiries submitted through the Contact Us form will appear
              here as soon as someone reaches out.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          bookings.length > 0 &&
          visibleBookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
              <h2 className="text-base font-semibold text-[#111214]">
                No bookings match your search
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try a different search term or change the status filter.
              </p>

              {hasActiveFilters && (
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
              )}
            </div>
          )}

        {!loading && visibleBookings.length > 0 && (
          <>
            <p className="mb-3 text-xs font-medium text-gray-400">
              Showing {visibleBookings.length} of {bookings.length} booking
              {bookings.length === 1 ? "" : "s"}
            </p>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  updating={updatingId === booking._id}
                  copied={copiedId === booking._id}
                  onOpen={() => setActiveBookingId(booking._id)}
                  onStatusChange={(status) => handleStatusChange(booking, status)}
                  onDeleteRequest={() => requestDelete(booking)}
                  onCopyEmail={() => copyEmail(booking)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {activeBooking && (
        <BookingDetailModal
          booking={activeBooking}
          updating={updatingId === activeBooking._id}
          copied={copiedId === activeBooking._id}
          onClose={() => setActiveBookingId(null)}
          onStatusChange={(status) => handleStatusChange(activeBooking, status)}
          onCopyEmail={() => copyEmail(activeBooking)}
          onDeleteRequest={() => {
            setActiveBookingId(null);
            requestDelete(activeBooking);
          }}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          booking={pendingDelete}
          deleting={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ========================================================================= */
/* Icons                                                                     */
/* ========================================================================= */

function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h4l1.5 3h5L16 12h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5h14l1.5 7v6a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18v-6L5 5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 12.3l2.3 2.3 4.7-4.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-1 2-2 2-7 0-13.5-6.5-13.5-13.5 0-1 1-2 2-2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.5 6.5L12 12.5l7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-8 0v12a2 2 0 002 2h6a2 2 0 002-2V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ========================================================================= */
/* Stat Card                                                                 */
/* ========================================================================= */

function StatCard({
  label,
  value,
  accent,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-l-4 border-black/[0.06] bg-white p-5 shadow-sm transition hover:shadow-md ${accent}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            highlight ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111214]">
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* Helpers                                                                   */
/* ========================================================================= */

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  let value = seconds;
  const units = ["s", "m", "h", "d"];
  let unitIndex = 0;

  const divisors = [60, 60, 24, 7];
  for (let i = 0; i < divisors.length; i++) {
    if (value < divisors[i]) break;
    value = Math.floor(value / divisors[i]);
    unitIndex++;
  }

  if (unitIndex === 0) return "just now";
  if (unitIndex >= units.length) {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return `${value}${units[unitIndex]} ago`;
}

function formatFullDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string) {
  const sum = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/* ========================================================================= */
/* Booking Card                                                              */
/* ========================================================================= */

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: "bg-blue-500/90 text-white",
  contacted: "bg-amber-500/90 text-white",
  completed: "bg-emerald-500/90 text-white",
};

const STATUS_DOT: Record<BookingStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  completed: "bg-emerald-500",
};

interface BookingCardProps {
  booking: Booking;
  updating: boolean;
  copied: boolean;
  onOpen: () => void;
  onStatusChange: (status: BookingStatus) => void;
  onDeleteRequest: () => void;
  onCopyEmail: () => void;
}

function BookingCard({
  booking,
  updating,
  copied,
  onOpen,
  onStatusChange,
  onDeleteRequest,
  onCopyEmail,
}: BookingCardProps) {
  const isLongMessage = booking.message.length > 140;
  void copied; // reserved for future inline copy feedback on the card itself
  void onCopyEmail;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        booking.status === "new"
          ? "border-blue-200 ring-1 ring-blue-100"
          : "border-black/[0.06]"
      }`}
    >
      {updating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#a07b42]/30 border-t-[#a07b42]" />
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        className="block w-full p-5 text-left"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold ${avatarColor(
                booking.name
              )}`}
            >
              {getInitials(booking.name)}
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-[#111214]">
                {booking.name}
              </h2>
              <span className="block truncate text-xs text-gray-400">
                {booking.email}
              </span>
            </div>
          </div>

          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[booking.status]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {booking.status}
          </span>
        </div>

        {(booking.service || booking.phone) && (
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {booking.service && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#a07b42]">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
                {booking.service}
              </span>
            )}
            {booking.phone && (
              <span className="text-xs text-gray-400">{booking.phone}</span>
            )}
          </div>
        )}

        <p className={`text-sm leading-6 text-gray-500 ${isLongMessage ? "line-clamp-2" : "line-clamp-3"}`}>
          {booking.message}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {timeAgo(booking.createdAt)}
        </p>
      </button>

      <div className="flex items-center gap-2 border-t border-black/[0.06] p-5 pt-4">
        <select
          value={booking.status}
          disabled={updating}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(e.target.value as BookingStatus)}
          className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-[#111214] transition hover:border-[#a07b42]/40 focus:border-[#a07b42] focus:outline-none disabled:opacity-60"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="completed">Completed</option>
        </select>

        {booking.phone && (
          <a
            href={telHref(booking.phone)}
            onClick={(e) => e.stopPropagation()}
            title="Call"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700"
          >
            <PhoneIcon />
          </a>
        )}

        <a
          href={`mailto:${booking.email}`}
          onClick={(e) => e.stopPropagation()}
          title="Reply by email"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#111214] text-white transition hover:bg-black"
        >
          <MailIcon />
        </a>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest();
          }}
          title="Delete booking"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:border-red-400 hover:bg-red-50"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

/* ========================================================================= */
/* Booking Detail Modal                                                      */
/* ========================================================================= */

interface BookingDetailModalProps {
  booking: Booking;
  updating: boolean;
  copied: boolean;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
  onCopyEmail: () => void;
  onDeleteRequest: () => void;
}

function BookingDetailModal({
  booking,
  updating,
  copied,
  onClose,
  onStatusChange,
  onCopyEmail,
  onDeleteRequest,
}: BookingDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[calc(100vh-4rem)] w-full max-w-lg animate-[fadeIn_0.2s_ease] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {updating && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#a07b42]/30 border-t-[#a07b42]" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-6 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-12 w-12 flex-none items-center justify-center rounded-full text-base font-semibold ${avatarColor(
                booking.name
              )}`}
            >
              {getInitials(booking.name)}
            </span>

            <div className="min-w-0">
              <h2
                id="booking-modal-title"
                className="truncate text-lg font-semibold tracking-tight text-[#111214]"
              >
                {booking.name}
              </h2>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[booking.status]}`}
              >
                {booking.status}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <dl className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#fafafa] px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <MailIcon className="h-4 w-4 flex-none text-gray-400" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Email
                  </dt>
                  <dd className="truncate text-sm font-medium text-[#111214]">
                    {booking.email}
                  </dd>
                </div>
              </div>
              <button
                type="button"
                onClick={onCopyEmail}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#a07b42] transition hover:bg-[#a07b42]/10"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {booking.phone && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#fafafa] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <PhoneIcon className="h-4 w-4 flex-none text-gray-400" />
                  <div className="min-w-0">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Phone
                    </dt>
                    <dd className="truncate text-sm font-medium text-[#111214]">
                      {booking.phone}
                    </dd>
                  </div>
                </div>
                <a
                  href={telHref(booking.phone)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  Call
                </a>
              </div>
            )}

            {booking.service && (
              <div className="rounded-xl bg-[#fafafa] px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Service needed
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-[#a07b42]">
                  {booking.service}
                </dd>
              </div>
            )}

            <div className="rounded-xl bg-[#fafafa] px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Message
              </dt>
              <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#111214]">
                {booking.message}
              </dd>
            </div>

            <div className="rounded-xl bg-[#fafafa] px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Submitted
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-[#111214]">
                {formatFullDate(booking.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Status
              </dt>
              <select
                value={booking.status}
                disabled={updating}
                onChange={(e) => onStatusChange(e.target.value as BookingStatus)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-[#111214] focus:border-[#a07b42] focus:outline-none disabled:opacity-60"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </dl>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 border-t border-black/[0.06] p-6 pt-4">
          {booking.phone && (
            <a
              href={telHref(booking.phone)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <PhoneIcon />
              Call
            </a>
          )}

          <a
            href={`mailto:${booking.email}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#111214] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            <MailIcon />
            Email
          </a>

          <button
            type="button"
            onClick={onDeleteRequest}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Delete Confirmation Modal                                                 */
/* ========================================================================= */

interface DeleteConfirmModalProps {
  booking: Booking;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  booking,
  deleting,
  error,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
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
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-[fadeIn_0.2s_ease] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TrashIcon className="h-5 w-5" />
        </div>

        <h2 id="delete-modal-title" className="text-lg font-semibold tracking-tight text-[#111214]">
          Delete booking from &ldquo;{booking.name}&rdquo;?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          This will permanently remove this booking enquiry. This action
          cannot be undone.
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
              "Delete Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}