const express = require("express");
const router = express.Router();
const { addEvent } = require("../controllers/eventController");

// POST /api/events
router.post("/", addEvent);

module.exports = router;
