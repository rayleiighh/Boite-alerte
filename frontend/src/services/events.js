import { mockEvents } from "../assets/mockEvents";

export async function fetchEvents(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...mockEvents];

      // Filtre type
      if (filters.type && filters.type !== "all") {
        data = data.filter((e) => e.type === filters.type);
      }

      // Filtre date début
      if (filters.dateStart) {
        const start = new Date(filters.dateStart + "T00:00:00");
        data = data.filter((e) => new Date(e.timestamp) >= start);
      }

      // Filtre date fin
      if (filters.dateEnd) {
        const end = new Date(filters.dateEnd + "T23:59:59");
        data = data.filter((e) => new Date(e.timestamp) <= end);
      }

      // Tri décroissant
      data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 5;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const items = data.slice(startIndex, endIndex);

      resolve({ items, total: data.length });
    }, 500);
  });
}
