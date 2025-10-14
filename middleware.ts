import { NextRequest, NextResponse } from "next/server";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { IUserRole } from "./interfaces/user.interface";

export async function middleware(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = new Map(
    cookieHeader
      .split("; ")
      .map((c) => c.split("="))
      .filter((pair): pair is [string, string] => pair.length === 2)
  );
  const accessToken = cookies.get("better-auth.session_token");
  const role = cookies.get("user-role");
  if (!accessToken || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    const payload = jwtDecode<JwtPayload & { role: IUserRole }>(role);
    if (payload.role !== IUserRole.admin)
      return NextResponse.redirect(new URL("/login", req.url));
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard", "/orders"],
};
