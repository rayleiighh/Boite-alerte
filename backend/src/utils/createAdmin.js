const mongoose = require("mongoose");
const argon2 = require("argon2");
const User = require("../models/User.js");
const dotenv = require("dotenv");
dotenv.config();

(async () => {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    const username = "admin";
    const password = "1234"; // tu peux changer ici

    const hash = await argon2.hash(password);

    await User.findOneAndUpdate(
      { username },
      { username, password: hash },
      { upsert: true }
    );

    console.log("Admin créé/mis à jour avec succès");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de la création de l'admin :", err);
    process.exit(1);
  }
})();
