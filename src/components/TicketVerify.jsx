import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";

// fetchAPI encapsule l'erreur backend dans "API Error: <status> - <body JSON>" —
// on en extrait le message propre et le statut pour un affichage soigné.
function extractApiMessage(err, fallback) {
  const match = err.message?.match(/API Error: \d+ - (.+)$/s);
  if (!match) return err.message || fallback;
  try {
    return JSON.parse(match[1]).message || fallback;
  } catch {
    return match[1] || fallback;
  }
}

function extractApiStatus(err) {
  const match = err.message?.match(/^API Error: (\d+)/);
  return match ? Number(match[1]) : null;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketVerify() {
  const [state, setState] = useState("loading"); // loading | error | invalid | used | valid
  const [ticket, setTicket] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const [checkinStep, setCheckinStep] = useState("idle"); // idle | code | details
  const [code, setCode] = useState("");
  const [presenterNom, setPresenterNom] = useState("");
  const [presenterNumero, setPresenterNumero] = useState("");
  const [checkinError, setCheckinError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function load(id) {
    fetchAPI(`/tickets/verify/${id}`)
      .then((data) => {
        setTicket(data);
        if (!data.valid) setState("invalid");
        else if (data.used) setState("used");
        else setState("valid");
      })
      .catch(() => setState("error"));
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("ticket");
    if (!id) {
      setState("error");
      return;
    }
    setTicketId(id);
    load(id);
  }, []);

  function startCheckin() {
    setCheckinStep("code");
    setCheckinError(null);
    setCode("");
  }

  function submitCode(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setCheckinError(null);
    setCheckinStep("details");
  }

  async function confirmCheckin(e) {
    e.preventDefault();
    if (!presenterNom.trim()) return;
    setSubmitting(true);
    setCheckinError(null);

    try {
      await fetchAPI(`/tickets/verify/${ticketId}/checkin`, {
        method: "POST",
        body: JSON.stringify({
          code: code.trim(),
          nom: presenterNom.trim(),
          numero: presenterNumero.trim() || undefined,
        }),
      });
      setJustCheckedIn(true);
      setCheckinStep("idle");
      load(ticketId);
    } catch (err) {
      const status = extractApiStatus(err);
      const message = extractApiMessage(err, "Erreur lors de la validation.");
      setCheckinError(message);
      if (status === 401) {
        // Code incorrect : on renvoie au champ code plutôt que de perdre le nom saisi.
        setCheckinStep("code");
      } else if (status === 409) {
        // Utilisé entre-temps par quelqu'un d'autre (double scan quasi simultané).
        load(ticketId);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "loading") {
    return <p className="text-slate-600 animate-pulse text-center">Vérification du ticket...</p>;
  }

  if (state === "error") {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
          <span className="text-3xl">?</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket introuvable</h1>
        <p className="text-slate-600">Le lien de vérification est invalide ou incomplet.</p>
      </div>
    );
  }

  const ticketInfo = ticket && (
    <div className="mt-4 text-left inline-block rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-2 w-full">
      <p><span className="font-semibold text-slate-900">Numéro :</span> {ticket.numero}</p>
      <p><span className="font-semibold text-slate-900">Type :</span> {ticket.ticketType}</p>
      <p><span className="font-semibold text-slate-900">Titulaire :</span> {ticket.buyerName}</p>
    </div>
  );

  // ── Ticket non payé / invalide ──────────────────────────────────────────
  if (state === "invalid") {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-100">
          <span className="text-3xl">✕</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket non valide</h1>
        <p className="text-slate-600 mb-4">
          Ce ticket n'a pas de paiement confirmé (statut : {ticket?.status || "inconnu"}).
        </p>
        {ticketInfo}
      </div>
    );
  }

  // ── Déjà utilisé ─────────────────────────────────────────────────────────
  if (state === "used") {
    const success = justCheckedIn;
    return (
      <div className="text-center">
        <div
          className={`mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full ${
            success ? "bg-success-100" : "bg-danger-100"
          }`}
        >
          <span className="text-3xl">{success ? "✓" : "✕"}</span>
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${success ? "text-success-700" : "text-danger-600"}`}>
          {success ? "Entrée validée" : "Ticket déjà utilisé"}
        </h1>
        {!success && (
          <p className="text-danger-600 font-semibold mb-2">
            Ce ticket a déjà été scanné et accepté — refusez l'entrée.
          </p>
        )}
        {ticket?.checkedInBy?.nom && (
          <p className="text-slate-600 mb-4">
            Présenté par <strong>{ticket.checkedInBy.nom}</strong>
            {ticket.checkedInBy.numero && ` (${ticket.checkedInBy.numero})`}
            {ticket.usedAt && ` — ${formatDate(ticket.usedAt)}`}
          </p>
        )}
        {ticketInfo}
      </div>
    );
  }

  // ── Valide, pas encore utilisé ──────────────────────────────────────────
  return (
    <div className="text-center">
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
        <span className="text-3xl">✓</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket valide</h1>
      {ticketInfo}

      {checkinStep === "idle" && (
        <button
          type="button"
          onClick={startCheckin}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold py-3 shadow-md hover:shadow-lg transition-all"
        >
          ✅ Accepter le ticket
        </button>
      )}

      {checkinStep === "code" && (
        <form onSubmit={submitCode} className="mt-6 text-left space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Code de vérification (personnel d'entrée)
          </label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          {checkinError && <p className="text-danger-600 text-sm">{checkinError}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCheckinStep("idle")}
              className="rounded-xl border-2 border-slate-200 text-slate-700 font-semibold px-5 py-2.5 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary-600 text-white font-bold py-2.5 hover:bg-primary-700 transition-colors"
            >
              Continuer
            </button>
          </div>
        </form>
      )}

      {checkinStep === "details" && (
        <form onSubmit={confirmCheckin} className="mt-6 text-left space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nom de la personne présentant le ticket *
            </label>
            <input
              value={presenterNom}
              onChange={(e) => setPresenterNom(e.target.value)}
              autoFocus
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Numéro (optionnel)
            </label>
            <input
              value={presenterNumero}
              onChange={(e) => setPresenterNumero(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          {checkinError && <p className="text-danger-600 text-sm">{checkinError}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCheckinStep("code")}
              className="rounded-xl border-2 border-slate-200 text-slate-700 font-semibold px-5 py-2.5 hover:bg-slate-50"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold py-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              {submitting ? "Validation..." : "Confirmer l'entrée"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
