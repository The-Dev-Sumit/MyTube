import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Virtual for replies
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
});

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
