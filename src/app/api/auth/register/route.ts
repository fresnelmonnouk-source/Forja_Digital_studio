import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp } from "@/lib/otp";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/validate-password";

export async function POST(req: Request) {
  // Anti-abus : limite les créations de compte / envois d'email par IP.
  if (!(await rateLimit(getIp(req), 5, 60_000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "L'email est requis." }, { status: 400 });
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      return NextResponse.json({ error: pwdError }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    const cleanName = typeof name === "string" ? name.trim() || null : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60_000);
    const ip = getIp(req);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.emailVerified) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    // Anti-fraude (multi-comptes gratuits) : limite le nombre de comptes VÉRIFIÉS
    // par IP. Seuil volontairement large (les IP mobiles ouest-africaines sont
    // souvent partagées en NAT) → bloque seulement l'abus manifeste.
    const MAX_ACCOUNTS_PER_IP = Number(process.env.FREE_ACCOUNTS_PER_IP) || 5;
    if (!existing && ip && ip !== "unknown") {
      const sameIpCount = await prisma.user.count({
        where: { signupIp: ip, emailVerified: { not: null } },
      });
      if (sameIpCount >= MAX_ACCOUNTS_PER_IP) {
        return NextResponse.json(
          { error: "Trop de comptes ont déjà été créés depuis ce réseau. Contacte le support si besoin." },
          { status: 429 }
        );
      }
    }

    if (existing && !existing.emailVerified) {
      // Compte non vérifié — on régénère le code et le mot de passe
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: cleanName ?? existing.name, password: hashedPassword, otpCode: otp, otpExpires, signupIp: ip },
      });
    } else {
      await prisma.user.create({
        data: { name: cleanName, email, password: hashedPassword, otpCode: otp, otpExpires, signupIp: ip },
      });
    }

    await sendOtpEmail(email, cleanName, otp);

    return NextResponse.json({ pending: true });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
  }
}
