import axios from "axios";

const API = axios.create({
  baseURL: "/api", // Use Vite proxy to backend
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
  console.log("res.data.events:", res.data.events);
  console.log("res.data.total:", res.data.total);
  console.log("Type of res.data:", typeof res.data);
  console.log("Keys in res.data:", Object.keys(res.data || {}));
  return {
    items: res.data.events, // backend renvoie { events, total, totalPages }
    total: res.data.total,
  };
}
