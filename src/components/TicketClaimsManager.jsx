import { useEffect, useState } from "react";
import config from "../config";

async function apiFetch(path, { secret, method = "GET", body } = {}) {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) throw new Error("__UNAUTHORIZED__");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function normalizePhoneForWhatsApp(raw) {
  return String(raw || "")
    .replace(/[^0-9]/g, "")
    .replace(/^00/, "");
}

function buildWhatsAppLink(phone, message) {
  return `https://wa.me/${normalizePhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-success-50 text-success-700",
  failed: "bg-danger-50 text-danger-700",
};

function TicketSearchPanel({ claim, secret }) {
  const [query, setQuery] = useState(claim.transactionOrTicketId || claim.contact || "");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const data = await apiFetch(
        `/manager/ticket-claims/search-tickets?q=${encodeURIComponent(query.trim())}`,
        { secret }
      );
      setResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  // Lance automatiquement une recherche si on a déjà un ID ou un contact.
  useEffect(() => {
    if (query.trim()) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payableTickets = (results || []).filter((t) => t.status === "paid" && t.pngUrl);

  function sendOne(ticket) {
    const message = `Bonjour ${claim.nom}, voici votre ticket ${ticket.ticketTypeSnapshot?.nom || ""} n°${ticket.numero} :\n${ticket.pngUrl}`;
    window.open(buildWhatsAppLink(claim.contact, message), "_blank");
  }

  function sendAll() {
    const lines = payableTickets.map((t) => `- ${t.numero} : ${t.pngUrl}`).join("\n");
    const message = `Bonjour ${claim.nom}, voici votre/vos ticket(s) :\n${lines}`;
    window.open(buildWhatsAppLink(claim.contact, message), "_blank");
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2 space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="ID transaction, téléphone ou nom"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="rounded-lg bg-primary-600 text-white text-sm font-semibold px-4 py-2 hover:bg-primary-700 disabled:opacity-60"
        >
          {searching ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {searchError && <p className="text-red-600 text-sm">{searchError}</p>}

      {results && results.length === 0 && (
        <p className="text-sm text-slate-500">Aucun ticket trouvé pour cette recherche.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-2">
          {payableTickets.length > 1 && (
            <button
              type="button"
              onClick={sendAll}
              className="w-full rounded-lg bg-success-600 text-white text-sm font-semibold px-4 py-2 hover:bg-success-700"
            >
              📲 Envoyer les {payableTickets.length} tickets via WhatsApp
            </button>
          )}
          <div className="grid gap-2">
            {results.map((t) => (
              <div
                key={t._id}
                className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {t.numero} — {t.ticketTypeSnapshot?.nom}
                  </p>
                  <p className="text-slate-500">
                    {t.displayName} · {t.buyer?.telephone} · {t.buyer?.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[t.status] || "bg-slate-100 text-slate-600"}`}>
                    {t.status}
                  </span>
                  {t.status === "paid" && t.pngUrl ? (
                    <button
                      type="button"
                      onClick={() => sendOne(t)}
                      className="rounded-lg bg-success-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-success-700"
                    >
                      📲 WhatsApp
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {t.status === "paid" ? "ticket non généré" : "paiement non confirmé"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketClaimsManager({ secret, onUnauthorized }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);

  const [emailInput, setEmailInput] = useState("");
  const [savedEmail, setSavedEmail] = useState(null);
  const [checkinCodeInput, setCheckinCodeInput] = useState("");
  const [savedCheckinCode, setSavedCheckinCode] = useState(null);
  const [votingStartInput, setVotingStartInput] = useState("");
  const [votingEndInput, setVotingEndInput] = useState("");
  const [savedVotingStart, setSavedVotingStart] = useState(null);
  const [savedVotingEnd, setSavedVotingEnd] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  async function loadClaims(status = statusFilter) {
    setLoading(true);
    setError(null);
    try {
      const qs = status ? `?status=${status}` : "";
      const data = await apiFetch(`/manager/ticket-claims${qs}`, { secret });
      setClaims(data);
    } catch (err) {
      if (err.message === "__UNAUTHORIZED__") {
        onUnauthorized();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const data = await apiFetch("/manager/ticket-claims/settings", { secret });
      setSavedEmail(data.claimNotificationEmail);
      setEmailInput(data.claimNotificationEmail || "");
      setSavedCheckinCode(data.ticketCheckinCode);
      setCheckinCodeInput(data.ticketCheckinCode || "");
      setSavedVotingStart(data.votingStartDate);
      setVotingStartInput(data.votingStartDate || "");
      setSavedVotingEnd(data.votingEndDate);
      setVotingEndInput(data.votingEndDate || "");
    } catch {
      // silencieux : la liste des réclamations reste utilisable sans ça
    }
  }

  useEffect(() => {
    if (secret) {
      loadClaims();
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  useEffect(() => {
    if (secret) loadClaims(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function saveSettings(e) {
    e.preventDefault();
    setSettingsMessage(null);

    if (votingStartInput && votingEndInput && votingStartInput > votingEndInput) {
      setSettingsMessage("❌ La date de début doit être avant (ou égale à) la date de fin.");
      return;
    }

    setSavingSettings(true);
    try {
      const data = await apiFetch("/manager/ticket-claims/settings", {
        secret,
        method: "PUT",
        body: {
          claimNotificationEmail: emailInput.trim() || null,
          ticketCheckinCode: checkinCodeInput.trim() || null,
          // Cette page ne propose pas de saisie d'heure (voir le nouvel
          // espace admin pour ça) : on garde le comportement historique en
          // couvrant la journée entière (00h00 → 23h59, heure du Bénin).
          votingStartDate: votingStartInput || null,
          votingStartTime: votingStartInput ? "00:00" : null,
          votingEndDate: votingEndInput || null,
          votingEndTime: votingEndInput ? "23:59" : null,
        },
      });
      setSavedEmail(data.claimNotificationEmail);
      setSavedCheckinCode(data.ticketCheckinCode);
      setSavedVotingStart(data.votingStartDate);
      setSavedVotingEnd(data.votingEndDate);
      setSettingsMessage("✅ Réglages enregistrés.");
    } catch (err) {
      setSettingsMessage(`❌ ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  }

  async function toggleStatus(claim) {
    const nextStatus = claim.status === "pending" ? "resolved" : "pending";
    try {
      await apiFetch(`/manager/ticket-claims/${claim._id}/status`, {
        secret,
        method: "PATCH",
        body: { status: nextStatus },
      });
      await loadClaims();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Réglages */}
      <form onSubmit={saveSettings} className="rounded-xl border border-slate-200 p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Réglages</h3>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Email qui reçoit les réclamations
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="manager@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
          {!savedEmail && (
            <p className="text-xs text-amber-600">
              Aucun email configuré — les réclamations seront enregistrées mais aucune notification ne sera envoyée.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Code d'entrée (personnel qui accepte les tickets à la porte)
          </label>
          <input
            value={checkinCodeInput}
            onChange={(e) => setCheckinCodeInput(e.target.value)}
            placeholder="Ex : 4821"
            className="w-full sm:w-64 rounded-lg border border-gray-300 px-4 py-2"
          />
          <p className="text-xs text-slate-500">
            Ce code (pas le mot de passe manager) est demandé sur la page /verify avant d'accepter un
            ticket à l'entrée.
          </p>
          {!savedCheckinCode && (
            <p className="text-xs text-amber-600">
              Aucun code configuré — personne ne pourra accepter de ticket tant qu'il n'est pas défini.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Période de vote</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Début</label>
              <input
                type="date"
                value={votingStartInput}
                onChange={(e) => setVotingStartInput(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Fin</label>
              <input
                type="date"
                value={votingEndInput}
                onChange={(e) => setVotingEndInput(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Le bouton "Voter" est bloqué avant le début et après la fin (bascule exacte à 00h00,
            heure locale du visiteur). Aucun rebuild ni redéploiement du site n'est nécessaire :
            chaque nouvelle visite applique la nouvelle période (jusqu'à 1 minute de délai possible).
            Un onglet déjà ouvert doit être rechargé pour voir le changement.
          </p>
          {(!savedVotingStart || !savedVotingEnd) && (
            <p className="text-xs text-amber-600">
              Aucune période configurée — le bouton "Voter" restera bloqué pour tout le monde tant
              que les deux dates ne sont pas définies.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 disabled:opacity-60"
        >
          {savingSettings ? "Enregistrement..." : "Enregistrer"}
        </button>
        {settingsMessage && <p className="text-sm">{settingsMessage}</p>}
      </form>

      {/* Filtre + liste */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          {[
            { value: "pending", label: "En attente" },
            { value: "resolved", label: "Traitées" },
            { value: "", label: "Toutes" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                statusFilter === opt.value
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {loading ? (
          <p>Chargement...</p>
        ) : claims.length === 0 ? (
          <p className="text-slate-500">Aucune réclamation.</p>
        ) : (
          <div className="space-y-2">
            {claims.map((claim) => (
              <div key={claim._id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{claim.nom}</p>
                    <p className="text-sm text-slate-500">
                      {claim.contact}
                      {claim.transactionOrTicketId && ` · ID: ${claim.transactionOrTicketId}`}
                      {" · "}
                      {formatDate(claim.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        claim.status === "resolved"
                          ? "bg-success-50 text-success-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {claim.status === "resolved" ? "traitée" : "en attente"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === claim._id ? null : claim._id)}
                      className="text-primary-600 hover:underline text-sm font-semibold"
                    >
                      {expandedId === claim._id ? "Fermer" : "Rechercher le ticket"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(claim)}
                      className="text-amber-600 hover:underline text-sm font-semibold"
                    >
                      {claim.status === "resolved" ? "Remettre en attente" : "Marquer traitée"}
                    </button>
                  </div>
                </div>

                {expandedId === claim._id && (
                  <div className="px-3 pb-3">
                    <TicketSearchPanel claim={claim} secret={secret} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
