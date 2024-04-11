const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    favoriteCount: { type: Number, default: 0 },
    favoriteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
