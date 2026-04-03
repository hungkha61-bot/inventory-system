const Item = require("../models/itemModel"); // 👈 IMPORTANT

router.post("/", async (req, res) => {
  try {
    const { items, total } = req.body;

    // 🛑 VALIDATION
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // 🔥 LOOP THROUGH ITEMS → UPDATE STOCK
    for (const orderItem of items) {
      const product = await Item.findById(orderItem.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 🛑 CHECK STOCK
      if (product.quantity < orderItem.qty) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      // ✅ REDUCE STOCK
      product.quantity -= orderItem.qty;

      await product.save();
    }

    // ✅ CREATE ORDER
    const newOrder = new Order({
      items,
      total,
      status: "Pending"
    });

    await newOrder.save();

    res.status(201).json(newOrder);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});