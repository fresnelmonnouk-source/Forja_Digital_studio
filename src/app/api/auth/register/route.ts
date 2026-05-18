import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "L'email est requis." }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Le mot de passe est requis." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins une majuscule." }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins un chiffre." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    const cleanName = typeof name === "string" ? name.trim() || null : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60_000);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.emailVerified) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    if (existing && !existing.emailVerified) {
      // Compte non vérifié — on régénère le code et le mot de passe
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: cleanName ?? existing.name, password: hashedPassword, otpCode: otp, otpExpires },
      });
    } else {
      await prisma.user.create({
        data: { name: cleanName, email, password: hashedPassword, otpCode: otp, otpExpires },
      });
    }

    await sendOtpEmail(email, cleanName, otp);

    return NextResponse.json({ pending: true });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
  }
}
