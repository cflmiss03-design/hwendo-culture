import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";

export default function ManagerClient({ secret, onUnauthorized }) {
  const [candidates, setCandidates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const authHeaders = { "x-admin-secret": secret };

  function handleApiError(err) {
    if (err.message?.startsWith("API Error: 401")) {
      onUnauthorized();
      return true;
    }
    return false;
  }

  async function loadCandidates() {
    try {
      const res = await fetchAPI("/manager", { headers: authHeaders });
      setCandidates(res);
    } catch (err) {
      if (!handleApiError(err)) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(candidate) {
    setEditing(candidate._id);
    setForm({ ...candidate });
    setMessage(null);
    setError(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    if (!form.firstName || !form.lastName || !form.slug) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      const res = await fetchAPI(`/manager/${editing}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          orderNumber: Number(form.orderNumber),
          unitPrice: Number(form.unitPrice)
        })
      });

      setMessage("✅ Candidate mise à jour avec succès.");
      setEditing(null);
      await loadCandidates();
    } catch (err) {
      if (!handleApiError(err)) setError(err.message);
    }
  }

  async function deleteCandidate(id) {
    if (!confirm("Supprimer cette candidate ?")) return;

    try {
      await fetchAPI(`/manager/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      if (!handleApiError(err)) alert(err.message);
    }
  }

  async function modifyVotes(candidate) {
    const input = prompt(
      `Modifier le nombre de votes pour ${candidate.firstName} ${candidate.lastName}`,
      candidate.totalVotes || 0
    );

    if (input === null) return; // annuler

    const votes = Number(input);
    if (isNaN(votes) || votes < 0) {
      alert("Veuillez entrer un nombre valide de votes.");
      return;
    }

    try {
      await fetchAPI(`/manager/${candidate._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ totalVotes: votes })
      });

      setMessage(`✅ Total des votes mis à jour pour ${candidate.firstName}.`);
      await loadCandidates();
    } catch (err) {
      if (!handleApiError(err)) alert(err.message);
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Nom</th>
            <th>Slug</th>
            <th>Total Votes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c._id}>
              <td>{c.orderNumber}</td>
              <td>{c.firstName} {c.lastName}</td>
              <td>{c.slug}</td>
              <td>{c.totalVotes || 0}</td>
              <td>
                <button onClick={() => startEdit(c)}>Modifier</button>
                <button onClick={() => deleteCandidate(c._id)}>Supprimer</button>
                <button onClick={() => modifyVotes(c)}>MV</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <>
          <h2>Modifier la candidate</h2>

          <input
            name="orderNumber"
            value={form.orderNumber}
            onChange={handleChange}
            placeholder="Numéro d'ordre"
          />
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Prénom"
          />
          <input
            name="secondName"
            value={form.secondName || ""}
            onChange={handleChange}
            placeholder="Deuxième prénom"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Nom"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
          />
          <input
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="URL de la photo"
          />
          <input
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            placeholder="Prix du vote"
          />
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="Description"
          />

          <br />
          <button onClick={saveEdit}>💾 Enregistrer</button>
          <button onClick={() => setEditing(null)}>Annuler</button>
        </>
      )}
    </>
  );
}
