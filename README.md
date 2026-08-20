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

Le domaine officiel `hwendo-culture.site` a été acheté et est déjà utilisé
dans `astro.config.mjs` (`site:`) et les métadonnées SEO. En attendant qu'il
soit actif (propagation DNS / branchement Cloudflare Pages), le site tourne
sur le sous-domaine temporaire `hwendo-culture.cflmiss03.workers.dev` — le
backend (`server-votes`) autorise déjà les deux domaines en CORS. Aucune
action nécessaire ici une fois `hwendo-culture.site` actif : il suffit de le
brancher comme domaine personnalisé sur le projet Cloudflare Pages.

## Développement local

```bash
npm install
npm run dev     # http://localhost:4323
npm run build   # génère dist/
```
