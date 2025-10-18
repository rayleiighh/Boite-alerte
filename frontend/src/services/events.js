import axios from "axios";

const API = axios.create({
  baseURL: "/api", // Use Vite proxy to backend
});

// Récupérer le dernier événement pour le dashboard
export async function fetchLatestEvent() {
  try {
    const res = await API.get("/events/latest");
    return res.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du dernier événement:",
      error,
    );
    throw error;
  }
}

// Récupérer les events avec pagination & filtres
export async function fetchEvents(filters = {}) {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 5,
  };

  if (filters.type && filters.type !== "all") {
    params.type = filters.type;
  }
  if (filters.dateStart) {
    params.startDate = filters.dateStart;
  }
  if (filters.dateEnd) {
    params.endDate = filters.dateEnd;
  }
    // 🔍 Ajout du paramètre search
  if (filters.search && filters.search.trim() !== "") {
    params.search = filters.search.trim();
  }

  const res = await API.get("/events", { params });
  console.log("API response:", res.data);
  console.log("res.data.events:", res.data.events);
  console.log("res.data.total:", res.data.total);
  console.log("Type of res.data:", typeof res.data);
  console.log("Keys in res.data:", Object.keys(res.data || {}));
  return {
    items: res.data.events, // backend renvoie { events, total, totalPages }
    total: res.data.total,
  };
}

// Supprimer un événement par ID
export async function deleteEvent(id) {
  try {
    const res = await API.delete(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    throw error;
  }
}