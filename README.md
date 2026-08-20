# Festival Hwendo-Culture — Site public

Site Astro statique (3 catégories de concours partagent ce même frontend —
voir `src/config/categories.js`). Build entièrement statique, aucun serveur
requis pour l'hébergement.

## Déploiement sur Cloudflare Pages

1. Connecter ce dépôt GitHub à un nouveau projet Cloudflare Pages.
2. Paramètres de build :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (racine du dépôt — ce dépôt ne contient que ce site, pas de monorepo)
3. Variables d'environnement à définir dans Cloudflare Pages (Settings → Environment variables) :
   - `VITE_API_ORIGIN` = `https://server-miss-culture-benin-production.up.railway.app`
   - `VITE_WS_BASE_URL` = `wss://server-miss-culture-benin-production.up.railway.app`
   - (voir `.env` en local pour les valeurs actuelles — ne pas committer `.env`, il est dans `.gitignore`)
4. Node.js : la version est épinglée via `.node-version` (22) et `engines.node` dans `package.json` (>=18.20.8) — Cloudflare Pages les respecte automatiquement, rien à configurer en plus.

Le build a été vérifié en isolation totale (sans accès au monorepo local ni
à un `node_modules` préexistant) avant le premier push, avec le
`package-lock.json` committé pour garantir un résultat reproductible.

## Domaine

Le domaine `festivalhwendoculture.com` utilisé dans `astro.config.mjs`
(`site:`) et dans les métadonnées SEO est un **placeholder** — à mettre à
jour une fois le vrai nom de domaine choisi et branché sur Cloudflare Pages.

## Développement local

```bash
npm install
npm run dev     # http://localhost:4323
npm run build   # génère dist/
```
