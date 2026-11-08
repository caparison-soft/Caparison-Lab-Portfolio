import { NextResponse, type NextRequest } from "next/server";

/**
 * /capabilities became /services in the light redesign (2026-11-05). A route
 * handler rather than redirect() in a page: the (site) loading boundary makes a
 * page redirect stream a 200 with a meta refresh, which drops the #slug
 * fragment. A real 308 keeps it, and the service groups keep their capability
 * slugs as anchors on /services. The query string is carried over too.
 */
export function GET(request: NextRequest) {
  const url = new URL("/", request.url);
  url.search = request.nextUrl.search;
  url.hash = "services"; // one-page site since 2026-11-07
  return NextResponse.redirect(url, 308);
}
