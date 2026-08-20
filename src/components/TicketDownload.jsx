import { useEffect, useState } from "react";
import { fetchAPI } from "../services/api.js";

export default function TicketDownload() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState(null);
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tx = params.get("tx");

    if (!tx) {
      setError("Lien invalide : identifiant de transaction manquant.");
      return;
    }

    fetchAPI(`/tickets/download/${encodeURIComponent(tx)}`)
      .then((data) => setTickets(data))
      .catch((err) => setError(err.message));
  }, []);

  async function downloadAllAsZip() {
    if (!tickets || tickets.length === 0) return;
    setZipping(true);
    setZipError(null);

    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      await Promise.all(
        tickets.map(async (t) => {
          const res = await fetch(t.pngUrl);
          if (!res.ok) throw new Error(`Échec du téléchargement de ${t.numero}`);
          const blob = await res.blob();
          zip.file(`ticket-${t.numero}.png`, blob);
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes-tickets.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setZipError(
        "Impossible de créer le ZIP automatiquement. Téléchargez vos tickets un par un ci-dessous."
      );
      console.error("ZIP error:", err);
    } finally {
      setZipping(false);
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!tickets) {
    return <p className="text-slate-600 animate-pulse text-center py-12">Chargement de vos tickets...</p>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-3">⏳</p>
        <p className="text-slate-600">
          Vos tickets sont encore en cours de génération ou introuvables. Réessayez dans
          quelques instants, ou faites une réclamation si le problème persiste.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-slate-700 font-semibold">
          {tickets.length} ticket{tickets.length > 1 ? "s" : ""} disponible{tickets.length > 1 ? "s" : ""}
        </p>
        {tickets.length > 1 && (
          <button
            type="button"
            onClick={downloadAllAsZip}
            disabled={zipping}
            className="rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white font-bold px-6 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {zipping ? "Préparation du ZIP..." : "📦 Tout télécharger (ZIP)"}
          </button>
        )}
      </div>

      {zipError && <p className="text-amber-600 text-sm">{zipError}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div
            key={t.numero}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 bg-white"
          >
            <img
              src={t.pngUrl}
              alt={`Ticket ${t.numero}`}
              className="w-20 h-20 object-contain rounded-lg bg-slate-50 border border-slate-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 truncate">{t.ticketTypeNom}</p>
              <p className="text-sm text-slate-500 truncate">
                {t.numero} · {t.displayName}
              </p>
            </div>
            <a
              href={t.pngUrl}
              download={`ticket-${t.numero}.png`}
              className="shrink-0 rounded-lg bg-primary-600 text-white text-sm font-semibold px-4 py-2 hover:bg-primary-700 transition-colors"
            >
              Télécharger
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
