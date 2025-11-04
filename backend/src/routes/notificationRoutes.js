const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAllRead,
  markOneRead,
  deleteOne
} = require("../controllers/notificationController");

// GET /api/notifications - Récupérer toutes les notifications
router.get("/", getNotifications);

// POST /api/notifications - Créer une notification
router.post("/", createNotification);

// POST /api/notifications/mark-all-read - Marquer toutes comme lues
router.post("/mark-all-read", markAllRead);

// POST /api/notifications/:id/read - Marquer une comme lue
router.post("/:id/read", markOneRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete("/:id", deleteOne);

module.exports = router;