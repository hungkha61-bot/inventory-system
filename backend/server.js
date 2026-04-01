// server.js
const multer = require("multer");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Parser } = require("json2csv");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- MongoDB Connection -------------------
mongoose.connect(process.env.MONGO_URI, {
  dbName: "inventoryDB"
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// ------------------- SCHEMAS -------------------
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  createdBy: { type: String, required: true },
  image: { type: String }  
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);

// ------------------- MIDDLEWARE -------------------
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Missing token");

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Invalid token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { email, role }
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};

// ------------------- AUTH ROUTES -------------------

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Invalid credentials");

  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, role: user.role });
});

// Admin-only register
app.post("/api/register", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Not authorized");

  const { username, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({ username, email, password: hashed, role });
    res.json({ message: "User registered", user: { username, email, role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ------------------- ITEMS ROUTES -------------------

// Create item

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "inventory",
    format: "jpg", // or let Cloudinary decide
    public_id: Date.now() + "-" + file.originalname
  })
});

const upload = multer({ storage });


app.post("/api/items", authMiddleware, async (req, res) => {
  try {
    const { name, price, quantity, image } = req.body;

    const newItem = new Item({
      name,
      price,
      quantity,
      createdBy: req.user.email,
      image: image || null
    });

    await newItem.save();

    res.json(newItem);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update item
app.put("/api/items/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, price, quantity } = req.body || {};

    const updateData = {
      name,
      price,
      quantity
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // 🔐 Ownership check
    if (req.user.role !== "admin" && item.createdBy !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete item
app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🔐 ownership check
    if (
      req.user.role !== "admin" &&
      item.createdBy.trim().toLowerCase() !== req.user.email.trim().toLowerCase()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

   // ⭐ DELETE ITEM FROM DB
    await Item.findByIdAndDelete(id);

    res.json({ message: "Item and image deleted" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/items/stats", authMiddleware, async (req, res) => {
  try {
    // 🔐 Data ownership
    const filter = req.user.role === "admin"
      ? {}
      : { createdBy: req.user.email.trim().toLowerCase() };

    const items = await Item.find(filter);

    const totalItems = items.length;
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalValue = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    res.json({ totalItems, totalQty, totalValue });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search/filter + pagination
app.get("/api/items/paginated", authMiddleware, async (req, res) => {
  try {
    const { name, createdBy, minPrice, maxPrice, minQty, maxQty, page = 1, limit = 5 } = req.query;

    const filter = {};

    // 🔐 DATA OWNERSHIP
    if (req.user.role !== "admin") {
      filter.createdBy = req.user.email;
    } else {
      if (createdBy) filter.createdBy = createdBy;
    }

    // Filters
    if (name) filter.name = { $regex: name, $options: "i" };

    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);

    if (minQty || maxQty) filter.quantity = {};
    if (minQty) filter.quantity.$gte = parseInt(minQty);
    if (maxQty) filter.quantity.$lte = parseInt(maxQty);

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      items
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export CSV
app.get("/api/items/export", authMiddleware, async (req, res) => {
  try {
    const { name, createdBy, minPrice, maxPrice, minQty, maxQty } = req.query;

    const filter = {};

    // 🔐 Data ownership
    if (req.user.role !== "admin") {
      filter.createdBy = req.user.email;
    } else {
      if (createdBy) filter.createdBy = createdBy;
    }

    // Filters
    if (name) filter.name = { $regex: name, $options: "i" };

    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);

    if (minQty || maxQty) filter.quantity = {};
    if (minQty) filter.quantity.$gte = parseInt(minQty);
    if (maxQty) filter.quantity.$lte = parseInt(maxQty);

    const items = await Item.find(filter).sort({ createdAt: -1 });

    const fields = ["name", "price", "quantity", "createdBy", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(items);

    res.header("Content-Type", "text/csv");
    res.attachment("filtered_items.csv");
    res.send(csv);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUBLIC SITE

app.get("/api/public/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHECKOUT API

const Order = require("./models/Order");

app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = new Order({
      userEmail: req.user.email,
      items,
      total
    });

    await order.save();

    res.json({ message: "Order placed!", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----  GET USER ORDERS
app.get("/api/orders/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userEmail: req.user.email
    }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));