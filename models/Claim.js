import mongoose from "mongoose"

const ClaimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimantName: {
      type: String,
      required: true,
    },
    claimantEmail: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    proofImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Claim || mongoose.model("Claim", ClaimSchema)
