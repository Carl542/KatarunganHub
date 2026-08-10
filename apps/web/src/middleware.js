import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware execution error:", error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
