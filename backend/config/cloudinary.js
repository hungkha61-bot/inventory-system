const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm1n8bthw",
  api_key: "58145134556178",
  api_secret: "PO7ZuALAcFiNxBd7YBW7IsGEUmY"
});

module.exports = cloudinary;