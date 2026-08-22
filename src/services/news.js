/**
 * Actualité — contenu PARTAGÉ par tout le site Hwendo (pas propre à une
 * catégorie), servi par le tenant technique dédié "hwendo-site" (voir
 * config.ts — NEWS_API_BASE_URL, distinct de config.apiBaseUrl qui suit la
 * catégorie courante).
 */
import { NEWS_API_BASE_URL } from "../config";

async function fetchNews(endpoint, options = {}) {
  const url = `${NEWS_API_BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Erreur API actualité (${res.status}) : ${body}`);
  }
  return res.json();
}

export function getArticles({ tag, q, page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return fetchNews(`/news?${params.toString()}`);
}

export function getFeaturedArticle() {
  return fetchNews("/news/featured");
}

export function getTags() {
  return fetchNews("/news/tags");
}

export function getArticleBySlug(slug) {
  return fetchNews(`/news/${encodeURIComponent(slug)}`);
}
