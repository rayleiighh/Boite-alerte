/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, ..., ..., ..., ...
 *  Description   : Access point of the backend application
 *  Date          : 27/09/2025
 *  Version       : [1.1.0] - Phase 1: Stats enrichies + Heartbeat
 *
 ***************************************************************************/

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const displayRoutes = require("./routes/displayRoutes");
const heartbeatRoutes = require("./routes/heartbeatRoutes"); // ✅ NOUVEAU
const { WebSocketServer } = require("ws");

dotenv.config();

const app = express();

// ========== MIDDLEWARES (AVANT tout le reste) ==========

// 1. JSON parser
app.use(express.json());

// 2. CORS - ✅ Ajout des headers pour ESP32
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "X-API-Key", // ✅ pour ESP32
      "Idempotency-Key",
      "Authorization",
    ],
    credentials: true,
  })
);

// 3. Middleware d'authentification global
const authMiddleware = (req, res, next) => {
  if (req.path === "/" || req.path === "/health") return next();

  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY || "dev-local-key";

  if (!apiKey) {
    return res
      .status(401)
      .json({ error: "❌ Authentification requise : header X-API-Key manquant" });
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({ error: "❌ Clé API invalide" });
  }

  next();
};

// Appliquer auth sur /api (mais pas sur / et /health)
app.use("/api", authMiddleware);

// ========== CONNEXION DB ==========
connectDB();

// ========== ROUTES ==========

// Route test (publique)
app.get("/", (req, res) => {
  res.send("🚀 Backend Boite'Alerte fonctionne !");
});

// Health check (publique)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes API (protégées par authMiddleware)
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/display", displayRoutes);
app.use("/api/heartbeat", heartbeatRoutes); // ✅ NOUVEAU - Route heartbeat

// Compatibilité ESP32 (anciennes URLs)
app.use("/events", eventRoutes);

// ========== GESTION ERREURS 404 ==========
app.use((req, res) => {
  res.status(404).json({
    error: "❌ Route non trouvée",
    path: req.path,
    method: req.method,
  });
});

// ========== LANCEMENT SERVEUR + WEBSOCKET ==========
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log(`🚀 Backend Boite'Alerte v1.1.0 - Phase 1 Stats enrichies`);
  console.log("=".repeat(60));
  console.log(`📍 Serveur    : http://localhost:${PORT}`);
  console.log(`🔑 Auth       : X-API-Key = ${process.env.API_KEY || "dev-local-key"}`);
  console.log(`✅ Endpoints  :`);
  console.log(`   POST   /api/events      - Recevoir événements (enrichis)`);
  console.log(`   POST   /api/heartbeat   - Recevoir heartbeat ESP32 (nouveau)`);
  console.log(`   GET    /api/heartbeat/latest?deviceID=xxx`);
  console.log(`   GET    /api/heartbeat/history?deviceID=xxx&limit=20`);
  console.log("=".repeat(60));
});

// ========== SERVEUR WEBSOCKET ==========
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("🔌 Client WebSocket connecté");
  ws.send(
    JSON.stringify({
      id: Date.now(),
      type: "mail",
      title: "Bienvenue 👋",
      description: "Connexion WebSocket établie avec succès",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isNew: true,
    })
  );
});