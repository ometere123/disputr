import { NextResponse, type NextRequest } from "next/server";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (!request.nextUrl.pathname.startsWith("/api") || !mutatingMethods.has(request.method)) {
    return response;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const requestHost = request.nextUrl.host;

  const originHost = origin ? new URL(origin).host : undefined;
  const refererHost = referer ? new URL(referer).host : undefined;

  if ((originHost && originHost === requestHost) || (refererHost && refererHost === requestHost)) {
    return response;
  }

  return NextResponse.json({ error: "csrf_origin_mismatch" }, { status: 403 });
}

export const config = {
  matcher: ["/api/:path*"]
};
