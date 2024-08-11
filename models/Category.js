const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String },
});

module.exports = mongoose.model("Category", CategorySchema);
