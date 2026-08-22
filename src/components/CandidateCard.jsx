"use client";

import { useState, useEffect } from "react";
import VoteModal from "./VoteModal.jsx";
import VoteCounter from "./VoteCounter.jsx";
import { getVotingState } from "../config";

export default function CandidateCard({ candidate, category, rank, period }) {
  const [showModal, setShowModal] = useState(false);
  const [candidateId, setCandidateId] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(true);

  useEffect(() => {
    if (candidate?.id) setCandidateId(candidate.id);
  }, [candidate]);

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

  const photoUrl = candidate.photoUrl
    ? candidate.photoUrl.startsWith("http")
      ? candidate.photoUrl
      : `${candidate.photoUrl.startsWith("/") ? "" : "/"}${candidate.photoUrl}`
    : "";

  return (
    <>
      <article className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        
        {/* IMAGE SECTION */}
        <div className="relative h-48 sm:h-96 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          
          {/* Skeleton Loading - Fades out */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          )}

          {/* Image - Always visible */}
          <img
            src={photoUrl}
            alt={`${candidate.firstName} ${candidate.lastName}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className="w-full h-full object-top transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rank Badge — remplace le badge #orderNumber par le classement dynamique */}
          <div className="absolute left-3 top-3 flex items-center justify-center h-10 px-3 rounded-full bg-gradient-primary text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
            {rank ?? `#${candidate.orderNumber}`}
          </div>
        </div>

{/* CONTENT SECTION */}
<div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-6">

  {/* Name */}
  <div className="min-h-[60px]">

    <div className="mb-2 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
      Candidat(e) officiel(le)
    </div>

    <h3 className="font-heading text-xl font-extrabold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-primary-600">
      {candidate.lastName}

      <span className="text-primary-600">
        {" " + candidate.firstName}
      </span>
    </h3>

    {candidate.secondName && (
      <p className="mt-1 text-sm font-medium text-slate-500">
        {candidate.secondName}
      </p>
    )}
  </div>

  {/* Vote Counter Box */}
  {candidateId && (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-3 text-white shadow-md transition-all duration-300 group-hover:shadow-xl sm:p-4">

      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/80">
        Total des votes
      </p>

      <div className="flex items-end justify-between">
        <p className="text-2xl font-black leading-none sm:text-3xl">
          <VoteCounter candidateId={candidateId} />
        </p>

      </div>
    </div>
  )}

          {/* Action Buttons */}
          <div className="mt-auto flex flex-row gap-2 sm:gap-3">
            <button
              onClick={handleVoteClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-primary text-white font-semibold py-2.5 px-3 rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 hover:brightness-110 sm:py-3 sm:px-4"
            >
              <span>🗳️</span>
              <span>Voter</span>
            </button>
            <a
              href={`/${category}/${candidate.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border-2 border-slate-200 text-primary-600 font-semibold py-2.5 px-3 rounded-lg hover:bg-slate-50 hover:border-primary-300 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:py-3 sm:px-4"
            >
              <span>→</span>
              <span>Profil</span>
            </a>
          </div>
        </div>
      </article>

      {/* Vote Modal */}
      {showModal && (
        <VoteModal
          candidate={candidate}
          period={period}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
