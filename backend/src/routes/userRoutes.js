const express = require("express");
const router = express.Router();
const { subscribe, unsubscribe, getUsers, getNotifiedEmails } = require("../controllers/userController");

// POST /api/users/subscribe - S'inscrire
router.post("/subscribe", subscribe);

// POST /api/users/unsubscribe - Se désinscrire
router.post("/unsubscribe", unsubscribe);

// GET /api/users - Liste des utilisateurs (admin)
router.get("/", getUsers);

// GET /api/users/notified-emails - Emails actifs pour notifications
router.get("/notified-emails", getNotifiedEmails);

module.exports = router;