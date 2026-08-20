import { useEffect, useState } from "react";
import { SuccessView, CancelledView, ErrorView } from "./PaymentViews";
import TicketClaimForm from "./TicketClaimForm";

export default function TicketPaymentStatus() {
  const [view, setView] = useState("loading");
  const [transactionId, setTransactionId] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const close = params.get("close");
    const id = params.get("id");

    if (status === "approved" && id) setTransactionId(id);

    if (close === "true") setView("cancelled");
    else if (status === "approved") setView("success");
    else setView("error");
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
      <div className="w-full max-w-md flex flex-col items-center animate-fade-up mt-16 sm:mt-24">
        {view === "success" && (
          <SuccessView
            transactionId={transactionId}
            onRetry={retry}
            title="Votre ticket est en cours d'envoi !"
            message="🎫 Votre paiement a été validé. Le ticket (PNG avec QR code) vous sera envoyé par email dans quelques instants."
            primaryHref="/tickets"
            primaryLabel="🎫 Acheter un autre ticket"
            redirectSeconds={0}
          >
            <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-200 text-left animate-fade-up" style={{ animationDelay: "0.45s" }}>
              <p className="text-sm text-slate-700">
                📧 Vérifiez votre boîte de réception <strong>et vos spams/courriers indésirables</strong> — l'email
                peut prendre quelques minutes à arriver.
              </p>
              <p className="text-sm text-slate-700 mt-2">
                Si vous n'avez toujours rien reçu après <strong>10 minutes</strong>, cliquez ci-dessous pour nous le
                signaler.
              </p>
              <button
                type="button"
                onClick={() => setShowClaimForm(true)}
                className="mt-4 w-full rounded-lg border-2 border-primary-600 text-primary-700 font-semibold py-2.5 hover:bg-primary-100 transition-colors"
              >
                Je n'ai pas reçu mon ticket
              </button>
            </div>
          </SuccessView>
        )}
        {view === "cancelled" && (
          <CancelledView
            onRetry={retry}
            title="Achat annulé"
            message="L'achat de ticket a été annulé. Aucun montant n'a été débité."
            primaryHref="/tickets"
            primaryLabel="Reprendre l'achat"
          />
        )}
        {view === "error" && (
          <ErrorView
            onRetry={retry}
            title="Erreur lors du traitement"
            message="Une erreur s'est produite lors du traitement de votre paiement de ticket. Veuillez réessayer."
          />
        )}
      </div>
      <div className="h-24 sm:h-32"></div>

      {showClaimForm && (
        <TicketClaimForm transactionId={transactionId} onClose={() => setShowClaimForm(false)} />
      )}
    </div>
  );
}
