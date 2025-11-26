import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY,
  },
});

// Récupérer le dernier événement
export async function fetchLatestEvent() {
  const res = await API.get("/events/latest");
  return res.data;
}

/**
 * Récupère le statut du Heartbeat (connexion ESP32) pour un device spécifique.
 * @param {string} deviceID - L'identifiant de l'appareil (ex: 'esp32-mailbox-001').
 */
export async function fetchHeartbeatStatus(deviceID) {
  // Appel à GET /api/heartbeat/latest?deviceID=...
  const res = await API.get("/heartbeat/latest", {
    params: {
      deviceID: deviceID,
    },
  });
  return res.data;
}

/**
 * Récupère les données agrégées pour les graphiques (weeklyData, monthlyData).
 * Appel à GET /api/events/summary
 */
export async function fetchEventSummary() {
  const res = await API.get("/events/summary");
  // Le backend renvoie déjà un objet JSON complet (weeklyData, monthlyData, totals)
  return res.data; 
}

// Récupérer les événements avec pagination & filtres
export async function fetchEvents(filters = {}) {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 5,
  };
  if (filters.type && filters.type !== "all") params.type = filters.type;
  if (filters.dateStart) params.startDate = filters.dateStart;
  if (filters.dateEnd) params.endDate = filters.dateEnd;
  if (filters.search && filters.search.trim() !== "")
    params.search = filters.search.trim();

  const res = await API.get("/events", { params });
  return {
    items: res.data.events,
    total: res.data.total,
    totalPages: res.data.totalPages,
  };
}

// Supprimer un événement
export async function deleteEvent(id) {
  const res = await API.delete(`/events/${id}`);
  return res.data;
}
