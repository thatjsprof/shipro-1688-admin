import { NextApiRequest, NextApiResponse } from "next";

const expiredCookie = (name: string, domain?: string) => {
  const domainPart = domain ? `; Domain=${domain}` : "";
  return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${domainPart}`;
};

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".shipro.africa" : undefined;

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Set-Cookie", [
    expiredCookie("better-auth.session_token", domain),
    expiredCookie("__Secure-better-auth.session_token", domain),
    expiredCookie("user-role", domain),
    expiredCookie("connect.sid", isProduction ? "api.shipro.africa" : undefined),
  ]);
  res.status(200).json({
    message: "Logged out",
  });
}
