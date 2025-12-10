const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// ✅ État du système en temps réel
router.get("/status", (req, res) => {
  const dbState =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    backend: "ok",
    mongodb: dbState,
    uptime: process.uptime(), // en secondes
  });
});

router.get("/profile", getAdminProfile);

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findOne({ username: "admin" }).select(
      "username email active createdAt lastLogin"
    );

    res.json({
      username: admin.username,
      email: admin.email,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
      active: admin.active,
      backend: "ok",
      mongo: "ok",
      uptime: process.uptime()
    });

  } catch (err) {
    console.error("Erreur profil admin:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


module.exports = router;
