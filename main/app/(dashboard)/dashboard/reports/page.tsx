"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReportsTabs from "@/components/dashboard/ReportsTabs";
import {
  computeTotals,
  formatDate,
  formatMoney,
  INVOICE_STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

type Row = Invoice & { _id: string; totals?: ReturnType<typeof computeTotals> };

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  sent: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
};

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/invoices", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load invoices");
        if (!cancelled) setInvoices(data.invoices ?? []);
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
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchTerm =
        !term ||
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.client.name.toLowerCase().includes(term) ||
        (inv.reference ?? "").toLowerCase().includes(term);
      return matchStatus && matchTerm;
    });
  }, [invoices, search, statusFilter]);

  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.totals?.total ?? computeTotals(i).total), 0);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${pendingDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
      setInvoices((prev) => prev.filter((i) => i._id !== pendingDelete._id));
      setNotice(`${pendingDelete.invoiceNumber} deleted.`);
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
            Invoices
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Create, download and track invoices. Numbers are assigned automatically.
          </p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#a07b42] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#896735]"
        >
          + New invoice
        </Link>
      </header>

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Total invoices" value={String(invoices.length)} />
        <Stat label="Unpaid" value={String(invoices.filter((i) => i.status !== "paid").length)} />
        <Stat label="Outstanding" value={formatMoney(outstanding)} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="h-10 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#a07b42]"
          placeholder="Search number, client or reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#a07b42]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | InvoiceStatus)}
        >
          <option value="all">All statuses</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
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
              {invoices.length === 0 ? "No invoices yet." : "No invoices match your filters."}
            </p>
            {invoices.length === 0 && (
              <Link
                href="/dashboard/reports/new"
                className="mt-3 inline-block text-sm font-semibold text-[#a07b42] hover:underline"
              >
                Create your first invoice →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-black/[0.06] bg-[#faf9f7] text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Issued</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {visible.map((inv) => {
                const totals = inv.totals ?? computeTotals(inv);
                return (
                  <tr key={inv._id} className="hover:bg-black/[0.015]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/reports/${inv._id}`}
                        className="font-semibold text-[#111214] hover:text-[#a07b42]"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      {inv.reference && (
                        <span className="block text-xs text-gray-400">{inv.reference}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.client.name}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#111214]">
                      {formatMoney(totals.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[inv.status]}`}
                      >
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadInvoicePdf(inv)}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#a07b42] hover:text-[#a07b42]"
                        >
                          PDF
                        </button>
                        <Link
                          href={`/dashboard/reports/${inv._id}`}
                          className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#a07b42] hover:text-[#a07b42]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setPendingDelete(inv)}
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
              Delete {pendingDelete.invoiceNumber}?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              This permanently removes the invoice for {pendingDelete.client.name}. The number is
              not reused.
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#111214]">{value}</p>
    </div>
  );
}
