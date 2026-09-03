"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InvoiceForm from "@/components/dashboard/InvoiceForm";
import { toDateInput, type Invoice } from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load invoice");
        if (cancelled) return;
        const inv: Invoice = {
          ...data.invoice,
          issueDate: toDateInput(data.invoice.issueDate),
          dueDate: toDateInput(data.invoice.dueDate),
          client: {
            name: data.invoice.client?.name ?? "",
            addressLines: data.invoice.client?.addressLines ?? [],
            email: data.invoice.client?.email ?? "",
            phone: data.invoice.client?.phone ?? "",
          },
        };
        setInvoice(inv);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  async function saveInvoice(updated: Invoice): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save invoice");
      setInvoice(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(updated: Invoice) {
    if (await saveInvoice(updated)) setNotice("Saved.");
  }

  async function handleDownload(updated: Invoice) {
    if (await saveInvoice(updated)) {
      downloadInvoicePdf(updated);
      setNotice("Saved & downloaded.");
    }
  }

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  if (loadError || !invoice)
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{loadError ?? "Invoice not found."}</p>
        <Link href="/dashboard/reports" className="mt-3 inline-block text-sm text-[#a07b42]">
          ← Back to invoices
        </Link>
      </div>
    );

  return (
    <div className="min-h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/dashboard/reports" className="text-sm text-gray-500 hover:text-[#a07b42]">
            ← Invoices
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
            {invoice.invoiceNumber}
          </h1>
        </div>
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-600 hover:bg-black/[0.03]"
        >
          Done
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <InvoiceForm
        key={invoice._id}
        initial={invoice}
        mode="edit"
        onSubmit={handleSubmit}
        onDownload={handleDownload}
        saving={saving}
        error={error}
      />
    </div>
  );
}
