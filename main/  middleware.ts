import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
};

function verifyAuthToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "role" in decoded
    ) {
      return decoded as JwtPayload;
    }

    return null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value ?? "";

  // Include real route + common typos
  const protectedPrefixes = [
    "/dashboard",
    "/dashbord",
    "/dashbrod",
    "/dahboard",
    "/deshboard",
  ];

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isLoginRoute = pathname === "/login";

  if (isProtected) {
    // Always normalize typos to /dashboard (only if authenticated)
    const isCanonicalDashboard =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", `${pathname}${search}`);

      const res = NextResponse.redirect(loginUrl);
      res.cookies.set({
        name: "auth_token",
        value: "",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // Logged in but typo route -> redirect to canonical /dashboard
    if (!isCanonicalDashboard) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Prevent logged-in users from seeing login page
  if (isLoginRoute && token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashbord/:path*",
    "/dashbrod/:path*",
    "/dahboard/:path*",
    "/deshboard/:path*",
    "/login",
  ],
};