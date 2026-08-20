/**
 * Connexion WebSocket unique, partagée par tous les VoteCounter d'une même page
 * (au lieu d'une connexion par candidate — jusqu'à 16 sockets simultanés sur
 * l'accueil, inutilement lourd pour le serveur).
 */
import config from "../config";

const listeners = new Map(); // candidateId -> Set<callback>
let socket = null;
let reconnectTimeout = null;

function notify(candidateId, totalVotes) {
  const callbacks = listeners.get(candidateId);
  if (!callbacks) return;
  callbacks.forEach((cb) => cb(totalVotes));
}

function connect() {
  if (socket) return;

  socket = new WebSocket(config.wsBaseUrl);

  socket.onopen = () => console.log("🟢 WebSocket connecté (votes)");

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "VOTES_UPDATED") {
        notify(message.candidateId, message.totalVotes);
      }
    } catch (err) {
      console.error("Message WebSocket invalide :", err);
    }
  };

  socket.onclose = () => {
    socket = null;
    if (listeners.size > 0) {
      reconnectTimeout = setTimeout(connect, 3000);
    }
  };

  socket.onerror = (err) => {
    console.error("Erreur WebSocket (votes) :", err);
    socket?.close();
  };
}

/**
 * S'abonne aux mises à jour de votes d'une candidate. Ouvre la connexion
 * partagée si elle n'existe pas encore. Retourne une fonction de désabonnement.
 */
export function subscribeToVotes(candidateId, callback) {
  if (!listeners.has(candidateId)) listeners.set(candidateId, new Set());
  listeners.get(candidateId).add(callback);
  connect();

  return () => {
    const callbacks = listeners.get(candidateId);
    if (!callbacks) return;
    callbacks.delete(callback);
    if (callbacks.size === 0) listeners.delete(candidateId);
    if (listeners.size === 0 && socket) {
      clearTimeout(reconnectTimeout);
      socket.close();
      socket = null;
    }
  };
}
