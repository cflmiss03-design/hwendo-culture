"use client";

import { useState, useEffect } from "react";
import CandidateCard from "./CandidateCard.jsx";
import { fetchAPI } from "../services/api.js";
import { getVotingPeriod } from "../services/votingPeriod.js";

function formatRank(rank) {
  if (rank === 1) return "1ère";
  return `${rank}ème`;
}

export default function CandidateGrid({
  candidates,
  category,
  eyebrow = "Découvrez nos candidats",
  title = "En Compétition",
  intro = "Participez au vote et soutenez votre candidat préféré. Chaque vote compte pour célébrer la culture béninoise.",
}) {
  const [rankMap, setRankMap] = useState({});
  const [period, setPeriod] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRankings = async () => {
      try {
        const rankings = await fetchAPI("/candidates/rankings");
        if (!isMounted) return;

        const map = {};
        rankings.forEach(({ candidateId, rank }) => {
          map[candidateId] = { rank, label: formatRank(rank) };
        });

        setRankMap(map);
      } catch (err) {
        console.error("Erreur classement :", err);
      }
    };

    fetchRankings();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    getVotingPeriod()
      .then(setPeriod)
      .catch((err) => console.error("Erreur récupération période de vote :", err));
  }, []);

  const hasRanks = Object.keys(rankMap).length > 0;

  const sorted = [...candidates].sort((a, b) => {
    const rankA = hasRanks ? (rankMap[a.id]?.rank ?? 999) : a.orderNumber;
    const rankB = hasRanks ? (rankMap[b.id]?.rank ?? 999) : b.orderNumber;
    return rankA - rankB;
  });

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mb-12 space-y-4 text-center animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
          {eyebrow}
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          {intro}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {sorted.map((candidate, index) => (
            <div
              key={candidate.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CandidateCard
                candidate={candidate}
                category={category}
                rank={rankMap[candidate.id]?.label}
                period={period}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
