const express = require("express");
const router = express.Router();
const { addEvent, getEvents } = require("../controllers/eventController");

// POST /api/events → ajouter un event
router.post("/", addEvent);

// GET /api/events → récupérer les events avec pagination & filtres
router.get("/", getEvents);

module.exports = router;
