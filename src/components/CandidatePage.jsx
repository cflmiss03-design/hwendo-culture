"use client";

import { useState, useEffect } from "react";
import VoteModal from "./VoteModal.jsx";
import VoteCounter from "./VoteCounter.jsx";
import ShareButtons from "./ShareButtons.jsx";
import { fetchAPI } from "../services/api.js";
import { getVotingState } from "../config";
import { getVotingPeriod } from "../services/votingPeriod.js";

function formatRank(rank) {
  if (rank === 1) return "1ère";
  return `${rank}ème`;
}

export default function CandidatePage({ candidate, category }) {
  const [showModal, setShowModal] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [candidateId, setCandidateId] = useState(null);
  const [rank, setRank] = useState(null);
  const [period, setPeriod] = useState(null);

  useEffect(() => {
    getVotingPeriod()
      .then(setPeriod)
      .catch((err) => console.error("Erreur récupération période de vote :", err));
  }, []);

  useEffect(() => {
    setEmoji("🗳️");
    if (candidate?.id) setCandidateId(candidate.id);
  }, [candidate]);

  // 1 seul fetch pour récupérer le rang de cette candidate
  useEffect(() => {
    if (!candidate?.id) return;
    let isMounted = true;

    const fetchRank = async () => {
      try {
        const rankings = await fetchAPI("/candidates/rankings");
        if (!isMounted) return;
        const entry = rankings.find(r => r.candidateId === candidate.id);
        if (entry) setRank(formatRank(entry.rank));
      } catch (err) {
        console.error("Erreur récupération rang :", err);
      }
    };

    fetchRank();
    return () => { isMounted = false; };
  }, [candidate?.id]);

  const displayRank = rank ?? `#${candidate?.orderNumber}`;

  const handleVoteClick = () => {
    const votingState = getVotingState(period);
    if (votingState.closed) {
      alert(
        votingState.overrideActive
          ? votingState.overrideMessage || "Les votes sont actuellement fermés."
          : votingState.notStarted
          ? "Les votes n'ont pas encore débuté. Revenez au démarrage de la période de vote !"
          : "Les votes sont clôturés. Merci pour votre participation !"
      );
      return;
    }
    setShowModal(true);
  };

  const API_BASE_URL = "";
  const photoUrl = candidate.photoUrl
    ? candidate.photoUrl.startsWith("http")
      ? candidate.photoUrl
      : `${API_BASE_URL}${candidate.photoUrl.startsWith("/") ? "" : "/"}${candidate.photoUrl}`
    : "";

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="w-full max-w-full sm:max-w-2xl mx-auto animate-fade-up">

        <header className="mb-8 text-center space-y-4 sm:space-y-5">
          <p className="text-sm sm:text-base font-semibold uppercase tracking-wide text-primary">
            Page officielle du candidat
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-dark leading-tight">
            {candidate.firstName}{" "}
            {candidate.secondName && <span>{candidate.secondName} </span>}
            {candidate.lastName}
          </h1>
          <div className="mx-auto h-1 w-20 rounded-full bg-gradient-primary" />
          <p className="mx-auto max-w-xl text-base sm:text-lg text-gray-700 leading-relaxed">
            Bienvenue sur ma page officielle.<br />
            Chaque vote est un soutien précieux qui me rapproche de la victoire.
          </p>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-gray-600 leading-relaxed">
            💙 Le processus est simple : cliquez sur <strong>Voter</strong>, choisissez le nombre de votes et validez.<br />
            Ensemble, faisons entendre notre voix.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <div className="relative w-full">
            <img
              src={photoUrl}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute left-3 top-3 flex items-center justify-center h-10 px-3 rounded-full bg-gradient-primary text-white font-bold text-sm shadow-lg transition-transform duration-300">
              {displayRank}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark">
              {candidate.lastName}{" "}
              <span className="text-primary">{candidate.firstName}</span>{" "}
              {candidate.secondName && (
                <span className="text-gray-500">{candidate.secondName}</span>
              )}
            </h1>

            {candidateId && (
              <div className="relative mt-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="mb-5 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold">
                      Total des votes
                    </p>
                  </div>
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl px-8 py-5 text-center min-w-[140px]">
                      <div className="text-4xl sm:text-5xl font-black text-white">
                        <VoteCounter candidateId={candidateId} />
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-widest text-white/60">
                        Votes reçus
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleVoteClick}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 py-4 text-base sm:text-lg font-black text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_35px_rgba(245,158,11,0.45)] active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">🗳️</span>
                    <span>Voter pour ce candidat</span>
                  </button>
                  <p className="mt-4 text-center text-xs text-white/60">
                    Chaque vote contribue à soutenir votre candidat favori.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anciennement conditionné à `candidate.bio`, un objet structuré
            (age/professions/origin/...) que le modèle Candidate en base ne
            possède pas — seul `candidate.text` (texte libre) existe. Ce bloc
            ne s'affichait donc jamais, sur aucun tenant, et les boutons de
            partage étaient piégés dedans. Corrigé : on affiche le texte libre
            tel quel, et les boutons de partage ne dépendent plus de sa présence. */}
        <section className="mt-10 rounded-3xl border border-primary-200 bg-primary-50/70 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-primary-800 text-center">
            Profil officiel du candidat
          </h2>
          {candidate.text && (
            <p className="whitespace-pre-line text-sm sm:text-base text-primary-900 leading-relaxed">
              {candidate.text}
            </p>
          )}
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <span className="text-sm sm:text-base font-medium text-primary-700">
              Aidez-moi à aller plus loin en partageant mon profil :
            </span>
            <ShareButtons candidate={candidate} category={category} />
          </div>
        </section>
      </div>

      {showModal && (
        <VoteModal
          candidate={candidate}
          period={period}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
}
