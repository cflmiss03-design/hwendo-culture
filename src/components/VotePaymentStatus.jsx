import { useEffect, useRef, useState } from "react";
import { SuccessView, CancelledView, ErrorView, PendingView } from "./PaymentViews";
import { fetchAPI } from "../services/api.js";

// CHANGED: polling SebPay (voir memory/sebpay_integration.md) — filet de
// sécurité en complément du webhook (mécanisme principal, voir doc SebPay).
// Espacement modeste et arrêt après un délai raisonnable : le webhook arrive
// en général bien avant, ce polling ne sert qu'à rafraîchir l'écran sans
// action du votant.
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

// Statuts Transaction (voir models/Transaction.js) qui comptent comme un
// paiement confirmé du point de vue du votant — "awaiting_review" inclus :
// l'argent est encaissé, seule la validation manuelle admin reste en
// attente, ce qui n'est jamais montré différemment côté public (même
// comportement que le flux FedaPay existant, qui ne distingue pas ce cas).
const SUCCESS_STATUSES = ["success", "completed", "awaiting_review"];
const FAILURE_STATUSES = ["failed", "rejected"];

export default function VotePaymentStatus() {
  const [view, setView] = useState("loading");
  const [transactionId, setTransactionId] = useState(null);
  const pollTimer = useRef(null);
  const pollDeadline = useRef(null);

  function stopPolling() {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = null;
  }

  function pollSebpayStatus(id) {
    setTransactionId(id);
    setView("pending");
    pollDeadline.current = Date.now() + POLL_TIMEOUT_MS;

    const check = async () => {
      try {
        const data = await fetchAPI(`/payments/status/${encodeURIComponent(id)}`);
        if (SUCCESS_STATUSES.includes(data.status)) {
          setView("success");
          return;
        }
        if (FAILURE_STATUSES.includes(data.status)) {
          setView("error");
          return;
        }
        // "pending" : toujours en attente de confirmation côté téléphone.
      } catch (err) {
        // Une erreur réseau ponctuelle ne doit pas faire échouer tout le
        // suivi — on continue de réessayer jusqu'au timeout.
        console.error("Erreur de suivi du paiement SebPay:", err);
      }

      if (Date.now() >= pollDeadline.current) {
        setView("timeout");
        return;
      }
      pollTimer.current = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const close = params.get("close");
    const id = params.get("id");
    const provider = params.get("provider");

    // CHANGED: retour du flux SebPay direct — pas de redirection depuis une
    // page hébergée (contrairement à FedaPay), donc pas de `status` dans
    // l'URL : on bascule sur le polling de GET /payments/status/:id.
    if (provider === "sebpay" && id) {
      pollSebpayStatus(id);
      return () => stopPolling();
    }

    if (status === "approved" && id) setTransactionId(id);

    if (close === "true") setView("cancelled");
    else if (status === "approved") setView("success");
    else setView("error");

    return undefined;
  }, []);

  const retry = () => window.location.reload();

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 animate-pulse text-base sm:text-lg">
          Traitement du paiement...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 sm:px-6 md:px-12 py-16 flex flex-col items-center">
      {/* CONTENU PRINCIPAL */}
      <div className="w-full max-w-md flex flex-col items-center animate-fade-up mt-16 sm:mt-24">
        {view === "success" && (
          <SuccessView transactionId={transactionId} onRetry={retry} />
        )}
        {view === "cancelled" && <CancelledView onRetry={retry} />}
        {view === "pending" && <PendingView />}
        {view === "timeout" && (
          <ErrorView
            onRetry={retry}
            title="Confirmation plus longue que prévue"
            message="Nous n'avons pas encore reçu la confirmation de votre paiement. Si vous avez validé la demande sur votre téléphone, votre vote sera compté sous peu — sinon, réessayez."
          />
        )}
        {view === "error" && <ErrorView onRetry={retry} />}
      </div>

      {/* Espace bas pour que la page ne touche pas le footer */}
      <div className="h-24 sm:h-32"></div>
    </div>
  );
}
