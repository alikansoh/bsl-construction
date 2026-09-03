"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InvoiceForm from "@/components/dashboard/InvoiceForm";
import { emptyInvoice, toDateInput, type Invoice } from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Invoice | null>(null);

  async function createInvoice(invoice: Invoice): Promise<Invoice | null> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.invoice?._id) {
        throw new Error(data.message || "Failed to create invoice");
      }

      const saved: Invoice = {
        ...data.invoice,
        issueDate: toDateInput(data.invoice.issueDate),
        dueDate: toDateInput(data.invoice.dueDate),
      };
      setCreated(saved);
      window.history.replaceState(null, "", `/dashboard/reports/${saved._id}`);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(invoice: Invoice) {
    const saved = await createInvoice(invoice);
    if (saved) downloadInvoicePdf(saved);
  }

  if (created) {
    return (
      <div className="min-h-full">
        <Link href="/dashboard/reports" className="text-sm text-gray-500 hover:text-[#a07b42]">
          ← Invoices
        </Link>

        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Invoice {created.invoiceNumber} saved.
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            The number <strong>{created.invoiceNumber}</strong> is stored against{" "}
            {created.client.name}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => downloadInvoicePdf(created)}
              className="h-10 rounded-xl bg-[#a07b42] px-4 text-sm font-semibold text-white transition hover:bg-[#896735]"
            >
              Download PDF
            </button>
            <button
              onClick={() => router.push(`/dashboard/reports/${created._id}`)}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-semibold text-[#111214] transition hover:bg-black/[0.03]"
            >
              Edit invoice
            </button>
            <button
              onClick={() => {
                setCreated(null);
                window.history.replaceState(null, "", "/dashboard/reports/new");
              }}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-semibold text-[#111214] transition hover:bg-black/[0.03]"
            >
              New invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <Link href="/dashboard/reports" className="text-sm text-gray-500 hover:text-[#a07b42]">
          ← Invoices
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
          New invoice
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          The invoice number is assigned automatically when you create it.
        </p>
      </div>

      <InvoiceForm
        initial={emptyInvoice()}
        mode="create"
        onSubmit={async (inv) => {
          await createInvoice(inv);
        }}
        onDownload={handleDownload}
        saving={saving}
        error={error}
      />
    </div>
  );
}
