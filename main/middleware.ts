import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type JwtPayload = {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
};

async function verifyAuthToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT verify failed: JWT_SECRET is missing/undefined");
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] } // match whatever algorithm you sign tokens with
    );

    if (
      typeof payload === "object" &&
      payload !== null &&
      "userId" in payload &&
      "role" in payload
    ) {
      return payload as JwtPayload;
    }

    console.error("JWT verify failed: payload missing userId/role", payload);
    return null;
  } catch (err) {
    console.error("JWT verify failed:", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value ?? "";

  const protectedPrefixes = [
    "/dashboard",
    "/dashbord",
    "/dashbrod",
    "/dahboard",
    "/deshboard",
  ];

  const matchedPrefix = protectedPrefixes.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isProtected = !!matchedPrefix;
  const isLoginRoute = pathname === "/login";

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAuthToken(token);
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

    // Normalize misspelled prefixes to /dashboard, preserving the rest of the path
    if (matchedPrefix !== "/dashboard") {
      const correctedPath = pathname.replace(matchedPrefix, "/dashboard");
      const correctedUrl = new URL(correctedPath + search, request.url);
      return NextResponse.redirect(correctedUrl);
    }

    return NextResponse.next();
  }

  if (isLoginRoute) {
    if (!token) {
      return NextResponse.next();
    }

    const payload = await verifyAuthToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If the cookie is present but invalid/stale, clear it and let the login page render
    const res = NextResponse.next();
    res.cookies.set({
      name: "auth_token",
      value: "",
      path: "/",
      maxAge: 0,
    });
    return res;
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