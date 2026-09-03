import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { verifyToken } from "@/lib/auth";
import { quoteTotal } from "@/lib/quote";

export const dynamic = "force-dynamic";

function authed(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "editor") return null;
  return user;
}

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
    const quote = await Quote.findById(id).lean();
    if (!quote) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        total: quoteTotal(quote.sections),
      },
    });
  } catch (error) {
    console.error("Get quote error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

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

    const quote = await Quote.findById(id);
    if (!quote) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }

    if (["sent", "accepted", "declined"].includes(body.status)) quote.status = body.status;
    if (body.date) quote.date = new Date(body.date);
    if (body.validUntil !== undefined)
      quote.validUntil = body.validUntil ? new Date(body.validUntil) : undefined;
    if (body.project !== undefined) quote.project = String(body.project).trim();
    if (body.location !== undefined) quote.location = String(body.location).trim();
    if (body.preparedBy !== undefined) quote.preparedBy = String(body.preparedBy).trim();
    if (body.intro !== undefined) quote.intro = String(body.intro).trim();

    if (body.client) {
      quote.client = {
        name: String(body.client.name ?? quote.client.name).trim(),
        addressLines: Array.isArray(body.client.addressLines)
          ? body.client.addressLines.map((l: unknown) => String(l ?? "").trim()).filter(Boolean)
          : quote.client.addressLines,
        email: String(body.client.email ?? quote.client.email ?? "").trim(),
        phone: String(body.client.phone ?? quote.client.phone ?? "").trim(),
      };
    }

    if (Array.isArray(body.sections)) {
      quote.sections = body.sections.map((s: Record<string, unknown>) => ({
        title: String(s.title ?? "").trim(),
        bullets: Array.isArray(s.bullets)
          ? s.bullets.map((b: unknown) => String(b ?? "").trim()).filter(Boolean)
          : [],
        note: String(s.note ?? "").trim(),
        price: Number(s.price) || 0,
      }));
    }

    if (body.notes !== undefined) quote.notes = String(body.notes).trim();

    quote.markModified("client");
    quote.markModified("sections");
    await quote.save();

    revalidatePath("/dashboard/reports/quotes");
    revalidatePath(`/dashboard/reports/quotes/${id}`);

    return NextResponse.json({ success: true, message: "Quote updated", quote });
  } catch (error) {
    console.error("Update quote error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = authed(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admins can delete quotes" },
        { status: 403 },
      );
    }
    const { id } = await params;
    await connectDB();
    const deleted = await Quote.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Quote not found" }, { status: 404 });
    }
    revalidatePath("/dashboard/reports/quotes");
    return NextResponse.json({ success: true, message: "Quote deleted" });
  } catch (error) {
    console.error("Delete quote error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
