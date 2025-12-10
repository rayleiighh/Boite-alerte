const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const argon2 = require("argon2");
const MainUser = require("../models/MainUser");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI manquant dans le .env");
  process.exit(1);
}

async function createAdmin() {
  try {
    console.log("[createAdmin] Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);

    const username = process.env.ADMIN_USERNAME || "admin";
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!rawPassword) {
      console.error("❌ ADMIN_PASSWORD manquant dans le .env");
      process.exit(1);
    }

    console.log(`[createAdmin] Création / mise à jour de l'admin "${username}"...`);

    const passwordHash = await argon2.hash(rawPassword, {
      type: argon2.argon2id,
    });

    const admin = await MainUser.findOneAndUpdate(
      { username },                               // critère
      {
        username,
        password: passwordHash,
        role: "admin",
        active: true,
      },
      {
        upsert: true,                             // crée si n'existe pas
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("✅ Admin créé/mis à jour avec succès :");
    console.log({
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    });
  } catch (err) {
    console.error("❌ Erreur lors de la création de l'admin :", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
