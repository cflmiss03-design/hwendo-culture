import { useState } from "react";
import { fetchAPI } from "../services/api.js";

export default function TicketClaimForm({ transactionId, onClose }) {
  // Sur la page de statut de paiement, l'ID est auto-capturé depuis l'URL et
  // reste caché (transactionId fourni). Sur la page /tickets, il n'y a rien à
  // capturer : on affiche un champ optionnel pour que la personne le saisisse
  // elle-même si elle le connaît.
  const showManualIdField = !transactionId;

  const [form, setForm] = useState({ nom: "", contact: "", manualId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const canSubmit = form.nom.trim() && form.contact.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await fetchAPI("/tickets/claims", {
        method: "POST",
        body: JSON.stringify({
          nom: form.nom,
          contact: form.contact,
          transactionOrTicketId: transactionId || form.manualId.trim() || undefined,
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl animate-slide-up">
        {done ? (
          <div className="text-center py-4">
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-100">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Réclamation envoyée</h2>
            <p className="text-slate-600 mb-6">
              Nous avons bien reçu votre demande et allons vous recontacter dans les meilleurs délais.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold py-3 hover:shadow-lg transition-all"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Signaler un ticket non reçu</h2>
              <p className="text-sm text-slate-500 mt-1">
                Renseignez vos coordonnées, nous vous recontactons rapidement pour vous envoyer votre ticket.
              </p>
            </div>

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
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Numéro WhatsApp ou téléphone *
              </label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                placeholder="+229…"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {showManualIdField && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  ID de transaction ou de ticket (optionnel)
                </label>
                <input
                  name="manualId"
                  value={form.manualId}
                  onChange={handleChange}
                  placeholder="Si vous l'avez, ex : identifiant reçu après le paiement"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Laissez vide si vous ne l'avez pas — nous pourrons quand même retrouver votre ticket.
                </p>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-slate-200 text-slate-700 font-semibold px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {submitting ? "Envoi..." : "Envoyer la réclamation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
