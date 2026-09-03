import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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

// GET /api/invoices/clients — distinct clients seen on past invoices,
// each with the most recently used contact details.
export async function GET(request: Request) {
  try {
    if (!authed(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const invoices = await Invoice.find({})
      .sort({ seq: -1 })
      .select("client")
      .lean();

    const byName = new Map<
      string,
      { name: string; addressLines: string[]; email: string; phone: string }
    >();

    for (const inv of invoices) {
      const c = inv.client;
      if (!c?.name) continue;
      const key = c.name.trim().toLowerCase();
      if (byName.has(key)) continue; // first hit = most recent (sorted desc)
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
    console.error("List invoice clients error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
