const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ["mail", "package", "alert"] // Types autorisés
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    deviceID: { type: String, required: true },
    isNew: { type: Boolean, default: true }, // Non lu par défaut
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);