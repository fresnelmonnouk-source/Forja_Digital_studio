import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { getPack } from "@/lib/plans";
import { createCheckout, fedapayConfigured } from "@/lib/fedapay";

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 10, 60_000))) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!fedapayConfigured()) {
    return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
  }

  try {
    const { packId } = await req.json();
    const pack = getPack(typeof packId === "string" ? packId : "");
    if (!pack) return NextResponse.json({ error: "Pack invalide." }, { status: 400 });

    // Pack "Essai" = palier d'entrée, achetable UNE SEULE FOIS par utilisateur.
    // Sans cette garde, quelqu'un peut acheter Essai 3× = 30 docs / 10 500 F
    // (exactement Starter) sans jamais monter en gamme — la value ladder se casse.
    if (pack.id === "essai") {
      const existing = await prisma.payment.findFirst({
        where: { userId: session.user.id, packId: "essai", status: "approved" },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          {
            error: "ESSAI_ALREADY_USED",
            message: "Tu as déjà utilisé ton pack Essai (palier d'entrée à 3 500 F, disponible une fois). Pour continuer à exporter, passe à Starter (30 documents · 10 500 F) ou plus.",
          },
          { status: 403 }
        );
      }
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const { transactionId, url } = await createCheckout({
      amount: pack.amount,
      description: `FORJA — Pack ${pack.label} (${pack.credits} documents)`,
      customerEmail: session.user.email || "client@myforja.digital",
      customerName: session.user.name,
      callbackUrl: `${appUrl}/chat?payment=done`,
    });

    // Trace la transaction (statut confirmé ensuite par le webhook).
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        fedapayId: transactionId,
        packId: pack.id,
        amount: pack.amount,
        credits: pack.credits,
        status: "pending",
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erreur création paiement:", error);
    return NextResponse.json({ error: "Impossible d'initier le paiement." }, { status: 500 });
  }
}
