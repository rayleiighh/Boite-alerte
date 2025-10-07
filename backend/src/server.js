/***************************************************************************
 *  Boite-alerte - Backend
 *  ENTRYPOINT : src/routes/server.js
 ***************************************************************************/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Connexion DB ---
connectDB();

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// --- Routes principales ---
app.get("/", (req, res) => {
  res.send("🚀 Backend Boite'Alerte fonctionne !");
});

app.use("/api/events", eventRoutes);

// --- Notifications (données temporaires) ---
let notifications = [
  { id: "1", type: "mail", title: "Nouvelle lettre reçue", description: "Courrier standard déposé dans la boîte aux lettres", time: "14h32", isNew: true },
  { id: "2", type: "package", title: "Colis détecté", description: "Colis de taille moyenne en attente de récupération", time: "12h15", isNew: true },
];

// --- Routes notifications ---
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

// --- Lancement HTTP ---
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

// --- WebSocket ---
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
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

// Broadcast de démo toutes les 30s
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
