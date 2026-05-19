# Pipeline Complet de Génération PDF FORJA

## 📊 Vue d'ensemble

Le pipeline PDF de FORJA suit ce flux exact avec **observabilité complète** :

```
Utilisateur → ExportModal → /api/export/pdf → Markdown → Images → HTML → Puppeteer → PDF
```

---

## 🔍 Points de Suivi du Pipeline

### 1️⃣ **REQUEST START** (route.ts:18-21)
```
[PDF-{requestId}] ⏱️ Début de la requête
```
- ✅ RequestID généré (8 caractères aléatoires)
- ✅ startTime enregistré
- ✅ Utilisé pour tracer la requête dans tous les logs

### 2️⃣ **AUTHENTICATION** (route.ts:23-34)
```
[PDF-{requestId}] ✓ Authentification OK
```
ou
```
[PDF-{requestId}] ❌ Non authentifié
[PDF-{requestId}] ❌ Rate limit dépassée
```

### 3️⃣ **REQUEST VALIDATION** (route.ts:37-52)
```
[PDF-{requestId}] 📦 Données reçues: 15 messages, type=ebook
[PDF-{requestId}] ⚙️ Options: cover=true, signature=true, printer=false
```

### 4️⃣ **MESSAGE TRUNCATION** (route.ts:62-63)
```
[PDF-{requestId}] 📝 Messages tronqués: 14 messages (budget caractères: 4194304)
```
- Sélectionne les messages pertinents
- Respecte la limite de tokens Claude

### 5️⃣ **LLM CALL #1 - Content Generation** (route.ts:65-69)
```
[PDF-{requestId}] ✓ LLM #1 terminé en 2847ms (markdown: 12456 chars)
```
- ✅ Génère le contenu principal en Markdown
- ✅ Durée mesurée en millisecondes
- ✅ Taille du markdown retourné

**Format Markdown attendu:**
```markdown
# Titre du Document
## Section 1
Contenu...
## Section 2
Contenu...
```

### 6️⃣ **IMAGE PLANNING & GENERATION** (route.ts:76-79)
```
[PDF-{requestId}] ✓ Images traitées en 3214ms
```

**Détail interne (image-planner.ts):**
```
[IMAGE] Plan reçu: 5 images proposées
[IMAGE] Headings trouvés: 8 → [Section 1, Section 2, ...]
[IMAGE] Génération de 5 images (limite: 5)...
[IMAGE] Génération image pour section_index=0 heading="## Section 1" quality=high
[IMAGE] Résultat génération: succès (data:image/jpeg...)
[IMAGE] Résultat génération: échec
```

### 7️⃣ **MARKDOWN → HTML CONVERSION** (route.ts:81-86)
```
[PDF-{requestId}] ✓ HTML converti en 234ms
```
- ✅ marked.parse() : Markdown → HTML
- ✅ processMermaidBlocks() : Diagrammes Mermaid → SVG
- ✅ processCharts() : Graphiques → HTML/Canvas

### 8️⃣ **PUPPETEER LAUNCH & PDF GENERATION** (route.ts:94-115)
```
[PDF-{requestId}] 🌐 Lancement Puppeteer...
[PDF-{requestId}] ✓ Puppeteer lancé
[PDF-{requestId}] ✓ Nouvelle page créée
[PDF-{requestId}] ✓ Contenu HTML chargé
[PDF-{requestId}] ✓ Attente 1s (images/fonts)
[PDF-{requestId}] ✓ PDF généré en 1856ms (taille: 245680 bytes)
```

### 9️⃣ **COMPLETION & SUMMARY** (route.ts:117-119)
```
[PDF-{requestId}] ✅ SUCCÈS - Durée totale: 8151ms
[PDF-{requestId}] 📊 Résumé: LLM=2847ms, Images=3214ms, HTML=234ms, Puppeteer=1856ms
```

**Response Headers:**
```
X-PDF-Request-ID: a1b2c3d4
X-PDF-Duration-MS: 8151
```

### 🔟 **ERROR HANDLING** (route.ts:136-143)
```
[PDF-{requestId}] ❌ ERREUR après 2456ms: Error message here
```
- ✅ RequestID inclus pour debugging
- ✅ Durée au moment de l'erreur
- ✅ Message d'erreur détaillé en réponse JSON

---

## 👤 Client-Side Tracking (ExportModal.tsx)

### Capture des Headers
```javascript
const requestId = res.headers.get("X-PDF-Request-ID");  // a1b2c3d4
const duration = parseInt(res.headers.get("X-PDF-Duration-MS")); // 8151
```

### Console Logging
```javascript
console.log(`[a1b2c3d4] PDF generated successfully in 8151ms`)
console.error(`[a1b2c3d4] PDF generation failed: Error message`)
```

### Success Display
Affiche:
- ⏱️ Durée: **8.15s**
- 🔖 ID: **a1b2c3d4**

(Permettant au client de retrouver les logs Vercel avec ce requestId)

---

## 🚨 **Checklist de Vérification du Pipeline**

À chaque génération PDF, vérifier dans les logs Vercel:

- [ ] `[PDF-{requestId}] ⏱️ Début de la requête` - START
- [ ] `[PDF-{requestId}] ✓ Authentification OK` - Auth passée
- [ ] `[PDF-{requestId}] 📦 Données reçues: X messages` - X = nombre de messages
- [ ] `[PDF-{requestId}] 📝 Messages tronqués: Y messages` - Y ≤ 20 (sliding window)
- [ ] `[PDF-{requestId}] ✓ LLM #1 terminé en XXXms` - Temps raisonnable (1000-5000ms)
- [ ] `[IMAGE] Plan reçu: N images proposées` - N ≤ 5 (nouvelle limite)
- [ ] `[IMAGE] Génération de N images...` - Montre combien sont générées
- [ ] `[PDF-{requestId}] ✓ Images traitées en XXXms` - Temps image generation
- [ ] `[PDF-{requestId}] ✓ HTML converti en XXms` - Conversion rapide
- [ ] `[PDF-{requestId}] ✓ PDF généré en XXXms` - Puppeteer OK
- [ ] `[PDF-{requestId}] ✅ SUCCÈS - Durée totale: XXXXms` - SUCCESS
- [ ] `[PDF-{requestId}] 📊 Résumé: LLM=...` - Breakdown complet

**OU pour les erreurs:**
- [ ] `[PDF-{requestId}] ❌ ERREUR après XXXms:` - Error message

---

## 📈 Métriques Attendues

| Étape | Temps Typique | Min | Max |
|-------|---|---|---|
| Auth | <10ms | 5ms | 50ms |
| Validation | <5ms | 1ms | 10ms |
| Messages Truncation | <5ms | 1ms | 20ms |
| LLM #1 Content | **2000-4000ms** | 1500ms | 5000ms |
| Image Planning | <100ms | 50ms | 200ms |
| Image Generation | **2000-5000ms** | 1000ms | 8000ms |
| HTML Conversion | **100-500ms** | 50ms | 1000ms |
| Puppeteer Startup | **500-1500ms** | 300ms | 2000ms |
| PDF Generation | **1000-2500ms** | 500ms | 4000ms |
| **TOTAL** | **6000-9000ms** | 4000ms | 15000ms |

---

## 🔗 Traçabilité Complète

**Exemple de flux pour un PDF généré:**

1. Client voit dans ExportModal: `Durée: 8.15s, ID: a1b2c3d4`
2. Client ouvre Vercel logs
3. Grep par `[PDF-a1b2c3d4]`
4. Voit toute la timeline complète de la génération

**Logs Vercel Complets pour ce PDF:**
```
[PDF-a1b2c3d4] ⏱️ Début de la requête
[PDF-a1b2c3d4] ✓ Authentification OK
[PDF-a1b2c3d4] 📦 Données reçues: 8 messages, type=ebook
[PDF-a1b2c3d4] ⚙️ Options: cover=true, signature=true, printer=false
[PDF-a1b2c3d4] 📝 Messages tronqués: 8 messages (budget caractères: 4194304)
[PDF-a1b2c3d4] ✓ LLM #1 terminé en 2847ms (markdown: 12456 chars)
[PDF-a1b2c3d4] ✓ Images traitées en 3214ms
[IMAGE] Plan reçu: 3 images proposées
[IMAGE] Headings trouvés: 8
[IMAGE] Génération de 3 images (limite: 5)...
[IMAGE] Génération image pour section_index=0 heading="## Introduction" quality=high
[IMAGE] Résultat génération: succès (data:image/jpeg...)
[IMAGE] Génération image pour section_index=2 heading="## Chapitre 1" quality=standard
[IMAGE] Résultat génération: succès (data:image/jpeg...)
[IMAGE] Génération image pour section_index=5 heading="## Conclusion" quality=standard
[IMAGE] Résultat génération: échec
[PDF-a1b2c3d4] ✓ HTML converti en 234ms
[PDF-a1b2c3d4] 🌐 Lancement Puppeteer...
[PDF-a1b2c3d4] ✓ Puppeteer lancé
[PDF-a1b2c3d4] ✓ Nouvelle page créée
[PDF-a1b2c3d4] ✓ Contenu HTML chargé
[PDF-a1b2c3d4] ✓ Attente 1s (images/fonts)
[PDF-a1b2c3d4] ✓ PDF généré en 1856ms (taille: 245680 bytes)
[PDF-a1b2c3d4] ✅ SUCCÈS - Durée totale: 8151ms
[PDF-a1b2c3d4] 📊 Résumé: LLM=2847ms, Images=3214ms, HTML=234ms, Puppeteer=1856ms
```

---

## 🎯 Prochaines Étapes

Pour tester ce pipeline complet:

1. **Générer un PDF** (ex: "Design Irrésistible" ou un autre sujet)
2. **Attendre le succès** dans ExportModal
3. **Noter le requestId et duration** affichés
4. **Ouvrir Vercel logs** → Filtre par `[PDF-{requestId}]`
5. **Vérifier chaque checkpoint** dans le checklist ci-dessus
6. **Analyser les timings** et identifier les goulots d'étranglement

**Questions clés à répondre:**
- ✅ Combien d'images ont été proposées par le planner? (devrait être ≤ 5 maintenant)
- ✅ Combien ont réussi? (voir résultats génération)
- ✅ Quelle étape prend le plus de temps? (LLM vs Images vs Puppeteer)
- ✅ Le PDF final contient-il toutes les images générées?
