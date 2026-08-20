import { useEffect, useState } from "react";
import { SuccessView, CancelledView, ErrorView } from "./PaymentViews";

export default function VotePaymentStatus() {
  const [view, setView] = useState("loading");
  const [transactionId, setTransactionId] = useState(null);

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
      {/* CONTENU PRINCIPAL */}
      <div className="w-full max-w-md flex flex-col items-center animate-fade-up mt-16 sm:mt-24">
        {view === "success" && (
          <SuccessView transactionId={transactionId} onRetry={retry} />
        )}
        {view === "cancelled" && <CancelledView onRetry={retry} />}
        {view === "error" && <ErrorView onRetry={retry} />}
      </div>

      {/* Espace bas pour que la page ne touche pas le footer */}
      <div className="h-24 sm:h-32"></div>
    </div>
  );
}
