import { NextResponse } from "next/server";

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const routeHandlerClient = createRouteHandlerSupabaseClient(request);

  if (!routeHandlerClient) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { supabase, response } = routeHandlerClient;

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/", request.url), {
    headers: response.headers,
  });
}
