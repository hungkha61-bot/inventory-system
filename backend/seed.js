require("dotenv").config();
const mongoose = require("mongoose");
const Item = require("./models/Item");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

const seedData = async () => {
  try {
    const users = await User.find();

    if (users.length === 0) {
      console.log("No users found. Please register users first.");
      process.exit();
    }

    await Item.deleteMany();

    const items = [];

    users.forEach((user) => {
      for (let i = 1; i <= 10; i++) {
        items.push({
          name: `Item ${i} - ${user.name}`,
          quantity: i * 2,
          price: i * 100,
          user: user._id,
        });
      }
    });

    await Item.insertMany(items);

    console.log("Seed data inserted successfully");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedData();