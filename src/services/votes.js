import { fetchAPI } from "./api.js";

/* Candidates */
export const getCandidates = () => fetchAPI("/candidates");

export const getCandidateBySlug = (slug) =>
  fetchAPI(`/candidates/${slug}`);

export const getVotes = (id) =>
  fetchAPI(`/candidates/${id}/votes`);

/* Paiement */
export const initPayment = (candidateId, votes) =>
  fetchAPI("/payments/init", {
    method: "POST",
    body: JSON.stringify({
      candidateId,
      votes,
    }),
  });
