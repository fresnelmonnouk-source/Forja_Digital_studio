// middleware.ts — Utilise auth.config.ts (Edge-compatible, sans Prisma/pg)
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/chat/:path*", "/onboarding/:path*"],
};
