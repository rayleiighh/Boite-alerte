const mongoose = require("mongoose");

const DisplayConfigSchema = new mongoose.Schema(
  {
    deviceID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    houseNumber: {
      type: String,
      required: true,
      default: "86B",
      maxlength: 10,
    },
    message: {
      type: String,
      required: true,
      default: "NO PUB",
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DisplayConfig", DisplayConfigSchema);