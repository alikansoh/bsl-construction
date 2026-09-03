import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { verifyToken } from "@/lib/auth";
import { computeTotals, formatInvoiceNumber } from "@/lib/invoice";

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

// GET /api/invoices — list (newest first)
export async function GET(request: Request) {
  try {
    if (!authed(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const invoices = await Invoice.find({})
      .sort({ seq: -1 })
      .lean();

    const withTotals = invoices.map((inv) => ({
      ...inv,
      totals: computeTotals({ lineItems: inv.lineItems, vatRate: inv.vatRate, discount: inv.discount }),
    }));

    return NextResponse.json({ success: true, invoices: withTotals });
  } catch (error) {
    console.error("List invoices error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

// POST /api/invoices — create (auto-assigns the next INV-0001 number)
export async function POST(request: Request) {
  try {
    const user = authed(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body?.client?.name || typeof body.client.name !== "string") {
      return NextResponse.json(
        { success: false, message: "Client name is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Add at least one line item" },
        { status: 400 },
      );
    }

    await connectDB();

    const base = {
      status: body.status === "sent" || body.status === "paid" ? body.status : "sent",
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
      reference: (body.reference ?? "").toString().trim(),
      client: {
        name: body.client.name.trim(),
        addressLines: Array.isArray(body.client.addressLines)
          ? body.client.addressLines.map((l: unknown) => String(l ?? "").trim()).filter(Boolean)
          : [],
        email: (body.client.email ?? "").toString().trim(),
        phone: (body.client.phone ?? "").toString().trim(),
      },
      workDescription: (body.workDescription ?? "").toString().trim(),
      lineItems: body.lineItems.map((li: Record<string, unknown>) => ({
        description: String(li.description ?? "").trim(),
        quantity: Number(li.quantity) || 0,
        unitPrice: Number(li.unitPrice) || 0,
      })),
      vatRate: Number(body.vatRate) || 0,
      discount: Number(body.discount) || 0,
      notes: (body.notes ?? "").toString().trim(),
      paymentTerms: (body.paymentTerms ?? "").toString().trim(),
    };

    // Assign the next sequence, retrying on the unique-index race.
    let created = null;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const last = await Invoice.findOne({}).sort({ seq: -1 }).select("seq").lean();
      const seq = ((last?.seq as number | undefined) ?? 0) + 1;

      try {
        created = await Invoice.create({
          ...base,
          seq,
          invoiceNumber: formatInvoiceNumber(seq),
        });
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: number }).code === 11000
        ) {
          continue; // someone grabbed that seq — try again
        }
        throw err;
      }
    }

    if (!created) {
      return NextResponse.json(
        { success: false, message: "Could not allocate an invoice number, please retry" },
        { status: 409 },
      );
    }

    revalidatePath("/dashboard/reports");

    return NextResponse.json(
      { success: true, message: "Invoice created", invoice: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
