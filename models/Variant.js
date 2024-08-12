const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Liên kết tới sản phẩm
    size: { type: String, required: true }, // Kích thước của sản phẩm
    color: { type: String, required: true }, // Màu sắc của sản phẩm
    quantity: { type: Number, required: true }, // Số lượng tồn kho
  },
  {
    timestamps: true,
  }
);

const Variant = mongoose.model("Variant", variantSchema);
module.exports = Variant;
