import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // TEMPORAIRE : Désactivé pour les tests de production de validation du parcours complet
  // if (!(await rateLimit(getIp(req), 5, 15 * 60_000))) {
  //   return NextResponse.json({ error: "Trop de tentatives. Réessaie dans 15 minutes." }, { status: 429 });
  // }

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

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: typeof name === "string" ? name.trim() : null,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
  }
}
