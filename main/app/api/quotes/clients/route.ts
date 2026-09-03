import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Invoice from "@/models/Invoice";
import { verifyToken } from "@/lib/auth";

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

// GET /api/quotes/clients — distinct clients from quotes + invoices,
// most-recent contact details first.
export async function GET(request: Request) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [quotes, invoices] = await Promise.all([
      Quote.find({}).sort({ seq: -1 }).select("client").lean(),
      Invoice.find({}).sort({ seq: -1 }).select("client").lean(),
    ]);

    const byName = new Map<
      string,
      { name: string; addressLines: string[]; email: string; phone: string }
    >();

    for (const doc of [...quotes, ...invoices]) {
      const c = doc.client;
      if (!c?.name) continue;
      const key = c.name.trim().toLowerCase();
      if (byName.has(key)) continue;
      byName.set(key, {
        name: c.name.trim(),
        addressLines: (c.addressLines ?? []).filter(Boolean),
        email: c.email ?? "",
        phone: c.phone ?? "",
      });
    }

    return NextResponse.json({
      success: true,
      clients: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (error) {
    console.error("List quote clients error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
