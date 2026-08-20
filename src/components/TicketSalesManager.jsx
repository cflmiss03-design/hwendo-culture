import { useEffect, useState } from "react";
import config from "../config";


async function apiFetch(path, { secret } = {}) {
  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: { "x-admin-secret": secret },
  });
  if (res.status === 401) throw new Error("__UNAUTHORIZED__");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur ${res.status}`);
  }
  return res.json();
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
const STATUS_LABEL = { pending: "en attente", paid: "payé", failed: "échoué" };

function SalesTab({ secret, onUnauthorized }) {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const data = await apiFetch(`/manager/ticket-sales?${params.toString()}`, { secret });
      setSales(data.data);
      setTotal(data.total);
    } catch (err) {
      if (err.message === "__UNAUTHORIZED__") onUnauthorized();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, q]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(qInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {[
            { value: "", label: "Tous" },
            { value: "paid", label: "Payés" },
            { value: "pending", label: "En attente" },
            { value: "failed", label: "Échoués" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setPage(1);
                setStatus(opt.value);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                status === opt.value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Rechercher nom, email, téléphone..."
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-56"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-600 text-white text-sm font-semibold px-4 py-1.5 hover:bg-primary-700"
          >
            Rechercher
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : sales.length === 0 ? (
        <p className="text-slate-500">Aucune vente pour ces critères.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Qté</th>
                <th className="py-2 pr-4">Prix unit.</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Code candidate</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium text-slate-900">{s.buyerNom}</td>
                  <td className="py-2 pr-4 text-slate-500">
                    {s.buyerTelephone}
                    <br />
                    {s.buyerEmail}
                  </td>
                  <td className="py-2 pr-4">{s.ticketTypeNom}</td>
                  <td className="py-2 pr-4">{s.quantity}</td>
                  <td className="py-2 pr-4">{s.unitPrice?.toLocaleString()} FCFA</td>
                  <td className="py-2 pr-4 font-semibold">{s.totalAmount?.toLocaleString()} FCFA</td>
                  <td className="py-2 pr-4">{s.candidateCode || "—"}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[s.status] || "bg-slate-100"}`}>
                      {STATUS_LABEL[s.status] || s.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-slate-500">
              {total} achat{total > 1 ? "s" : ""} — page {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidatesTab({ secret, onUnauthorized }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch("/manager/ticket-sales/candidates", { secret })
      .then(setCandidates)
      .catch((err) => {
        if (err.message === "__UNAUTHORIZED__") onUnauthorized();
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [secret]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600 text-sm">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="py-2 pr-4">Rang</th>
            <th className="py-2 pr-4">Code</th>
            <th className="py-2 pr-4">Candidate</th>
            <th className="py-2 pr-4">Tickets vendus</th>
            <th className="py-2 pr-4">Revenu généré</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <tr key={c._id} className="border-b border-slate-100">
              <td className="py-2 pr-4 font-bold text-slate-400">#{i + 1}</td>
              <td className="py-2 pr-4 font-mono text-primary-700">{c.code}</td>
              <td className="py-2 pr-4 font-medium text-slate-900">{c.nom}</td>
              <td className="py-2 pr-4">{c.ticketsSold}</td>
              <td className="py-2 pr-4 font-semibold">{c.revenue.toLocaleString()} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TicketSalesManager({ secret, onUnauthorized }) {
  const [tab, setTab] = useState("sales");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("sales")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "sales" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Ventes / Clients
        </button>
        <button
          type="button"
          onClick={() => setTab("candidates")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            tab === "candidates" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Classement Candidates
        </button>
      </div>

      {tab === "sales" ? (
        <SalesTab secret={secret} onUnauthorized={onUnauthorized} />
      ) : (
        <CandidatesTab secret={secret} onUnauthorized={onUnauthorized} />
      )}
    </div>
  );
}
