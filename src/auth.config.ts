// auth.config.ts — Contient uniquement la config compatible Edge Runtime (sans Prisma ni pg)
// Utilisé EXCLUSIVEMENT par le middleware
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isProtected =
        pathname.startsWith("/chat") || pathname.startsWith("/onboarding");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
  providers: [], // Les providers réels sont dans auth.ts
};
