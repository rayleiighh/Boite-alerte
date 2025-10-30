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
  };
}

// Supprimer un événement
export async function deleteEvent(id) {
  const res = await API.delete(`/events/${id}`);
  return res.data;
}
