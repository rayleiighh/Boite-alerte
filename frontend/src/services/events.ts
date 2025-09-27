import { mockEvents, EventItem } from "../assets/mockEvents";

export async function fetchEvents(): Promise<EventItem[]> {
  // Simule une requête API
  return new Promise(resolve => {
    setTimeout(() => resolve(mockEvents), 500);
  });
}
