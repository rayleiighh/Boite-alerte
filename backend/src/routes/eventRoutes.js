const express = require("express");
const router = express.Router();
const {
  addEvent,
  getEvents,
  getLatestEvent,
  deleteEvent,
  // Import de la nouvelle fonction
  getEventSummary, 
} = require("../controllers/eventController");

// GET /api/events/latest → récupérer le dernier événement pour le dashboard (inchangé)
router.get("/latest", getLatestEvent);

// NOUVEAU: GET /api/events/summary → récupérer les données pour les charts
router.get("/summary", getEventSummary);

// POST /api/events → ajouter un event (inchangé)
router.post("/", addEvent);

// GET /api/events → récupérer les events avec pagination & filtres (inchangé)
router.get("/", getEvents);

// DELETE /api/events/:id → supprimer un event (inchangé)
router.delete("/:id", deleteEvent);

module.exports = router;