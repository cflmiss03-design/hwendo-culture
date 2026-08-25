"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";
import { getVotingState } from "../config";

// CHANGED: routage Local/Afrique (voir memory/sebpay_integration.md). "amount"
// = étape existante inchangée. "country"/"operator" n'apparaissent que pour
// un événement en mode de paiement "Afrique".
export default function VoteModal({ candidate, period, onClose }) {
  const [votes, setVotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("amount");

  // Réglages de paiement de l'événement — chargés une fois, en tâche de fond.
  // En cas d'échec réseau, on reste sur paymentType "local" par défaut : ne
  // JAMAIS bloquer un vote à cause d'un souci sur cet appel secondaire.
  const [paymentType, setPaymentType] = useState("local");
  const [countries, setCountries] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryError, setCountryError] = useState(null);
  const [sebpayCountryNames, setSebpayCountryNames] = useState(null);

  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [operatorError, setOperatorError] = useState(null);

  const total = votes ? Number(votes) * candidate.unitPrice : 0;

  useEffect(() => {
    fetchAPI("/payments/countries")
      .then((data) => {
        setPaymentType(data.paymentType || "local");
        setCountries(data.countries || []);
      })
      .catch(() => {
        // Best-effort : le vote reste possible en mode Local si cet appel échoue.
      });
  }, []);

  const validateAmount = () => {
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
      return false;
    }
    if (!votes || votes <= 0) {
      alert("Veuillez entrer un nombre valide de votes (1 à 9999).");
      return false;
    }
    return true;
  };

  // Redirige vers la page hébergée FedaPay — flux inchangé, utilisé aussi
  // bien en mode Local qu'en mode Afrique quand le pays choisi est routé
  // vers FedaPay.
  const payViaFedapay = async (country) => {
    setLoading(true);
    try {
      const data = await fetchAPI("/payments/init", {
        method: "POST",
        body: JSON.stringify({
          candidateId: candidate.id,
          votes: Number(votes),
          ...(country ? { country } : {}),
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

  const handlePay = async () => {
    if (!validateAmount()) return;

    if (paymentType !== "afrique" || countries.length === 0) {
      await payViaFedapay(null);
      return;
    }

    setStep("country");
  };

  const handleSelectCountry = async () => {
    setCountryError(null);
    setSebpayCountryNames(null);

    const country = countries.find((c) => c.code === selectedCountry);
    if (!country) {
      setCountryError("Veuillez choisir un pays.");
      return;
    }

    if (country.provider === "fedapay") {
      await payViaFedapay(country.code);
      return;
    }

    // SebPay : vérification live des opérateurs disponibles pour ce pays
    // (Étape 2.2 — le mapping admin peut être périmé si SebPay change sa
    // couverture, voir payment.controller.js#getOperatorsForCountry).
    setLoading(true);
    try {
      const data = await fetchAPI(`/payments/operators?country=${encodeURIComponent(country.code)}`);
      if (!data.available) {
        setCountryError(data.message || "Pays non disponible actuellement");
        setSebpayCountryNames((data.sebpayCountries || []).map((c) => c.name));
        return;
      }
      setOperators(data.operators || []);
      setSelectedOperator("");
      setPhone("");
      setOtpCode("");
      setStep("operator");
    } catch (err) {
      setCountryError("Erreur lors de la vérification du pays : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySebpay = async () => {
    setOperatorError(null);

    const operator = operators.find((o) => o.slug === selectedOperator);
    if (!operator) {
      setOperatorError("Veuillez choisir un opérateur.");
      return;
    }
    if (!phone.trim()) {
      setOperatorError("Veuillez saisir votre numéro de téléphone.");
      return;
    }
    if (operator.otpRequired && !otpCode.trim()) {
      setOperatorError("Veuillez saisir le code reçu après avoir composé le code USSD.");
      return;
    }

    const country = countries.find((c) => c.code === selectedCountry);

    setLoading(true);
    try {
      const data = await fetchAPI("/payments/init", {
        method: "POST",
        body: JSON.stringify({
          candidateId: candidate.id,
          votes: Number(votes),
          country: country?.code,
          // CHANGED: SebPay POST /collections attend le champ `code` générique
          // (ex: "mtn"), pas `slug` (ex: "mtn-bj" — suffixé par pays malgré le
          // nom "slug" employé par leur doc pour ce paramètre). Confirmé par
          // erreur réelle "Operator not found or not configured for this
          // country" en testant avec slug.
          operator: operator.code,
          phone: phone.trim(),
          ...(operator.otpRequired ? { otpCode: otpCode.trim() } : {}),
        }),
      });

      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      if (!data.transactionId) {
        throw new Error("Réponse de paiement invalide");
      }

      // Exception au flux direct (observée avec Wave) : une page de
      // confirmation doit s'ouvrir dans un nouvel onglet.
      if (data.providerLink) {
        window.open(data.providerLink, "_blank", "noopener,noreferrer");
      }
      // CHANGED: contrairement à frontend-votes-palais-royal (route plate
      // /vote/status), ce frontend sert 3 catégories sous /<category>/vote/status
      // (voir src/pages/[category]/vote/status.astro) — il faut donc
      // préfixer par la catégorie courante (même logique que resolveApiPrefix
      // dans src/config.ts, dupliquée ici car non exportée).
      const categoryPrefix = window.location.pathname.split("/").filter(Boolean)[0];
      window.location.href = `/${categoryPrefix}/vote/status?provider=sebpay&id=${encodeURIComponent(data.transactionId)}`;
    } catch (err) {
      setOperatorError("Erreur lors de l'initiation du paiement : " + err.message);
      setLoading(false);
    }
  };

  const selectedOperatorObj = operators.find((o) => o.slug === selectedOperator);

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

          {step === "amount" && (
            <>
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
                  : paymentType === "afrique"
                  ? "Continuer"
                  : `Payer ${total.toLocaleString()} FCFA`}
              </button>

              {/* ANNULER */}
              <button
                onClick={onClose}
                className="mt-4 w-full rounded-2xl border border-gray-300 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>
            </>
          )}

          {/* CHANGED: étape pays (mode Afrique uniquement) */}
          {step === "country" && (
            <>
              <p className="mb-1 text-sm font-semibold text-gray-700">
                {votes} vote{Number(votes) > 1 ? "s" : ""} — {total.toLocaleString()} FCFA
              </p>
              <label className="block mb-4">
                <span className="mb-1 block text-gray-700 font-semibold">
                  Dans quel pays payez-vous ?
                </span>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 p-3 text-base focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              {countryError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  <p>{countryError}</p>
                  {sebpayCountryNames && sebpayCountryNames.length > 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      Pays actuellement disponibles : {sebpayCountryNames.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleSelectCountry}
                disabled={loading || !selectedCountry}
                className="w-full rounded-2xl bg-gradient-to-r from-primary-700 to-secondary-600 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-70"
              >
                {loading ? "Vérification..." : "Continuer"}
              </button>

              <button
                onClick={() => setStep("amount")}
                className="mt-4 w-full rounded-2xl border border-gray-300 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Retour
              </button>
            </>
          )}

          {/* CHANGED: étape opérateur SebPay (mode Afrique, pays routé SebPay) */}
          {step === "operator" && (
            <>
              <p className="mb-1 text-sm font-semibold text-gray-700">
                {votes} vote{Number(votes) > 1 ? "s" : ""} — {total.toLocaleString()} FCFA
              </p>

              <label className="block mb-4">
                <span className="mb-1 block text-gray-700 font-semibold">Opérateur mobile money</span>
                <div className="space-y-2">
                  {operators.map((op) => (
                    <label
                      key={op.slug}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                        selectedOperator === op.slug ? "border-primary-500 bg-primary-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="operator"
                        value={op.slug}
                        checked={selectedOperator === op.slug}
                        onChange={() => setSelectedOperator(op.slug)}
                      />
                      <span className="font-medium text-gray-800">{op.name}</span>
                    </label>
                  ))}
                </div>
              </label>

              <label className="block mb-4">
                <span className="mb-1 block text-gray-700 font-semibold">Numéro de téléphone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 22997000000 (indicatif inclus, sans le +)"
                  className="w-full rounded-2xl border border-gray-200 p-3 text-base focus:border-primary-500 focus:outline-none"
                />
              </label>

              {selectedOperatorObj?.otpRequired && (
                <div className="mb-4 rounded-xl bg-sky-50 border border-sky-100 p-3 text-sm text-sky-800">
                  <p className="mb-2">
                    Cet opérateur demande une confirmation : composez{" "}
                    <strong>{selectedOperatorObj.ussdCode || "le code USSD reçu de votre opérateur"}</strong> sur
                    votre téléphone, puis saisissez le code reçu ci-dessous.
                  </p>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Code reçu"
                    className="w-full rounded-xl border border-sky-200 p-2.5 text-base focus:border-sky-500 focus:outline-none"
                  />
                </div>
              )}

              {operatorError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  {operatorError}
                </div>
              )}

              <button
                onClick={handlePaySebpay}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-primary-700 to-secondary-600 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-70"
              >
                {loading ? "Envoi de la demande..." : `Payer ${total.toLocaleString()} FCFA`}
              </button>

              <button
                onClick={() => setStep("country")}
                className="mt-4 w-full rounded-2xl border border-gray-300 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Retour
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
