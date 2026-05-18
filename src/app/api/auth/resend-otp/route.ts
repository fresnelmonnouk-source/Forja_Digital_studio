import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Ce compte est déjà vérifié." }, { status: 400 });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpires = new Date(Date.now() + 10 * 60_000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpires },
    });

    await sendOtpEmail(email, user.name, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur renvoi OTP:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
