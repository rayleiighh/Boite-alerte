const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");

const mock = () => {
  const now = Date.now();
  return [
    { id:"1", type:"mail",    title:"Nouvelle lettre reçue", description:"Courrier standard déposé dans la boîte aux lettres", time:new Date(now-5*60*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), isNew:true },
    { id:"2", type:"package", title:"Colis détecté",         description:"Colis de taille moyenne en attente de récupération", time:"12h15", isNew:true },
    { id:"3", type:"mail",    title:"Courrier collecté",     description:"Le courrier a été récupéré avec succès",            time:"Hier 16h45", isNew:false },
    { id:"4", type:"alert",   title:"Boîte aux lettres pleine", description:"Veuillez vider la boîte aux lettres",           time:"Hier 14h20", isNew:false },
  ];
};

export async function getNotifications() {
  try {
    const r = await fetch(`${API_BASE}/api/notifications`);
    if (!r.ok) throw new Error("bad");
    return await r.json();
  } catch {
    return mock();
  }
}

export async function markAllRead() {
  try { return (await fetch(`${API_BASE}/api/notifications/mark-all-read`, {method:"POST"})).ok; }
  catch { return true; }
}

export async function markOneRead(id) {
  try { return (await fetch(`${API_BASE}/api/notifications/${id}/read`, {method:"POST"})).ok; }
  catch { return true; }
}

export async function deleteOne(id) {
  try { return (await fetch(`${API_BASE}/api/notifications/${id}`, {method:"DELETE"})).ok; }
  catch { return true; }
}

export function subscribeRealtime({ onOpen, onClose, onError, onMessage }) {
  let ws, closed = false;

  try {
    const wsUrl = (API_BASE.startsWith("https") ? "wss://" : "ws://") + API_BASE.replace(/^https?:\/\//,"") + "/ws";
    ws = new WebSocket(wsUrl);
    ws.addEventListener("open",  () => !closed && onOpen?.());
    ws.addEventListener("close", () => !closed && onClose?.());
    ws.addEventListener("error", () => !closed && onError?.());
    ws.addEventListener("message", ev => {
      try { onMessage?.(JSON.parse(ev.data)); } catch {}
    });
  } catch {}

  const sim = setInterval(() => {
    // simulation: de temps en temps, une notif "mail"
    if (Math.random() < 0.25) {
      const id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
      onMessage?.({ id, type:"mail", title:"Courrier (simulation)", description:"Détection de poids", time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), isNew:true });
    }
  }, 10_000);

  return {
    status() {
      if (!ws) return "closed";
      return ws.readyState === 1 ? "open" : ws.readyState === 0 ? "connecting" : "closed";
    },
    unsubscribe() {
      closed = true;
      try { ws && ws.close(); } catch {}
      clearInterval(sim);
    },
  };
}
