import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 5000,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "tech",
        "gaming",
        "music",
        "education",
        "entertainment",
        "tutorial",
      ],
      default: "education",
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Video =
  mongoose.models.Video || mongoose.model("Video", VideoSchema);
