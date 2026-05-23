import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/email";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Anti-brute-force : limite les tentatives sur le token de reset par IP.
  if (!(await rateLimit(getIp(req), 5, 60_000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une minute." }, { status: 429 });
  }

  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token de réinitialisation requis ou invalide." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 10) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
    }

    // Trouver l'utilisateur avec un jeton valide et non expiré
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Ce lien de réinitialisation est invalide ou a expiré." },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur et invalider le jeton
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    sendPasswordChangedEmail(user.email, user.name).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur réinitialisation mot de passe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réinitialisation de votre mot de passe." },
      { status: 500 }
    );
  }
}
