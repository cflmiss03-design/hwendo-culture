import { useEffect, useRef, useState } from "react";
import { fetchAPI } from "../services/api.js";
import TicketClaimForm from "./TicketClaimForm.jsx";

const MAX_QUANTITY = 20;
const STEP_LABELS = ["Ticket", "Quantité", "Coordonnées"];
// Format attendu : XXXX-YYYY, ex. "DOSSOU-001" — nom en lettres majuscules
// uniquement (aucun espace/point/tiret), 10 lettres maximum, puis un tiret et
// 3 à 5 chiffres. La partie nom doit rester synchronisée avec MAX_NAME_LENGTH
// et normalizeCode dans server-votes/src/utils/candidateCode.js.
const CANDIDATE_CODE_MAX_NAME_LENGTH = 10;
const CANDIDATE_CODE_MAX_NUMBER_LENGTH = 5;
const CANDIDATE_CODE_REGEX = new RegExp(
  `^[A-Z]{1,${CANDIDATE_CODE_MAX_NAME_LENGTH}}-\\d{3,${CANDIDATE_CODE_MAX_NUMBER_LENGTH}}$`
);
const CANDIDATE_CODE_EXAMPLE = "XXXX-YYYY";
const CODE_CHECK_DEBOUNCE_MS = 500;

function StepBadge({ n, active }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 transition-all ${
        active
          ? "bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-md"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {n}
    </span>
  );
}

function StepProgress({ step, maxReached, onJump }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const isCurrent = n === step;
        const isDone = n < step;
        const clickable = n <= maxReached && n !== step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(n)}
              className={`flex items-center gap-1.5 sm:gap-2 ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full font-bold text-xs sm:text-sm shrink-0 transition-all ${
                  isCurrent
                    ? "bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-glow-primary scale-110"
                    : isDone
                    ? "bg-gradient-to-br from-primary-500 to-secondary-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? "✓" : n}
              </span>
              <span
                className={`hidden sm:inline text-xs sm:text-sm font-semibold ${
                  isCurrent ? "text-slate-900" : isDone ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </button>
            {n < STEP_LABELS.length && (
              <span
                className={`mx-2 sm:mx-3 h-0.5 flex-1 rounded-full transition-colors ${
                  isDone ? "bg-gradient-to-r from-primary-500 to-secondary-500" : "bg-slate-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TicketPurchase() {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    pays: "",
    ville: "",
    candidateCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);

  // Vérification en direct du code candidate : "idle" | "invalid-format" |
  // "checking" | "found" | "not-found"
  const [codeStatus, setCodeStatus] = useState("idle");
  const [codeCandidateName, setCodeCandidateName] = useState(null);
  const codeRequestIdRef = useRef(0);
  // Mémorise les codes déjà vérifiés (code → { valid, candidateName? }) pour
  // ne jamais re-solliciter le serveur pour un code identique déjà résolu
  // dans cette session (ex: l'utilisateur efface puis retape le même code).
  const codeCacheRef = useRef(new Map());

  useEffect(() => {
    fetchAPI("/tickets/types")
      .then((data) => setTicketTypes(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingTypes(false));
  }, []);

  // Étape 1, cliente : le format doit être complet (XXXX-YYYY) avant même de
  // solliciter le serveur — la saisie est déjà filtrée par
  // handleCandidateCodeChange, donc un format incomplet ici veut juste dire
  // "l'utilisateur n'a pas fini de taper", pas "caractère invalide".
  // Étape 2, serveur : le code complet correspond-il à une candidate ?
  useEffect(() => {
    const code = form.candidateCode.trim();

    if (!code) {
      setCodeStatus("idle");
      setCodeCandidateName(null);
      return;
    }

    if (!CANDIDATE_CODE_REGEX.test(code)) {
      setCodeStatus("incomplete");
      setCodeCandidateName(null);
      return;
    }

    const cached = codeCacheRef.current.get(code);
    if (cached) {
      setCodeStatus(cached.valid ? "found" : "not-found");
      setCodeCandidateName(cached.valid ? cached.candidateName : null);
      return; // déjà vérifié dans cette session, aucune requête envoyée
    }

    setCodeStatus("checking");
    const requestId = ++codeRequestIdRef.current;

    const timeout = setTimeout(async () => {
      try {
        const data = await fetchAPI(`/tickets/candidate-code/${encodeURIComponent(code)}`);
        codeCacheRef.current.set(code, data);
        if (codeRequestIdRef.current !== requestId) return; // réponse obsolète, ignorée
        if (data.valid) {
          setCodeStatus("found");
          setCodeCandidateName(data.candidateName);
        } else {
          setCodeStatus("not-found");
          setCodeCandidateName(null);
        }
      } catch {
        if (codeRequestIdRef.current !== requestId) return;
        // Échec réseau : on n'affiche rien de bloquant, l'achat reste possible.
        setCodeStatus("idle");
        setCodeCandidateName(null);
      }
    }, CODE_CHECK_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [form.candidateCode]);

  const selectedType = ticketTypes.find((t) => t._id === selectedTypeId) || null;
  const total = selectedType ? selectedType.prix * quantity : 0;

  function goToStep(n) {
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
    // Fait remonter la vue en haut du composant, utile sur mobile où le
    // formulaire précédent pouvait être scrollé loin en dessous.
    document.getElementById("ticket-purchase-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectType(id) {
    setSelectedTypeId(id);
    goToStep(2);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Filtre la saisie du code candidate au fil de la frappe plutôt que de
  // simplement rejeter après coup : majuscules forcées, uniquement des
  // lettres pour le nom (10 max), uniquement des chiffres après le tiret.
  function handleCandidateCodeChange(e) {
    const raw = e.target.value.toUpperCase();
    const dashIndex = raw.indexOf("-");

    if (dashIndex === -1) {
      const namePart = raw.replace(/[^A-Z]/g, "").slice(0, CANDIDATE_CODE_MAX_NAME_LENGTH);
      setForm((prev) => ({ ...prev, candidateCode: namePart }));
      return;
    }

    const namePart = raw
      .slice(0, dashIndex)
      .replace(/[^A-Z]/g, "")
      .slice(0, CANDIDATE_CODE_MAX_NAME_LENGTH);
    const numberPart = raw
      .slice(dashIndex + 1)
      .replace(/[^0-9]/g, "")
      .slice(0, CANDIDATE_CODE_MAX_NUMBER_LENGTH);

    setForm((prev) => ({ ...prev, candidateCode: `${namePart}-${numberPart}` }));
  }

  function changeQuantity(delta) {
    setQuantity((q) => Math.min(MAX_QUANTITY, Math.max(1, q + delta)));
  }

  const canSubmit =
    selectedType && form.nom.trim() && form.email.trim() && form.telephone.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const data = await fetchAPI("/tickets/purchase", {
        method: "POST",
        body: JSON.stringify({
          ticketTypeId: selectedType._id,
          buyer: {
            nom: form.nom,
            email: form.email,
            telephone: form.telephone,
            pays: form.pays || undefined,
            ville: form.ville || undefined,
          },
          candidateCode: form.candidateCode || undefined,
          quantity,
        }),
      });

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement introuvable");
      }
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  if (loadingTypes) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="aspect-[16/10] shimmer bg-slate-100" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-2/3 rounded shimmer bg-slate-100" />
              <div className="h-3 w-full rounded shimmer bg-slate-100" />
              <div className="h-5 w-1/3 rounded shimmer bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (ticketTypes.length === 0) {
    return <p className="text-slate-600">Aucun ticket disponible pour le moment.</p>;
  }

  return (
    <div id="ticket-purchase-top">
      <StepProgress step={step} maxReached={maxReached} onJump={goToStep} />

      {/* Étape 1 : sélection du type de ticket */}
      {step === 1 && (
        <div className="animate-fade-up">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-5">
            <StepBadge n={1} active />
            Choisissez votre ticket
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {ticketTypes.map((tt, i) => {
              const isSelected = selectedTypeId === tt._id;
              return (
                <button
                  key={tt._id}
                  type="button"
                  onClick={() => selectType(tt._id)}
                  className={`group relative text-left rounded-2xl overflow-hidden bg-white border transition-all duration-300 animate-fade-up ${
                    isSelected
                      ? "border-primary-500 shadow-glow-primary -translate-y-1 ring-2 ring-primary-400"
                      : "border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary-300"
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Aperçu du modèle de ticket */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                    <img
                      src={tt.svgUrl}
                      alt={`Aperçu du ticket ${tt.nom}`}
                      className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Infos */}
                  <div className="p-4 sm:p-5">
                    <p className="font-heading font-bold text-base sm:text-lg text-slate-900">{tt.nom}</p>
                    {tt.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{tt.description}</p>
                    )}
                    <p className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 px-3 py-1 text-sm sm:text-base font-bold text-primary-700">
                      {tt.prix?.toLocaleString()} FCFA
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Étape 2 : quantité */}
      {step === 2 && selectedType && (
        <div className="animate-fade-up space-y-6">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900">
            <StepBadge n={2} active />
            Quantité
          </h2>

          <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 p-3 sm:p-4 bg-gradient-to-r from-white to-primary-50/40">
            <img
              src={selectedType.svgUrl}
              alt=""
              className="w-16 h-11 sm:w-20 sm:h-14 object-contain rounded-lg bg-slate-50 border border-slate-100 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{selectedType.nom}</p>
              <p className="text-sm text-slate-500">{selectedType.prix?.toLocaleString()} FCFA / ticket</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => changeQuantity(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 text-white font-bold text-lg shadow-md hover:shadow-lg active:scale-90 transition-all disabled:opacity-30 disabled:hover:shadow-md"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_QUANTITY}
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isInteger(val)) {
                    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, val)));
                  }
                }}
                className="w-16 sm:w-20 text-center rounded-xl border border-slate-200 py-2 sm:py-2.5 text-lg sm:text-xl font-black text-slate-900"
              />
              <button
                type="button"
                onClick={() => changeQuantity(1)}
                disabled={quantity >= MAX_QUANTITY}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 text-white font-bold text-lg shadow-md hover:shadow-lg active:scale-90 transition-all disabled:opacity-30 disabled:hover:shadow-md"
              >
                +
              </button>
            </div>
            <span className="text-sm text-slate-500">
              {quantity > 1 ? `${quantity} tickets (max ${MAX_QUANTITY})` : "ticket"}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="shrink-0 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors text-sm sm:text-base"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold px-4 sm:px-6 py-3 shadow-md hover:shadow-lg active:scale-[0.99] transition-all text-sm sm:text-base"
            >
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : coordonnées + paiement */}
      {step === 3 && selectedType && (
        <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900">
            <StepBadge n={3} active />
            Vos coordonnées
          </h2>
          {quantity > 1 && (
            <p className="text-sm text-slate-500 -mt-4 ml-11">
              Ces coordonnées seront utilisées pour les {quantity} tickets, qui seront numérotés
              individuellement et envoyés dans un seul email.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nom *</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                📧 {quantity > 1 ? `Vos ${quantity} tickets seront envoyés` : "Votre ticket sera envoyé"} à cette
                adresse email.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone *</label>
              <input
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                required
                placeholder="+229…"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pays</label>
              <input
                name="pays"
                value={form.pays}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ville</label>
              <input
                name="ville"
                value={form.ville}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200/60 p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              🎗️ Code d'une candidate (optionnel)
            </label>
            <div className="relative w-full sm:w-64">
              <input
                name="candidateCode"
                value={form.candidateCode}
                onChange={handleCandidateCodeChange}
                placeholder={`Ex : ${CANDIDATE_CODE_EXAMPLE}`}
                autoComplete="off"
                spellCheck="false"
                maxLength={CANDIDATE_CODE_MAX_NAME_LENGTH + 1 + CANDIDATE_CODE_MAX_NUMBER_LENGTH}
                className={`w-full rounded-lg border px-4 py-2.5 pr-9 outline-none bg-white transition-colors focus:ring-2 ${
                  codeStatus === "found"
                    ? "border-success-500 focus:ring-success-50"
                    : codeStatus === "not-found"
                    ? "border-danger-500 focus:ring-danger-50"
                    : "border-gray-300 focus:ring-primary-500"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {codeStatus === "checking" && (
                  <span className="inline-block w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                )}
                {codeStatus === "found" && <span className="text-success-600">✓</span>}
                {codeStatus === "not-found" && <span className="text-danger-500">✕</span>}
              </span>
            </div>

            {codeStatus === "found" && (
              <p className="text-xs text-success-700 font-semibold mt-1.5">
                ✓ Candidate trouvée : {codeCandidateName}
              </p>
            )}
            {codeStatus === "not-found" && (
              <p className="text-xs text-danger-600 mt-1.5">
                Aucune candidate ne correspond à ce code. Votre achat continuera normalement, sans attribution.
              </p>
            )}
            {codeStatus === "incomplete" && (
              <p className="text-xs text-slate-500 mt-1.5">
                Format attendu : {CANDIDATE_CODE_EXAMPLE} — {CANDIDATE_CODE_MAX_NAME_LENGTH} lettres majuscules
                maximum, puis un tiret et les chiffres.
              </p>
            )}
            {(codeStatus === "idle" || codeStatus === "checking") && (
              <p className="text-xs text-slate-500 mt-1.5">
                Soutenez une candidate en indiquant son code (ex : {CANDIDATE_CODE_EXAMPLE}). Laissez vide si vous
                n'en avez pas.
              </p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <span className="relative text-white/90 font-medium text-sm sm:text-base">
              Total à payer{" "}
              {quantity > 1 ? `(${quantity} × ${selectedType.prix?.toLocaleString()} FCFA)` : ""}
            </span>
            <span className="relative font-black text-white text-xl sm:text-2xl">
              {total.toLocaleString()} FCFA
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center -mt-2">
            Des frais de transaction pourront être appliqués au moment du paiement.
          </p>

          {/* Réassurance */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center text-xs sm:text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">🔒 Paiement 100% sécurisé</span>
            <span className="inline-flex items-center gap-1.5">📧 Ticket envoyé par email</span>
            <span className="inline-flex items-center gap-1.5">✅ QR code vérifiable</span>
          </div>

          {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="shrink-0 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors text-sm sm:text-base"
            >
              ← Retour
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white shadow-glow-secondary transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <span className="relative">
                {submitting ? "Préparation du paiement..." : `Payer ${total.toLocaleString()} FCFA`}
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="mt-10 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Vous avez déjà acheté un ticket mais ne l'avez pas reçu ?{" "}
          <button
            type="button"
            onClick={() => setShowClaimForm(true)}
            className="text-primary-600 font-semibold hover:underline"
          >
            Faire une réclamation
          </button>
        </p>
      </div>

      {showClaimForm && <TicketClaimForm onClose={() => setShowClaimForm(false)} />}
    </div>
  );
}
