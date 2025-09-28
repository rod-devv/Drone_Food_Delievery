const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const optionSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },

    // Category of the option (e.g., burgers, sides, drinks)
    category: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Option = mongoose.models.Option || mongoose.model("Option", optionSchema);

module.exports = Option;
