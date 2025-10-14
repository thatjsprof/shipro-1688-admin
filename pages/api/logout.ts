import { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Set-Cookie", [
    "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; Secure; SameSite=Lax; Domain=.shipro.africa",
    "user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; Secure; SameSite=Lax; Domain=.shipro.africa",
    "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; Domain=api.shipro.africa",
  ]);
  res.status(200).json({
    message: "Logged out",
  });
}
