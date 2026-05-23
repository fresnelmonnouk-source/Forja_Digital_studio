import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Anti-brute-force : limite les essais de code OTP par IP.
  if (!(await rateLimit(getIp(req), 10, 60_000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Ce compte est déjà vérifié." }, { status: 400 });
    }
    if (!user.otpCode || !user.otpExpires) {
      return NextResponse.json({ error: "Aucun code en attente. Réinscris-toi." }, { status: 400 });
    }
    if (new Date() > user.otpExpires) {
      return NextResponse.json({ error: "Code expiré. Réinscris-toi pour en recevoir un nouveau." }, { status: 400 });
    }
    if (code !== user.otpCode) {
      return NextResponse.json({ error: "Code incorrect." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), otpCode: null, otpExpires: null },
    });

    sendWelcomeEmail(user.email, user.name).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur vérification OTP:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
