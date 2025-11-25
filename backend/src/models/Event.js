const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // ========== CHAMPS EXISTANTS ==========
    type: { type: String, required: true },       // ex: "courrier", "colis"
    timestamp: { type: Date, required: true },    // date fournie par l'ESP32
    deviceID: { type: String, required: true },   // identifiant de l'ESP32
    
    // ========== NOUVEAUX CHAMPS ENRICHIS (Phase 1) ==========
    weight_g: { type: Number, default: null },          // Poids en grammes (HX711)
    rssi: { type: Number, default: null },              // Signal WiFi en dBm
    beam_state: { type: Boolean, default: null },       // État faisceau IR (true=coupé)
    uptime_s: { type: Number, default: null },          // Uptime ESP32 en secondes
    event_count: { type: Number, default: null },       // Numéro d'événement depuis boot
    battery_percent: { type: Number, default: null }    // Niveau batterie (null si non implémenté)
  },
  { timestamps: true }  // Ajoute createdAt et updatedAt automatiquement
);

// Index pour optimiser les requêtes par timestamp et deviceID
eventSchema.index({ timestamp: -1 });
eventSchema.index({ deviceID: 1 });

module.exports = mongoose.model("Event", eventSchema);