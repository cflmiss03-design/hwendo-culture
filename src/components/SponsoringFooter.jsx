const WHATSAPP_LINK = "https://wa.me/2290160744415";

export default function SponsoringBar() {
  return (
    <section className="relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-800" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Texte */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
              🤝
            </div>

            <div>
              <span className="inline-block mb-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                Partenariat & Sponsoring
              </span>

              <h3 className="text-white font-bold text-base md:text-lg">
                Festival Hwendo-Culture
              </h3>

              <p className="text-white/90 text-sm md:text-base">
                Associez votre marque à la valorisation du patrimoine béninois et
                soutenez la <strong>Nuit de l'Élégance Africaine</strong>, le{" "}
                <strong>Concours Miss Endo-Culture</strong> et le <strong>Match de Gala</strong>.
              </p>
            </div>
          </div>

          {/* Bouton */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3 font-semibold text-primary-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="text-xl">💬</span>

            <span>Contactez-nous</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}