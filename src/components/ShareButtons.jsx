import React from "react";
import { getCategory } from "../config/categories.js";

const SITE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://festivalhwendoculture.com";

export default function ShareButtons({ candidate, category }) {
  const cat = getCategory(category);
  const url = encodeURIComponent(`${SITE_ORIGIN}/${category || ""}/${candidate.slug}`);
  const candidateName = `${candidate.firstName} ${candidate.secondName || ""} ${candidate.lastName}`
    .replace(/\s+/g, " ")
    .trim();
  const label = cat ? cat.label : "Festival Hwendo-Culture";

  const text = encodeURIComponent(
    `Salut !

Je suis ${candidateName}, candidat(e) officiel(le) au concours ${label} du Festival Hwendo-Culture 2026.
Je serais honoré(e) de pouvoir compter sur votre précieux soutien tout au long de cette aventure.
N’hésitez pas à partager mon profil et à voter pour moi.

Je vous remercie sincèrement pour votre accompagnement.`
  );

  return (
    <div className="mt-2 flex justify-center sm:justify-start gap-4">
      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${text} ${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        aria-label="Partager sur WhatsApp"
      >
        WhatsApp
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
        aria-label="Partager sur Facebook"
      >
        Facebook
      </a>
    </div>
  );
}
