/***************************************************************************
 *
 * Project Title : Boite-alerte
 * Authors       : Nicolas H, Rayane B, Saad Z, Khasan A, Mohamed M
 * Description   : Access point of the backend application
 * Date          : 01/11/2025
 * Version       : [1.1.0] - Stats enrichies + Heartbeat + Inscription email + WebSocket
 *
 ***************************************************************************/

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const displayRoutes = require("./routes/displayRoutes");
const heartbeatRoutes = require("./routes/heartbeatRoutes"); // ✅ NOUVEAU (Branche developp)
const userRoutes = require("./routes/userRoutes"); // ✅ AJOUT (Branche feature)
const authRoutes = require("./routes/authRoutes");
const { WebSocketServer } = require("ws");
const systemRoutes = require("./routes/systemRoutes");


const app = express();

// ========== MIDDLEWARES (AVANT tout le reste) ==========

// 1. JSON parser
app.use(express.json());

// 2. CORS - ✅ Headers pour ESP32 et frontend
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
  // Routes publiques (pas d'auth requise)
  const publicPaths = ["/", "/health"];
  if (publicPaths.includes(req.path)) return next();

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
// AUTH PUBLIQUE (LOGIN)
app.use("/auth", authRoutes);

app.use("/system", systemRoutes);


// 🔐 API key UNIQUEMENT pour l’ESP32
app.use("/api/events", authMiddleware);
app.use("/api/heartbeat", authMiddleware);


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
app.use("/api/heartbeat", heartbeatRoutes); // Route heartbeat
app.use("/api/users", userRoutes); // ✅ Gestion des inscriptions email

// Compatibilité ESP32 (anciennes URLs)
app.use("/events", eventRoutes);

// ========== GESTION ERREURS 404 ==========
app.use((req, res) => {
  res.status(404).json({
    error: "❌ Route non trouvée",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api/events",
      "POST /api/events",
      "GET /api/notifications",
      "POST /api/notifications",
      "GET /api/display",
      "POST /api/heartbeat",
      "GET /api/heartbeat/latest",
      "POST /api/users/subscribe",
      "POST /api/users/unsubscribe",
      "GET /api/users"
    ]
  });
});

// ========== LANCEMENT SERVEUR + WEBSOCKET ==========
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log(`🚀 Backend Boite'Alerte v1.1.0 - Stats, Heartbeat & Email/WS`);
  console.log("=".repeat(60));
  console.log(`📍 Serveur    : http://localhost:${PORT}`);
  console.log(`🔑 Auth       : X-API-Key = ${process.env.API_KEY || "dev-local-key"}`);
  console.log(`📧 Email      : ${process.env.SMTP_USER || "non configuré"}`);
  console.log(`✅ Endpoints  :`);
  console.log(`   POST   /api/events       - Recevoir événements (enrichis)`);
  console.log(`   POST   /api/heartbeat    - Recevoir heartbeat ESP32`);
  console.log(`   POST   /api/users        - Gestion utilisateurs`);
  console.log("=".repeat(60));
});

// ========== SERVEUR WEBSOCKET ==========
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  // Connexion silencieuse

  ws.on("close", () => {
    // Déconnexion silencieuse
  });

  ws.on("error", (error) => {
    console.error("❌ Erreur WebSocket:", error.message);
  });
});

// Broadcast fonction pour envoyer à tous les clients WebSocket
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
};

// Export pour utiliser wss.broadcast() dans les controllers
module.exports = { app, server, wss };