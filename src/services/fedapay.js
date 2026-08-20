import { fetchAPI } from "./api.js";

export const initVotePayment = async (candidateId, votes) => {
  const res = await fetchAPI("/payments/init", {
    method: "POST",
    body: JSON.stringify({ candidateId, votes }),
  });
  return res.payment_url;
};
