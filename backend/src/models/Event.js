const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },       // ex: "courrier", "colis"
    timestamp: { type: Date, required: true },    // date fournie par l’ESP32
    deviceID: { type: String, required: true }    // identifiant de l’ESP32
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
