"use client";

// Partage simple d'un article (WhatsApp/Facebook) — distinct de
// ShareButtons.jsx qui est spécifique aux profils de candidats (message de
// sollicitation de vote).
export default function ArticleShareButtons({ title }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title || "Festival Hwendo-Culture");

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
    </div>
  );
}
