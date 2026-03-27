const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// GET items
router.get("/", async (req, res) => {
  const items = await Item.find().sort("-createdAt");
  res.json({ items });
});

// POST item
router.post("/", async (req, res) => {
  console.log("🔥 POST HIT");

  const { name, price, quantity } = req.body;

  const item = await Item.create({
    name,
    price,
    quantity
  });

  res.json(item);
});

module.exports = router;