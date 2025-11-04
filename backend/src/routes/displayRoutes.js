const express = require("express");
const router = express.Router();
const {
  getDisplayConfig,
  updateDisplayConfig,
  getAllDisplayConfigs,
} = require("../controllers/displayController");

// GET /api/display?deviceID=xxx - Récupérer config OLED
router.get("/", getDisplayConfig);

// PUT /api/display - Modifier config OLED
router.put("/", updateDisplayConfig);

// GET /api/display/all - Lister toutes les configs OLED
router.get("/all", getAllDisplayConfigs);

module.exports = router;