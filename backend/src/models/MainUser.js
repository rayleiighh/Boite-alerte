const mongoose = require("mongoose");

const mainUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      default: "admin"
    },

    lastLogin: {
      type: Date,
      default: null
    },
    lastPasswordChange: {
      type: Date,
      default: null
    },


    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MainUser", mainUserSchema);
