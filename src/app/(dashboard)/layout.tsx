"use client";
import { SessionProvider } from "next-auth/react";

// Wrapper qui force le layout dashboard à avoir le SessionProvider
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
