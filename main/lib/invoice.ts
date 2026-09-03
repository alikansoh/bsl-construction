// lib/invoice.ts
//
// Shared, client-safe invoice types + helpers. No database imports here so
// this can be pulled into dashboard client components as well as the API.

export const COMPANY = {
  name: "BSL Construction LTD",
  addressLines: ["Flat 16, Aylesbury House", "London"],
  phone: "07378 412002",
  email: "info@bsl-construction.co.uk",
  website: "bsl-construction.co.uk",
  vatNumber: "43011658",
  logoUrl: "/logo.png",
  bank: {
    accountName: "BSL Construction Services LTD",
    sortCode: "20-92-63",
    accountNumber: "43011658",
  },
  brand: {
    // Matches the dashboard / site brass accent.
    accent: "#A26028",
    ink: "#111214",
    muted: "#6b7280",
    line: "#e5e7eb",
    soft: "#f6f4ef",
  },
} as const;

export type InvoiceStatus = "sent" | "paid";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceClient {
  name: string;
  addressLines: string[];
  email?: string;
  phone?: string;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  seq?: number;
  status: InvoiceStatus;
  issueDate: string; // ISO (yyyy-mm-dd on the form)
  dueDate: string;
  reference?: string;
  client: InvoiceClient;
  workDescription?: string;
  lineItems: InvoiceLineItem[];
  vatRate: number; // percentage, e.g. 20
  discount: number; // absolute amount off the subtotal
  notes?: string;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

/* --------------------------------------------------------------------- */

export function lineTotal(item: InvoiceLineItem): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  return round2(qty * price);
}

export function computeTotals(invoice: {
  lineItems: InvoiceLineItem[];
  vatRate: number;
  discount: number;
}): InvoiceTotals {
  const subtotal = round2(
    invoice.lineItems.reduce((sum, item) => sum + lineTotal(item), 0),
  );
  const discount = clampMoney(Number(invoice.discount) || 0, subtotal);
  const taxable = round2(subtotal - discount);
  const vatRate = Number(invoice.vatRate) || 0;
  const vatAmount = round2((taxable * vatRate) / 100);
  const total = round2(taxable + vatAmount);

  return { subtotal, discount, vatRate, vatAmount, total };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clampMoney(value: number, max: number): number {
  if (value < 0) return 0;
  if (value > max) return max;
  return round2(value);
}

/* --------------------------------------------------------------------- */

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatMoney(n: number): string {
  return GBP.format(round2(Number(n) || 0));
}

export function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** INV-0001 style — continuous, zero-padded to at least 4 digits. */
export function formatInvoiceNumber(seq: number): string {
  return `INV-${String(seq).padStart(4, "0")}`;
}

export function emptyLineItem(): InvoiceLineItem {
  return { description: "", quantity: 1, unitPrice: 0 };
}

export function emptyInvoice(): Invoice {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 14);

  return {
    invoiceNumber: "",
    status: "sent",
    issueDate: toDateInput(today),
    dueDate: toDateInput(due),
    reference: "",
    client: { name: "", addressLines: [], email: "", phone: "" },
    workDescription: "",
    lineItems: [emptyLineItem()],
    vatRate: 20,
    discount: 0,
    notes: "",
    paymentTerms: "",
  };
}

export function toDateInput(value: string | Date | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  sent: "Sent",
  paid: "Paid",
};
