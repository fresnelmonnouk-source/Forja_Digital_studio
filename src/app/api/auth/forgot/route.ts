import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Pour éviter l'énumération d'emails, on renvoie un succès générique
      return NextResponse.json({ success: true });
    }

    // Générer le token de réinitialisation (valable 1 heure)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetExpires: expires,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset?token=${token}`;

    // Templating HTML Premium FonderieV2
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rallumer votre fourneau — FORJA</title>
        <style>
          body {
            background-color: #0B0908;
            color: #F1E9DA;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 40px 20px;
          }
          .card {
            max-width: 550px;
            margin: 0 auto;
            background-color: #15110D;
            border: 1px solid #2A241E;
            border-radius: 14px;
            padding: 40px;
            text-align: center;
          }
          .logo {
            font-family: 'Fraunces', Georgia, serif;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.15em;
            color: #EE5A24;
            margin-bottom: 30px;
          }
          .title {
            font-family: 'Fraunces', Georgia, serif;
            font-size: 28px;
            font-weight: 500;
            line-height: 1.2;
            color: #F1E9DA;
            margin-bottom: 16px;
          }
          .title em {
            font-style: italic;
            color: #EE5A24;
          }
          .description {
            font-size: 14px;
            line-height: 1.6;
            color: #C8BDA8;
            margin-bottom: 32px;
          }
          .btn {
            display: inline-block;
            background-color: #EE5A24;
            color: #0B0908 !important;
            text-decoration: none !important;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 14px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(238, 90, 36, 0.3);
            margin-bottom: 32px;
            transition: all 0.2s;
          }
          .footer {
            font-size: 11px;
            color: #8C8270;
            border-top: 1px solid #2A241E;
            padding-top: 20px;
            line-height: 1.6;
          }
          .link-alt {
            word-break: break-all;
            color: #F39C2C;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">✦ FORJA ✦</div>
          <div class="title">Rallumer le <em>fourneau</em>.</div>
          <p class="description">
            Bonjour ${user.name || "Créateur"},<br><br>
            Une demande de réinitialisation de mot de passe a été faite pour ton compte. Click sur le bouton ci-dessous pour forger un nouveau mot de passe robuste.
          </p>
          <a href="${resetLink}" class="btn">Forger un nouveau mot de passe →</a>
          <p class="description" style="font-size: 12px; margin-top: 10px;">
            Si le bouton ne fonctionne pas, copie et colle ce lien dans ton navigateur :<br>
            <a href="${resetLink}" class="link-alt">${resetLink}</a>
          </p>
          <div class="footer">
            Ce lien est valable pendant 60 minutes.<br>
            Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet e-mail en toute sécurité.
          </div>
        </div>
      </body>
      </html>
    `;

    // Utilise RESEND_FROM si configuré, sinon fallback sur onboarding@resend.dev (requis pour le mode Sandbox Resend)
    const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev";

    await resend.emails.send({
      from: fromAddress,
      to: user.email,
      subject: "Rallumer votre fourneau — Réinitialisation FORJA",
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur réinitialisation demandée:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'envoi de l'email." }, { status: 500 });
  }
}
