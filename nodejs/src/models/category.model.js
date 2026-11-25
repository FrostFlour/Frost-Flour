// US-11: the Category model (a "schema" describes what a category looks like).
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Required, max 50 characters, spaces at the start/end are removed
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [50, "name must have at most 50 characters"],
    },
    // Optional
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// The name must be unique, IGNORING upper/lower case ("Cakes" = "cakes").
// A "collation" with strength 2 tells MongoDB to compare without case.
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Category", categorySchema);
