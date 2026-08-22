"use client";

import { useState } from "react";

// Partage simple d'un article (WhatsApp/Facebook/copie du lien) — distinct
// de ShareButtons.jsx qui est spécifique aux profils de candidats (message
// de sollicitation de vote).
//
// Important : l'URL n'est PAS calculée au rendu (window.location.href lu
// dans le corps du composant), mais à l'intérieur de chaque onClick. Sur une
// page statique, ce composant est pré-rendu au build (window indéfini côté
// serveur) — un href="..." figé au rendu contiendrait alors une URL vide
// tant que React n'a pas fini d'hydrater la page. Un clic pendant cette
// fenêtre (très courante en pratique) partageait donc le texte seul, sans
// lien. En lisant window.location.href au moment du clic, l'URL est
// toujours la bonne, quel que soit l'état d'hydratation.
export default function ArticleShareButtons({ title }) {
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function shareOnWhatsApp() {
    const text = encodeURIComponent(`${title || "Festival Hwendo-Culture"} ${currentUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareOnFacebook() {
    const encodedUrl = encodeURIComponent(currentUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt("Copiez ce lien :", currentUrl());
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={shareOnWhatsApp}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <span>💬</span> WhatsApp
      </button>
      <button
        type="button"
        onClick={shareOnFacebook}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        <span>📘</span> Facebook
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span>{copied ? "✅" : "🔗"}</span> {copied ? "Lien copié !" : "Copier le lien"}
      </button>
    </div>
  );
}
