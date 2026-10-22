import mongoose from "mongoose"

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Jewelry", "Documents", "Clothing", "Bag", "Keys", "Other"],
      default: "Other",
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["lost", "found"],
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    image: {
      type: String,
      default: "",
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add text index for search queries
ItemSchema.index({ title: "text", description: "text", location: "text" })

export default mongoose.models.Item || mongoose.model("Item", ItemSchema)
