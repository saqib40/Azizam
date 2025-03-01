const mongoose = require("mongoose");

const blockedIPSchema = new mongoose.Schema({
  ip: { type: String, unique: true }, // Ensures each IP is stored only once
  reason: { // reason of ban
    type: String,
    enum: ["SQLi", "XSS", "Brute"]
  },
  blockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BlockedIP", blockedIPSchema);
