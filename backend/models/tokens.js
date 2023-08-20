const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, ref: "Users" },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Tokens", tokenSchema);
