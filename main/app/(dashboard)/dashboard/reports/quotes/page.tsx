"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReportsTabs from "@/components/dashboard/ReportsTabs";
import {
  quoteTotal,
  formatDate,
  formatMoney,
  QUOTE_STATUS_LABELS,
  type Quote,
  type QuoteStatus,
} from "@/lib/quote";
import { downloadQuotePdf } from "@/lib/quotePdf";

type Row = Quote & { _id: string; total?: number };

const STATUS_STYLES: Record<QuoteStatus, string> = {
  sent: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-gray-100 text-gray-500",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quotes", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load quotes");
        if (!cancelled) setQuotes(data.quotes ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((q) => {
      const matchStatus = statusFilter === "all" || q.status === statusFilter;
      const matchTerm =
        !term ||
        q.quoteNumber.toLowerCase().includes(term) ||
        q.client.name.toLowerCase().includes(term) ||
        (q.project ?? "").toLowerCase().includes(term);
      return matchStatus && matchTerm;
    });
  }, [quotes, search, statusFilter]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotes/${pendingDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setQuotes((prev) => prev.filter((q) => q._id !== pendingDelete._id));
      setNotice(`${pendingDelete.quoteNumber} deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full">
      <ReportsTabs />

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#a07b42]">
            Reports
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
            Quotes
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Build scoped quotations. Numbers are assigned automatically.
          </p>
        </div>
        <Link
          href="/dashboard/reports/quotes/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#a07b42] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#896735]"
        >
          + New quote
        </Link>
      </header>

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="h-10 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#a07b42]"
          placeholder="Search number, client or project…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#a07b42]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | QuoteStatus)}
        >
          <option value="all">All statuses</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              {quotes.length === 0 ? "No quotes yet." : "No quotes match your filters."}
            </p>
            {quotes.length === 0 && (
              <Link
                href="/dashboard/reports/quotes/new"
                className="mt-3 inline-block text-sm font-semibold text-[#a07b42] hover:underline"
              >
                Create your first quote →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-black/[0.06] bg-[#faf9f7] text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {visible.map((q) => {
                const total = q.total ?? quoteTotal(q.sections);
                return (
                  <tr key={q._id} className="hover:bg-black/[0.015]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/reports/quotes/${q._id}`}
                        className="font-semibold text-[#111214] hover:text-[#a07b42]"
                      >
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{q.client.name}</td>
                    <td className="px-4 py-3 text-gray-500">{q.project || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(q.date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#111214]">
                      {formatMoney(total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[q.status]}`}
                      >
                        {QUOTE_STATUS_LABELS[q.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadQuotePdf(q)}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#a07b42] hover:text-[#a07b42]"
                        >
                          PDF
                        </button>
                        <Link
                          href={`/dashboard/reports/quotes/${q._id}`}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#a07b42] hover:text-[#a07b42]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setPendingDelete(q)}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-[#111214]">
              Delete {pendingDelete.quoteNumber}?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              This permanently removes the quote for {pendingDelete.client.name}.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => !deleting && setPendingDelete(null)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
