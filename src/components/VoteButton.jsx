"use client"; // <- Important pour les composants React côté client dans Astro

import React from "react";

export default function VoteButton({ onClick, label = "Voter" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        bg-pink-600
        hover:bg-pink-700
        text-white
        font-semibold
        py-2
        px-4
        rounded-lg
        transition
        duration-200
      "
    >
      {label}
    </button>
  );
}
