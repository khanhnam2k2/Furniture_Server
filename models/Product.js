const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imagesUrl: [{ type: String, required: true }],
    rating: { type: Number, required: true, default: 5 },
    price: { type: String, required: true },
    priceSale: { type: String },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    favoriteCount: { type: Number, default: 0 },
    favoriteBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    ],
    bestsellers: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
