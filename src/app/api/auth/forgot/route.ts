import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Anti-spam : limite les demandes de réinitialisation par IP.
  if (!(await rateLimit(getIp(req), 3, 60_000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Réponse générique pour éviter l'énumération d'emails
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpires: expires },
    });

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset?token=${token}`;

    await sendPasswordResetEmail(user.email, user.name, resetLink);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur réinitialisation demandée:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'envoi de l'email." }, { status: 500 });
  }
}
