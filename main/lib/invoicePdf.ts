// lib/invoicePdf.ts
//
// Client-side PDF generation for a single invoice. Uses jsPDF + autotable.
// Call downloadInvoicePdf(invoice) from a dashboard client component.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  COMPANY,
  computeTotals,
  formatDate,
  formatMoney,
  lineTotal,
  INVOICE_STATUS_LABELS,
  type Invoice,
} from "@/lib/invoice";

const ACCENT: [number, number, number] = [162, 96, 40]; // #A26028
const INK: [number, number, number] = [17, 18, 20]; // #111214
const MUTED: [number, number, number] = [107, 114, 128]; // #6b7280
const LINE: [number, number, number] = [229, 231, 235]; // #e5e7eb
const SOFT: [number, number, number] = [246, 244, 239]; // #f6f4ef

async function loadImageDataUrl(url: string): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims: { width: number; height: number } = await new Promise(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;

  /* ---- brand corner accent (top-left) ---- */
  doc.setFillColor(...ACCENT);
  doc.triangle(0, 0, 150, 0, 0, 90, "F");
  doc.setFillColor(232, 197, 153);
  doc.triangle(0, 0, 96, 0, 0, 58, "F");

  /* ---- logo ---- */
  let headerBottom = margin + 8;
  const logo = await loadImageDataUrl(COMPANY.logoUrl);
  if (logo) {
    const logoW = 150;
    const logoH = (logo.height / logo.width) * logoW;
    doc.addImage(logo.dataUrl, "PNG", margin, margin, logoW, Math.min(logoH, 60));
    headerBottom = margin + Math.min(logoH, 60);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...INK);
    doc.text(COMPANY.name, margin, margin + 18);
    headerBottom = margin + 26;
  }

  /* ---- INVOICE title + number block (right) ---- */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...ACCENT);
  doc.text("INVOICE", pageW - margin, margin + 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  const metaRows: Array<[string, string]> = [
    ["Invoice No", invoice.invoiceNumber || "—"],
    ["Issue date", formatDate(invoice.issueDate)],
    ["Due date", formatDate(invoice.dueDate)],
    ["Status", INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status],
  ];
  if (invoice.reference) metaRows.push(["Reference", invoice.reference]);

  let my = margin + 40;
  metaRows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${k}:`, pageW - margin - 150, my, { align: "left" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(String(v), pageW - margin, my, { align: "right" });
    my += 15;
  });

  /* ---- From / Bill To ---- */
  let y = Math.max(headerBottom, my) + 26;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  const colGap = 28;
  const colW = (contentW - colGap) / 2;

  const fromLines = [
    COMPANY.name,
    ...COMPANY.addressLines,
    COMPANY.phone,
    COMPANY.email,
    `VAT number: ${COMPANY.vatNumber}`,
  ];
  const toLines = [
    invoice.client.name || "—",
    ...(invoice.client.addressLines ?? []).filter(Boolean),
    ...(invoice.client.email ? [invoice.client.email] : []),
    ...(invoice.client.phone ? [invoice.client.phone] : []),
  ];

  const blockLabel = (label: string, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(label.toUpperCase(), x, y);
  };
  blockLabel("From", margin);
  blockLabel("Bill to", margin + colW + colGap);

  doc.setFontSize(10);
  const drawLines = (lines: string[], x: number) => {
    let ly = y + 16;
    lines.forEach((line, i) => {
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      doc.setTextColor(...(i === 0 ? INK : MUTED));
      doc.splitTextToSize(line, colW).forEach((wrapped: string) => {
        doc.text(wrapped, x, ly);
        ly += 13;
      });
    });
    return ly;
  };
  const leftEnd = drawLines(fromLines, margin);
  const rightEnd = drawLines(toLines, margin + colW + colGap);
  y = Math.max(leftEnd, rightEnd) + 12;

  /* ---- work description ---- */
  if (invoice.workDescription) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text("DESCRIPTION OF WORKS", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.splitTextToSize(invoice.workDescription, contentW).forEach((line: string) => {
      doc.text(line, margin, y);
      y += 13;
    });
    y += 10;
  }

  /* ---- line items table ---- */
  const totals = computeTotals(invoice);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Description", "Qty", "Unit price", "Line total"]],
    body: invoice.lineItems.map((it) => [
      it.description || "—",
      String(it.quantity ?? 0),
      formatMoney(it.unitPrice ?? 0),
      formatMoney(lineTotal(it)),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 8,
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [45, 49, 56],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: SOFT },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 50, halign: "right" },
      2: { cellWidth: 90, halign: "right" },
      3: { cellWidth: 90, halign: "right" },
    },
  });

  const afterTable = (doc as unknown as { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY;
  y = (afterTable ?? y) + 18;

  /* ---- totals ---- */
  const totalsX = pageW - margin - 240;
  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(label, totalsX, y);
    doc.setTextColor(...INK);
    doc.text(value, pageW - margin, y, { align: "right" });
    y += bold ? 20 : 16;
  };

  totalRow("Subtotal", formatMoney(totals.subtotal));
  if (totals.discount > 0) totalRow("Discount", `- ${formatMoney(totals.discount)}`);
  totalRow(`VAT (${totals.vatRate}%)`, formatMoney(totals.vatAmount));

  doc.setDrawColor(...LINE);
  doc.line(totalsX, y - 6, pageW - margin, y - 6);
  y += 4;

  doc.setFillColor(...SOFT);
  doc.rect(totalsX - 10, y - 14, pageW - margin - totalsX + 10, 26, "F");
  totalRow("Total due", formatMoney(totals.total), true);
  y += 14;

  /* ---- notes / payment terms ---- */
  const footerBlock = (label: string, text: string) => {
    if (!text) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(label.toUpperCase(), margin, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.splitTextToSize(text, contentW).forEach((line: string) => {
      doc.text(line, margin, y);
      y += 12;
    });
    y += 10;
  };

  /* ---- payment details ---- */
  const boxW = contentW;
  const boxTop = y;
  doc.setFillColor(...SOFT);
  doc.setDrawColor(...LINE);
  doc.roundedRect(margin, boxTop, boxW, 74, 4, 4, "FD");

  let py = boxTop + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("PAYMENT DETAILS", margin + 14, py);
  py += 15;

  doc.setFontSize(9.5);
  const bankRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, margin + 14, py);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(value, margin + 120, py);
    py += 14;
  };
  bankRow("Account name", COMPANY.bank.accountName);
  bankRow("Sort code", COMPANY.bank.sortCode);
  bankRow("Account number", COMPANY.bank.accountNumber);

  y = boxTop + 74 + 16;

  footerBlock("Notes", invoice.notes ?? "");

  /* ---- page footer ---- */
  const footY = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(...LINE);
  doc.line(margin, footY - 10, pageW - margin, footY - 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `${COMPANY.name}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}  ·  ${COMPANY.website}`,
    pageW / 2,
    footY,
    { align: "center" },
  );

  doc.save(`${invoice.invoiceNumber || "invoice"}.pdf`);
}
