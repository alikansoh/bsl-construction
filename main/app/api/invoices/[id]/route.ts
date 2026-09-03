import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { verifyToken } from "@/lib/auth";
import { computeTotals } from "@/lib/invoice";

export const dynamic = "force-dynamic";

function getToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  return cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];
}

function authed(request: Request) {
  const token = getToken(request);
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "editor") return null;
  return user;
}

// GET /api/invoices/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: { ...invoice, totals: computeTotals({ lineItems: invoice.lineItems, vatRate: invoice.vatRate, discount: invoice.discount }) },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// PUT /api/invoices/[id] — the invoice number / seq can't be changed here
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    if (body.status === "sent" || body.status === "paid") {
      invoice.status = body.status;
    }
    if (body.issueDate) invoice.issueDate = new Date(body.issueDate);
    if (body.dueDate) invoice.dueDate = new Date(body.dueDate);
    if (body.reference !== undefined) invoice.reference = String(body.reference).trim();

    if (body.client) {
      invoice.client = {
        name: String(body.client.name ?? invoice.client.name).trim(),
        addressLines: Array.isArray(body.client.addressLines)
          ? body.client.addressLines.map((l: unknown) => String(l ?? "").trim()).filter(Boolean)
          : invoice.client.addressLines,
        email: String(body.client.email ?? invoice.client.email ?? "").trim(),
        phone: String(body.client.phone ?? invoice.client.phone ?? "").trim(),
      };
    }

    if (body.workDescription !== undefined) {
      invoice.workDescription = String(body.workDescription).trim();
    }

    if (Array.isArray(body.lineItems)) {
      invoice.lineItems = body.lineItems.map((li: Record<string, unknown>) => ({
        description: String(li.description ?? "").trim(),
        quantity: Number(li.quantity) || 0,
        unitPrice: Number(li.unitPrice) || 0,
      }));
    }

    if (body.vatRate !== undefined) invoice.vatRate = Number(body.vatRate) || 0;
    if (body.discount !== undefined) invoice.discount = Number(body.discount) || 0;
    if (body.notes !== undefined) invoice.notes = String(body.notes).trim();
    if (body.paymentTerms !== undefined) invoice.paymentTerms = String(body.paymentTerms).trim();

    invoice.markModified("client");
    invoice.markModified("lineItems");

    await invoice.save();

    revalidatePath("/dashboard/reports");
    revalidatePath(`/dashboard/reports/${id}`);

    return NextResponse.json({ success: true, message: "Invoice updated", invoice });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/invoices/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = authed(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admins can delete invoices" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await connectDB();

    const deleted = await Invoice.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    revalidatePath("/dashboard/reports");

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
