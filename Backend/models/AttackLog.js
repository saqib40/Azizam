const mongoose = require("mongoose");

const attackSchema = new mongoose.Schema({
  ip: String,
  payload: {
    type: String,
    enum: ["SQLi", "XSS", "Brute"]
  },
  timestamp: { type: Date, default: Date.now },
  method: String, //HTTP method (GET, POST, etc.)
  path: String, // Which URL path was targeted (e.g., "/login")
});

module.exports = mongoose.model("Attack", attackSchema);
