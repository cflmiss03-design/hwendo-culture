"use client";

import { useEffect, useState } from "react";
import { getArticleBySlug } from "../services/news.js";
import ArticleShareButtons from "./ArticleShareButtons.jsx";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Page 404 personnalisée, avec un cas spécial pour /actualites/<slug> : un
// article tout juste publié depuis le CMS n'a pas encore de page statique
// générée (voir [slug].astro — celle-ci n'existe qu'après un rebuild
// Cloudflare Pages). Plutôt que d'afficher une simple erreur, on va
// chercher l'article en direct auprès de l'API et on l'affiche ici, en
// attendant le prochain build.
//
// Dès qu'un build a lieu, le vrai fichier statique existe pour cette URL —
// Cloudflare le sert alors directement, cette page 404 n'est plus jamais
// atteinte pour cet article. Aucun nettoyage à faire : c'est la résolution
// de fichiers statiques elle-même qui fait la bascule.
export default function ArticleFallback() {
  const [state, setState] = useState("loading"); // loading | article | notfound

  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const isArticlePath = segments.length === 2 && segments[0] === "actualites";
    const slug = isArticlePath ? segments[1] : null;

    if (!slug) {
      setState("notfound");
      return;
    }

    getArticleBySlug(slug)
      .then((data) => {
        setState({ article: data.article, related: data.related || [] });
        if (data.article?.title) {
          document.title = `${data.article.title} – Festival Hwendo-Culture`;
        }
      })
      .catch(() => setState("notfound"));
  }, []);

  if (state === "loading") {
    return <div className="py-24 text-center text-slate-400">Chargement...</div>;
  }

  if (state === "notfound") {
    return (
      <div className="py-24 text-center">
        <p className="font-heading text-5xl font-black text-slate-300">404</p>
        <p className="mt-4 text-xl font-bold text-slate-900">Page introuvable</p>
        <a href="/" className="mt-4 inline-block font-semibold text-primary-600 hover:underline">
          ← Retour à l'accueil
        </a>
      </div>
    );
  }

  const { article, related } = state;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
        🔴 Urgent
      </div>

      <a href="/actualites" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
        ← Toutes les actualités
      </a>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="mb-6 max-h-[420px] w-full rounded-2xl object-cover shadow-lg"
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
        <span>{formatDate(article.publishAt)}</span>
        <span>·</span>
        <span>{article.readingTimeMinutes} min de lecture</span>
        {article.author && (
          <>
            <span>·</span>
            <span>{article.author}</span>
          </>
        )}
      </div>

      <h1 className="mb-6 font-heading text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
        {article.title}
      </h1>

      <div
        className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-primary-600 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {article.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="mb-3 text-sm font-semibold text-slate-500">Partager cet article</p>
        <ArticleShareButtons title={article.title} />
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="mb-6 font-heading text-xl font-bold text-slate-900">Articles similaires</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <a
                key={a._id}
                href={`/actualites/${a.slug}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
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
                <div className="p-4">
                  <h3 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary-600">
                    {a.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
