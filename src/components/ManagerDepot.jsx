import { useState } from "react";
import { fetchAPI } from "../services/api.js";

export default function AdminPayoutForm({ secret, onUnauthorized }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    description: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchAPI("/admin/payouts", {
        method: "POST",
        headers: {
          "x-admin-secret": secret
        },
        body: JSON.stringify(form)
      });

      alert("Dépôt envoyé avec succès");

      setForm({
        amount: "",
        firstname: "",
        lastname: "",
        email: "",
        phoneNumber: "",
        description: ""
      });

    } catch (err) {
      if (err.message?.startsWith("API Error: 401")) onUnauthorized();
      else alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Création d’un dépôt manuel
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Montant (XOF)
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Ex: 5000"
            />
          </div>

          {/* Nom + Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Prénom
              </label>
              <input
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nom
              </label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="john@example.com"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Numéro Mobile Money
            </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="+229XXXXXXXX"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description (optionnel)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Motif du dépôt"
            />
          </div>

          {/* Bouton */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition 
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? "Envoi en cours..." : "Envoyer le dépôt"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
