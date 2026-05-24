import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserQuota } from "@/lib/quota";
import { FREE_DOC_LIMIT } from "@/lib/plans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const quota = await getUserQuota(session.user.id);
  return NextResponse.json(
    { ...quota, freeLimit: FREE_DOC_LIMIT },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
