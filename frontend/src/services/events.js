import { mockEvents } from "../assets/mockEvents";

export async function fetchEvents() {
  // Simule une requête API
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockEvents), 500);
  });
}
