import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("ereport_session")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isReporterRoute = pathname.startsWith("/reporter");

  if (!isAdminRoute && !isReporterRoute) {
    return NextResponse.next();
  }

  // Jika tidak ada cookie sesi, redirect ke /login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const [payloadB64, signature] = sessionCookie.split(".");
    if (!payloadB64 || !signature) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verifikasi HMAC SHA-256 menggunakan Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode base64url signature
    const sigStr = signature.replace(/-/g, "+").replace(/_/g, "/");
    const sigPad = sigStr.padEnd(sigStr.length + ((4 - (sigStr.length % 4)) % 4), "=");
    const sigBytes = Uint8Array.from(atob(sigPad), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payloadB64)
    );

    if (!isValid) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // SEC-07, SEC-08: Pemeriksaan Role
    if (isAdminRoute && payload.role !== "admin") {
      // Reporter dilarang mengakses halaman admin
      return NextResponse.redirect(new URL("/reporter/dashboard", request.url));
    }

    if (isReporterRoute && payload.role !== "reporter") {
      // Admin yang membuka route reporter dialihkan ke admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/reporter/:path*"],
};
