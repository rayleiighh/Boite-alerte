const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController.js");

// POST /auth/login
router.post("/login", login);

module.exports = router;
