"use client";

import { useEffect, useState } from "react";
import { getArticles, getFeaturedArticle, getTags } from "../services/news.js";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function pillClasses(active) {
  return [
    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
  ].join(" ");
}

export default function NewsList() {
  const [featured, setFeatured] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeaturedArticle().then(setFeatured).catch(() => {});
    getTags().then(setTags).catch(() => {});
  }, []);

  // Débounce la recherche pour ne pas spammer l'API à chaque frappe.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [activeTag, debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getArticles({ tag: activeTag || undefined, q: debouncedQuery || undefined, page, limit: 9 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTag, debouncedQuery, page]);

  // Sur la vue par défaut (aucun filtre, page 1), l'article à la une est déjà
  // mis en avant en haut — on évite de le répéter dans la grille en dessous.
  const showingUnfiltered = !activeTag && !debouncedQuery && page === 1;
  const gridItems = showingUnfiltered && featured ? data.items.filter((a) => a._id !== featured._id) : data.items;

  return (
    <div>
      {featured && showingUnfiltered && (
        <a
          href={`/actualites/${featured.slug}`}
          className="group mb-12 block overflow-hidden rounded-3xl bg-slate-900 shadow-xl"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 overflow-hidden md:h-full">
              {featured.coverImage && (
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <span className="absolute left-4 top-4 rounded-full bg-secondary-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                À la une
              </span>
            </div>
            <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary-400">
                {formatDate(featured.publishAt)} · {featured.readingTimeMinutes} min de lecture
              </p>
              <h2 className="font-heading text-2xl font-black text-white sm:text-3xl">{featured.title}</h2>
              <p className="text-white/70">{featured.excerpt}</p>
              <span className="mt-2 inline-flex items-center gap-2 font-semibold text-secondary-400">
                Lire l'article →
              </span>
            </div>
          </div>
        </a>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:max-w-xs"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTag("")} className={pillClasses(activeTag === "")}>
              Tous
            </button>
            {tags.map((t) => (
              <button key={t} onClick={() => setActiveTag(t)} className={pillClasses(activeTag === t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="py-12 text-center text-slate-500">Chargement...</p>
      ) : gridItems.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Aucun article pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridItems.map((a) => (
            <a
              key={a._id}
              href={`/actualites/${a.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                {a.coverImage && (
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  {formatDate(a.publishAt)} · {a.readingTimeMinutes} min
                </p>
                <h3 className="font-heading text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary-600">
                  {a.title}
                </h3>
                <p className="line-clamp-3 flex-1 text-sm text-slate-600">{a.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="px-3 text-sm text-slate-500">
            Page {page} / {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
