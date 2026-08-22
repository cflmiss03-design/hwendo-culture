"use client";

import { useEffect, useState } from "react";
import { getArticleBySlug } from "../services/news.js";
import ArticleShareButtons from "./ArticleShareButtons.jsx";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Page statique unique (/actualites/lire) qui lit le slug depuis le query
// string plutôt qu'un segment d'URL dynamique : le site est en export
// statique (aucun serveur pour du SSR par slug), donc le contenu — géré
// depuis le CMS après le build — est résolu ici, côté client, exactement
// comme VotePaymentStatus.jsx le fait déjà pour les retours de paiement.
export default function ArticlePage() {
  const [state, setState] = useState("loading"); // loading | ok | notfound
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) {
      setState("notfound");
      return;
    }
    getArticleBySlug(slug)
      .then((data) => {
        setArticle(data.article);
        setRelated(data.related || []);
        setState("ok");
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
        <p className="text-2xl font-bold text-slate-900">Article introuvable</p>
        <a href="/actualites" className="mt-4 inline-block font-semibold text-primary-600 hover:underline">
          ← Retour aux actualités
        </a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
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
                href={`/actualites/lire?slug=${a.slug}`}
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
