import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTransaction } from "@/lib/fedapay";

// Webhook FedaPay. On NE FAIT PAS confiance au corps reçu : on extrait l'id de
// transaction puis on re-vérifie le statut DIRECTEMENT auprès de FedaPay (appel
// authentifié avec notre clé secrète). Les crédits ne sont ajoutés qu'une fois
// le paiement réellement "approved", et de façon idempotente.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // L'id de transaction selon les formats possibles du payload FedaPay.
    const id = String(
      body?.entity?.id ?? body?.data?.id ?? body?.["v1/transaction"]?.id ?? body?.id ?? ""
    );
    if (!id) return NextResponse.json({ received: true });

    const tx = await getTransaction(id);
    if (!tx) return NextResponse.json({ received: true });

    const payment = await prisma.payment.findUnique({ where: { fedapayId: id } });
    if (!payment) return NextResponse.json({ received: true });

    if (tx.status === "approved") {
      // Flip atomique pending→approved (évite le double-crédit sur webhooks répétés)
      const flipped = await prisma.payment.updateMany({
        where: { fedapayId: id, status: { not: "approved" } },
        data: { status: "approved" },
      });
      if (flipped.count > 0) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { credits: { increment: payment.credits } },
        });
        console.log(`[PAYMENT] +${payment.credits} crédits → user ${payment.userId} (tx ${id})`);
      }
    } else if (tx.status === "declined" || tx.status === "canceled") {
      await prisma.payment.updateMany({
        where: { fedapayId: id, status: "pending" },
        data: { status: tx.status },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur webhook paiement:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
