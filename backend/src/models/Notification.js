const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    type: {
      type: String,
      enum: ["mail", "package", "alert"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    deviceID: {
      type: String,
      default: "ESP32-001",
    },
  },
  { timestamps: true }
);

notificationSchema.index({ timestamp: -1 });
notificationSchema.index({ isNew: 1 });

module.exports = mongoose.model("Notification", notificationSchema);