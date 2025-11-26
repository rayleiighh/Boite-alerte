// src/services/notifications.api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-local-key";

const headers = { "X-API-Key": API_KEY };

const mock = () => {
  const now = Date.now();
  return [
    {
      id: "1",
      type: "mail",
      title: "Nouvelle lettre reçue",
      description: "Courrier standard déposé dans la boîte aux lettres",
      time: new Date(now - 5 * 60 * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNew: true,
    },
    {
      id: "2",
      type: "package",
      title: "Colis détecté",
      description: "Colis de taille moyenne en attente de récupération",
      time: "12h15",
      isNew: true,
    },
    {
      id: "3",
      type: "mail",
      title: "Courrier collecté",
      description: "Le courrier a été récupéré avec succès",
      time: "Hier 16h45",
      isNew: false,
    },
    {
      id: "4",
      type: "alert",
      title: "Boîte aux lettres pleine",
      description: "Veuillez vider la boîte aux lettres",
      time: "Hier 14h20",
      isNew: false,
    },
  ];
};

// --- API principale ---
export async function getNotifications() {
  try {
    const r = await fetch(`${API_BASE}/api/notifications`, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (err) {
    return mock();
  }
}

export async function markAllRead() {
  try {
    const r = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
      method: "POST",
      headers,
    });
    return r.ok;
  } catch (err) {
    return false;
  }
}

export async function markOneRead(id) {
  try {
    const r = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "POST",
      headers,
    });
    return r.ok;
  } catch (err) {
    return false;
  }
}

export async function deleteOne(id) {
  try {
    const r = await fetch(`${API_BASE}/api/notifications/${id}`, {
      method: "DELETE",
      headers,
    });
    return r.ok;
  } catch (err) {
    return false;
  }
}

// --- WebSocket temps réel (facultatif) ---
export function subscribeRealtime({ onOpen, onClose, onError, onMessage }) {
  let ws,
    closed = false;

  try {
    const wsUrl =
      (API_BASE.startsWith("https") ? "wss://" : "ws://") +
      API_BASE.replace(/^https?:\/\//, "").replace(/\/$/, "") +
      "/ws";

    ws = new WebSocket(wsUrl);
    ws.addEventListener("open", () => !closed && onOpen?.());
    ws.addEventListener("close", () => !closed && onClose?.());
    ws.addEventListener("error", () => !closed && onError?.());
    ws.addEventListener("message", (ev) => {
      try {
        onMessage?.(JSON.parse(ev.data));
      } catch {}
    });
  } catch (err) {
    // Silencieux
  }

  return {
    status() {
      if (!ws) return "closed";
      return ws.readyState === 1
        ? "open"
        : ws.readyState === 0
        ? "connecting"
        : "closed";
    },
    unsubscribe() {
      closed = true;
      try {
        ws && ws.close();
      } catch {}
    },
  };
}