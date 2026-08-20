/**
 * Période de vote pilotée depuis le manager (stockée en base), plus depuis
 * .env. Le site étant déployé en upload manuel du dossier dist/ (pas de
 * redéploiement automatique), les dates doivent pouvoir changer sans rebuild
 * — chaque page les récupère donc au chargement via l'API publique.
 *
 * Cache en mémoire + dédoublonnage des requêtes concurrentes : plusieurs
 * composants (Progress, CandidateGrid, CandidatePage...) sur une même page
 * peuvent appeler getVotingPeriod() sans déclencher plusieurs appels réseau.
 */
import { fetchAPI } from "./api.js";

let cached = null;
let pending = null;

export async function getVotingPeriod() {
  if (cached) return cached;
  if (!pending) {
    pending = fetchAPI("/settings/voting-period")
      .then((data) => {
        cached = data;
        pending = null;
        return data;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
