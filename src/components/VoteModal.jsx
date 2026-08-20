"use client";

import { useState } from "react";
import { fetchAPI } from "../services/api.js";
import { getVotingState } from "../config";

export default function VoteModal({ candidate, period, onClose }) {
  const [votes, setVotes] = useState("");
  const [loading, setLoading] = useState(false);

  const total = votes ? Number(votes) * candidate.unitPrice : 0;

  const handlePay = async () => {
    const votingState = getVotingState(period);
    if (votingState.closed) {
      alert(
        votingState.overrideActive
          ? votingState.overrideMessage || "Les votes sont actuellement fermés."
          : votingState.notStarted
          ? "Les votes n'ont pas encore débuté. Revenez au démarrage de la période de vote !"
          : "Les votes sont clôturés. Merci pour votre participation !"
      );
      onClose();
      return;
    }

    if (!votes || votes <= 0) {
      alert("Veuillez entrer un nombre valide de votes (1 à 9999).");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchAPI("/payments/init", {
        method: "POST",
        body: JSON.stringify({
          candidateId: candidate.id,
          votes: Number(votes),
        }),
      });

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement introuvable");
      }
    } catch (err) {
      alert("Erreur lors de la création du paiement : " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-1xl p-2 sm:p-8 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 px-6 py-2 text-white">

          <p className="text-xs uppercase tracking-widest text-white/80">
            Festival Hwendo-Culture
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold">
            Votez pour {candidate.firstName}
          </h2>

          <p className="mt-2 text-sm text-white/90">
            Soutenez votre candidat(e) favori(te) et augmentez ses chances de victoire.
          </p>
        </div>

        {/* CONTENU */}
        <div className="p-0">

          {/* PRIX */}
          <div className="mb-5 rounded-2xl border border-primary-100 bg-primary-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Prix par vote
              </span>

              <span className="font-bold text-primary-700">
                {candidate.unitPrice?.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* CHOIX RAPIDES */}
          <div className="mb-0">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Choix rapide
            </p>

            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 30,50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setVotes(String(value))}
                  className="rounded-xl border border-gray-200 py-3 font-semibold transition hover:border-primary-500 hover:bg-primary-50"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT */}
          <label className="block mb-2">
            <span className="mb-1 block text-gray-700 font-semibold">
              Nombre de votes
            </span>

            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="9999"
              value={votes}
              onChange={(e) => {
                const val = e.target.value;

                if (
                  val === "" ||
                  (/^\d{1,4}$/.test(val) && Number(val) > 0)
                ) {
                  setVotes(val);
                }
              }}
              placeholder="Ex: 10"
              className="w-full rounded-2xl border-1 border-gray-200 p-2 text-center text-xl font-bold focus:border-primary-500 focus:outline-none"
            />
          </label>


          {/* INFO */}
          <div className="mb-2 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
            🔒 Paiement sécurisé. Les votes sont comptabilisés immédiatement après validation.
          </div>

          {/* BOUTON PRINCIPAL */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-primary-700 to-secondary-600 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-70"
          >
            {loading
              ? "Préparation du paiement..."
              : `Payer ${total.toLocaleString()} FCFA`}
          </button>

          {/* ANNULER */}
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-2xl border border-gray-300 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Annuler
          </button>

        </div>
      </div>
    </div>
  );
}
