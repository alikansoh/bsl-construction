"use client";

import { useEffect, useState } from "react";
import {
  COMPANY,
  emptyQuoteSection,
  formatMoney,
  quoteTotal,
  type Quote,
  type QuoteSection,
  type QuoteStatus,
} from "@/lib/quote";
import { downloadQuotePdf } from "@/lib/quotePdf";

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#111214] outline-none transition focus:border-[#a07b42] focus:ring-2 focus:ring-[#a07b42]/15";
const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500";

function autosize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

type SavedClient = { name: string; addressLines: string[]; email: string; phone: string };

type Props = {
  initial: Quote;
  mode: "create" | "edit";
  onSubmit: (quote: Quote) => Promise<void>;
  onDownload?: (quote: Quote) => Promise<void>;
  saving: boolean;
  error?: string | null;
};

export default function QuoteForm({ initial, mode, onSubmit, onDownload, saving, error }: Props) {
  const [quote, setQuote] = useState<Quote>(initial);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [clientOpen, setClientOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quotes/clients", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.success) setClients(data.clients ?? []);
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof Quote>(key: K, value: Quote[K]) =>
    setQuote((p) => ({ ...p, [key]: value }));
  const setClient = (patch: Partial<Quote["client"]>) =>
    setQuote((p) => ({ ...p, client: { ...p.client, ...patch } }));

  const clientQuery = quote.client.name.trim().toLowerCase();
  const clientMatches = clients
    .filter((c) => !clientQuery || c.name.toLowerCase().includes(clientQuery))
    .slice(0, 8);

  function selectClient(c: SavedClient) {
    setQuote((p) => ({
      ...p,
      client: {
        name: c.name,
        addressLines: c.addressLines.length ? c.addressLines : ["", ""],
        email: c.email,
        phone: c.phone,
      },
    }));
    setClientOpen(false);
  }

  const setSection = (i: number, patch: Partial<QuoteSection>) =>
    setQuote((p) => ({
      ...p,
      sections: p.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  const addSection = () =>
    setQuote((p) => ({ ...p, sections: [...p.sections, emptyQuoteSection()] }));
  const removeSection = (i: number) =>
    setQuote((p) => ({ ...p, sections: p.sections.filter((_, idx) => idx !== i) }));

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_300px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(quote);
      }}
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Client + project */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#111214]">Client &amp; project</h2>
          <div className="space-y-4">
            <div className="relative">
              <label className={labelCls}>Client / company name</label>
              <input
                className={inputCls}
                placeholder="Search existing clients or type a new name…"
                value={quote.client.name}
                onChange={(e) => {
                  setClient({ name: e.target.value });
                  setClientOpen(true);
                }}
                onFocus={() => setClientOpen(true)}
                onBlur={() => window.setTimeout(() => setClientOpen(false), 120)}
                onKeyDown={(e) => e.key === "Escape" && setClientOpen(false)}
                required
                autoComplete="off"
              />
              {clientOpen && clientMatches.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg">
                  {clientMatches.map((c) => (
                    <li key={c.name}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectClient(c);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-[#a07b42]/8"
                      >
                        <span className="font-medium text-[#111214]">{c.name}</span>
                        {(c.addressLines[0] || c.email) && (
                          <span className="block text-xs text-gray-400">
                            {[c.addressLines[0], c.email].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Project</label>
                <input
                  className={inputCls}
                  value={quote.project}
                  onChange={(e) => set("project", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Prepared by</label>
                <input
                  className={inputCls}
                  value={quote.preparedBy}
                  onChange={(e) => set("preparedBy", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Location / site address</label>
              <input
                className={inputCls}
                value={quote.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={quote.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Valid until</label>
                <input
                  type="date"
                  className={inputCls}
                  value={quote.validUntil ?? ""}
                  onChange={(e) => set("validUntil", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={quote.status}
                  onChange={(e) => set("status", e.target.value as QuoteStatus)}
                >
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Intro paragraph (optional)</label>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="Short paragraph shown under the client table."
                value={quote.intro ?? ""}
                onChange={(e) => set("intro", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Scope sections */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111214]">Scope of works</h2>
            <button
              type="button"
              onClick={addSection}
              className="rounded-lg border border-[#a07b42]/30 px-3 py-1.5 text-xs font-semibold text-[#a07b42] transition hover:bg-[#a07b42]/5"
            >
              + Add section
            </button>
          </div>

          <div className="space-y-5">
            {quote.sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-black/[0.08] p-4">
                <div className="mb-3 flex items-start gap-2">
                  <input
                    className={`${inputCls} font-medium`}
                    placeholder="Section title (e.g. LVT Flooring Installation)"
                    value={s.title}
                    onChange={(e) => setSection(i, { title: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    disabled={quote.sections.length === 1}
                    className="mt-2 shrink-0 text-gray-400 transition hover:text-red-500 disabled:opacity-30"
                    aria-label="Remove section"
                  >
                    ✕
                  </button>
                </div>

                <label className={labelCls}>Scope bullets — one per line</label>
                <textarea
                  ref={(el) => {
                    if (el) autosize(el);
                  }}
                  rows={3}
                  className={`${inputCls} resize-none overflow-hidden leading-snug`}
                  placeholder={"Supply and installation of…\nInstallation over ply where required.\n…"}
                  value={s.bullets.join("\n")}
                  onChange={(e) => {
                    setSection(i, { bullets: e.target.value.split("\n") });
                    autosize(e.currentTarget);
                  }}
                />

                <label className={`${labelCls} mt-3`}>Note (optional, italic grey)</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder="These works include the supply of…"
                  value={s.note ?? ""}
                  onChange={(e) => setSection(i, { note: e.target.value })}
                />

                <div className="mt-3 w-44">
                  <label className={labelCls}>Section price (£)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputCls} text-right`}
                    value={s.price}
                    onChange={(e) => setSection(i, { price: Number(e.target.value) })}
                  />
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <label className={labelCls}>Notes / terms (optional)</label>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Anything shown at the bottom of the quote."
            value={quote.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </section>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#a07b42]">
            {COMPANY.name}
          </p>
          <p className="mb-2 text-sm font-semibold text-[#111214]">
            {quote.quoteNumber || (mode === "create" ? "Number assigned on save" : "")}
          </p>
          <p className="mb-4 text-xs text-gray-400">
            {quote.sections.length} scope section{quote.sections.length === 1 ? "" : "s"}
          </p>

          <div className="mb-4 flex items-center justify-between rounded-xl bg-[#a07b42]/8 px-3 py-2.5">
            <span className="text-sm font-semibold text-[#111214]">Total</span>
            <span className="text-base font-semibold text-[#a07b42]">
              {formatMoney(quoteTotal(quote.sections))}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 h-11 w-full rounded-xl bg-[#a07b42] text-sm font-semibold text-white transition hover:bg-[#896735] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create quote" : "Save changes"}
          </button>

          <button
            type="button"
            disabled={saving || downloading}
            onClick={async () => {
              if (onDownload) {
                setDownloading(true);
                try {
                  await onDownload(quote);
                } finally {
                  setDownloading(false);
                }
              } else {
                downloadQuotePdf(quote);
              }
            }}
            className="mt-2 h-11 w-full rounded-xl border border-black/15 text-sm font-semibold text-[#111214] transition hover:bg-black/[0.03] disabled:opacity-40"
          >
            {downloading
              ? "Saving & preparing…"
              : onDownload
                ? mode === "create"
                  ? "Create & download PDF"
                  : "Save & download PDF"
                : "Download PDF"}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">Downloading saves the quote too.</p>
        </div>
      </aside>
    </form>
  );
}
