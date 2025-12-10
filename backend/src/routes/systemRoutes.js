const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/MainUser"); // ✅ IMPORTANT : MainUser ici

// ✅ ÉTAT DU SYSTÈME
router.get("/status", (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    backend: "ok",
    mongo: dbState,
    uptime: process.uptime(),
  });
});

// ✅ PROFIL ADMIN
router.get("/profile", async (req, res) => {
  try {
    const admin = await User.findOne({ username: "admin" }).select(
      "username email active createdAt lastLogin"
    );

    if (!admin) {
      return res.status(404).json({ error: "Admin introuvable" });
    }

    res.json({
      username: admin.username,
      email: admin.email || null,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
      active: admin.active,
      backend: "ok",
      mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  } catch (err) {
    console.error("Erreur profil admin:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
