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
