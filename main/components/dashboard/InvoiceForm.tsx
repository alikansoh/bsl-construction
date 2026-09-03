"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COMPANY,
  computeTotals,
  emptyLineItem,
  formatMoney,
  lineTotal,
  type Invoice,
  type InvoiceLineItem,
  type InvoiceStatus,
} from "@/lib/invoice";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#111214] outline-none transition focus:border-[#a07b42] focus:ring-2 focus:ring-[#a07b42]/15";
const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500";

function autosize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

type SavedClient = {
  name: string;
  addressLines: string[];
  email: string;
  phone: string;
};

type Props = {
  initial: Invoice;
  mode: "create" | "edit";
  onSubmit: (invoice: Invoice) => Promise<void>;
  /** Save the invoice, then download its PDF. Falls back to a plain
   *  client-side download when not provided. */
  onDownload?: (invoice: Invoice) => Promise<void>;
  saving: boolean;
  error?: string | null;
};

export default function InvoiceForm({
  initial,
  mode,
  onSubmit,
  onDownload,
  saving,
  error,
}: Props) {
  const [invoice, setInvoice] = useState<Invoice>(initial);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [clientOpen, setClientOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const totals = useMemo(() => computeTotals(invoice), [invoice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/invoices/clients", {
          credentials: "include",
          cache: "no-store",
        });
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

  const set = <K extends keyof Invoice>(key: K, value: Invoice[K]) =>
    setInvoice((prev) => ({ ...prev, [key]: value }));

  const setClient = (patch: Partial<Invoice["client"]>) =>
    setInvoice((prev) => ({ ...prev, client: { ...prev.client, ...patch } }));

  const clientQuery = invoice.client.name.trim().toLowerCase();
  const clientMatches = clients
    .filter((c) => !clientQuery || c.name.toLowerCase().includes(clientQuery))
    .slice(0, 8);

  function selectClient(c: SavedClient) {
    setInvoice((prev) => ({
      ...prev,
      client: {
        name: c.name,
        addressLines: c.addressLines.length ? c.addressLines : ["", ""],
        email: c.email,
        phone: c.phone,
      },
    }));
    setClientOpen(false);
  }

  const setItem = (i: number, patch: Partial<InvoiceLineItem>) =>
    setInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    }));

  const addItem = () =>
    setInvoice((prev) => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));

  const removeItem = (i: number) =>
    setInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, idx) => idx !== i),
    }));

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_300px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(invoice);
      }}
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Client */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#111214]">Client</h2>

          <div className="space-y-4">
            <div className="relative">
              <label className={labelCls}>Client / company name</label>
              <input
                className={inputCls}
                placeholder="Search existing clients or type a new name…"
                value={invoice.client.name}
                onChange={(e) => {
                  setClient({ name: e.target.value });
                  setClientOpen(true);
                }}
                onFocus={() => setClientOpen(true)}
                onBlur={() => window.setTimeout(() => setClientOpen(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setClientOpen(false);
                }}
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

              {clients.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Start typing to search saved clients — pick one to auto-fill their details.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div>
                <label className={labelCls}>Street address</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 12 Temple Street, London"
                  value={invoice.client.addressLines?.[0] ?? ""}
                  onChange={(e) =>
                    setClient({
                      addressLines: [
                        e.target.value,
                        invoice.client.addressLines?.[1] ?? "",
                      ],
                    })
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Postcode</label>
                <input
                  className={inputCls}
                  placeholder="LD1 5DY"
                  value={invoice.client.addressLines?.[1] ?? ""}
                  onChange={(e) =>
                    setClient({
                      addressLines: [
                        invoice.client.addressLines?.[0] ?? "",
                        e.target.value,
                      ],
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Email (optional)</label>
                <input
                  type="email"
                  className={inputCls}
                  value={invoice.client.email ?? ""}
                  onChange={(e) => setClient({ email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input
                  className={inputCls}
                  value={invoice.client.phone ?? ""}
                  onChange={(e) => setClient({ phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dates + status */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Issue date</label>
              <input
                type="date"
                className={inputCls}
                value={invoice.issueDate}
                onChange={(e) => set("issueDate", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input
                type="date"
                className={inputCls}
                value={invoice.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={invoice.status}
                onChange={(e) => set("status", e.target.value as InvoiceStatus)}
              >
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </section>

        {/* Line items */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111214]">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-[#a07b42]/30 px-3 py-1.5 text-xs font-semibold text-[#a07b42] transition hover:bg-[#a07b42]/5"
            >
              + Add line
            </button>
          </div>

          <div className="hidden grid-cols-[1fr_64px_100px_100px_28px] gap-2 px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:grid">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit £</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          <div className="space-y-2">
            {invoice.lineItems.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_64px_100px_100px_28px] items-start gap-2"
              >
                <textarea
                  ref={(el) => {
                    if (el) autosize(el);
                  }}
                  rows={1}
                  className={`${inputCls} resize-none overflow-hidden leading-snug`}
                  placeholder="Description of works — type as much as you need, the box grows"
                  value={item.description}
                  onChange={(e) => {
                    setItem(i, { description: e.target.value });
                    autosize(e.currentTarget);
                  }}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${inputCls} px-2 text-right`}
                  value={item.quantity}
                  onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={`${inputCls} px-2 text-right`}
                  value={item.unitPrice}
                  onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
                />
                <div className="py-2 text-right text-sm font-medium text-[#111214]">
                  {formatMoney(lineTotal(item))}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={invoice.lineItems.length === 1}
                  className="mt-2.5 text-gray-400 transition hover:text-red-500 disabled:opacity-30"
                  aria-label="Remove line"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 w-40">
            <label className={labelCls}>VAT rate (%)</label>
            <input
              type="number"
              min={0}
              step="0.5"
              className={inputCls}
              value={invoice.vatRate}
              onChange={(e) => set("vatRate", Number(e.target.value))}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <label className={labelCls}>Description of works / notes (optional)</label>
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Anything that should appear under the items on the invoice."
            value={invoice.workDescription ?? ""}
            onChange={(e) => set("workDescription", e.target.value)}
          />
        </section>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#a07b42]">
            {COMPANY.name}
          </p>
          <p className="mb-4 text-sm font-semibold text-[#111214]">
            {invoice.invoiceNumber || (mode === "create" ? "Number assigned on save" : "")}
          </p>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <dt>Subtotal</dt>
              <dd className="font-medium text-[#111214]">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gray-500">
              <dt>VAT ({totals.vatRate}%)</dt>
              <dd className="font-medium text-[#111214]">{formatMoney(totals.vatAmount)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-[#111214]">
              <dt>Total due</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 h-11 w-full rounded-xl bg-[#a07b42] text-sm font-semibold text-white transition hover:bg-[#896735] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create invoice" : "Save changes"}
          </button>

          <button
            type="button"
            disabled={saving || downloading}
            onClick={async () => {
              if (onDownload) {
                setDownloading(true);
                try {
                  await onDownload(invoice);
                } finally {
                  setDownloading(false);
                }
              } else {
                downloadInvoicePdf(invoice);
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
          <p className="mt-2 text-center text-xs text-gray-400">
            Downloading saves the invoice too.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#a07b42]">
            Payment details (on the PDF)
          </p>
          <dl className="space-y-1.5 text-gray-500">
            <div className="flex justify-between gap-3">
              <dt>Account name</dt>
              <dd className="text-right font-medium text-[#111214]">
                {COMPANY.bank.accountName}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Sort code</dt>
              <dd className="font-medium text-[#111214]">{COMPANY.bank.sortCode}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Account number</dt>
              <dd className="font-medium text-[#111214]">{COMPANY.bank.accountNumber}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </form>
  );
}
