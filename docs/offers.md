# 💰 OFFRES — Catalogue FORJA

> Rempli par Kody à partir de `src/lib/plans.ts`, `src/lib/seo/structured-data.ts` (FAQ)
> et de la mémoire projet. Prix RÉELS du code au **2026-05-31** (post-pivot pricing).
> ⚠️ **Modèle économique** : **conversation gratuite illimitée** (avec quotas anti-abus) + **packs PDF payants** (1 crédit = 1 document PDF exporté).
> Pas d'abonnement à débit automatique (renouvellement manuel). Devise : **FCFA (XOF)**, paiement **FedaPay** (mobile money + cartes).

---

## OFFRE 0 — CONVERSATION GRATUITE ILLIMITÉE (point d'entrée)

### 📌 Vue d'ensemble
- **Nom commercial** : Discussion libre / « Forger gratuitement avec FORJA »
- **Type** : palier gratuit à vie, **avec quotas anti-abus invisibles**
- **Statut** : actif (pivot du 2026-05-31)

### 💵 Prix
- **0 FCFA**, sans carte bancaire, sans engagement.
- **Quotas anti-abus** (jamais affichés à l'utilisateur sauf en cas de dépassement) :
  - **30 messages / heure** (anti-burst — partagé entre tous les utilisateurs)
  - **50 messages / jour** pour un non-payeur
  - **300 messages / jour** pour un client (≥ 1 pack acheté avec statut `approved`)
  - **80 messages max par conversation** (au-delà → clôture ou nouvelle session)
- **Aucun document PDF inclus.** L'export PDF est strictement payant (cf. offres 1 à 4).

### 🎯 Promesse principale
**Discuter avec FORJA, valider son idée, structurer son offre, explorer sa cible — entièrement gratuit, sans carte, sans pression.** Tu paies seulement quand tu veux **exporter** ton produit en PDF prêt à vendre.

### 🎁 Ce qui est inclus
- Accès illimité au chat-agent et au framework 12 étapes.
- Méthode complète : Oracle, Triangle d'Or, Matrice de Valeur, 4 Piliers, Flywheel.
- Modèle IA : DeepSeek (par défaut), pas de choix de modèle.
- **0 document PDF.** Pour exporter, voir Pack Essai (3 500 F) ou supérieur.

### 🎯 Rôle dans le tunnel
**Cœur du nouveau positionnement** : "discute autant que tu veux avant d'investir un franc". C'est la nouvelle preuve sociale — l'utilisateur juge la qualité de l'agent **avant** toute transaction. Remplace l'ancien "5 docs gratuits à vie".

---

## OFFRE 1 — PACK ESSAI ⭐ (palier d'entrée, achetable 1× par compte)

### 📌 Vue d'ensemble
- **Nom commercial** : Essai
- **id** : `essai`
- **Type** : pack de crédits — **palier d'entrée, achetable UNE SEULE FOIS par compte**
- **Statut** : actif (nouveauté du 2026-05-31)

### 💵 Prix & paiement
- **Prix** : **3 500 FCFA** pour **10 documents PDF** (**350 F / document**).
- **Limite** : 1 achat maximum par utilisateur (verrouillé côté API + UI grisée si déjà acheté). Au-delà : Starter ou plus.
- **Validité des crédits** : **31 jours glissants** depuis l'achat (`CREDIT_VALIDITY_DAYS = 31`).
- **Paiement** : FedaPay (mobile money + cartes), en FCFA.

### 🎯 Promesse
**Tester l'export PDF FORJA avec un investissement minime.** Si tu n'as jamais essayé un livrable FORJA, ce pack est conçu pour toi : 10 documents pour 3 500 F = le ticket le plus bas du marché ouest-africain pour un PDF pro.

### 🎯 Cible
- Komlan qui a déjà discuté gratuitement, qui a une offre en tête, et qui veut voir le PDF final avant de s'engager sur des packs plus volumineux.
- Curieux à petit budget qui veut juger sur pièce.

### 🛡️ Justification de la règle "1× par compte"
Sans cette règle, un utilisateur peut acheter Essai 3 fois (3 × 10 = 30 docs / 10 500 F) — c'est strictement équivalent à Starter, ce qui casse la value ladder. La règle est techniquement verrouillée dans `api/payment/create/route.ts` (vérifie `existing Payment status="approved" packId="essai"` → 403 ESSAI_ALREADY_USED).

---

## OFFRE 2 — PACK STARTER

### 📌 Vue d'ensemble
- **Nom commercial** : Starter
- **id** : `starter`
- **Type** : pack de crédits (achat ponctuel, renouvellement manuel)
- **Statut** : actif

### 💵 Prix & paiement
- **Prix** : **10 500 FCFA** pour **30 documents** (**350 F / document**).
- **Modalité** : achat ponctuel d'un pack ; pas d'abonnement à débit auto.
- **Validité des crédits** : **31 jours glissants** depuis le dernier rechargement.
- **Paiement** : FedaPay (mobile money + cartes), en FCFA.

### 🎯 Promesse
Pour qui démarre vraiment et veut produire régulièrement sans se ruiner. 3× plus de docs qu'Essai pour 3× le prix — même tarif unitaire, mais sans la limite "1×".

### 🎯 Cible
Créateur qui lance ses premiers produits, volume modéré, qui a déjà passé l'étape Essai (ou qui saute directement à Starter par confiance).

---

## OFFRE 3 — PACK PRO ⭐ (mis en avant)

### 📌 Vue d'ensemble
- **Nom commercial** : Pro
- **id** : `pro` · `highlight: true` (c'est le pack recommandé dans l'UI)
- **Type** : pack de crédits (achat ponctuel, renouvellement manuel)
- **Statut** : actif

### 💵 Prix & paiement
- **Prix** : **15 000 FCFA** pour **50 documents** (**300 F / document** — meilleur ratio que Starter et Essai).
- Validité 31 jours glissants. FedaPay / FCFA.

### 🎯 Promesse
Le meilleur rapport volume/prix pour un créateur actif qui sort des produits chaque semaine.

### 🎯 Cible
Créateur régulier / petit business digital en rythme de croisière. **Pack à pousser par défaut** (badge "RECOMMANDÉ" / "POPULAIRE" dans l'UI).

---

## OFFRE 4 — PACK STUDIO (premium)

### 📌 Vue d'ensemble
- **Nom commercial** : Studio
- **id** : `studio`
- **Type** : pack de crédits premium (achat ponctuel, renouvellement manuel)
- **Statut** : actif

### 💵 Prix & paiement
- **Prix** : **45 000 FCFA** pour **200 documents** (**225 F / document** — le tarif le plus bas).
- Validité 31 jours glissants. FedaPay / FCFA.

### 🎁 Avantage exclusif
- **Choix du modèle d'IA** (le sélecteur de modèle est réservé aux abonnés Studio ; les autres tournent sur DeepSeek imposé).
- **Quota chat client** (300 messages/jour) — comme tous les payeurs.

### 🎯 Cible
Gros producteur / agence / créateur qui industrialise sa production de produits digitaux.

---

## 🧬 MÉCANISME UNIQUE (commun à toutes les offres)

- **Nom du mécanisme** : la **Forge** — méthode de terrain en 13 outils, dont le **Framework 12 étapes** (du Signal de marché à l'effet WOW), qui transforme une idée brute en produit fini.
- **Pourquoi c'est différent** :
  1. Les concurrents (formations, coachs) **expliquent** comment faire. FORJA **livre** un PDF professionnel fini.
  2. **Les concurrents n'expliquent même pas gratuitement** — il faut payer une formation pour avoir des conseils. Ici, **la discussion stratégique est gratuite et illimitée**. Tu paies seulement le livrable final, jamais le conseil.
- **Briques de méthode mobilisables en copy** : Oracle (lire le marché), Triangle d'Or (trouver l'idée), Matrice de Valeur (valider : utile / simple / livrable), 4 Piliers (bâtir l'offre), Flywheel (faire grandir).

---

## 🛡️ GARANTIE / RÉASSURANCE (décision Fresnel 2026-05-24, mise à jour 2026-05-31)

1. **La conversation gratuite et illimitée comme essai sans risque** : tu peux discuter, valider ton idée, construire ton offre avec FORJA — entièrement gratuit. La meilleure preuve, c'est l'expérience que tu vis dans la conversation. C'est la **nouvelle preuve principale**, remplaçante de "5 documents gratuits".
2. **Satisfait ou remboursé** sur les packs payés.
   - **Modalités (décision Fresnel 2026-05-24)** : toute demande de remboursement est **gérée par l'équipe SAV**, au cas par cas, via le contact (aide@myforja.digital). **NE PAS afficher de délai chiffré** ni de conditions chiffrées dans la copie. Formuler la réassurance simplement : « satisfait ou remboursé — notre équipe s'en occupe ».
   - Une page `/legal/remboursement` existe (éditable depuis le back office) : aligner le ton, sans promettre de délai précis.

---

## 🎯 PARCOURS CLIENT (nouveau tunnel d'ascension)

```
1. Visite landing (gratuit, sans compte)
   ↓
2. Inscription (gratuite, ~60s, sans carte)
   ↓
3. Onboarding (3 questions : nom, objectif, niveau)
   ↓
4. CONVERSATION ILLIMITÉE gratuite avec FORJA
   → l'utilisateur valide son idée, construit son offre, juge la qualité
   ↓
5. Clic "Forger PDF" → modale Export → quota épuisé (0 crédits)
   → CTA "Acheter des crédits" → CreditsModal
   ↓
6. Premier achat : PACK ESSAI (3 500 F, 10 PDF) ← palier d'entrée
   ↓
7. Si encore besoin → PACK STARTER (10 500 F, 30 PDF) ou PRO (15 000 F, 50 PDF)
   ↓
8. Si gros producteur → PACK STUDIO (45 000 F, 200 PDF + choix modèle IA)
```

> Note pricing psychologique : Studio fixe l'ancrage haut et le meilleur prix unitaire ;
> Pro est le « choix malin » mis en avant ; Starter rassure les budgets moyens ;
> **Essai est le palier d'entrée à friction quasi-nulle** (3 500 F = le prix d'un menu fast-food).

---

## 📊 PREUVES & DONNÉES
- **Clients / témoignages réels** : **AUCUN à ce jour** (voir `testimonials.md`). Ne rien inventer.
- **Données de conversion** : non disponibles (pré-lancement commercial / FedaPay activé, analytics PostHog branchés depuis 2026-05-31).
- **Analytics actives** (depuis 2026-05-31) : PostHog (EU) + Microsoft Clarity, opt-in strict (bandeau de consentement). Events AARRR câblés : `landing_viewed`, `pricing_viewed`, `pack_selected`, `payment_initiated`, `payment_success`, `signup_completed`.
- Coût estimé par document (interne, ne pas publier) : DeepSeek ~30 F · Haiku ~120 F · Sonnet ~330 F → marges saines sur DeepSeek.
- Coût estimé par message chat (interne) : ~5-10 F selon modèle → quotas anti-abus (50/jour non-payeur) protègent suffisamment la marge.

---

## 🌍 SPÉCIFICITÉS MARCHÉ (Afrique de l'Ouest francophone)
- Prix en **FCFA**, jamais en € ni $.
- Paiement **mobile money** (Moov, MTN, Wave, Orange Money) via FedaPay — argument de réassurance fort (pas besoin de carte bancaire).
- Mobile-first : la copie doit fonctionner sur petit écran et data limitée.
- Pack Essai à **3 500 F = ~5,30 €** : ticket d'entrée volontairement abordable pour le pouvoir d'achat ouest-africain (équivalent d'un repas à emporter).

---

## 🔄 HISTORIQUE DES PIVOTS

- **2026-05-24** : version initiale du document (modèle freemium "5 documents gratuits à vie").
- **2026-05-31** : pivot pricing — bascule en "conversation gratuite illimitée + PDF payant dès 3 500 F (pack Essai 1×)".
  - Suppression du palier gratuit en documents PDF.
  - Ajout du pack Essai (3 500 F / 10 docs, achetable 1× par compte).
  - Mise en place de quotas anti-abus invisibles (30/h, 50/j non-payeur, 300/j client).
  - Branchement analytics PostHog + Clarity, opt-in strict.

---

**Date de dernière mise à jour** : 2026-05-31
**Validé par** : [à valider par Fresnel après audit Marcus]
