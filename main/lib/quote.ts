// lib/quote.ts
//
// Shared, client-safe quote types + helpers. Reuses money/date helpers and
// the COMPANY constant from lib/invoice.ts. No database imports here.

import { formatMoney, round2, toDateInput } from "@/lib/invoice";

export type QuoteStatus = "sent" | "accepted" | "declined";

export interface QuoteSection {
  title: string;
  /** one scope bullet per entry */
  bullets: string[];
  /** italic grey "these works include…" line */
  note?: string;
  price: number;
}

export interface QuoteClient {
  name: string;
  addressLines: string[];
  email?: string;
  phone?: string;
}

export interface Quote {
  _id?: string;
  quoteNumber: string;
  seq?: number;
  status: QuoteStatus;
  date: string; // yyyy-mm-dd
  validUntil?: string;
  project: string;
  location: string;
  preparedBy: string;
  client: QuoteClient;
  intro?: string;
  sections: QuoteSection[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** A quote has no VAT / invoice-style totals — just the sum of its
 *  section prices, used for the list view. */
export function quoteTotal(sections: QuoteSection[]): number {
  return round2(sections.reduce((sum, s) => sum + (Number(s.price) || 0), 0));
}

export function formatQuoteNumber(seq: number): string {
  return `QUO-${String(seq).padStart(4, "0")}`;
}

export function emptyQuoteSection(): QuoteSection {
  return { title: "", bullets: [""], note: "", price: 0 };
}

export function emptyQuote(): Quote {
  const today = new Date();
  const valid = new Date(today);
  valid.setDate(valid.getDate() + 30);

  return {
    quoteNumber: "",
    status: "sent",
    date: toDateInput(today),
    validUntil: toDateInput(valid),
    project: "",
    location: "",
    preparedBy: "",
    client: { name: "", addressLines: [], email: "", phone: "" },
    intro: "",
    sections: [emptyQuoteSection()],
    notes: "",
  };
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

// re-export so quote components only need one import
export { formatMoney };
export { formatDate } from "@/lib/invoice";
export { toDateInput } from "@/lib/invoice";
export { COMPANY } from "@/lib/invoice";
