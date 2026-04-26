import mongoose from "mongoose";


const SubscriptionSchema = new mongoose.Schema(
  {
    // Kaun subscribe kar raha hai
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    // Notification chahiye ya nahi (bell icon ke liye)
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
