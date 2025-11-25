const express = require("express");
const router = express.Router();
const heartbeatController = require("../controllers/heartbeatController");

// POST /api/heartbeat - Recevoir heartbeat ESP32
router.post("/", heartbeatController.receiveHeartbeat);

// GET /api/heartbeat/latest?deviceID=xxx - Dernier heartbeat d'un device
router.get("/latest", heartbeatController.getLatestHeartbeat);

// GET /api/heartbeat/history?deviceID=xxx&limit=20 - Historique heartbeats
router.get("/history", heartbeatController.getHeartbeatHistory);

module.exports = router;
