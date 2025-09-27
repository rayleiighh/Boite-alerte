export type EventType = "courrier" | "ouverture" | "colis";

export interface EventItem {
  type: EventType;
  timestamp: string;
  deviceID: string;
}

export const mockEvents: EventItem[] = [
  { type: "courrier",  timestamp: "2025-09-27T10:15:00Z", deviceID: "ESP32-01" },
  { type: "ouverture", timestamp: "2025-09-26T18:42:00Z", deviceID: "ESP32-01" },
  { type: "colis",     timestamp: "2025-09-25T14:05:00Z", deviceID: "ESP32-01" },
];
