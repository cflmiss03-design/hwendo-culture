import "./src/env.ts"; 
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  // L'URL de ton site — domaine provisoire, à mettre à jour une fois le vrai
  // nom de domaine du Festival Hwendo Culture choisi (voir aussi
  // server-votes/src/config/tenants.js et voteserver.js pour le CORS).
  site: "https://festivalhwendoculture.com",

  // Port de dev distinct pour tourner en même temps que les autres sites
  // locaux (missculture: 4321, campusvoice: 4322).
  server: { port: 4323 },

  // Préfixe pour les variables d'environnement
  envPrefix: "VITE_",

  // Intégrations Astro
  integrations: [
    tailwind(),
    sitemap(),
    react(), // composants React hydratés côté client
  ],

  // i18n
  defaultLocale: "fr",
  locales: ["fr", "en"],
  i18nextOptions: {
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: "fr",
  },
});
