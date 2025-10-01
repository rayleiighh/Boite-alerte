/***************************************************************************
 *  Boite-alerte - Backend
 *  ENTRYPOINT : src/routes/server.js (oui, dans routes)
 ***************************************************************************/

import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// --- Données en mémoire pour démo (remplacer plus tard par DB) ---
let notifications = [
  { id: "1", type: "mail",    title: "Nouvelle lettre reçue", description: "Courrier standard déposé dans la boîte aux lettres", time: "14h32", isNew: true },
  { id: "2", type: "package", title: "Colis détecté",         description: "Colis de taille moyenne en attente de récupération", time: "12h15", isNew: true },
  { id: "3", type: "mail",    title: "Courrier collecté",     description: "Le courrier a été récupéré avec succès",            time: "Hier 16h45", isNew: false },
  { id: "4", type: "alert",   title: "Boîte aux lettres pleine", description: "Veuillez vider la boîte aux lettres",           time: "Hier 14h20", isNew: false }
];

// --- Routes REST ---
app.get("/api/notifications", (req, res) => res.json(notifications));

app.post("/api/notifications/mark-all-read", (req, res) => {
  notifications = notifications.map(n => ({ ...n, isNew: false }));
  res.sendStatus(204);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  notifications = notifications.map(n => (n.id === id ? { ...n, isNew: false } : n));
  res.sendStatus(204);
});

app.delete("/api/notifications/:id", (req, res) => {
  const { id } = req.params;
  notifications = notifications.filter(n => n.id !== id);
  res.sendStatus(204);
});

// --- Démarrage HTTP ---
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// --- WebSocket `/ws` ---
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  // message de bienvenue
  const now = new Date();
  const welcome = {
    id: String(now.getTime()),
    type: "mail",
    title: "Bienvenue",
    description: "Connexion WebSocket OK",
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isNew: true
  };
  try { ws.send(JSON.stringify(welcome)); } catch {}
});

// demo: broadcast toutes 30s
setInterval(() => {
  const now = new Date();
  const msg = {
    id: String(now.getTime()),
    type: "mail",
    title: "Courrier (WS)",
    description: "Évènement démonstration",
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isNew: true
  };
  wss.clients.forEach((client) => {
    try { client.send(JSON.stringify(msg)); } catch {}
  });
}, 30000);
