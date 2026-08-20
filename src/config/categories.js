// Les 3 catégories du Festival Hwendo Culture — un seul frontend, mais
// chaque catégorie est un événement (tenant) backend indépendant : ses
// propres candidats, votes, classement, prix/période de vote, billetterie
// (voir server-votes/src/config/tenants.js pour le miroir côté backend).
//
// `key` = premier segment de l'URL pour cette catégorie (ex: /top-modele-afrique/...)
// `apiPrefix` = préfixe des routes backend pour son tenant (/api/<tenantKey>)
// `dataFile` = nom du fichier auto-généré dans src/data/ (voir
// server-votes/src/services/candidatesFile.service.js)
// `logo` = visuel officiel de la catégorie. TOP Modèle Afrique et Jeune
// Créateur font tous deux partie de "La Nuit de l'Élégance Africaine" (voir
// a-propos.astro) et partagent donc le même logo ; Miss Endo-Culture a le sien.
const NUIT_ELEGANCE_LOGO = "https://res.cloudinary.com/di21pnpda/image/upload/f_auto,q_auto/v1787160931/1784301435365.jpg_hcjgcz.jpg";
const MISS_ENDO_LOGO = "https://res.cloudinary.com/di21pnpda/image/upload/f_auto,q_auto/v1787160931/1784301471948.jpg_oogjtl.jpg";

export const CATEGORIES = {
  "top-modele-afrique": {
    key: "top-modele-afrique",
    tenantKey: "hwendo-topmodel",
    apiPrefix: "/api/hwendo-topmodel",
    label: "TOP Modèle Afrique",
    subtitle: "Mannequinat",
    dataFile: "topmodel-candidates",
    logo: NUIT_ELEGANCE_LOGO,
  },
  "jeune-createur": {
    key: "jeune-createur",
    tenantKey: "hwendo-createur",
    apiPrefix: "/api/hwendo-createur",
    label: "Jeune Créateur",
    subtitle: "Styliste",
    dataFile: "createur-candidates",
    logo: NUIT_ELEGANCE_LOGO,
  },
  "miss-endo-culture": {
    key: "miss-endo-culture",
    tenantKey: "hwendo-missendo",
    apiPrefix: "/api/hwendo-missendo",
    label: "Miss Endo-Culture",
    subtitle: null,
    dataFile: "missendo-candidates",
    logo: MISS_ENDO_LOGO,
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);
export const DEFAULT_CATEGORY = "miss-endo-culture";

export function getCategory(key) {
  return CATEGORIES[key] || null;
}
