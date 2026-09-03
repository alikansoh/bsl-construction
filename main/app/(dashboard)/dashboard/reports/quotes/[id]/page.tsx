"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QuoteForm from "@/components/dashboard/QuoteForm";
import { toDateInput, type Quote } from "@/lib/quote";
import { downloadQuotePdf } from "@/lib/quotePdf";

export default function EditQuotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/quotes/${id}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load quote");
        if (cancelled) return;
        setQuote({
          ...data.quote,
          date: toDateInput(data.quote.date),
          validUntil: toDateInput(data.quote.validUntil),
          client: {
            name: data.quote.client?.name ?? "",
            addressLines: data.quote.client?.addressLines ?? [],
            email: data.quote.client?.email ?? "",
            phone: data.quote.client?.phone ?? "",
          },
          sections: (data.quote.sections ?? []).map((s: Quote["sections"][number]) => ({
            title: s.title ?? "",
            bullets: s.bullets ?? [],
            note: s.note ?? "",
            price: s.price ?? 0,
          })),
        });
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

  async function save(updated: Quote): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to save quote");
      setQuote(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading…</p>;
  if (loadError || !quote)
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{loadError ?? "Quote not found."}</p>
        <Link href="/dashboard/reports/quotes" className="mt-3 inline-block text-sm text-[#a07b42]">
          ← Back to quotes
        </Link>
      </div>
    );

  return (
    <div className="min-h-full">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/reports/quotes"
            className="text-sm text-gray-500 hover:text-[#a07b42]"
          >
            ← Quotes
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111214] sm:text-3xl">
            {quote.quoteNumber}
          </h1>
        </div>
        <button
          onClick={() => router.push("/dashboard/reports/quotes")}
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

      <QuoteForm
        key={quote._id}
        initial={quote}
        mode="edit"
        onSubmit={async (q) => {
          if (await save(q)) setNotice("Saved.");
        }}
        onDownload={async (q) => {
          if (await save(q)) {
            downloadQuotePdf(q);
            setNotice("Saved & downloaded.");
          }
        }}
        saving={saving}
        error={error}
      />
    </div>
  );
}
