/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, ..., ..., ..., ...
 *  Description   : Access point of the backend application
 *  Date          : 27/09/2025
 *  Version       : [1.0.0]
 *
 ***************************************************************************/

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes"); // ✅ nouveau
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Connexion DB
connectDB();

// CORS
app.use(cors({
  origin: "http://localhost:5173", // autorise ton frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

// Route test
app.get("/", (req, res) => {
  res.send("🚀 Backend Boite'Alerte fonctionne !");
});

// Routes API
app.use("/api/events", eventRoutes); // ✅ nouveau

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));

