const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favoriteProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    avatar: { type: String },
    role: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
