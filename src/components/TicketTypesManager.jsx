import { useEffect, useState } from "react";
import config from "../config";

const DEFAULT_ZONES = [
  { nom: "qr", x: 443.3, y: 56.3, width: 137.5, height: 137.5, fontSize: 24, color: "#000000" },
  { nom: "nom", x: 94.7, y: 23.1, width: 135.5, height: 23.4, fontSize: 16, color: "#000000" },
  { nom: "numero", x: 328.6, y: 24.5, width: 78.2, height: 20.3, fontSize: 14, color: "#333333" },
];

async function apiFetch(path, { secret, method = "GET", body, isForm = false } = {}) {
  const headers = { "x-admin-secret": secret };
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) throw new Error("__UNAUTHORIZED__");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function emptyForm() {
  return {
    nom: "",
    description: "",
    prix: "",
    fraisTransaction: "0",
    zones: DEFAULT_ZONES.map((z) => ({ ...z })),
    svgFile: null,
  };
}

export default function TicketTypesManager({ secret, onUnauthorized }) {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [editingId, setEditingId] = useState(null); // null = pas de formulaire, "new" = création
  const [form, setForm] = useState(emptyForm());
  const [svgPreviewUrl, setSvgPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadTicketTypes() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/manager/ticket-types", { secret });
      setTicketTypes(data);
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

  useEffect(() => {
    if (secret) loadTicketTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  function startCreate() {
    setForm(emptyForm());
    setSvgPreviewUrl(null);
    setEditingId("new");
    setMessage(null);
    setError(null);
  }

  function startEdit(tt) {
    setForm({
      nom: tt.nom,
      description: tt.description || "",
      prix: tt.prix,
      fraisTransaction: tt.fraisTransaction ?? 0,
      zones: (tt.zones || []).map((z) => ({ ...z })),
      svgFile: null,
    });
    setSvgPreviewUrl(tt.svgUrl);
    setEditingId(tt._id);
    setMessage(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    if (svgPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(svgPreviewUrl);
    setSvgPreviewUrl(null);
  }

  function handleSvgChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, svgFile: file }));
    setSvgPreviewUrl(URL.createObjectURL(file));
  }

  function updateZone(index, field, value) {
    setForm((prev) => {
      const zones = prev.zones.map((z, i) =>
        i === index ? { ...z, [field]: value } : z
      );
      return { ...prev, zones };
    });
  }

  function addZone() {
    setForm((prev) => ({
      ...prev,
      zones: [
        ...prev.zones,
        { nom: "", x: 0, y: 0, width: 100, height: 30, fontSize: 20, color: "#000000" },
      ],
    }));
  }

  function removeZone(index) {
    setForm((prev) => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.nom || form.prix === "") {
        throw new Error("Nom et prix sont requis");
      }
      const fraisTransaction = form.fraisTransaction === "" ? 0 : Number(form.fraisTransaction);
      if (Number.isNaN(fraisTransaction) || fraisTransaction < 0 || fraisTransaction > 100) {
        throw new Error("Les frais de transaction doivent être un nombre entre 0 et 100");
      }
      if (editingId === "new" && !form.svgFile) {
        throw new Error("Le fichier SVG est requis pour créer un type de ticket");
      }

      const body = new FormData();
      body.append("nom", form.nom);
      body.append("description", form.description || "");
      body.append("prix", form.prix);
      body.append("fraisTransaction", fraisTransaction);
      body.append("zones", JSON.stringify(form.zones));
      if (form.svgFile) body.append("svg", form.svgFile);

      if (editingId === "new") {
        await apiFetch("/manager/ticket-types", {
          secret,
          method: "POST",
          body,
          isForm: true,
        });
        setMessage("✅ Type de ticket créé.");
      } else {
        await apiFetch(`/manager/ticket-types/${editingId}`, {
          secret,
          method: "PUT",
          body,
          isForm: true,
        });
        setMessage("✅ Type de ticket mis à jour.");
      }

      cancelEdit();
      await loadTicketTypes();
    } catch (err) {
      setError(err.message === "__UNAUTHORIZED__" ? "Non autorisé" : err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(tt) {
    try {
      const nextStatut = tt.statut === "actif" ? "inactif" : "actif";
      await apiFetch(`/manager/ticket-types/${tt._id}/status`, {
        secret,
        method: "PATCH",
        body: { statut: nextStatut },
      });
      await loadTicketTypes();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteTicketType(tt) {
    if (
      !confirm(
        `Supprimer définitivement le type de ticket "${tt.nom}" ? Cette action est irréversible (l'historique des ventes déjà faites reste intact).`
      )
    )
      return;
    try {
      await apiFetch(`/manager/ticket-types/${tt._id}`, {
        secret,
        method: "DELETE",
      });
      await loadTicketTypes();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {editingId === null && (
        <button
          onClick={startCreate}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg"
        >
          + Nouveau type de ticket
        </button>
      )}

      {editingId === null && (
        loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Prix</th>
                <th className="py-2 pr-4">Frais de transaction</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Zones</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticketTypes.map((tt) => (
                <tr key={tt._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{tt.nom}</td>
                  <td className="py-2 pr-4">{tt.prix} XOF</td>
                  <td className="py-2 pr-4">{tt.fraisTransaction ?? 0}%</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        tt.statut === "actif"
                          ? "text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs"
                          : "text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs"
                      }
                    >
                      {tt.statut}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{tt.zones?.length || 0}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => startEdit(tt)} className="text-blue-600 hover:underline">
                      Modifier
                    </button>
                    <button onClick={() => toggleStatus(tt)} className="text-amber-600 hover:underline">
                      {tt.statut === "actif" ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => deleteTicketType(tt)} className="text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {ticketTypes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-slate-500">
                    Aucun type de ticket pour l'instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )
      )}

      {editingId !== null && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {editingId === "new" ? "Nouveau type de ticket" : "Modifier le type de ticket"}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
              <input
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Ex: VIP"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Prix (XOF)</label>
              <input
                type="number"
                min="0"
                value={form.prix}
                onChange={(e) => setForm((p) => ({ ...p, prix: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Frais de transaction (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.fraisTransaction}
                onChange={(e) => setForm((p) => ({ ...p, fraisTransaction: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Pourcentage (0-100) ajouté au prix pour couvrir taxes et frais divers. Ex : prix
                100 FCFA + 2% = 102 FCFA réellement facturés. Jamais affiché à l'acheteur.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description (optionnel)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Modèle SVG {editingId === "new" ? "(requis)" : "(laisser vide pour garder l'actuel)"}
            </label>
            <input type="file" accept=".svg,image/svg+xml" onChange={handleSvgChange} />
            {svgPreviewUrl && (
              <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-slate-50 inline-block">
                <img src={svgPreviewUrl} alt="Aperçu du modèle" className="max-w-md max-h-80" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-600">
                Zones (positions en unités du viewBox du SVG)
              </label>
              <button
                type="button"
                onClick={addZone}
                className="text-sm text-blue-600 hover:underline"
              >
                + Ajouter une zone
              </button>
            </div>

            <div className="space-y-3">
              {form.zones.map((zone, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 md:grid-cols-8 gap-2 items-center border border-slate-200 rounded-lg p-3"
                >
                  <input
                    value={zone.nom}
                    onChange={(e) => updateZone(i, "nom", e.target.value)}
                    placeholder="nom (qr/nom/numero/...)"
                    className="col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={zone.x}
                    onChange={(e) => updateZone(i, "x", Number(e.target.value))}
                    placeholder="x"
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={zone.y}
                    onChange={(e) => updateZone(i, "y", Number(e.target.value))}
                    placeholder="y"
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={zone.width}
                    onChange={(e) => updateZone(i, "width", Number(e.target.value))}
                    placeholder="largeur"
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    value={zone.height}
                    onChange={(e) => updateZone(i, "height", Number(e.target.value))}
                    placeholder="hauteur"
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  {zone.nom !== "qr" && (
                    <>
                      <input
                        type="number"
                        value={zone.fontSize}
                        onChange={(e) => updateZone(i, "fontSize", Number(e.target.value))}
                        placeholder="taille police"
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="color"
                        value={zone.color}
                        onChange={(e) => updateZone(i, "color", e.target.value)}
                        className="h-8 w-full rounded border border-gray-300"
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeZone(i)}
                    className="text-red-600 text-sm justify-self-start"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Zones connues : <code>qr</code> (image QR code), <code>nom</code> (nom de l'acheteur),{" "}
              <code>numero</code> (numéro du ticket). Tout autre nom est réservé pour de futures zones texte.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg"
            >
              {saving ? "Enregistrement..." : "💾 Enregistrer"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-slate-600 hover:underline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
