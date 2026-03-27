const Item = require("../models/Item");

// GET all items with pagination + search (only logged-in user's items)
const getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const filter = {};
    if (req.user.role !== "admin") {
      filter.user = req.user.id;
    }

    // 🔍 Search by name
    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: "i" };
    }

    // 💰 Price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // 📦 Quantity range
    if (req.query.minQty || req.query.maxQty) {
      filter.quantity = {};
      if (req.query.minQty) {
        filter.quantity.$gte = Number(req.query.minQty);
      }
      if (req.query.maxQty) {
        filter.quantity.$lte = Number(req.query.maxQty);
      }
    }

    // 🔃 Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      const field = req.query.sort;
      sortOption = field.startsWith("-")
        ? { [field.substring(1)]: -1 }
        : { [field]: 1 };
    }

    const total = await Item.countDocuments(filter);

    const items = await Item.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE item
const createItem = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    const item = await Item.create({
      name,
      quantity,
      price,
      user: req.user.id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || item.name,
        quantity: req.body.quantity || item.quantity,
        price: req.body.price || item.price,
      },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 👇 THIS PART IS IMPORTANT
module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};