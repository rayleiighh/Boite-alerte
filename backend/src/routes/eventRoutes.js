const express = require("express");
const router = express.Router();
const {
  addEvent,
  getEvents,
  getLatestEvent,
  deleteEvent
} = require("../controllers/eventController");

// GET /api/events/latest → récupérer le dernier événement pour le dashboard
router.get("/latest", getLatestEvent);

// POST /api/events → ajouter un event
router.post("/", addEvent);

// GET /api/events → récupérer les events avec pagination & filtres
router.get("/", getEvents);

// DELETE /api/events/:id → supprimer un event
router.delete("/:id", deleteEvent);

module.exports = router;
