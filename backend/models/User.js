const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },   // display name, not unique
  email: { type: String, required: true, unique: true }, // login identifier
  password: { type: String, required: true },  // hashed
  role: { type: String, default: "user" }      // "admin" or "user"
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);