const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },       // ex: "courrier", "colis"
    timestamp: { type: Date, required: true },    // date fournie par l'ESP32
    deviceID: { type: String, required: true }    // identifiant de l'ESP32
  },
  { timestamps: true }
);

// Index pour optimiser les requêtes triées
eventSchema.index({ timestamp: -1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);