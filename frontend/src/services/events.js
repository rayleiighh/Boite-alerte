import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // backend local
});

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

  const res = await API.get("/events", { params });
  console.log("API response:", res.data);
  return {
    items: res.data.events,  // backend renvoie { events, total, totalPages }
    total: res.data.total,
  };
}
