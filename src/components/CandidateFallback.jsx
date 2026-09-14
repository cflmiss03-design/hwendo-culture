"use client";

/**
 * Filet de secours pour un candidat ajouté via l'admin APRÈS le dernier
 * build du site (donc absent du fichier statique src/data/*-candidates.js
 * et de getStaticPaths, voir [category]/[slug].astro) — sans ça, sa page
 * profil renvoie un vrai 404 tant que le site n'est pas reconstruit.
 *
 * Principe : Cloudflare Pages sert d'abord les fichiers statiques déjà
 * générés (donc les candidats déjà connus au build gardent leur page
 * statique rapide, inchangé) et ne retombe sur `_redirects` (voir
 * public/_redirects) que si AUCUN fichier ne correspond à l'URL demandée —
 * c'est-à-dire un candidat trop récent. Cette règle réécrit alors
 * silencieusement (statut 200, l'URL affichée au visiteur ne change pas)
 * vers /candidate-fallback, qui charge CE composant. Il lit la catégorie et
 * le slug directement dans window.location.pathname (l'URL d'origine,
 * puisque la réécriture ne la change pas) et récupère le candidat EN DIRECT
 * depuis l'API (GET /candidates/:slug, déjà utilisée ailleurs dans ce
 * projet) — zéro rebuild nécessaire pour qu'un nouveau candidat soit
 * consultable.
 */

import { useEffect, useState } from "react";
import CandidatePage from "./CandidatePage.jsx";
import Progress from "./Progress.jsx";
import { fetchAPI } from "../services/api.js";
import { CATEGORIES } from "../config/categories.js";

export default function CandidateFallback() {
  const [state, setState] = useState({ status: "loading", candidate: null, category: null });

  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const [category, slug] = segments;
    const cat = CATEGORIES[category];

    if (!cat || !slug) {
      setState({ status: "not-found", candidate: null, category: null });
      return;
    }

    fetchAPI(`/candidates/${slug}`)
      .then((candidate) => {
        if (!candidate) throw new Error("Candidat introuvable");
        document.title = `${candidate.firstName} ${candidate.lastName} – ${cat.label} – Festival Hwendo Culture 2026`;
        setState({ status: "ready", candidate, category });
      })
      .catch(() => setState({ status: "not-found", candidate: null, category }));
  }, []);

  if (state.status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Chargement du profil…
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800">Candidat introuvable</h1>
        <p className="text-gray-500">Ce profil n'existe pas ou plus.</p>
        <a href="/" className="text-primary underline">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <>
      <CandidatePage candidate={state.candidate} category={state.category} />
      <section className="px-4 py-12">
        <Progress />
      </section>
    </>
  );
}
