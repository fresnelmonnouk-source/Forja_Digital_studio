"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";
import ExportModal from "@/components/chat/ExportModal";
import CreditsModal from "@/components/chat/CreditsModal";
import { FV, FVMark } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { stripImageData } from "@/lib/strip-images";
import { track } from "@/lib/analytics";
import Link from "next/link";
import { Menu, X, RotateCcw, LogOut, Sparkles, ArrowRight, CornerDownLeft, GraduationCap, BookOpen, Cog, Bot, Shield, Trash2, Paperclip, Coins, type LucideIcon } from "lucide-react";

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: Message[];
}

const QUICK_PROMPTS: { Icon: LucideIcon; label: string; text: string }[] = [
  { Icon: GraduationCap, label: "Créer une formation", text: "Je veux créer une formation en ligne. Aide-moi à choisir le sujet, à la construire et à la vendre, pas à pas." },
  { Icon: BookOpen, label: "Créer un ebook", text: "Je veux créer un ebook qui se vend. Aide-moi à trouver le bon sujet, à le structurer et à fixer le prix." },
  { Icon: Cog, label: "Créer un outil en ligne", text: "J'ai une idée d'outil ou d'application en ligne. Aide-moi à vérifier que des gens en veulent, à définir la première version simple, et à préparer le lancement." },
  { Icon: Bot, label: "Automatiser mon travail", text: "Je veux gagner du temps en automatisant des tâches répétitives avec l'IA. Montre-moi par où commencer." },
];

const STEPS = ['Signal', 'Offre', 'Promesse', 'Avatar', 'Douleurs', 'Pédagogie', 'Fil Rouge', 'Outils', 'Auto.', 'Livrables', 'Copy', 'ROI', 'WOW'];

interface OnboardingData {
  name?: string;
  goal?: string;
  level?: string;
}

const GOAL_LABELS: Record<string, string> = {
  formation: "créer une formation en ligne",
  ebook: "lancer un ebook",
  saas: "créer un outil en ligne",
  vente: "construire une offre et sa page de vente",
  automatisation: "automatiser ton travail grâce à l'IA",
  marque: "bâtir ta marque personnelle",
};

const LEVEL_LABELS: Record<string, string> = {
  debutant: "débutant (je commence de zéro)",
  intermediaire: "intermédiaire (j'ai déjà lancé quelque chose)",
  avance: "avancé (je veux faire grandir ce que j'ai déjà)",
};

function buildWelcomeMessage(onboarding: OnboardingData | null): string {
  if (!onboarding?.goal && !onboarding?.level) {
    return "Bonjour, je suis **FORJA**, ton atelier pour transformer une idée en vrai produit digital — un ebook, une formation, une offre — prêt à vendre.\n\nMon rôle : on valide ensemble que ton idée a un marché, on la construit pas à pas, et tu repars avec un livrable fini (un PDF pro). Pas un conseil de plus.\n\n**Dis-moi : c'est quoi, ton idée ?** (Même floue, on part de là.)";
  }
  const goalLabel = onboarding.goal ? GOAL_LABELS[onboarding.goal] ?? onboarding.goal : null;
  const levelLabel = onboarding.level ? LEVEL_LABELS[onboarding.level] ?? onboarding.level : null;
  const firstName = onboarding.name ? ` **${onboarding.name}**` : "";
  let msg = `Bonjour${firstName}, je suis **FORJA**.\n\nJ'ai bien noté ton profil :`;
  if (goalLabel) msg += `\n— **Objectif :** ${goalLabel}`;
  if (levelLabel) msg += `\n— **Niveau :** ${levelLabel}`;
  msg += "\n\nJe vais adapter chaque étape à ta situation. Décris-moi ton idée ou ton projet — on attaque directement.";
  return msg;
}

const stripMessages = (msgs: Message[]) =>
  msgs.map((m) => ({ role: m.role, content: stripImageData(m.content) }));

export default function ChatPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Forgeron";
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin = session?.user?.role === "admin";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [onboarding] = useState<OnboardingData | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("forja_onboarding");
    if (!raw) return null;
    try { return JSON.parse(raw) as OnboardingData; } catch { return null; }
  });

  const initialMessage: Message = {
    role: "assistant",
    content: buildWelcomeMessage(onboarding),
  };

  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    if (typeof window === "undefined") return "auto";
    return localStorage.getItem("forja_llm_provider") || "auto";
  });
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isStudio, setIsStudio] = useState(false); // abonnés Studio : choix du modèle IA
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepsScrollRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  const FILE_CHAR_CAP = 30_000; // borne le contenu joint pour rester sous les limites
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;
    if (file.size > 2_000_000) { alert("Fichier trop volumineux (max 2 Mo)."); return; }
    try {
      let text = await file.text();
      if (text.length > FILE_CHAR_CAP) text = text.slice(0, FILE_CHAR_CAP) + "\n…[fichier tronqué]";
      setAttachedFile({ name: file.name, content: text });
    } catch {
      alert("Impossible de lire ce fichier.");
    }
  };

  useEffect(() => {
    if (session?.user) {
      setIsLoadingHistory(true);
      fetch("/api/conversations")
        .then(res => {
          if (!res.ok) throw new Error("Erreur réseau");
          return res.json();
        })
        .then((data: unknown) => {
          if (Array.isArray(data)) setHistory(data as Conversation[]);
        })
        .catch((err: Error) => console.error("Erreur chargement historique:", err.message))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Sur mobile, la sidebar démarre fermée (elle s'ouvre en overlay à la demande).
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Retour de paiement FedaPay (callback ?payment=done) → affiche le solde à jour.
  // Analytics : fire payment_success côté client (le webhook serveur a déjà fulfilled la commande,
  // FedaPay ne redirige avec ?payment=done que si tout a réussi). No-op sans consentement.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("payment") === "done") {
      track("payment_success");
      setShowCredits(true);
      window.history.replaceState({}, "", "/chat");
    }
  }, []);

  // Statut d'abonnement (Studio = choix du modèle IA débloqué).
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/quota")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setIsStudio(!!d.isStudio); })
      .catch(() => {});
  }, [session]);

  // Fait défiler le stepper pour centrer l'étape active à chaque changement
  // (sinon les étapes avancées sont hors écran → on ne voit pas la progression).
  useEffect(() => {
    const c = stepsScrollRef.current;
    const el = activeStepRef.current;
    if (c && el) {
      c.scrollTo({ left: el.offsetLeft - c.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
    }
  }, [activeStep]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    const file = attachedFile;
    if ((!userText && !file) || loading) return;
    setShowPrompts(false);
    setInput("");
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    // Affichage : texte + chip discret du fichier (pas le contenu brut).
    const displayText = (userText || "(fichier joint)") + (file ? `\n📎 ${file.name}` : "");
    const newMessages: Message[] = [...messages, { role: "user", content: displayText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      // Payload LLM : on injecte le contenu réel du fichier dans le dernier message.
      const payloadMessages = stripMessages(newMessages);
      if (file) {
        const last = payloadMessages[payloadMessages.length - 1];
        last.content = `${userText}\n\n[Fichier joint : ${file.name}]\n"""\n${file.content}\n"""`;
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Seuls les abonnés Studio choisissent le modèle ; les autres → défaut (DeepSeek).
        body: JSON.stringify({ messages: payloadMessages, provider: isStudio ? selectedProvider : "auto" })
      });
      const data = await response.json();
      if (data.usedProvider) setActiveProvider(data.usedProvider);
      const contentText = Array.isArray(data.content)
        ? (data.content as { text?: string }[]).map(b => b.text || "").join("")
        : "";
      let reply: string = contentText || data.error || "Erreur de réponse.";

      // Recherche de marché : si FORJA demande [RECHERCHE: requête], on interroge
      // web + Reddit, puis on lui renvoie les résultats réels pour qu'il synthétise.
      const searchMatch = reply.match(/\[RECHERCHE\s*:\s*([^\]]+)\]/i);
      if (searchMatch) {
        const query = searchMatch[1].trim();
        try {
          const sres = await fetch("/api/search", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const sdata = await sres.json();
          const results: { title: string; snippet: string; url: string; source: string }[] = sdata.results || [];
          if (sdata.configured === false) {
            // Pas de clé de recherche → on retire le tag et on garde la réponse telle quelle.
            reply = reply.replace(searchMatch[0], "").trim();
          } else {
            const resultsText = results.length
              ? results.map((r, i) => `${i + 1}. [${r.source}] ${r.title}\n${r.snippet}\n${r.url}`).join("\n\n")
              : "Aucun résultat pertinent trouvé.";
            const followup = [
              ...stripMessages(newMessages),
              { role: "assistant", content: "Je consulte le marché en temps réel…" },
              { role: "user", content: `Résultats de recherche web réels pour « ${query} » :\n\n${resultsText}\n\nAnalyse ces données et poursuis ta réponse en t'appuyant dessus. Ne réémets PAS de tag [RECHERCHE].` },
            ];
            const r2 = await fetch("/api/chat", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: followup, provider: selectedProvider }),
            });
            const d2 = await r2.json();
            const t2 = Array.isArray(d2.content) ? (d2.content as { text?: string }[]).map(b => b.text || "").join("") : "";
            reply = t2 || reply.replace(searchMatch[0], "").trim();
          }
        } catch {
          reply = reply.replace(searchMatch[0], "").trim();
        }
      }

      // Détection et génération des images [GENERATE_IMAGE:qualité:type|description]
      const imageTagRegex = /\[GENERATE_IMAGE:(standard|high|premium):(cover|illustration|diagram|header|photo)\|([^\]]+)\]/g;
      const imageTags: { fullMatch: string; quality: string; type: string; description: string }[] = [];
      let imgMatch;
      while ((imgMatch = imageTagRegex.exec(reply)) !== null) {
        imageTags.push({ fullMatch: imgMatch[0], quality: imgMatch[1], type: imgMatch[2], description: imgMatch[3] });
      }
      if (imageTags.length > 0) {
        const imageResults = await Promise.all(
          imageTags.map(async (img) => {
            try {
              const res = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quality: img.quality, type: img.type, description: img.description }),
              });
              if (!res.ok) return { fullMatch: img.fullMatch, url: null, credit: undefined };
              const json = await res.json();
              return { fullMatch: img.fullMatch, url: json.url as string | null, credit: json.credit as string | undefined };
            } catch {
              return { fullMatch: img.fullMatch, url: null, credit: undefined };
            }
          })
        );
        for (const result of imageResults) {
          if (result.url) {
            const creditLine = result.credit ? `\n*Photo : ${result.credit} / Unsplash*` : "";
            reply = reply.replace(result.fullMatch, `\n\n![image](${result.url})${creditLine}\n\n`);
          } else {
            reply = reply.replace(result.fullMatch, "");
          }
        }
      }

      const pdfTagMatch = reply.match(/\[GENERATE_PDF:(ebook|formation|vente|blueprint)\]/);
      if (pdfTagMatch) {
        reply = reply.replace(/\[GENERATE_PDF:(ebook|formation|vente|blueprint)\]/, "").trim();
      }
      // Filet de sécurité : si l'utilisateur demande explicitement un PDF/document,
      // on ouvre la modale d'export même si le modèle a "oublié" (ou refusé) d'émettre
      // le tag. Le moteur PDF fonctionne indépendamment de la réponse du modèle.
      const userWantsPdf = /(\bpdf\b|t[ée]l[ée]charg|\bexporte?r?\b|g[ée]n[èe]re.{0,40}(document|ebook|livrable|pdf)|fais.{0,20}(le )?(document|pdf|ebook)|mets [çc]a en (document|pdf)|le fichier)/i.test(userText);
      if (pdfTagMatch || userWantsPdf) {
        setTimeout(() => setShowExport(true), 800);
      }
      // Étape courante : pilotée UNIQUEMENT par le tag explicite [ETAPE:n] de FORJA.
      // (Plus de détection par mots-clés : "transformation", "promesse", "marché"…
      //  apparaissent partout et faisaient sauter l'indicateur au mauvais endroit.)
      const stepTagMatch = reply.match(/\[(?:E|É)TAPE\s*:\s*(\d{1,2})\]/i);
      if (stepTagMatch) {
        const n = parseInt(stepTagMatch[1], 10);
        if (n >= 0 && n < STEPS.length) setActiveStep(n);
      }
      reply = reply.replace(/\[(?:E|É)TAPE\s*:\s*\d{1,2}\]/gi, "").trim();
      const finalMessages: Message[] = [...newMessages, { role: "assistant", content: reply }];
      setMessages(finalMessages);
      if (session?.user) {
        let convId = activeConv;
        if (!convId) {
          const title = userText.length > 30 ? userText.substring(0, 30) + "…" : userText;
          const resConv = await fetch("/api/conversations", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, initialMessages: stripMessages(finalMessages) })
          });
          if (!resConv.ok) throw new Error("Impossible de créer la conversation");
          const newConv: Conversation = await resConv.json();
          convId = newConv.id;
          setActiveConv(convId);
          setHistory(prev => [newConv, ...prev]);
        } else {
          await fetch(`/api/conversations/${convId}/messages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: userText }, { role: "assistant", content: stripImageData(reply) }] })
          });
        }
      }
    } catch (err) {
      console.error("Erreur envoi message:", err);
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Une erreur s'est produite. Vérifie ta connexion et réessaie." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const newConversation = () => {
    setMessages([{ role: "assistant", content: buildWelcomeMessage(onboarding) }]);
    setShowPrompts(true);
    setInput("");
    setActiveConv(null);
    setActiveStep(0);
    if (isMobile) setSidebarOpen(false);
  };

  const loadConversation = async (conv: Conversation) => {
    setActiveConv(conv.id);
    setShowPrompts(false);
    if (isMobile) setSidebarOpen(false); // referme l'overlay après sélection
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conv.id}`);
      if (!res.ok) throw new Error("Conversation introuvable");
      const data: { messages?: Message[] } = await res.json();
      setMessages(data.messages?.length ? data.messages : [initialMessage]);
    } catch (err) {
      console.error("Erreur chargement conversation:", err);
      setMessages([initialMessage]);
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async (conv: Conversation) => {
    setConfirmDelete(null);
    const prev = history;
    setHistory((list) => list.filter((c) => c.id !== conv.id)); // optimiste
    if (activeConv === conv.id) newConversation();
    try {
      const res = await fetch(`/api/conversations/${conv.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setHistory(prev); // rollback si l'API échoue
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: `radial-gradient(circle, ${FV.ember}15 0%, transparent 60%)`, pointerEvents: 'none' }} />

      {/* Backdrop mobile (ferme la sidebar au tap) */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,9,8,0.6)', backdropFilter: 'blur(2px)', zIndex: 40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <div style={isMobile
        ? { width: 280, maxWidth: '85vw', background: FV.black2, borderRight: `1px solid ${FV.rule}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', boxShadow: sidebarOpen ? '0 0 40px rgba(0,0,0,0.5)' : 'none' }
        : { width: sidebarOpen ? 260 : 0, background: FV.black2, borderRight: sidebarOpen ? `1px solid ${FV.rule}` : 'none', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', transition: 'width 0.3s ease', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ padding: '18px', borderBottom: `1px solid ${FV.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FVMark size={28} />
            <div>
              <div style={{ fontFamily: FV.serif, fontSize: 17, fontWeight: 700, letterSpacing: '0.16em' }}>FORJA</div>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.12em' }}>v.1 · LIBRE</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} title="Fermer" style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}><X size={18} /></button>
        </div>

        {/* New session btn */}
        <div style={{ padding: '14px' }}>
          <button onClick={newConversation} style={{ width: '100%', background: FV.ember, color: FV.black, border: 'none', padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase', boxShadow: `0 0 16px ${FV.ember}55` }}>
            + Nouvelle session
          </button>
        </div>

        {/* History label */}
        <div style={{ padding: '14px 18px 6px', fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em' }}>JOURNAL DE FORGE</div>

        {/* History list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {isLoadingHistory ? (
            <div style={{ padding: '20px 14px', fontFamily: FV.mono, fontSize: 9, color: FV.smoke, textAlign: 'center', letterSpacing: '0.12em' }}>
              CHARGEMENT…
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '20px 14px', fontFamily: FV.serif, fontStyle: 'italic', fontSize: 13, color: FV.smokeDim, textAlign: 'center', lineHeight: 1.5 }}>
              Ton journal est vide.<br />Lance ta première session.
            </div>
          ) : history.map((conv) => {
            const active = activeConv === conv.id;
            return (
              <div key={conv.id} onClick={() => loadConversation(conv)} style={{ padding: '10px 12px', borderRadius: 7, background: active ? 'rgba(238,90,36,0.08)' : 'transparent', border: active ? '1px solid rgba(238,90,36,0.22)' : '1px solid transparent', marginBottom: 3, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: FV.ember, boxShadow: `0 0 6px ${FV.ember}`, flexShrink: 0 }} />}
                  <div style={{ fontSize: 12, color: active ? FV.ember : FV.ink, fontWeight: active ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{conv.title || "Session sans titre"}</div>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(conv); }} title="Supprimer la session" style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}><Trash2 size={13} /></button>
                </div>
                <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.08em', paddingLeft: active ? 14 : 0 }}>{new Date(conv.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()}</div>
              </div>
            );
          })}
        </div>

        {/* Crédits / achat */}
        <button onClick={() => setShowCredits(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 10px 6px', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', color: FV.ink2, background: 'rgba(241,233,218,0.04)', border: `1px solid ${FV.rule}`, fontSize: 12, fontWeight: 500, width: 'calc(100% - 20px)', textAlign: 'left' }}>
          <Coins size={15} color={FV.amber} /> Crédits & forfaits
        </button>

        {/* Lien back office (admins uniquement) */}
        {isAdmin && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 10px 6px', padding: '9px 12px', borderRadius: 8, textDecoration: 'none', color: FV.ember, background: 'rgba(238,90,36,0.08)', border: '1px solid rgba(238,90,36,0.22)', fontSize: 12, fontWeight: 600 }}>
            <Shield size={15} /> Back office
          </Link>
        )}

        {/* User bottom */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${FV.rule}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${FV.amber}, ${FV.emberDeep})`, color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{userInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: FV.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.1em' }}>LIBRE</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} title="Déconnexion" style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 4, lineHeight: 1, display: 'flex', alignItems: 'center' }}><LogOut size={15} /></button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, minWidth: 0 }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${FV.rule}`, padding: isMobile ? '10px 14px' : '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(11,9,8,0.7)', backdropFilter: 'blur(12px)', gap: isMobile ? 8 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            {(!sidebarOpen || isMobile) && (
              <button onClick={() => setSidebarOpen(true)} title="Menu" style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0, display: 'flex', alignItems: 'center' }}><Menu size={18} /></button>
            )}
            {!isMobile && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', background: 'rgba(238,90,36,0.1)', border: '1px solid rgba(238,90,36,0.25)', borderRadius: 999, flexShrink: 0 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: FV.ember, boxShadow: `0 0 8px ${FV.ember}` }} />
                <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.ember, letterSpacing: '0.12em' }}>EN COURS</span>
              </div>
            )}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: FV.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeConv ? history.find(h => h.id === activeConv)?.title || "Session active" : "Nouvelle session"}
              </div>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.08em', marginTop: 1 }}>ÉTAPE {String(activeStep).padStart(2, '0')} · {STEPS[activeStep]?.toUpperCase()}</div>
            </div>
          </div>
          {/* Sélecteur de modèle — réservé aux abonnés Studio (sinon DeepSeek par défaut) */}
          {!isMobile && isStudio && <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {[
              { id: "auto", label: "AUTO" },
              { id: "anthropic", label: "CLAUDE" },
              { id: "deepseek", label: "DEEP" },
              { id: "openai", label: "GPT" },
            ].map(({ id, label }) => {
              const isSelected = selectedProvider === id;
              const isFallback = isSelected && activeProvider && activeProvider !== id && id !== "auto";
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedProvider(id);
                    localStorage.setItem("forja_llm_provider", id);
                  }}
                  title={isFallback ? `Fallback actif → ${activeProvider}` : label}
                  style={{
                    background: isSelected ? 'rgba(238,90,36,0.12)' : 'transparent',
                    color: isSelected ? FV.ember : FV.smoke,
                    border: `1px solid ${isSelected ? 'rgba(238,90,36,0.35)' : FV.rule}`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontFamily: FV.mono,
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.2s',
                    position: 'relative' as const,
                  }}
                >
                  {label}
                  {isFallback && (
                    <span style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, background: FV.amber, borderRadius: '50%' }} />
                  )}
                </button>
              );
            })}
            {selectedProvider === "auto" && activeProvider && (
              <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smokeDim, letterSpacing: '0.08em' }}>
                → {activeProvider.toUpperCase()}
              </span>
            )}
          </div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {!isMobile && <button onClick={newConversation} title="Nouvelle session" style={{ width: 32, height: 32, background: 'rgba(241,233,218,0.04)', color: FV.ink2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={15} /></button>}
            <button onClick={() => setShowExport(true)} title="Forger un PDF" style={{ background: FV.ember, color: FV.black, border: 'none', padding: isMobile ? '8px 12px' : '8px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Sparkles size={13} />
              {isMobile ? 'PDF' : 'FORGER PDF'}
            </button>
          </div>
        </div>

        {/* Steps bar */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${FV.rule}`, background: FV.black2, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em', flexShrink: 0 }}>SÉQUENCE</span>
          <div ref={stepsScrollRef} className="hide-scrollbar" style={{ flex: 1, position: 'relative', display: 'flex', gap: 3, overflowX: 'auto', scrollBehavior: 'smooth', paddingBottom: 2 }}>
            {STEPS.map((s, i) => {
              const isActive = i === activeStep;
              const isDone = i < activeStep;
              return (
                <div
                  key={i}
                  ref={isActive ? activeStepRef : null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 999,
                    background: isActive ? FV.ember : isDone ? 'rgba(238,90,36,0.08)' : 'transparent',
                    color: isActive ? FV.black : isDone ? FV.ember : FV.smoke,
                    // bordure toujours présente (1px) → pas de saut de largeur quand l'étape change
                    border: `1px solid ${isActive ? FV.ember : isDone ? 'rgba(238,90,36,0.18)' : FV.rule}`,
                    boxShadow: isActive ? `0 0 12px ${FV.ember}66` : 'none',
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                    fontSize: 9, fontFamily: FV.mono, letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0,
                    fontWeight: isActive || isDone ? 600 : 400,
                    transition: 'background 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease',
                  }}
                >
                  <span>{String(i).padStart(2, '0')}</span>
                  {s.toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '32px 40px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Quick prompts on start */}
            {showPrompts && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 16 }}>DÉMARRAGE RAPIDE</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 10 }}>
                  {QUICK_PROMPTS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q.text)} style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(238,90,36,0.3)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = FV.rule; }}
                    >
                      <q.Icon size={22} color={FV.ember} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: FV.ink, fontWeight: 500 }}>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages list */}
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 22, flexDirection: isUser ? 'row-reverse' : 'row' }}>
                  {/* Avatar */}
                  {isUser ? (
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${FV.amber}, ${FV.emberDeep})`, color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{userInitial}</div>
                  ) : (
                    <FVMark size={32} />
                  )}
                  <div style={{ maxWidth: '80%' }}>
                    {!isUser && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: FV.serif, fontWeight: 600, fontSize: 14, color: FV.ember, letterSpacing: '0.12em' }}>FORJA</span>
                      </div>
                    )}
                    <div style={{ background: isUser ? 'rgba(238,90,36,0.08)' : FV.black2, border: `1px solid ${isUser ? 'rgba(238,90,36,0.22)' : FV.rule}`, borderRadius: isUser ? '14px 3px 14px 14px' : '3px 14px 14px 14px', padding: '14px 18px', fontSize: 14, lineHeight: 1.7, color: isUser ? FV.ink : FV.ink2 }}>
                      {isUser ? (
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                      ) : (
                        <MarkdownRenderer text={m.content} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                <FVMark size={32} />
                <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: '3px 14px 14px 14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {[0, 150, 300].map((delay, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: FV.ember, animation: 'bounce 1.2s infinite', animationDelay: `${delay}ms` }} />
                  ))}
                  <span style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 13, color: FV.smoke, marginLeft: 6 }}>FORJA forge…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} style={{ height: 16 }} />
          </div>
        </div>

        {/* Composer */}
        <div style={{ borderTop: `1px solid ${FV.rule}`, padding: isMobile ? '12px 12px 14px' : '14px 20px 18px', background: FV.black2 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Chip du fichier joint */}
            {attachedFile && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 10px', background: 'rgba(238,90,36,0.08)', border: '1px solid rgba(238,90,36,0.22)', borderRadius: 8, fontSize: 12, color: FV.ink }}>
                <Paperclip size={13} color={FV.ember} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} title="Retirer" style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><X size={13} /></button>
              </div>
            )}
            <input ref={fileInputRef} type="file" aria-label="Joindre un fichier texte" title="Joindre un fichier texte" accept=".txt,.md,.markdown,.csv,.text,text/plain,text/markdown,text/csv" onChange={handleFilePick} style={{ display: 'none' }} />
            <div style={{ background: FV.black, border: `1px solid ${FV.ruleStrong}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', padding: 6, lineHeight: 1, flexShrink: 0, marginBottom: 2, display: 'flex', alignItems: 'center' }} title="Joindre un fichier texte (.txt, .md, .csv)"><Paperclip size={18} /></button>
              <button onClick={() => setShowExport(true)} style={{ background: 'transparent', border: 'none', color: FV.ember, cursor: 'pointer', padding: 6, lineHeight: 1, flexShrink: 0, marginBottom: 2, display: 'flex', alignItems: 'center' }} title="Générer un document"><Sparkles size={18} /></button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Réponds, ou pose ta question…"
                rows={1}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: FV.ink, resize: 'none', maxHeight: 150, overflowY: 'auto', padding: '6px 0', fontFamily: FV.sans, lineHeight: 1.6 }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 150) + "px";
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <kbd style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, padding: '3px 6px', border: `1px solid ${FV.rule}`, borderRadius: 4, display: 'inline-flex', alignItems: 'center' }}><CornerDownLeft size={11} /></kbd>
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || (!input.trim() && !attachedFile)}
                  style={{ background: (loading || (!input.trim() && !attachedFile)) ? FV.rule : FV.ember, color: (loading || (!input.trim() && !attachedFile)) ? FV.smoke : FV.black, border: 'none', width: 34, height: 34, borderRadius: 8, cursor: (loading || (!input.trim() && !attachedFile)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (!loading && (input.trim() || attachedFile)) ? `0 0 12px ${FV.ember}66` : 'none', transition: 'all 0.2s' }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smokeDim, textAlign: 'center', marginTop: 8, letterSpacing: '0.1em' }}>
              ENTRÉE POUR ENVOYER · MAJ+ENTRÉE POUR NOUVELLE LIGNE
            </div>
          </div>
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} conversation={messages} onNeedCredits={() => { setShowExport(false); setShowCredits(true); }} />}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}

      {/* Confirmation de suppression — modale au design FORJA (remplace confirm() natif) */}
      {confirmDelete && (
        <div
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(11,9,8,0.8)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 400, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: 26, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${FV.ember}1a` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(238,90,36,0.1)', border: '1px solid rgba(238,90,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} color={FV.ember} />
              </div>
              <div style={{ fontFamily: FV.serif, fontSize: 20, fontWeight: 500, color: FV.ink, letterSpacing: '-0.01em' }}>Supprimer la session ?</div>
            </div>
            <p style={{ fontSize: 13, color: FV.ink2, lineHeight: 1.6, margin: '0 0 22px' }}>
              <span style={{ color: FV.ink, fontWeight: 600 }}>« {confirmDelete.title || "Session sans titre"} »</span> et tous ses messages seront définitivement effacés. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: 'transparent', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => performDelete(confirmDelete)} style={{ background: FV.ember, color: FV.black, border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 0 20px ${FV.ember}55` }}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
