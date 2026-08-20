"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";
import { subscribeToVotes } from "../services/voteSocket.js";

export default function VoteCounter({ candidateId }) {
  const [votes, setVotes] = useState(null); // 🔹 null pour différencier chargement
  const [ready, setReady] = useState(false); // 🔹 prêt côté client

  // 🔹 Marquer le composant comme "prêt" côté client
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !candidateId) return; // 🔹 ne rien faire si pas prêt ou pas d'id

    const fetchInitialVotes = async () => {
      try {
        const data = await fetchAPI(`/candidates/${candidateId}/votes`);
        setVotes(data.totalVotes);
      } catch (err) {
        console.error("Erreur récupération votes :", err);
      }
    };

    fetchInitialVotes();
    const unsubscribe = subscribeToVotes(candidateId, setVotes);

    return unsubscribe;
  }, [ready, candidateId]);

  if (!ready) return null; // 🔹 attendre que le composant soit côté client
  if (votes === null) return <p className="mt-2 text-white text-2xl font-extrabold text-center">Chargement...</p>;

return (
  <p className="mt-2 text-yellow-400 text-4xl font-extrabold text-center">
    Votes : {votes}
  </p>
);
}
