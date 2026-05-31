# 🔍 AUDIT COPYWRITING — POST-PIVOT PRICING (2026-05-31)

> **Auditeur** : Marcus (subagent copywriting)
> **Périmètre** : 13 fichiers de copie utilisateur visible + 1 fichier doc (`offers.md`)
> **Pivot audité** : freemium "5 docs gratuits" → "chat gratuit illimité + PDF payant dès 3 500 F (pack Essai 1×)"
> **Garde-fous Fresnel respectés** : pas de "30 ans", aucun témoignage inventé, métaphore forge conservée, prompt système non touché.

---

## 1. SYNTHÈSE EXÉCUTIVE

**Verdict global** : la landing principale (`page.tsx`), la FAQ (`structured-data.ts`) et les CGU section 3 sont **alignées sur le pivot** — Kody a bien tenu la barre côté implémentation. **Mais 4 zones critiques crient encore l'ancien modèle** :

1. 🔴 **`ExportModal.tsx` (l.70)** affiche en dur le message `"Tu as utilisé tes 5 documents gratuits"` — c'est techniquement mort (l'API renvoie un autre message), mais il s'affiche en fallback si l'API ne répond pas avec son `message`. Risque : un utilisateur voit "5 documents gratuits" alors qu'il n'en a JAMAIS eu un seul → casse de promesse.
2. 🔴 **`legal.ts` section 2 des CGU** parle encore d'un "compte gratuit unique" — formulation ambiguë post-pivot (on dirait que le compte est une offre). À reformuler.
3. 🔴 **`legal.ts` politique de remboursement** parle de "crédits achetés" sans mentionner Essai, et donne un délai chiffré (14 jours) en contradiction avec la consigne Fresnel "ne pas afficher de délai".
4. 🔴 **`site.ts` SITE_DESCRIPTION** : utilise "vous" (vouvoiement) alors que toute la marque tutoie — cohérence brand-voice cassée sur le SEO/OpenGraph (premier contact Google).

**Zones OK** : `page.tsx` (la landing principale, post-session 9 + ajouts du pivot — solide), `chat/page.tsx` (message d'accueil et quick-prompts toujours valides), 5 emails (cohérents, métaphore forge intacte, aucun résidu "5 docs"), `CreditsModal.tsx` (la logique 3-cas est intelligente, copy propre), `DemoModal.tsx` (script méthode, OK).

**Zones à raffiner** (P2/P3) : 3 nuances dans la landing (CTA "gratuit" devenu ambigu), email de bienvenue (étape "Sors ton premier PDF" sous-entend gratuit), 4 anglicismes signalés, et un email confirmation paiement qui pourrait expliciter la validité 31 jours.

**Volume** : 23 propositions au total. Implémentation estimée : 1h30 pour Kody (modifs ciblées, pas de refonte).

---

## 2. PROPOSITIONS DE MODIFICATION — PAR FICHIER

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/components/chat/ExportModal.tsx`

---

#### 🔴 Proposition #1 — Fallback message quota épuisé (l.70)

❌ **TEXTE ACTUEL** :
```tsx
setError((data as { message?: string }).message || "Tu as utilisé tes 5 documents gratuits.");
```

✅ **TEXTE PROPOSÉ** :
```tsx
setError((data as { message?: string }).message || "Pour exporter ton produit en PDF, il te faut un pack. Le plus accessible démarre à 3 500 FCFA (10 documents).");
```

💡 **Justif** : le fallback contredit le nouveau modèle ; on aligne sur le message déjà servi par l'API `/api/export/pdf` (cohérence + zéro risque de promesse fantôme).

---

#### 🟠 Proposition #2 — Anglicismes "Copywriting / Blueprint / Roadmap" (l.15-16)

❌ **TEXTE ACTUEL** :
```tsx
{ id: "vente", Icon: Wallet, label: "Page de vente", desc: "Copywriting prêt à publier" },
{ id: "blueprint", Icon: Cog, label: "Blueprint", desc: "Roadmap & architecture technique" },
```

✅ **TEXTE PROPOSÉ** :
```tsx
{ id: "vente", Icon: Wallet, label: "Page de vente", desc: "Argumentaire de vente prêt à publier" },
{ id: "blueprint", Icon: Cog, label: "Plan technique", desc: "Feuille de route & architecture du produit" },
```

💡 **Justif** : conformité brand-voice (anglicismes interdits sans traduction). ⚠️ **L'id `"blueprint"` reste inchangé** (utilisé par `[GENERATE_PDF:blueprint]` côté prompt système) — seul le label/desc bouge.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/components/DemoModal.tsx`

---

#### 🟡 Proposition #3 — "dashboard Notion" (l.15)

❌ **TEXTE ACTUEL** :
```tsx
{ role: "forja", text: "Donc la douleur est **réelle et répétée** — c'est ton signal. On tient un angle : « Reprends le contrôle de tes projets en un seul dashboard Notion ». Passons à la **promesse mesurable** : qu'est-ce que l'élève saura *faire* à la fin, concrètement ?" },
```

✅ **TEXTE PROPOSÉ — option A (gardée pour authenticité, recommandée)** :
*Aucun changement.* Notion utilise effectivement "dashboard" dans son interface française. Dans le contexte d'un angle de vente Notion-spécifique, "dashboard" est ce que cherche Komlan sur Google. Le traduire en "tableau de bord" affaiblit le SEO mental et l'authenticité du script.

✅ **TEXTE PROPOSÉ — option B (si on veut puriste)** :
```tsx
{ role: "forja", text: "Donc la douleur est **réelle et répétée** — c'est ton signal. On tient un angle : « Reprends le contrôle de tes projets en un seul tableau de bord Notion ». Passons à la **promesse mesurable** : qu'est-ce que l'élève saura *faire* à la fin, concrètement ?" },
```

💡 **Justif & ma reco** : **garder "dashboard"**. C'est un cas de jargon-métier validé par l'usage (comme "framework" qu'on traduit, mais "dashboard" est utilisé partout en FR-tech, y compris par Notion lui-même). L'authenticité du script en pâtit si on traduit. Décision finale à Fresnel.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/lib/site.ts`

---

#### 🔴 Proposition #4 — SITE_DESCRIPTION vouvoie (l.11-12)

❌ **TEXTE ACTUEL** :
```ts
export const SITE_DESCRIPTION =
  "FORJA est l'agent IA qui vous guide pas à pas pour créer des produits digitaux prêts à vendre — ebooks, guides, kits — et génère des PDF professionnels en quelques minutes.";
```

✅ **TEXTE PROPOSÉ** :
```ts
export const SITE_DESCRIPTION =
  "FORJA transforme ton idée en produit digital prêt à vendre — ebook, formation, page de vente. Discussion gratuite et illimitée, PDF pro dès 3 500 FCFA. Paiement mobile money.";
```

💡 **Justif** : (1) cohérence tutoiement avec le reste du site, (2) intègre le nouveau pitch (chat gratuit + PDF payant dès 3 500 F + mobile money) dans le SEO/OpenGraph — premier contact avec l'avatar. Aussi : on enlève "agent IA" (brand voice : FORJA ne se vend pas "comme une IA").

---

#### 🟡 Proposition #5 — SITE_TAGLINE peut être plus collante (l.10)

❌ **TEXTE ACTUEL** :
```ts
export const SITE_TAGLINE = "L'agent qui transforme l'idée brute en produit qui se vend.";
```

✅ **TEXTE PROPOSÉ** :
```ts
export const SITE_TAGLINE = "De l'idée brute au produit qui se vend.";
```

💡 **Justif** : aligné mot pour mot sur le H1 de la landing ("De l'idée floue au produit qui se vend") → cohérence brand. On retire "L'agent qui" (cf. brand-voice : "ne pas se vendre comme une IA").

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/lib/legal.ts`

---

#### 🔴 Proposition #6 — CGU section 2 "Compte et accès" (l.69)

❌ **TEXTE ACTUEL** :
```md
## 2. Compte et accès

La création d'un compte nécessite une adresse email vérifiée. Chaque personne ne peut détenir qu'un seul compte gratuit. Toute tentative de contournement de cette limite peut entraîner la suspension du compte.
```

✅ **TEXTE PROPOSÉ** :
```md
## 2. Compte et accès

La création d'un compte nécessite une adresse email vérifiée. Chaque personne ne peut détenir qu'**un seul compte**. L'utilisation de FORJA est soumise à des quotas anti-abus (limite de messages par heure et par jour). Toute tentative de contournement (multi-comptes, automatisation) peut entraîner la suspension.
```

💡 **Justif** : "compte gratuit unique" est ambigu post-pivot (on dirait que le palier gratuit est une offre fermée). On parle simplement de "un compte par personne" + on mentionne les quotas anti-abus qui sont la vraie protection.

---

#### 🔴 Proposition #7 — Politique de remboursement (l.128-144)

❌ **TEXTE ACTUEL** :
```md
## Principe

Les crédits achetés débloquent la génération de documents. En raison de la nature numérique et immédiate du service, **les crédits déjà consommés ne sont pas remboursables**.

## Crédits non utilisés

Une demande de remboursement portant sur des **crédits non consommés** peut être étudiée dans un délai de 14 jours après l'achat, sur demande écrite à **${COMPANY.contact}**.

## Problème technique

En cas d'échec de génération imputable à un dysfonctionnement de notre service, le crédit correspondant est recrédité automatiquement ou sur demande.

## Traitement

Les remboursements éventuels sont effectués via le même moyen de paiement (FedaPay) que l'achat initial.

${today}
```

✅ **TEXTE PROPOSÉ** :
```md
## Principe

La discussion avec FORJA est gratuite et illimitée — tu peux juger sur pièce avant tout achat. Pour l'export en PDF, tu paies un pack de crédits (Essai, Starter, Pro ou Studio). Chaque crédit débloque un document PDF.

En raison de la nature numérique et immédiate du service, **les crédits déjà consommés ne sont pas remboursables**.

## Crédits non utilisés

Si tu n'es pas satisfait, écris-nous à **${COMPANY.contact}**. Notre équipe étudie chaque demande au cas par cas et te répond personnellement.

## Problème technique

En cas d'échec de génération imputable à un dysfonctionnement de notre service, le crédit correspondant est recrédité automatiquement ou sur demande.

## Pack Essai

Le pack Essai (3 500 FCFA, 10 documents) est un palier d'entrée disponible **une seule fois par compte**. Au-delà, les autres packs (Starter, Pro, Studio) restent ouverts.

## Traitement

Les remboursements éventuels sont effectués via le même moyen de paiement (FedaPay) que l'achat initial.

${today}
```

💡 **Justif** : (1) retire le délai chiffré "14 jours" (consigne Fresnel offers.md : "NE PAS afficher de délai"), (2) ajoute le contexte chat gratuit (cohérence pivot), (3) explicite la règle Essai 1× (nouveauté technique exposée côté UI grisée), (4) ton "écris-nous, on étudie au cas par cas" matche la décision Fresnel "satisfait ou remboursé — équipe au cas par cas".

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/app/page.tsx`

---

#### 🟠 Proposition #8 — Bullets pack Starter ambigu (l.23)

❌ **TEXTE ACTUEL** :
```tsx
starter: {
  accroche: "Pour lancer tes premiers produits.",
  unite: "30 documents · 350 F le document",
  bullets: ["30 documents par mois", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)"],
  cta: "Choisir Starter",
},
```

✅ **TEXTE PROPOSÉ** :
```tsx
starter: {
  accroche: "Pour lancer tes premiers produits.",
  unite: "30 documents · 350 F le document",
  bullets: ["30 documents PDF", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)", "Accès complet à la méthode FORJA"],
  cta: "Choisir Starter",
},
```

💡 **Justif** : on harmonise le format des bullets avec Essai (qui a 4 bullets dont "Accès complet à la méthode FORJA"). "Par mois" est trompeur post-pivot — c'est un pack ponctuel, pas un abonnement à débit auto. On retire l'inertie sémantique de "par mois".

---

#### 🟠 Proposition #9 — Bullets pack Pro idem (l.29)

❌ **TEXTE ACTUEL** :
```tsx
pro: {
  accroche: "Le meilleur rapport pour produire chaque semaine.",
  unite: "50 documents · 300 F le document",
  bullets: ["50 documents par mois", "Meilleur prix au document", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)"],
  cta: "Choisir Pro →",
},
```

✅ **TEXTE PROPOSÉ** :
```tsx
pro: {
  accroche: "Le meilleur rapport pour produire chaque semaine.",
  unite: "50 documents · 300 F le document",
  bullets: ["50 documents PDF", "Meilleur prix au document", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)"],
  cta: "Choisir Pro →",
},
```

💡 **Justif** : idem — "par mois" induit l'idée d'abonnement récurrent automatique alors que c'est ponctuel.

---

#### 🟠 Proposition #10 — Bullets pack Studio idem (l.35)

❌ **TEXTE ACTUEL** :
```tsx
studio: {
  accroche: "Pour industrialiser ta production.",
  unite: "200 documents · 225 F le document",
  bullets: ["200 documents par mois", "Le tarif le plus bas au document", "Choix du modèle d'IA", "Crédits valables 31 jours"],
  cta: "Choisir Studio",
},
```

✅ **TEXTE PROPOSÉ** :
```tsx
studio: {
  accroche: "Pour industrialiser ta production.",
  unite: "200 documents · 225 F le document",
  bullets: ["200 documents PDF", "Le tarif le plus bas au document", "Choix du modèle d'IA", "Crédits valables 31 jours"],
  cta: "Choisir Studio",
},
```

💡 **Justif** : cohérence avec Essai/Starter/Pro.

---

#### 🟠 Proposition #11 — Section "Pourquoi nous faire confiance" — bloc 01 (l.328)

❌ **TEXTE ACTUEL** :
```tsx
['Teste, ne crois pas', 'Cinq documents gratuits, sans carte. La meilleure preuve, c\'est le PDF que tu tiens en main à la fin.'],
```

✅ **TEXTE PROPOSÉ** :
```tsx
['Discute, ne paie pas en aveugle', "La conversation avec FORJA est gratuite et illimitée. Explore ton idée, valide ton marché, construis ton offre — sans sortir un franc. Quand tu vois la qualité, tu décides."],
```

💡 **Justif** : **CRITIQUE** mais classé 🟠 car peu visible (3ᵉ section). C'est le résidu freemium le plus visible côté landing. On bascule sur la nouvelle preuve = "discute gratuitement avant d'investir" (cf. consigne Fresnel point 3).

---

#### 🟡 Proposition #12 — Final CTA "Allumer mon four — gratuit" (l.391)

❌ **TEXTE ACTUEL** :
```tsx
Allumer mon four — gratuit →
```

✅ **TEXTE PROPOSÉ — option A (conserver, recommandée)** :
*Aucun changement.* L'inscription est effectivement gratuite (aucune carte demandée). Le mot "gratuit" reste juste.

✅ **TEXTE PROPOSÉ — option B (si on veut désamorcer toute ambiguïté)** :
```tsx
Allumer mon four — inscription gratuite →
```

💡 **Justif & ma reco** : **garder "gratuit"**. Le contexte est ultra-clair (final CTA, après la section tarifs). Ajouter "inscription" alourdit. À garder en réserve si on observe des plaintes "j'ai cru que tout était gratuit".

---

#### 🟡 Proposition #13 — Section "Aucun risque" peut renforcer la nouveauté chat (l.302-304)

❌ **TEXTE ACTUEL** :
```tsx
<div style={{ fontFamily: FV.serif, fontSize: isMobile ? 18 : 20, color: FV.ink, fontWeight: 500, marginBottom: 8 }}>Aucun risque de ton côté.</div>
<p style={{ fontSize: 14, color: FV.ink2, lineHeight: 1.6, margin: 0 }}>
  Satisfait ou remboursé sur les packs — notre équipe s&apos;en occupe, au cas par cas. Les crédits achetés sont valables 31 jours. La discussion avec FORJA, elle, reste gratuite et sans limite.
</p>
```

✅ **TEXTE PROPOSÉ** :
```tsx
<div style={{ fontFamily: FV.serif, fontSize: isMobile ? 18 : 20, color: FV.ink, fontWeight: 500, marginBottom: 8 }}>Le risque, c&apos;est nous qui le portons.</div>
<p style={{ fontSize: 14, color: FV.ink2, lineHeight: 1.6, margin: 0 }}>
  Discute autant que tu veux avec FORJA — c&apos;est gratuit et illimité. Tu n&apos;investis qu&apos;au moment d&apos;exporter ton PDF. Et même là : satisfait ou remboursé sur les packs, notre équipe s&apos;en occupe au cas par cas. Les crédits achetés restent valables 31 jours.
</p>
```

💡 **Justif** : (1) ordre logique inversé (chat gratuit d'abord, garantie ensuite) = miroir du parcours réel, (2) "le risque c'est nous qui le portons" = formule plus mémorisable que "aucun risque de ton côté", (3) introduit le concept "discute avant d'investir" qui est la nouvelle promesse-clé.

---

#### 🟡 Proposition #14 — Hero subline peut inclure le pivot (l.110)

❌ **TEXTE ACTUEL** :
```tsx
Tu as un savoir, une compétence, une idée. FORJA la transforme en vrai produit digital — ebook, formation, page de vente — et te le livre fini, prêt à vendre et à <span style={{ color: FV.brass, fontFamily: FV.serif, fontStyle: 'italic' }}>encaisser en mobile money</span>.
<br /><br />
Pas dans six mois. En quelques sessions, au feu, à l&apos;enclume, au marteau.
```

✅ **TEXTE PROPOSÉ** :
```tsx
Tu as un savoir, une compétence, une idée. FORJA la transforme en vrai produit digital — ebook, formation, page de vente — et te le livre fini, prêt à vendre et à <span style={{ color: FV.brass, fontFamily: FV.serif, fontStyle: 'italic' }}>encaisser en mobile money</span>.
<br /><br />
Discute librement, autant que tu veux. Tu ne paies qu&apos;au moment d&apos;exporter ton PDF.
```

💡 **Justif** : on remplace le bloc "Pas dans six mois. Au feu, à l'enclume…" par une **annonce explicite du modèle économique** dès le hero. La métaphore forge est déjà partout ailleurs sur la page — ici on a besoin de clarté commerciale, pas de poésie. Cohérence avec la micro-réassurance juste en dessous ("Conversation gratuite · Sans carte · PDF dès 3 500 F").

⚠️ **Variante conservatrice** si Fresnel tient à garder "Au feu, à l'enclume" dans le hero :
```tsx
Tu as un savoir, une compétence, une idée. FORJA la transforme en vrai produit digital — ebook, formation, page de vente — et te le livre fini, prêt à vendre et à <span style={{ color: FV.brass, fontFamily: FV.serif, fontStyle: 'italic' }}>encaisser en mobile money</span>.
<br /><br />
Discussion gratuite et illimitée. Tu ne paies qu&apos;au moment d&apos;exporter. Au feu, à l&apos;enclume, au marteau.
```

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/lib/email.ts`

---

#### 🟠 Proposition #15 — Email Bienvenue : étape 04 "Sors ton premier PDF" implique gratuit (l.144)

❌ **TEXTE ACTUEL** :
```ts
const steps = [
  ["01", "Lis l'Oracle",             "Six lectures pour repérer le signal sous le bruit."],
  ["02", "Trouve ton Triangle d'Or", "L'intersection de ce que tu sais, aimes, et qu'on te demande."],
  ["03", "Forge ta première offre",  "Promesse mesurable, transformation, prix tenu."],
  ["04", "Sors ton premier PDF",     "Tes conclusions, propres et signées FORJA."],
];
```

✅ **TEXTE PROPOSÉ** :
```ts
const steps = [
  ["01", "Lis l'Oracle",             "Six lectures pour repérer le signal sous le bruit."],
  ["02", "Trouve ton Triangle d'Or", "L'intersection de ce que tu sais, aimes, et qu'on te demande."],
  ["03", "Forge ton offre",          "Promesse mesurable, transformation, prix tenu. Tout ça en conversation, gratuit."],
  ["04", "Exporte ton PDF",          "Quand ton offre est prête, un pack à partir de 3 500 F suffit."],
];
```

💡 **Justif** : l'email actuel laisse l'utilisateur croire que sortir un PDF fait partie du parcours gratuit. Maintenant que ce n'est plus le cas, on doit lui dire honnêtement où passe la transaction. La transparence renforce la confiance — surtout pour Komlan, méfiant des outils étrangers.

---

#### 🟡 Proposition #16 — Email Bienvenue : lead (l.164)

❌ **TEXTE ACTUEL** :
```ts
${lead(`Le four est allumé. Ton compte est créé.<br>FORJA, c'est ton atelier pour transformer une idée en vrai produit digital — un ebook, une formation, une offre — et le livrer fini, prêt à vendre.`)}
```

✅ **TEXTE PROPOSÉ** :
```ts
${lead(`Le four est allumé. Ton compte est créé.<br><br>FORJA, c'est ton atelier pour transformer une idée en vrai produit digital — un ebook, une formation, une offre.<br><br><strong style="color:${C.ink}">Discute autant que tu veux — c'est gratuit.</strong> Tu paies seulement quand tu veux exporter ton PDF prêt à vendre.`)}
```

💡 **Justif** : on **explicite le modèle** dans le 1ᵉʳ email — moment où l'utilisateur a le plus d'attention. Évite la mauvaise surprise au moment de cliquer "Forger PDF".

---

#### 🟡 Proposition #17 — Email Paiement : note 31 jours (l.247)

❌ **TEXTE ACTUEL** :
```ts
${lead(`Bonjour ${displayName},<br><br>Merci ! Ton paiement a bien été reçu et tes documents ont été ajoutés à ton compte.`)}
```

✅ **TEXTE PROPOSÉ** :
```ts
${lead(`Bonjour ${displayName},<br><br>Merci ! Ton paiement a bien été reçu et tes documents ont été ajoutés à ton compte. Tu as 31 jours pour les utiliser.`)}
```

💡 **Justif** : ajoute la validité **dans le lead** (pas seulement le tableau récap). C'est l'info à retenir n°1 et elle évite des tickets SAV "mes crédits ont disparu".

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/lib/chat-quota.ts`

---

#### 🟠 Proposition #18 — Message quota non-payeur (l.85)

❌ **TEXTE ACTUEL** :
```ts
return `Tu as atteint la limite quotidienne de ${limit} messages gratuits. Prends un pack (à partir de 3 500 FCFA) pour discuter sans limite et exporter ton produit en PDF.`;
```

✅ **TEXTE PROPOSÉ** :
```ts
return `Tu as atteint la limite quotidienne (${limit} messages). Reviens demain pour continuer gratuitement — ou prends un pack (dès 3 500 FCFA, 10 documents) pour discuter sans limite et exporter ton PDF.`;
```

💡 **Justif** : actuellement le message ne dit pas "tu peux revenir demain" — un primo-utilisateur risque de croire qu'il est définitivement bloqué. On lui offre les deux portes (gratuit demain OU pack maintenant), formulation honnête + non-pressante.

---

#### 🟡 Proposition #19 — Message quota client payant (l.83)

❌ **TEXTE ACTUEL** :
```ts
return `Tu as atteint la limite quotidienne (${limit} messages). Reviens demain — ou écris-nous à aide@myforja.digital si c'est bloquant.`;
```

✅ **TEXTE PROPOSÉ** :
```ts
return `Tu as atteint ta limite quotidienne de ${limit} messages. Reviens demain — ou écris-nous à aide@myforja.digital si c'est urgent.`;
```

💡 **Justif** : "si c'est bloquant" est trop dramatique pour un client qui paie. "Si c'est urgent" est plus respectueux + plus actionnable.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/app/api/payment/create/route.ts`

---

#### 🟡 Proposition #20 — Message ESSAI_ALREADY_USED (l.37)

❌ **TEXTE ACTUEL** :
```ts
message: "Le pack Essai est disponible une seule fois. Passe à Starter (30 documents) pour continuer.",
```

✅ **TEXTE PROPOSÉ** :
```ts
message: "Tu as déjà utilisé ton pack Essai (palier d'entrée à 3 500 F, disponible une fois). Pour continuer à exporter, passe à Starter (30 documents · 10 500 F) ou plus.",
```

💡 **Justif** : le message actuel est sec et peut paraître punitif. Le nouveau explique POURQUOI (palier d'entrée), donne le contexte chiffré, et propose la suite logique avec son prix. Plus pédagogique, moins frustrant.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/app/api/export/pdf/route.ts`

---

#### 🟢 Proposition #21 — Message 402 quota (l.44) — déjà OK, micro-ajustement P3

❌ **TEXTE ACTUEL** :
```ts
{ error: "QUOTA_EXCEEDED", message: "Pour exporter ton produit en PDF, il te faut un pack. Le plus accessible démarre à 3 500 FCFA (10 documents)." },
```

✅ **TEXTE PROPOSÉ** :
```ts
{ error: "QUOTA_EXCEEDED", message: "Pour exporter ton produit en PDF, il te faut un pack de crédits. Le plus accessible : Essai à 3 500 FCFA (10 documents PDF, achetable une fois)." },
```

💡 **Justif** 🟡 : explicite que c'est "Essai" et signale que c'est une seule fois — l'utilisateur sait à quoi s'attendre avant de cliquer. Petite amélioration UX, pas critique.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/lib/seo/structured-data.ts`

---

#### 🟡 Proposition #22 — FAQ Q1 "Qu'est-ce que FORJA ?" (l.14-17)

❌ **TEXTE ACTUEL** :
```ts
{
  question: "Qu'est-ce que FORJA ?",
  answer:
    "FORJA est un studio digital piloté par une intelligence artificielle qui te guide pas à pas pour transformer une idée en produit digital prêt à vendre (ebook, guide, kit) et génère un PDF professionnel en quelques minutes.",
},
```

✅ **TEXTE PROPOSÉ** :
```ts
{
  question: "Qu'est-ce que FORJA ?",
  answer:
    "FORJA est ton atelier pour transformer une idée en vrai produit digital — ebook, formation, page de vente. Tu discutes gratuitement avec lui pour construire ton offre, et quand tu es prêt, il te livre un PDF professionnel prêt à vendre.",
},
```

💡 **Justif** : (1) intègre la dualité chat gratuit / PDF payant dès la 1ʳᵉ réponse FAQ (la plus lue par Google + utilisateurs), (2) remplace "piloté par une intelligence artificielle" par "ton atelier" (brand-voice : ne pas se vendre comme une IA), (3) "page de vente" remplace "kit" car c'est ce qui est exposé dans ExportModal.

---

### 📁 `C:/Users/LUFFY MKD/Forja_Digital_studio/src/components/ConsentBanner.tsx`

---

#### 🟢 Proposition #23 — Bandeau cookies (l.64-71) — RAS, juste un raffinement P3

❌ **TEXTE ACTUEL** :
```tsx
<p style={{ fontSize: 13, lineHeight: 1.55, color: C.ink2, margin: "0 0 16px" }}>
  Pour comprendre comment FORJA est utilisé et l&apos;améliorer, on aimerait activer deux outils
  de mesure (PostHog &amp; Microsoft Clarity). <strong style={{ color: C.ink }}>Aucune donnée
  n&apos;est envoyée tant que tu n&apos;as pas accepté.</strong> Ton choix reste en local sur ton appareil.{" "}
  <Link href="/legal/confidentialite" style={{ color: C.ember, textDecoration: "underline" }}>
    En savoir plus
  </Link>
</p>
```

✅ **TEXTE PROPOSÉ** (raffinement de phrasing uniquement) :
```tsx
<p style={{ fontSize: 13, lineHeight: 1.55, color: C.ink2, margin: "0 0 16px" }}>
  Pour comprendre comment FORJA est utilisé et l&apos;améliorer, on aimerait activer deux outils
  de mesure d&apos;audience (PostHog &amp; Microsoft Clarity, hébergés en UE). <strong style={{ color: C.ink }}>Rien n&apos;est envoyé tant que tu n&apos;as pas accepté.</strong> Ton choix reste sur ton appareil — tu peux changer d&apos;avis à tout moment.{" "}
  <Link href="/legal/confidentialite" style={{ color: C.ember, textDecoration: "underline" }}>
    En savoir plus
  </Link>
</p>
```

💡 **Justif** : (1) "hébergés en UE" rassure (RGPD), (2) "tu peux changer d'avis à tout moment" lève l'objection "et si je clique sur la mauvaise option". Note : c'est techniquement vrai (la fonction `setConsent` permet le revoke).

---

## 3. ZONES INSPECTÉES ET VOLONTAIREMENT NON TOUCHÉES (décision Fresnel)

Voici les passages où j'ai été tenté d'intervenir mais où je m'abstiens par respect des consignes :

| Fichier | Passage | Pourquoi je n'y touche pas |
|---|---|---|
| `page.tsx` l.193 | "Les autres te donnent des conseils. FORJA te rend un produit fini." | **Pitch central protégé par Fresnel** — c'est exactement l'angle "expliquent / livrent" qu'il a réaffirmé. Je raffinerais juste à un poil ("livre" plutôt que "rend") mais c'est cosmétique → P4, je laisse. |
| `page.tsx` l.238 | "Les autres t'expliquent comment faire. FORJA le fait avec toi — et te rend le fichier." | Idem, même angle protégé. |
| `page.tsx` l.245-247 | Tableau "Une formation / un produit fini exporté en PDF" | Solide, ne touche pas. |
| `page.tsx` l.347-348 | "Tu ne vends jamais un fichier. Tu vends une transformation" | Citation signature de la marque, intouchable. |
| `chat/page.tsx` l.58 | `buildWelcomeMessage` (cas sans onboarding) | Aligné avec le pivot ("livrable fini, un PDF pro"), aucun résidu freemium. RAS. |
| `chat/page.tsx` l.26-31 | QUICK_PROMPTS | OK post-pivot, parle de "Aide-moi" → chat = gratuit, donc l'utilisateur ne se prend pas une note "ça va te coûter". RAS. |
| `email.ts` l.221 | "Clé reforgée" (mot de passe modifié) | Magnifique, ne touche pas. |
| `email.ts` l.115 | "Une dernière étape avant de battre le métal" (OTP) | Signature, ne touche pas. |
| `prompts.ts` (système) | Toute la persona "30 ans" | Persona interne, jamais sortie côté UI. Respecté la consigne : pas d'audit, pas de modif. |
| `FAQ_ITEMS` Q2 à Q8 | Toutes les autres FAQ | Déjà mises à jour au pivot (j'ai vérifié), nickel. |

---

## 4. 🚩 DRAPEAU PROMPT SYSTÈME (pour décision Fresnel)

**Vérification effectuée** : recherche grep dans `src/lib/llm/prompts.ts` des chaînes "5 documents", "FREE_DOC", "freemium", "5 docs", "free" (case-insensitive).

**Résultats** :
- Ligne 241 : `"Situation : freelance, salarié, entrepreneur, créateur de contenu…"` — RAS, pas lié au modèle économique.
- Ligne 289-292 : prompt FORJA qui parle d'**outils tiers** ("alternatives gratuites/payantes") dans le contexte de la **Roadmap d'outils méthodologiques** — RAS, c'est de la pédagogie sur des outils externes (Canva, Notion…).
- Ligne 464 : `"Abonnement mensuel/annuel (idéal), freemium, à l'usage, ou licence unique."` — RAS, c'est FORJA qui **enseigne** les modèles éco à l'utilisateur. Pas de contradiction avec notre propre modèle.
- Ligne 552 : `"standard — modèles HF rapides et gratuits"` — RAS, parle des modèles de génération d'images.

**Verdict** : 🟢 **AUCUN DRAPEAU CRITIQUE.** Le prompt système ne contient aucune référence aux "5 documents gratuits FORJA" ni à l'ancien modèle freemium. Il peut rester strictement tel quel.

**Note secondaire (P3, à toi de voir)** : la persona "30 ans" est conservée comme convenu (cf. l.X de ton brief). Je n'ai rien à signaler côté incohérence utilisateur-visible.

---

## 5. 📝 MISE À JOUR DE `docs/offers.md` — proposition complète

Voir le nouveau contenu dans le fichier `C:/Users/LUFFY MKD/Forja_Digital_studio/docs/offers.md` (que je vais réécrire en parallèle de cet audit).

**Résumé des changements** :
- Suppression de "OFFRE 0 — GRATUIT (5 documents PDF gratuits À VIE)" — remplacée par "OFFRE 0 — CONVERSATION GRATUITE ILLIMITÉE".
- Ajout en première position payante : "OFFRE 1 — PACK ESSAI (3 500 F, 10 docs, 1× par compte)".
- Renumérotation : Starter → 2, Pro → 3, Studio → 4.
- Section "🛡️ GARANTIE" mise à jour : la preuve principale n'est plus "5 docs gratuits" mais "chat gratuit illimité".
- Section "🎯 PARCOURS CLIENT" : nouveau funnel chat libre → Essai → Starter/Pro → Studio.
- Section "📊 PREUVES & DONNÉES" : ajoute les quotas chat (50/jour non-payeur, 300/jour client) comme rempart anti-abus.
- Objection PRIX (avatar-client.md référence "5 documents gratuits à vie") : à mettre à jour ailleurs dans `avatar-client.md` ligne 121 — **je le flagge mais ne le modifie pas** (hors périmètre que tu m'as donné : tu as dit "tu peux écrire offers.md", pas avatar-client.md).

---

## 6. ⚠️ EFFETS DE BORD À VÉRIFIER PENDANT L'IMPLÉMENTATION

À surveiller par Kody lors de l'application des changements :

1. **Cohérence "par mois" / "par achat"** (props #8, #9, #10) : vérifier que **plans.ts** lui-même ne définit pas un champ qui hardcode "par mois" quelque part (ex. label exposé dans le payload FedaPay ou dans des emails secondaires). Grep recommandé : `par mois` dans tout `src/`.

2. **Prop #4 (SITE_DESCRIPTION)** : ce texte alimente **OpenGraph** (partage social) + **meta description SEO**. Vérifier sur Twitter Card Validator et Facebook Debugger après déploiement que le snippet rentre bien dans 160 chars (j'ai compté ~190 chars dans ma version — à raccourcir si Google tronque). Variante courte si besoin :
   ```
   "FORJA transforme ton idée en produit digital prêt à vendre. Discussion gratuite, PDF pro dès 3 500 FCFA. Mobile money."
   ```

3. **Prop #11 (section "Pourquoi nous faire confiance" bloc 01)** : le titre du bloc change ("Teste, ne crois pas" → "Discute, ne paie pas en aveugle"). Le bloc 02 ("La méthode est l'autorité") et le bloc 03 ("Le livrable parle") restent cohérents — vérifier visuellement que les 3 titres gardent un parallélisme rythmique.

4. **Prop #15 (steps email bienvenue)** : la cellule `[steps[3][2]]` change ("Tes conclusions, propres et signées FORJA" → "Quand ton offre est prête, un pack à partir de 3 500 F suffit"). Vérifier que le rendu HTML (table 2x2) gère bien la longueur sur petit écran mobile email (Gmail mobile = 320px de large).

5. **Prop #7 (politique remboursement)** : le contenu par défaut peut être OVERRIDÉ par une ligne en base (`LegalPage` table). Si Fresnel a déjà personnalisé `/legal/remboursement` côté back office, le `defaultLegalContent` n'aura aucun effet visible. **À VÉRIFIER côté admin** : si une version custom existe, Fresnel doit la mettre à jour aussi.

6. **`avatar-client.md` ligne 121** mentionne encore "5 documents à vie, sans carte" comme stratégie de réponse à l'objection PRIX. À mettre à jour dans une session séparée — je le laisse en l'état car non listé dans mon périmètre d'écriture.

7. **Cohérence `chat/page.tsx` l.407**  : la sidebar affiche `"v.1 · LIBRE"` (label utilisateur free) et l.465 idem (`"LIBRE"`). Ces labels sont OK post-pivot ("Libre" = pas encore payé, cohérent avec "chat libre/gratuit"). À garder.

---

## 7. 📊 COMPTEUR FINAL

| Priorité | Nombre | Implémentation estimée |
|----------|--------|------------------------|
| 🔴 **P1 — CRITIQUE** | **5** | 25 min |
| 🟠 **P2 — IMPORTANT** | **8** | 40 min |
| 🟡 **P3 — POLISH** | **10** | 25 min |
| **TOTAL** | **23 propositions** | **~1h30** |

### Détail P1 (critique) :
- #1 Fallback "5 documents gratuits" dans ExportModal
- #4 SITE_DESCRIPTION vouvoiement + ancien pitch
- #6 CGU section 2 "compte gratuit unique" ambigu
- #7 Politique remboursement (délai 14j contraire à consigne Fresnel + manque mention Essai)
- #11 Landing "Pourquoi nous faire confiance" bloc 01 (résidu "5 documents gratuits")

### Détail P2 (important) :
- #2 Anglicismes ExportModal (Copywriting / Blueprint / Roadmap)
- #8, #9, #10 "par mois" sur les bullets packs (Starter/Pro/Studio)
- #13 Réassurance "Aucun risque" reformulée
- #14 Hero subline intègre le nouveau modèle
- #15 Email bienvenue étape 04 sous-entend gratuit
- #18 Message quota non-payeur ouvre la porte "reviens demain"

### Détail P3 (polish) :
- #3 dashboard/tableau de bord DemoModal
- #5 SITE_TAGLINE alignée au H1
- #12 CTA final "gratuit" — reco garder
- #16 Email bienvenue lead explicite le modèle
- #17 Email paiement mentionne 31 jours dans le lead
- #19 Message quota client payant ("bloquant" → "urgent")
- #20 Message ESSAI_ALREADY_USED plus pédagogique
- #21 Message 402 export PDF — précision "Essai"
- #22 FAQ Q1 "Qu'est-ce que FORJA"
- #23 Bandeau cookies "hébergés en UE" + droit de revoke

---

**Marcus — fin d'audit.**
*Mission terminée, Kody. Tu peux présenter ce rapport à Fresnel pour validation pack par pack (P1 d'abord, P2 ensuite, P3 en option de finition).*
