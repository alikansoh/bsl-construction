// lib/quotePdf.ts
//
// Client-side PDF generation for a single quotation. Uses jsPDF + autotable.
// Layout mirrors the reference "Avisfor Project Quote (BSL)" document.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY, formatDate, formatMoney, quoteTotal, type Quote } from "@/lib/quote";

const ACCENT: [number, number, number] = [162, 96, 40];
const INK: [number, number, number] = [17, 18, 20];
const MUTED: [number, number, number] = [107, 114, 128];
const LINE: [number, number, number] = [214, 217, 222];
const SOFT: [number, number, number] = [245, 240, 232];

async function loadImageDataUrl(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims: { width: number; height: number } = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export async function downloadQuotePdf(quote: Quote): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  const logo = await loadImageDataUrl(COMPANY.logoUrl);

  /* --- running header, used on every page --- */
  const drawHeader = (first: boolean) => {
    const logoW = first ? 150 : 92;
    if (logo) {
      const h = Math.min((logo.height / logo.width) * logoW, first ? 58 : 34);
      doc.addImage(logo.dataUrl, "PNG", margin, first ? margin : 26, logoW, h);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(first ? 18 : 12);
      doc.setTextColor(...INK);
      doc.text(COMPANY.name, margin, first ? margin + 16 : 40);
    }

    const contactY = first ? margin + 74 : 62;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`Tel: ${COMPANY.phone}  |  Email: `, margin, contactY);
    const w = doc.getTextWidth(`Tel: ${COMPANY.phone}  |  Email: `);
    doc.setTextColor(...ACCENT);
    doc.text(COMPANY.email, margin + w, contactY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.setFontSize(first ? 17 : 12);
    doc.text(first ? "Quotation" : "QUOTATION", pageW - margin, contactY, { align: "right" });

    return contactY + (first ? 22 : 16);
  };

  let y = drawHeader(true);

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageH - 56) return;
    doc.addPage();
    y = drawHeader(false);
  };

  /* --- client / project info table --- */
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6, lineColor: LINE, lineWidth: 0.5, textColor: INK },
    columnStyles: {
      0: { cellWidth: 130, fillColor: SOFT, fontStyle: "bold", textColor: MUTED },
      1: { cellWidth: "auto" },
    },
    body: [
      ["Client", quote.client.name || "—"],
      ["Project", quote.project || "—"],
      ["Location", [quote.location, ...(quote.client.addressLines ?? [])].filter(Boolean).join(", ") || "—"],
      ["Date", formatDate(quote.date)],
      ...(quote.validUntil ? [["Valid until", formatDate(quote.validUntil)]] : []),
      ["Prepared by", quote.preparedBy || COMPANY.name],
    ],
  });
  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  y += 24;

  /* --- intro --- */
  if (quote.intro) {
    ensureSpace(40);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.splitTextToSize(quote.intro, contentW).forEach((l: string) => {
      doc.text(l, margin, y);
      y += 12;
    });
    y += 12;
  }

  /* --- Scope of works heading --- */
  ensureSpace(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Scope of works", margin, y);
  y += 8;
  doc.setDrawColor(...INK);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  /* --- sections --- */
  // Text styles. Re-applied after every ensureSpace() because a page break
  // runs drawHeader(), which leaves its own (bold / accent) font state.
  const titleStyle = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
  };
  const bulletStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
  };
  const noteStyle = () => {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
  };

  quote.sections.forEach((s, idx) => {
    ensureSpace(70);
    titleStyle();
    doc.text(s.title || `Section ${idx + 1}`, margin, y);
    y += 16;

    s.bullets.filter(Boolean).forEach((b) => {
      const lines = doc.splitTextToSize(b, contentW - 16);
      ensureSpace(lines.length * 12 + 4);
      bulletStyle();
      doc.text("•", margin + 2, y);
      lines.forEach((l: string, i: number) => {
        doc.text(l, margin + 14, y + i * 12);
      });
      y += lines.length * 12 + 3;
    });

    if (s.note) {
      y += 4;
      const noteLines = doc.splitTextToSize(s.note, contentW);
      ensureSpace(noteLines.length * 11 + 8);
      noteStyle();
      noteLines.forEach((l: string) => {
        doc.text(l, margin, y);
        y += 11;
      });
    }

    // shaded price bar
    y += 10;
    ensureSpace(28);
    doc.setFillColor(...SOFT);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 12, contentW, 24, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(s.title || `Section ${idx + 1}`, margin + 10, y + 3);
    doc.text(formatMoney(s.price), pageW - margin - 10, y + 3, { align: "right" });
    y += 24;

    // separator
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(margin + 40, y, pageW - margin - 40, y);
    y += 24;
  });

  /* --- grand total (sum of section prices, no VAT) --- */
  ensureSpace(40);
  doc.setFillColor(...ACCENT);
  doc.rect(margin, y - 12, contentW, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", margin + 12, y + 6);
  doc.text(formatMoney(quoteTotal(quote.sections)), pageW - margin - 12, y + 6, {
    align: "right",
  });
  y += 34;

  /* --- notes --- */
  if (quote.notes) {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text("NOTES", margin, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.splitTextToSize(quote.notes, contentW).forEach((l: string) => {
      doc.text(l, margin, y);
      y += 12;
    });
  }

  /* --- page footers --- */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.line(margin, pageH - 40, pageW - margin, pageH - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `${COMPANY.name}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}`,
      margin,
      pageH - 26,
    );
    doc.text(`${quote.quoteNumber || "Quotation"}  ·  Page ${p} of ${pages}`, pageW - margin, pageH - 26, {
      align: "right",
    });
  }

  doc.save(`${quote.quoteNumber || "quote"}.pdf`);
}
