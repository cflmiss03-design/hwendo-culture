"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";

// Rapide : c'est une proclamation en direct, chaque révélation doit
// apparaître au public en quelques secondes (le cache serveur est lui
// aussi à 5s, voir results.routes.js).
const REFRESH_INTERVAL_MS = 5000;
const MEDALS = ["🥇", "🥈", "🥉"];
// Titres officiels du concours pour les 3 premiers rangs — annoncés à la
// place du simple numéro de classement, aussi bien dans le spotlight de la
// proclamation en direct que sur le podium final. Configurable via la prop
// `rankTitles` (chaque catégorie du Festival Hwendo Culture a ses propres
// intitulés) — ceci reste la valeur par défaut.
const DEFAULT_RANK_TITLES = {
  1: "MISS CULTURE BÉNIN 2026",
  2: "PREMIÈRE DAUPHINE",
  3: "DEUXIÈME DAUPHINE",
};

function PodiumCard({ entry, size, rankTitles }) {
  const medal = MEDALS[entry.rank - 1];
  const title = rankTitles?.[entry.rank];
  return (
    <div className={`flex flex-col items-center ${size === "lg" ? "order-2" : entry.rank === 2 ? "order-1" : "order-3"}`}>
      <div className={`relative ${size === "lg" ? "h-36 w-36 sm:h-44 sm:w-44" : "h-28 w-28 sm:h-32 sm:w-32"}`}>
        <img
          src={entry.photoUrl}
          alt={entry.candidateName}
          className={`h-full w-full rounded-full border-4 object-cover object-top shadow-xl ${
            entry.rank === 1 ? "border-amber-400" : "border-white"
          }`}
        />
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-2xl shadow-md">
          {medal}
        </span>
      </div>
      {title && (
        <p className={`mt-5 text-center font-heading font-black uppercase tracking-wide text-amber-300 ${size === "lg" ? "text-base sm:text-lg" : "text-xs sm:text-sm"}`}>
          {title}
        </p>
      )}
      <p className={`text-center font-heading font-bold text-white ${title ? "mt-1" : "mt-5"} ${size === "lg" ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>
        {entry.candidateName}
      </p>
      <p className={`font-black text-amber-300 ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
        {entry.total.toLocaleString("fr-FR")} <span className="text-sm font-semibold text-white/60">pts</span>
      </p>
    </div>
  );
}

// Mode proclamation : met en avant la dernière candidate révélée (grand
// format, façon "ouverture d'enveloppe"), avec la liste des précédentes
// révélations en dessous, plus discrète.
function RevealSpotlight({ revealed, groupSize, rankTitles }) {
  const spotlight = revealed[revealed.length - 1];
  const earlier = revealed.slice(0, -1).reverse(); // plus récente en premier
  const title = rankTitles?.[spotlight.rank];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <div key={spotlight.candidateId} className="animate-fade-up overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-dark px-6 py-6 text-center sm:py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Résultat proclamé</p>
          {title ? (
            <>
              <p className="mt-2 text-2xl font-black uppercase tracking-wide text-amber-300 sm:text-3xl">{title}</p>
              <p className="mt-1 text-sm font-semibold text-white/50">Rang {spotlight.rank} sur {groupSize}</p>
            </>
          ) : (
            <p className="mt-1 text-3xl font-black text-white sm:text-4xl">
              Rang {spotlight.rank} <span className="text-lg font-semibold text-white/70">sur {groupSize}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-center px-6 py-8 sm:py-10">
          <img
            src={spotlight.photoUrl}
            alt={spotlight.candidateName}
            className="h-40 w-40 rounded-full border-4 border-amber-400 object-cover object-top shadow-xl sm:h-48 sm:w-48"
          />
          <h2 className="mt-6 text-center font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
            {spotlight.candidateName}
          </h2>
          <p className="mt-2 text-3xl font-black text-primary-600">
            {spotlight.total.toLocaleString("fr-FR")} <span className="text-base font-semibold text-slate-500">points au total</span>
          </p>

          {spotlight.epreuves.length > 0 && (
            <div className="mt-8 w-full max-w-md">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                Détail par épreuve
              </p>
              <div className="space-y-2">
                {spotlight.epreuves.map((ep) => (
                  <div key={ep.title} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                    <span className="font-medium text-slate-700">{ep.title}</span>
                    <span className="font-bold text-slate-900">{ep.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {earlier.length > 0 && (
        <div className="mx-auto mt-10 max-w-xl">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/60">
            Déjà proclamées
          </p>
          <div className="space-y-2">
            {earlier.map((entry) => (
              <div key={entry.candidateId} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm">
                <span className="w-8 text-center font-bold text-slate-400">{entry.rank}</span>
                <img src={entry.photoUrl} alt="" className="h-9 w-9 flex-shrink-0 rounded-full object-cover object-top" />
                <span className="flex-1 font-medium text-slate-700">{entry.candidateName}</span>
                <span className="font-bold text-slate-500">{entry.total} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfficialResults({ rankTitles = DEFAULT_RANK_TITLES } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchAPI("/results")
        .then((d) => !cancelled && setData(d))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-4 px-4 py-16">
        <div className="mx-auto h-8 w-64 rounded bg-white/20" />
        <div className="mx-auto h-40 w-full max-w-md rounded-2xl bg-white/10" />
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-2xl px-4 py-16 text-center text-red-200">Erreur de chargement des résultats.</p>;
  }

  // Mode proclamation en direct : le classement complet n'existe pas
  // encore côté client tant que finalRevealed est faux — seules les
  // candidates explicitement révélées sont connues (voir results.routes.js).
  if (!data?.finalRevealed) {
    const revealed = data?.revealed || [];
    if (revealed.length === 0) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-6xl">🏆</p>
          <h2 className="mt-6 font-heading text-2xl font-bold text-white">Résultats à venir</h2>
          <p className="mt-3 text-white/70">
            Les résultats officiels seront proclamés ici, candidate par candidate, au fur et à mesure de l'annonce du jury. Revenez bientôt !
          </p>
        </div>
      );
    }
    return <RevealSpotlight revealed={revealed} groupSize={data.groupSize} rankTitles={rankTitles} />;
  }

  // Classement complet (bascule explicite côté admin une fois toutes les
  // candidates du groupe proclamées).
  const ranking = data?.ranking || [];
  const epreuves = data?.epreuves || [];
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3, 7);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      {/* Podium top 3 */}
      <div className="mb-16 flex flex-wrap items-end justify-center gap-8 sm:gap-14">
        {top3[1] && <PodiumCard entry={top3[1]} size="sm" rankTitles={rankTitles} />}
        {top3[0] && <PodiumCard entry={top3[0]} size="lg" rankTitles={rankTitles} />}
        {top3[2] && <PodiumCard entry={top3[2]} size="sm" rankTitles={rankTitles} />}
      </div>

      {/* Rangs 4 à 7 */}
      {rest.length > 0 && (
        <div className="mx-auto mb-20 max-w-2xl space-y-3">
          {rest.map((entry) => (
            <div
              key={entry.candidateId}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm"
            >
              <span className="w-8 text-center text-xl font-black text-slate-400">{entry.rank}</span>
              <img
                src={entry.photoUrl}
                alt={entry.candidateName}
                className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-slate-100 object-cover object-top"
              />
              <span className="flex-1 font-heading font-semibold text-slate-900">{entry.candidateName}</span>
              <span className="text-lg font-black text-primary-600">{entry.total.toLocaleString("fr-FR")} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Détail par épreuve */}
      {epreuves.length > 0 && (
        <div>
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">Détail</p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Résultats par épreuve</h2>
          </div>
          <div className="space-y-6">
            {epreuves.map((ep) => (
              <div key={ep.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-dark px-6 py-4">
                  <h3 className="font-heading text-lg font-bold text-white">{ep.title}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {ep.scores.map((s, i) => (
                    <div key={s.candidateId} className="flex items-center gap-4 px-6 py-3">
                      <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                      <img
                        src={s.photoUrl}
                        alt={s.candidateName}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover object-top"
                      />
                      <span className="flex-1 text-sm font-medium text-slate-800">{s.candidateName}</span>
                      <span className="font-bold text-slate-900">{s.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
