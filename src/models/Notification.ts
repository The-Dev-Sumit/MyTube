import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Kisko notification jayegi
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["new_video"],
      default: "new_video",
    },

    // Konsa video upload hua
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    // Video ka title (quick access ke liye)
    title: {
      type: String,
      required: true,
    },

    // Video ka thumbnail
    thumbnail: {
      type: String,
    },

    // Padha ya nahi
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Index - ek user ki saari notifications quickly fetch karne ke liye
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
