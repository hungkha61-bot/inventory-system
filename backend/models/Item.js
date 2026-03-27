const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  image: { type: String },
  createdBy: { type: String, required: true }}, 
  { timestamps: true }

);

module.exports = mongoose.model("Item", itemSchema);