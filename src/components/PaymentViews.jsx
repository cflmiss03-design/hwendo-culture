import { useEffect } from "react";
import SuccessConfetti from "./SuccessConfetti";

const EVENT_TITLE = "Festival Hwendo-Culture 2026";
const HOME_URL = "/";

// Premium card component
const Card = ({ variant, children }) => {
  const styles = {
    success: "relative bg-gradient-to-br from-primary-50 via-white to-primary-50 border border-primary-200 shadow-premium",
    cancelled: "relative bg-gradient-to-br from-danger-50 via-white to-danger-50 border border-danger-200 shadow-soft",
    error: "relative bg-gradient-to-br from-warning-50 via-white to-warning-50 border border-warning-200 shadow-soft",
  };

  return (
    <div
      className={`
        w-full min-h-[60vh] rounded-2xl p-6 sm:p-8 text-center flex flex-col justify-center items-center
        transform transition-all duration-500 animate-fade-up
        ${styles[variant]}
      `}
    >
      {children}
    </div>
  );
};

/* ================= SUCCESS ================= */
export function SuccessView({
  transactionId,
  onRetry,
  title = "Merci pour votre vote !",
  message = "💙 Votre vote a bien été enregistré. Chaque vote rapproche votre candidate de la victoire.",
  primaryHref = "/#candidates",
  primaryLabel = "🗳️ Voter encore",
  secondaryHref = "/",
  secondaryLabel = "Retour à l'accueil",
  redirectSeconds = 15,
  children,
}) {
  useEffect(() => {
    if (!redirectSeconds) return; // 0/false => pas de redirection automatique
    const timer = setTimeout(() => {
      window.location.href = HOME_URL;
    }, redirectSeconds * 1000);
    return () => clearTimeout(timer);
  }, [redirectSeconds]);

  return (
    <Card variant="success">
      <SuccessConfetti />

      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100">
          <span className="text-3xl">✓</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4 animate-fade-up" style={{animationDelay: "0.1s"}}>
          {title}
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed mb-6 animate-fade-up" style={{animationDelay: "0.2s"}}>
          {message}
        </p>

        {transactionId && (
          <div className="mb-8 p-4 rounded-lg bg-slate-50 border border-slate-200 animate-fade-up" style={{animationDelay: "0.3s"}}>
            <p className="text-xs uppercase font-bold text-slate-500 mb-2">Référence de transaction</p>
            <p className="text-sm break-all font-mono font-semibold text-slate-900">{transactionId}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 animate-fade-up" style={{animationDelay: "0.4s"}}>
          <a
            href={primaryHref}
            className="inline-block py-3 px-6 rounded-lg bg-gradient-primary text-white text-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {primaryLabel}
          </a>

          <a
            href={secondaryHref}
            className="inline-block py-3 px-6 rounded-lg border-2 border-primary-600 text-primary-600 font-bold hover:bg-primary-50 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {secondaryLabel}
          </a>
        </div>

        {children}

        {redirectSeconds > 0 && (
          <p className="mt-6 text-sm text-slate-500 animate-fade-up" style={{animationDelay: "0.5s"}}>
            Redirection automatique dans {redirectSeconds} secondes…
          </p>
        )}
      </div>
    </Card>
  );
}

/* ================= CANCELLED ================= */
export function CancelledView({
  onRetry,
  title = "Paiement annulé",
  message = (
    <>Le paiement a été <strong>annulé</strong>. Aucun montant n'a été débité. Vous pouvez reprendre votre vote.</>
  ),
  primaryHref = "/#candidates",
  primaryLabel = "Reprendre le vote",
  secondaryHref = "/",
  secondaryLabel = "Retour à l'accueil",
}) {
  return (
    <Card variant="cancelled">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-100">
          <span className="text-3xl">✕</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 animate-fade-up">
          {title}
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed mb-8 animate-fade-up" style={{animationDelay: "0.1s"}}>
          {message}
        </p>

        <div className="flex flex-col gap-3 animate-fade-up" style={{animationDelay: "0.2s"}}>
          <a
            href={primaryHref}
            className="inline-block py-3 px-6 rounded-lg bg-gradient-primary text-white text-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            {primaryLabel}
          </a>

          <a
            href={secondaryHref}
            className="inline-block py-3 px-6 rounded-lg border-2 border-slate-300 text-slate-900 font-bold hover:bg-slate-100 transition-all duration-200"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </Card>
  );
}

/* ================= ERROR ================= */
export function ErrorView({
  onRetry,
  title = "Erreur lors du traitement",
  message = "Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer.",
}) {
  return (
    <Card variant="error">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning-100">
          <span className="text-3xl">⚠</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 animate-fade-up">
          {title}
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed mb-8 animate-fade-up" style={{animationDelay: "0.1s"}}>
          {message}
        </p>

        <div className="flex flex-col gap-3 animate-fade-up" style={{animationDelay: "0.2s"}}>
          <button
            onClick={onRetry}
            className="inline-block py-3 px-6 rounded-lg bg-gradient-primary text-white text-lg font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            Réessayer
          </button>

          <a
            href="/"
            className="inline-block py-3 px-6 rounded-lg border-2 border-slate-300 text-slate-900 font-bold hover:bg-slate-100 transition-all duration-200"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </Card>
  );
}
