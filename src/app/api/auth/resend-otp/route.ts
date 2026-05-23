import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { generateOtp } from "@/lib/otp";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Anti-spam : limite les renvois de code par IP.
  if (!(await rateLimit(getIp(req), 3, 60_000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Réponse générique : on ne révèle pas si le compte existe (anti-énumération).
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const otp = generateOtp();
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
