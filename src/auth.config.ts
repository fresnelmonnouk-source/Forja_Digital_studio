// auth.config.ts — Contient uniquement la config compatible Edge Runtime (sans Prisma ni pg)
// Utilisé par le middleware ET partagé avec auth.ts (Node).
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Zone admin : connexion + rôle admin requis.
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "admin";
      }

      // Zones protégées classiques : connexion requise.
      const isProtected =
        pathname.startsWith("/chat") || pathname.startsWith("/onboarding");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    // Propagation id + role dans le token (pas de Prisma → compatible Edge).
    // Renseignés au sign-in via l'objet `user` fourni par le provider Credentials.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
  providers: [], // Les providers réels sont dans auth.ts
};
