const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { login } = require("../controllers/authController.js");

const authJwt = require("../middlewares/authJwt");
const { changePassword } = require("../controllers/authController");

// ✅ LOGIN
router.post("/login", login);

// ✅ PROFIL CONNECTÉ VIA TOKEN
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json({
      username: user.username,
      role: "Administrateur",
      email: user.email,
      active: user.active,
      deviceID: user.deviceID,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastPasswordChange: user.lastPasswordChange,
      hashAlgorithm: "argon2id"
    });

  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
});

router.post("/change-password", authJwt, changePassword);

module.exports = router;
