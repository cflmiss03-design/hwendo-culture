"use client";

import { useEffect, useState } from "react";

export default function GlobalLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

return (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-black">

    {/* Background Effects */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-500/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
    </div>

    {/* Main Card */}
    <div className="relative flex flex-col items-center text-center">

      <div className="relative">

        {/* Glow Ring */}
        <div className="absolute inset-0 scale-125 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-40 blur-2xl animate-pulse" />

        {/* Logo officiel du festival */}
        <div className="relative flex items-center justify-center w-40 h-40 rounded-[32px] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden">
          <img
            src="https://res.cloudinary.com/di21pnpda/image/upload/w_320,h_320,c_fill,g_auto,f_auto,q_auto/v1787160931/1784301411203.jpg_wivjld.jpg"
            alt="Festival Hwendo-Culture"
            className="h-full w-full object-cover animate-float"
          />
        </div>

      </div>

      {/* Title */}
      <div className="mt-10 space-y-3">

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
          Hwendo
          <span className="block bg-gradient-to-r from-secondary-400 via-secondary-300 to-secondary-400 bg-clip-text text-transparent">
            Culture
          </span>
        </h1>

        <p className="text-white/70 text-lg font-medium">
          « Nos racines sont notre avenir. »
        </p>

      </div>

      {/* Modern Loader */}
      <div className="mt-10 relative w-16 h-16">

        <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>

        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary-400 border-r-primary-500 animate-spin"></div>

      </div>

      {/* Loading Text */}
      <p className="mt-6 text-white/80 font-medium tracking-wide">
        Chargement de la plateforme...
      </p>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">
          Groupe CFL World
        </p>
      </div>

    </div>

    <style jsx>{`
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }

        50% {
          transform: translateY(-12px);
        }
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>

  </div>
);
}
