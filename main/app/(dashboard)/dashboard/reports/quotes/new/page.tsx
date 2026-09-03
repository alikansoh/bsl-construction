"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QuoteForm from "@/components/dashboard/QuoteForm";
import { emptyQuote, toDateInput, type Quote } from "@/lib/quote";
import { downloadQuotePdf } from "@/lib/quotePdf";

export default function NewQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Quote | null>(null);

  async function createQuote(quote: Quote): Promise<Quote | null> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.quote?._id) {
        throw new Error(data.message || "Failed to create quote");
      }
      const saved: Quote = {
        ...data.quote,
        date: toDateInput(data.quote.date),
        validUntil: toDateInput(data.quote.validUntil),
      };
      setCreated(saved);
      window.history.replaceState(null, "", `/dashboard/reports/quotes/${saved._id}`);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(quote: Quote) {
    const saved = await createQuote(quote);
    if (saved) downloadQuotePdf(saved);
  }

  if (created) {
    return (
      <div className="min-h-full">
        <Link
          href="/dashboard/reports/quotes"
          className="text-sm text-gray-500 hover:text-[#a07b42]"
        >
          ← Quotes
        </Link>
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Quote {created.quoteNumber} saved.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => downloadQuotePdf(created)}
              className="h-10 rounded-xl bg-[#a07b42] px-4 text-sm font-semibold text-white transition hover:bg-[#896735]"
            >
              Download PDF
            </button>
            <button
              onClick={() => router.push(`/dashboard/reports/quotes/${created._id}`)}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-semibold text-[#111214] transition hover:bg-black/[0.03]"
            >
              Edit quote
            </button>
            <button
              onClick={() => {
                setCreated(null);
                window.history.replaceState(null, "", "/dashboard/reports/quotes/new");
              }}
              className="h-10 rounded-xl border border-black/15 px-4 text-sm font-semibold text-[#111214] transition hover:bg-black/[0.03]"
            >
              New quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <Link
          href="/dashboard/reports/quotes"
          className="text-sm text-gray-500 hover:text-[#a07b42]"
        >
          ← Quotes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
          New quote
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          The quote number is assigned automatically when you create it.
        </p>
      </div>

      <QuoteForm
        initial={emptyQuote()}
        mode="create"
        onSubmit={async (q) => {
          await createQuote(q);
        }}
        onDownload={handleDownload}
        saving={saving}
        error={error}
      />
    </div>
  );
}
