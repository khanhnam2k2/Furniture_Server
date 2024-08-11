const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imagesUrl: [{ type: String, required: true }],
    rating: { type: Number, required: true, default: 5 },
    quantityAll: { type: Number, required: true },
    price: { type: String, required: true },
    priceSale: { type: String },
    options: [
      {
        size: { type: String, required: true }, // Kích thước (ví dụ: S, M, L)
        color: { type: String, required: true }, // Màu sắc (ví dụ: red, blue)
        quantity: { type: Number, required: true }, // Số lượng cho từng màu sắc của kích thước
      },
    ],
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
