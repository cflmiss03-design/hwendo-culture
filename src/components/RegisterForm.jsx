"use client";

import { useState } from "react";
import { fetchAPI } from "../services/api.js";

export default function RegisterForm() {
  const [form, setForm] = useState({
    orderNumber: "",
    firstName: "",
    secondName: "",
    lastName: "",
    text: "",
    slug: "",
    photoUrl: "",
    unitPrice: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      !form.firstName ||
      !form.lastName ||
      !form.slug ||
      !form.photoUrl ||
      !form.orderNumber ||
      !form.unitPrice
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        orderNumber: Number(form.orderNumber),
        unitPrice: Number(form.unitPrice)
      };

      const response = await fetchAPI("/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      await response.json();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-100 text-green-800 rounded-lg shadow-md text-center mt-6 animate-fade-up">
        ✅ Candidate enregistrée avec succès !
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 animate-fade-up"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center">Enregistrer une candidate</h2>

      <input
        name="orderNumber"
        type="number"
        placeholder="Numéro d'ordre"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <input
        name="firstName"
        placeholder="Prénom"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <input
        name="secondName"
        placeholder="Deuxième prénom"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
      />

      <input
        name="lastName"
        placeholder="Nom"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <input
        name="slug"
        placeholder="Slug (unique)"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <input
        name="photoUrl"
        placeholder="URL de la photo"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <input
        name="unitPrice"
        type="number"
        placeholder="Prix du vote"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
        required
      />

      <textarea
        name="text"
        placeholder="Description"
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24"
      />

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white font-bold transition-all ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
        }`}
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
