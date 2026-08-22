"use client";

import { useState } from "react";

// Partage simple d'un article (WhatsApp/Facebook/copie du lien) — distinct
// de ShareButtons.jsx qui est spécifique aux profils de candidats (message
// de sollicitation de vote).
//
// L'URL utilisée est toujours window.location.href, donc toujours celle
// réellement affichée dans la barre d'adresse du navigateur — vrai que la
// page vienne du fichier statique déjà buildé ou du fallback 404 (voir
// ArticleFallback.jsx), le navigateur garde l'URL demandée dans les deux cas.
export default function ArticleShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title || "Festival Hwendo-Culture");

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.prompt("Copiez ce lien :", url);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={`https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <span>💬</span> WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
      >
        <span>📘</span> Facebook
      </a>
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
