import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "@/components/admin/AdminShell";

// Garde serveur (défense en profondeur, en plus du middleware) :
// seuls les admins authentifiés accèdent à /admin/*.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/login");
  }
  return <AdminShell userName={session.user.name || session.user.email || "Admin"}>{children}</AdminShell>;
}
