import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { verifyToken } from "@/lib/auth";
import { quoteTotal, formatQuoteNumber } from "@/lib/quote";

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

// GET /api/quotes — list, newest first
export async function GET(request: Request) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const quotes = await Quote.find({}).sort({ seq: -1 }).lean();

    const withTotals = quotes.map((q) => ({
      ...q,
      total: quoteTotal(q.sections),
    }));

    return NextResponse.json({ success: true, quotes: withTotals });
  } catch (error) {
    console.error("List quotes error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/quotes — create, auto-assigns the next QUO-0001 number
export async function POST(request: Request) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body?.client?.name) {
      return NextResponse.json(
        { success: false, message: "Client name is required" },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.sections) || body.sections.length === 0) {
      return NextResponse.json(
        { success: false, message: "Add at least one scope section" },
        { status: 400 },
      );
    }

    await connectDB();

    const base = {
      status:
        body.status === "accepted" || body.status === "declined" ? body.status : "sent",
      date: body.date ? new Date(body.date) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      project: (body.project ?? "").toString().trim(),
      location: (body.location ?? "").toString().trim(),
      preparedBy: (body.preparedBy ?? "").toString().trim(),
      client: {
        name: body.client.name.trim(),
        addressLines: Array.isArray(body.client.addressLines)
          ? body.client.addressLines.map((l: unknown) => String(l ?? "").trim()).filter(Boolean)
          : [],
        email: (body.client.email ?? "").toString().trim(),
        phone: (body.client.phone ?? "").toString().trim(),
      },
      intro: (body.intro ?? "").toString().trim(),
      sections: body.sections.map((s: Record<string, unknown>) => ({
        title: String(s.title ?? "").trim(),
        bullets: Array.isArray(s.bullets)
          ? s.bullets.map((b: unknown) => String(b ?? "").trim()).filter(Boolean)
          : [],
        note: String(s.note ?? "").trim(),
        price: Number(s.price) || 0,
      })),
      notes: (body.notes ?? "").toString().trim(),
    };

    let created = null;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const last = await Quote.findOne({}).sort({ seq: -1 }).select("seq").lean();
      const seq = ((last?.seq as number | undefined) ?? 0) + 1;
      try {
        created = await Quote.create({
          ...base,
          seq,
          quoteNumber: formatQuoteNumber(seq),
        });
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: number }).code === 11000
        ) {
          continue;
        }
        throw err;
      }
    }

    if (!created) {
      return NextResponse.json(
        { success: false, message: "Could not allocate a quote number, please retry" },
        { status: 409 },
      );
    }

    revalidatePath("/dashboard/reports/quotes");

    return NextResponse.json(
      { success: true, message: "Quote created", quote: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create quote error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
