const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://localhost:5001").replace(/\/$/, "");

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
    const data = await r.json();
    console.log("✅ Notifications reçues:", data);
    return data;
  } catch (err) {
    console.error("❌ Erreur fetch notifications:", err);
    console.log("⚠️ Utilisation des données mockées");
    return mock();
  }
}

export async function markAllRead() {
  try { 
    const r = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {method:"POST"});
    return r.ok; 
  } catch (err) {
    console.error("❌ Erreur markAllRead:", err);
    return true; 
  }
}

export async function markOneRead(id) {
  try { 
    const r = await fetch(`${API_BASE}/api/notifications/${id}/read`, {method:"POST"});
    return r.ok; 
  } catch (err) {
    console.error("❌ Erreur markOneRead:", err);
    return true; 
  }
}

export async function deleteOne(id) {
  try { 
    const r = await fetch(`${API_BASE}/api/notifications/${id}`, {method:"DELETE"});
    return r.ok; 
  } catch (err) {
    console.error("❌ Erreur deleteOne:", err);
    return true; 
  }
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
  } catch (err) {
    console.log("⚠️ WebSocket non disponible, notifications temps réel désactivées");
  }

  return {
    status() {
      if (!ws) return "closed";
      return ws.readyState === 1 ? "open" : ws.readyState === 0 ? "connecting" : "closed";
    },
    unsubscribe() {
      closed = true;
      try { ws && ws.close(); } catch {}
    },
  };
}