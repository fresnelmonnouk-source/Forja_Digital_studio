import { Resend } from "resend";

// Instanciation paresseuse : `new Resend(undefined)` lève une exception au
// chargement du module si la clé manque, ce qui faisait planter le build et
// toute route important ce fichier. On ne crée le client qu'à l'envoi réel.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY manquante — envoi d'email impossible.");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM || "onboarding@resend.dev";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const C = {
  black:  "#0B0908",
  black2: "#15110D",
  black3: "#1E1813",
  ink:    "#F1E9DA",
  ink2:   "#C8BDA8",
  smoke:  "#7A6F5E",
  dim:    "#54493B",
  rule:   "rgba(241,233,218,0.08)",
  strong: "rgba(241,233,218,0.16)",
  ember:  "#EE5A24",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>FORJA</title>
</head>
<body style="margin:0;padding:40px 20px;background:${C.black};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:${C.black};border-radius:14px;overflow:hidden;border:1px solid ${C.strong};color:${C.ink}">
    ${content}
  </div>
  <div style="max-width:600px;margin:12px auto 0;text-align:center;font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.dim};letter-spacing:0.15em">
    FORJA · 12 RUE DE LA FORGE, 75011 PARIS
  </div>
</body>
</html>`;
}

function header(tag: string): string {
  return `
  <div style="padding:24px 36px 20px;border-bottom:1px solid ${C.rule};background:${C.black2}">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;letter-spacing:0.2em;color:${C.ink}">✦ FORJA</div>
      <div style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.smoke};letter-spacing:0.2em;padding:4px 10px;border:1px solid ${C.rule};border-radius:999px">${tag}</div>
    </div>
  </div>`;
}

function footer(note?: string): string {
  return `
  <div style="padding:24px 36px 26px;border-top:1px solid ${C.rule};background:${C.black2}">
    ${note ? `<p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;color:${C.ink2};line-height:1.6;margin:0 0 20px">${note}</p>` : ""}
    <div style="padding-top:16px;border-top:1px solid ${C.rule};display:flex;align-items:center;justify-content:space-between">
      <span style="font-family:Consolas,'Courier New',monospace;font-size:10px;color:${C.dim};letter-spacing:0.15em">FORJA · v.4</span>
      <span>
        <a href="#" style="font-size:11px;color:${C.smoke};text-decoration:none;margin-left:12px">Aide</a>
        <a href="#" style="font-size:11px;color:${C.smoke};text-decoration:none;margin-left:12px">Confidentialité</a>
        <a href="#" style="font-size:11px;color:${C.smoke};text-decoration:none;margin-left:12px">Se désabonner</a>
      </span>
    </div>
  </div>`;
}

function hook(tag: string, label: string): string {
  return `<div style="margin-bottom:20px">
    <span style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.ember};letter-spacing:0.18em">${tag}</span>
    <span style="display:inline-block;width:18px;height:1px;background:${C.ember};vertical-align:middle;margin:0 8px"></span>
    <span style="font-size:9px;color:${C.ink2};letter-spacing:0.22em;text-transform:uppercase">${label}</span>
  </div>`;
}

function title(html: string, size = 38): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:${size}px;line-height:1.05;letter-spacing:-0.025em;color:${C.ink};margin:0">${html}</h1>`;
}

function lead(html: string): string {
  return `<p style="font-size:15px;line-height:1.65;color:${C.ink2};margin:18px 0 0">${html}</p>`;
}

function btn(label: string, url: string, secondary = false): string {
  if (secondary) {
    return `<a href="${url}" style="display:inline-block;padding:15px 28px;background:transparent;color:${C.ink};border:1px solid ${C.strong};border-radius:10px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none">${label}</a>`;
  }
  return `<a href="${url}" style="display:inline-block;padding:15px 28px;background:${C.ember};color:${C.black};border-radius:10px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;box-shadow:0 0 28px rgba(238,90,36,0.4)">${label}</a>`;
}

// ── 02 · Vérification OTP ────────────────────────────────────────

export function buildOtpEmail(name: string | null, code: string): string {
  const displayName = esc(name || "Créateur");
  const digits = code.split("").map(d =>
    `<span style="display:inline-block;width:52px;height:64px;line-height:64px;text-align:center;margin:0 4px;border-radius:8px;background:${C.black};border:1px solid ${C.strong};font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:500;color:${C.ember};font-style:italic">${esc(d)}</span>`
  ).join("");

  return shell(`
    ${header("✦ VÉRIFICATION")}
    <div style="padding:36px 44px 8px">
      ${hook("01", "Confirmer ton adresse")}
      ${title(`Une dernière étape<br>avant de battre le <em style="font-style:italic;color:${C.ember}">métal</em>.`)}
      ${lead(`Bonjour ${displayName},<br><br>Saisis ce code dans la fenêtre FORJA ouverte sur ton navigateur. Il expire dans <strong style="color:${C.ember}">10 minutes</strong>.`)}
    </div>

    <div style="padding:28px 44px 8px">
      <div style="background:${C.black2};border:1px solid ${C.strong};border-radius:12px;padding:24px;text-align:center">
        <div style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.smoke};letter-spacing:0.25em;margin-bottom:14px">CODE À 6 CHIFFRES</div>
        <div>${digits}</div>
        <div style="font-family:Consolas,'Courier New',monospace;font-size:10px;color:${C.smoke};letter-spacing:0.15em;margin-top:16px">EXPIRE DANS 10 MINUTES</div>
      </div>
    </div>

    <div style="padding:24px 44px 32px;text-align:center">
      <p style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.smoke};letter-spacing:0.15em;margin:0 0 14px">OU CLIQUE DIRECTEMENT</p>
      ${btn("Confirmer mon adresse →", `${APP_URL}/verify?email=placeholder`, true)}
    </div>

    ${footer("Tu n'as pas demandé ce code ? Ignore ce mail — personne n'accèdera à ton compte sans lui.")}
  `);
}

// ── 01 · Bienvenue ───────────────────────────────────────────────

export function buildWelcomeEmail(name: string | null): string {
  const displayName = esc(name || "Créateur");
  const steps = [
    ["01", "Lis l'Oracle",             "Six lectures pour repérer le signal sous le bruit."],
    ["02", "Trouve ton Triangle d'Or", "L'intersection de ce que tu sais, aimes, et qu'on te demande."],
    ["03", "Forge ta première offre",  "Promesse mesurable, transformation, prix tenu."],
    ["04", "Sors ton premier PDF",     "Tes conclusions, propres et signées FORJA."],
  ];
  const stepBoxes = steps.map(([n, t, s], i) => `
    <td style="width:50%;padding:18px;vertical-align:top;background:${C.black2};${i === 1 ? `border-left:1px solid ${C.rule};border-right:1px solid ${C.rule}` : ""};${i === 3 ? `border-left:1px solid ${C.rule}` : ""}">
      <div style="font-family:Consolas,'Courier New',monospace;font-size:10px;color:${C.ember};letter-spacing:0.15em;margin-bottom:6px">${n}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${C.ink};font-weight:500;margin-bottom:4px">${t}</div>
      <div style="font-size:12px;color:${C.ink2};line-height:1.55">${s}</div>
    </td>
  `).join("");

  return shell(`
    ${header("✦ BIENVENUE")}

    <div style="padding:36px 44px 0;text-align:center">
      <div style="width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFD27F 0%,#F39C2C 20%,#EE5A24 45%,#B83E0F 75%,#2A0E04 100%);margin:0 auto;box-shadow:0 0 50px rgba(238,90,36,0.45)"></div>
    </div>

    <div style="padding:28px 44px 8px;text-align:center">
      ${hook("00:00", "Édition v.4 · première session")}
      ${title(`Bienvenue à<br><em style="font-style:italic;color:${C.ember}">l'enclume</em>, ${displayName}.`, 42)}
      ${lead(`Le four est allumé. Ton compte est créé.<br>Trente ans de terrain dans le SaaS et l'automatisation IA, condensés en un agent qui te guide — du signal de marché à l'effet WOW.`)}
    </div>

    <div style="padding:28px 44px 8px;text-align:center">
      ${btn("Démarrer ma première session →", `${APP_URL}/onboarding`)}
    </div>

    <div style="padding:28px 44px 32px">
      <div style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.smoke};letter-spacing:0.2em;margin-bottom:14px;text-transform:uppercase">Pour bien commencer</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid ${C.rule};border-radius:10px;overflow:hidden">
        <tr>${stepBoxes.split("</td>").slice(0, 2).join("</td>")}</td></tr>
        <tr style="border-top:1px solid ${C.rule}">${stepBoxes.split("</td>").slice(2, 4).join("</td>")}</td></tr>
      </table>
    </div>

    ${footer("Si tu cales — un seul mail à wilson@forja.fr et je te débloque personnellement. — W.")}
  `);
}

// ── 03 · Réinitialisation mot de passe ──────────────────────────

export function buildPasswordResetEmail(name: string | null, resetLink: string): string {
  const displayName = esc(name || "Créateur");
  return shell(`
    ${header("✦ SÉCURITÉ")}
    <div style="padding:36px 44px 8px">
      ${hook("···", "Réinitialisation")}
      ${title(`Tu as oublié<br>ta <em style="font-style:italic;color:${C.ember}">clé</em>.`)}
      ${lead(`Bonjour ${displayName},<br><br>Clique le lien pour forger un nouveau mot de passe. Valide <strong style="color:${C.ember}">60 minutes</strong>, après quoi le four reverrouille.`)}
    </div>
    <div style="padding:28px 44px 8px">
      ${btn("Définir un nouveau mot de passe →", esc(resetLink))}
    </div>
    <div style="padding:12px 44px 24px">
      <p style="font-family:Consolas,'Courier New',monospace;font-size:9px;color:${C.smoke};letter-spacing:0.15em;margin:0 0 10px">OU COLLE CE LIEN DANS TON NAVIGATEUR</p>
      <div style="background:${C.black2};border:1px solid ${C.rule};border-radius:8px;padding:14px 16px;font-family:Consolas,'Courier New',monospace;font-size:11px;color:${C.ink2};word-break:break-all;line-height:1.5">${esc(resetLink)}</div>
    </div>
    <div style="padding:0 44px 28px">
      <div style="background:rgba(238,90,36,0.06);border:1px solid rgba(238,90,36,0.25);border-radius:10px;padding:16px 18px">
        <div style="font-size:13px;color:${C.ink};font-weight:600;margin-bottom:4px">Tu n'as pas fait cette demande ?</div>
        <div style="font-size:12px;color:${C.ink2};line-height:1.6">Ignore ce mail — ton mot de passe actuel reste en place. Demandes suspectes : <a href="mailto:securite@forja.fr" style="color:${C.ember};text-decoration:none">securite@forja.fr</a>.</div>
      </div>
    </div>
    ${footer()}
  `);
}

// ── 04 · Mot de passe modifié ────────────────────────────────────

export function buildPasswordChangedEmail(name: string | null): string {
  const displayName = esc(name || "Créateur");
  const when = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  return shell(`
    ${header("✦ SÉCURITÉ")}
    <div style="padding:36px 44px 8px">
      ${hook("✓", "Confirmation")}
      ${title(`Clé <em style="font-style:italic;color:${C.ember}">reforgée</em>.`)}
      ${lead(`Bonjour ${displayName},<br><br>Ton mot de passe a été modifié le ${esc(when)}. La prochaine connexion se fait avec le nouveau.`)}
    </div>
    <div style="padding:28px 44px 28px">
      <div style="background:rgba(238,90,36,0.06);border:1px solid rgba(238,90,36,0.25);border-radius:10px;padding:18px">
        <div style="font-size:13px;color:${C.ink};font-weight:600;margin-bottom:6px">Ce n'est pas toi ?</div>
        <div style="font-size:12px;color:${C.ink2};line-height:1.6;margin-bottom:14px">Verrouille immédiatement ton compte et contacte-nous.</div>
        ${btn("Aller à la connexion →", `${APP_URL}/login`)}
      </div>
    </div>
    ${footer()}
  `);
}

// ── Send helpers ─────────────────────────────────────────────────

export async function sendOtpEmail(to: string, name: string | null, code: string) {
  const formatted = `${code.slice(0, 3)} ${code.slice(3)}`;
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Ton code d'accès au four : ${formatted}`,
    html: buildOtpEmail(name, code),
  });
}

export async function sendWelcomeEmail(to: string, name: string | null) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${name ? name + ", " : ""}le four est chaud.`,
    html: buildWelcomeEmail(name),
  });
}

export async function sendPasswordResetEmail(to: string, name: string | null, resetLink: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Rallumer votre fourneau — Réinitialisation FORJA",
    html: buildPasswordResetEmail(name, resetLink),
  });
}

export async function sendPasswordChangedEmail(to: string, name: string | null) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Ton mot de passe a été modifié — FORJA",
    html: buildPasswordChangedEmail(name),
  });
}
