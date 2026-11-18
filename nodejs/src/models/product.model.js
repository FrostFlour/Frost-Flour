// US-14: the Product model.
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is required"], trim: true },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    // min 0.01 = the price must be greater than zero
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0.01, "price must be greater than zero"],
    },
    // "ref" = a link to a document of the Category collection.
    // A product belongs to exactly ONE category.
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    // A new product is available by default (US-17 will archive it = false)
    isAvailable: { type: Boolean, default: true },
    // Path of the image, for example "/uploads/products/1700000000-123.png".
    // null = no image -> the front end shows a default placeholder.
    image: { type: String, default: null },
  },
  { timestamps: true }
);

// Product names are unique (ignoring upper/lower case, like categories)
productSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Product", productSchema);
