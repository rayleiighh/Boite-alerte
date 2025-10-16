/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, ..., ..., ..., ...
 *  Description   : Access point of the backend application
 *  Date          : 27/09/2025
 *  Version       : [1.0.1] - Corrections pour ESP32
 *
 ***************************************************************************/

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const displayRoutes = require("./routes/displayRoutes");

dotenv.config();

const app = express();

// ========== MIDDLEWARES (AVANT tout le reste) ==========

// 1. JSON parser
app.use(express.json());

// 2. CORS - ✅ AJOUT des headers pour ESP32
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "X-API-Key",           // ✅ AJOUTÉ pour ESP32
    "Idempotency-Key",     // ✅ AJOUTÉ pour ESP32
    "Authorization"        // ✅ AJOUTÉ (si Bearer token futur)
  ],
  credentials: true
}));

// 3. Middleware d'authentification global (optionnel mais recommandé)
const authMiddleware = (req, res, next) => {
  // Bypass pour routes publiques (ex: page d'accueil, health check)
  if (req.path === "/" || req.path === "/health") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY || "dev-local-key";

  if (!apiKey) {
    return res.status(401).json({ 
      error: "❌ Authentification requise : header X-API-Key manquant" 
    });
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({ 
      error: "❌ Clé API invalide" 
    });
  }

  // ✅ Auth OK
  next();
};

// Appliquer l'auth sur toutes les routes API (sauf / et /health)
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
    uptime: process.uptime()
  });
});

// Routes API (protégées par authMiddleware)
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ AJOUT : Routes compatibles ESP32 (anciennes URLs)
// Redirection /events → /api/events (pour compatibilité ESP32)
app.use("/events", eventRoutes);
app.use("/api/display", displayRoutes);

// ========== GESTION ERREURS 404 ==========
app.use((req, res) => {
  res.status(404).json({ 
    error: "❌ Route non trouvée",
    path: req.path,
    method: req.method
  });
});

// ========== LANCEMENT SERVEUR ==========
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  console.log(`📍 Accessible via http://localhost:${PORT}`);
  console.log(`🔑 Auth: X-API-Key = ${process.env.API_KEY || "dev-local-key"}`);
});