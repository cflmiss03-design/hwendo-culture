import { useEffect, useState } from "react";
import { getVotingPeriod } from "../services/votingPeriod.js";
import { getVotingState } from "../config";

export default function Progress() {
  const [period, setPeriod] = useState(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    getVotingPeriod()
      .then(setPeriod)
      .catch((err) => console.error("Erreur récupération période de vote :", err));
  }, []);

  useEffect(() => {
    if (!period) return;

    const votingState = getVotingState(period);

    // Bouton spécial actif : remplace entièrement l'affichage habituel
    // (dates, décompte) par le court texte défini par l'admin, prioritaire
    // sur la période de vote.
    if (votingState.overrideActive) {
      setState({ override: true, message: votingState.overrideMessage || "Vote spécial en cours." });
      return;
    }

    if (!period.votingStartAt || !period.votingEndAt) {
      setState(null);
      return;
    }

    const start = new Date(period.votingStartAt);
    const end = new Date(period.votingEndAt);
    const now = new Date();

    const totalMs = Math.max(1, end - start);
    const elapsedMs = Math.min(totalMs, Math.max(0, now - start));
    const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

    const totalDays = Math.max(1, Math.ceil(totalMs / 86400000));
    const elapsedDays = Math.min(totalDays, Math.max(0, Math.ceil(elapsedMs / 86400000)));

    const dateTimeLabel = (d) =>
      `${d.toLocaleDateString("fr-FR", { month: "long", day: "numeric" }).toUpperCase()} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

    let colorClass = "bg-success-500";
    let message = "🚀 Les votes sont en cours. N'attendez pas le dernier jour !";
    let stage = "normal";

    if (now < start) {
      colorClass = "bg-secondary-500";
      message = `⏳ Les votes débutent le ${dateTimeLabel(start)}. Revenez bientôt !`;
      stage = "upcoming";
    } else if (now > end) {
      colorClass = "bg-danger-600";
      message = "🔒 Les votes sont clôturés. Merci pour votre participation !";
      stage = "closed";
    } else if (progress >= 90) {
      colorClass = "bg-danger-600";
      message = `⛔ FIN DES VOTES : ${dateTimeLabel(end)} ! Votez immédiatement !`;
      stage = "critical";
    } else if (progress >= 75) {
      colorClass = "bg-warning-600";
      message = "🔥 DERNIÈRE LIGNE DROITE : Plus que quelques heures !";
      stage = "urgent";
    } else if (progress >= 50) {
      colorClass = "bg-secondary-500";
      message = "⚠️ Plus de la moitié du temps écoulée. Accélérez !";
      stage = "halfway";
    }

    setState({ override: false, totalDays, elapsedDays, progress, colorClass, message, stage, start, end });
  }, [period]);

  if (!state) return null;

  // Bouton spécial actif : bandeau unique, aucun décompte affiché.
  if (state.override) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 backdrop-blur-xl px-6 sm:px-8 py-6 text-center shadow-sm">
          <p className="mb-2 text-xs uppercase tracking-widest text-amber-600 font-semibold">
            Période de vote
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">📢</span>
            <p className="text-base sm:text-lg font-bold text-amber-800">{state.message}</p>
          </div>
        </div>
      </section>
    );
  }

  const isUrgent = state.stage === "urgent" || state.stage === "critical" || state.stage === "closed";

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className={`rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
        isUrgent ? "border-danger-300 bg-danger-50/50" : "border-slate-200 bg-white/80"
      }`}>

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">
                Période de vote
              </p>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                Jour <span className="text-primary-600">{state.elapsedDays}</span> / {state.totalDays}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">
                Progression
              </p>
              <p className="text-4xl font-black text-primary-600">
                {state.progress}%
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 sm:px-8 py-4">
          <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full ${state.colorClass} rounded-full transition-all duration-1000 ease-out shadow-lg`}
              style={{
                width: `${state.progress}%`,
                backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0))",
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className={`px-6 sm:px-8 py-4 border-t ${isUrgent ? "border-danger-200" : "border-slate-100"}`}>
          <div className={`flex items-start gap-3 ${isUrgent ? "animate-pulse-glow" : ""}`}>
            <span className="text-2xl flex-shrink-0 mt-0.5">
              {state.stage === "closed" ? "🔒" : state.stage === "critical" ? "⛔" : state.stage === "urgent" ? "🔥" : state.stage === "halfway" ? "⚠️" : "🚀"}
            </span>
            <p className={`text-sm sm:text-base font-medium leading-relaxed ${
              isUrgent ? "text-danger-700" : "text-slate-700"
            }`}>
              {state.message}
            </p>
          </div>
        </div>

        {/* Timeline Info — date et heure sur 2 lignes distinctes (plutôt qu'un
            retour à la ligne imprévisible) pour rester lisible sur mobile,
            où 3 colonnes ne laissent qu'environ 80-100px chacune. */}
        <div className="px-2 sm:px-8 py-4 bg-slate-50/50 rounded-b-xl grid grid-cols-3 gap-1 sm:gap-4 text-center border-t border-slate-100">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">Début</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              {state.start.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }).toUpperCase()}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              {state.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">Maintenant</p>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 leading-tight">{new Date().toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">Fin</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              {state.end.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }).toUpperCase()}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              {state.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite;
        }
      `}</style>
    </section>
  );
}
