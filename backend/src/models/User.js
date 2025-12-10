const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password:{
      type: String,
      require: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    active: { 
      type: Boolean, 
      default: true 
    }, // Pour permettre de désactiver les notifications
    deviceID: { 
      type: String, 
      default: "ESP32-001" 
    }, // Lien avec l'appareil (optionnel)
    lastLogin: {
      type: Date,
      default: null
  },
  lastPasswordChange: {
    type: Date,
    default: null
  },

  },
  { timestamps: true }
);

// Index pour recherche rapide
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);